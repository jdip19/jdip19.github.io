/// <reference types="@figma/plugin-typings" />

// Show UI with dimensions
figma.showUI(__html__, { width: 300, height: 450 });

const syncSelectionInfoToUI = () => {
  const selection = figma.currentPage.selection;
  const names = selection.map((node) => node.name);
  const types = selection.map((node) => node.type);

  figma.ui.postMessage({
    type: "selection-info",
    names,
    types,
  });
};

const getMatchKey = (value: string) => {
  const trimmedValue = value.trim();
  return trimmedValue.startsWith("#") ? trimmedValue : `#${trimmedValue}`;
};

// In-memory cache for images during a single sync operation
const imageCache: Map<string, any> = new Map();

const extractImageUrl = (value: string): string | null => {
  if (!value) return null;
  const trimmed = String(value).trim();

  // Markdown style link: [text](url) or direct markdown link where url is in parentheses
  const mdMatch = trimmed.match(/\((https?:\/\/[^)]+)\)/i);
  if (mdMatch && mdMatch[1]) {
    return mdMatch[1].trim();
  }

  // Plain URL maybe wrapped in <>
  const angleMatch = trimmed.match(/<?(https?:\/\/[^>\s]+)>?/i);
  if (angleMatch && angleMatch[1]) {
    return angleMatch[1].trim();
  }

  return null;
};

const isImageExtension = (url: string) => {
  return /\.(jpe?g|png|webp|gif|svg)(?:[?#]|$)/i.test(url);
};

const fetchAndCreateImage = async (url: string) => {
  if (imageCache.has(url)) return imageCache.get(url);

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);

  const contentType = ((response as any).headers?.get?.("content-type") || "").toLowerCase();
  if (!contentType.startsWith("image/") && !contentType.includes("svg")) {
    throw new Error(`URL did not return an image content-type: ${contentType}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const img = figma.createImage(new Uint8Array(arrayBuffer));
  imageCache.set(url, img);
  return img;
};

const applyImageToLayer = (layer: SceneNode, image: any) => {
  try {
    const fills = JSON.parse(JSON.stringify((layer as any).fills || []));
    fills[0] = {
      type: "IMAGE",
      scaleMode: "FILL",
      imageHash: image.hash,
      visible: true,
      opacity: 1,
    } as Paint;
    (layer as any).fills = fills;
    return true;
  } catch (err) {
    console.error("applyImageToLayer error", err);
    return false;
  }
};

syncSelectionInfoToUI();

// Load saved URL when plugin starts
figma.clientStorage.getAsync("lastSheetUrl").then((savedUrl) => {
  if (savedUrl) {
    figma.ui.postMessage({
      type: "load-url",
      url: savedUrl,
    });
  }
});

const getLayerSequenceOrder = (layer: SceneNode): number => {
  if (layer.parent && "children" in layer.parent) {
    const parentIndex = layer.parent.children.indexOf(layer);
    if (parentIndex >= 0) {
      return parentIndex;
    }
  }

  return layer.y;
};

const syncSelectedLayersToHeader = (headerName: string) => {
  const trimmedHeader = String(headerName ?? "").trim();
  if (!trimmedHeader) {
    figma.notify("Invalid column header");
    return;
  }

  const selection = figma.currentPage.selection;
  if (selection.length === 0) {
    figma.notify("Please select at least one layer to rename.");
    return;
  }

  const newName = getMatchKey(trimmedHeader);
  for (const layer of selection) {
    layer.name = newName;
  }

  figma.notify(
    `Renamed ${selection.length} selected layer${
      selection.length > 1 ? "s" : ""
    } to ${newName}`,
    { timeout: 3000 },
  );
};

// Handle messages from the UI
figma.ui.onmessage = async (msg: any) => {
  if (msg.type === "update-layers") {
    const { data } = msg;
    console.log("Received data structure:", JSON.stringify(data, null, 2));

    // Save the URL
    if (msg.sheetUrl) {
      await figma.clientStorage.setAsync("lastSheetUrl", msg.sheetUrl);
    }

    if (!data || data.length < 2) {
      figma.notify("No data found in the sheet");
      return;
    }

    const selection = figma.currentPage.selection
      .slice()
      .sort((a, b) => {
        const layerOrderDiff = getLayerSequenceOrder(a) - getLayerSequenceOrder(b);
        if (layerOrderDiff !== 0) {
          return layerOrderDiff;
        }

        return a.y - b.y;
      });

    if (selection.length === 0) {
      figma.notify("Please select at least one layer. 😊");
      return;
    }

    try {
      // Clean and process the data
      const cleanData = data.map((row: any[]) =>
        row.map((cell: any) =>
          cell !== null && cell !== undefined ? String(cell).trim() : "",
        ),
      );

      // Find the header row - first non-empty row
      let headerRowIndex = 0;
      for (let i = 0; i < cleanData.length; i++) {
        if (cleanData[i].some((cell: string) => cell !== "")) {
          headerRowIndex = i;
          break;
        }
      }

      // Get headers and create column mapping
      const headers = cleanData[headerRowIndex];
      console.log("Raw headers from sheet:", headers);
      console.log("COLUMN VALUES:", cleanData.slice(headerRowIndex + 1));
      const columnMap: { [key: string]: number } = {};
      headers.forEach((header: string, index: number) => {
        if (header && header.trim()) {
          const trimmedHeader = header.trim();
          const matchKey = getMatchKey(trimmedHeader);
          if (matchKey) {
            columnMap[matchKey] = index;
          }
        }
      });
      console.log("Created column mapping:", columnMap);

      // Group selected layers by their matching column name
      const layerGroups: { [prefix: string]: SceneNode[] } = {};
      console.log(
        "Selected layers:",
        selection.map((layer) => ({ name: layer.name, type: layer.type })),
      );

      for (const layer of selection) {
        const layerName = layer.name;
        console.log("Checking layer:", layerName);

        const cleanLayerName = getMatchKey(layerName);
        const matchingColumnKey = Object.keys(columnMap).find(
          (key) => key.toLowerCase() === cleanLayerName.toLowerCase(),
        );

        if (matchingColumnKey) {
          if (!layerGroups[matchingColumnKey]) {
            layerGroups[matchingColumnKey] = [];
          }

          layerGroups[matchingColumnKey].push(layer);
          console.log("  ✓ Matched column:", matchingColumnKey);
        } else {
          console.log("  ✗ No matching prefix found");
        }
      }
      console.log("Layer groups:", Object.keys(layerGroups));

      // Process each group of layers
      let updatedNameCount = 0;
      let updatedContentCount = 0;
      let textLayersCount = 0;
      let otherLayersCount = 0;
      let imageLayersCount = 0;

      const orderedPrefixes = Object.keys(columnMap);

      for (const prefix of orderedPrefixes) {
        const layers = layerGroups[prefix]
          ? layerGroups[prefix].slice().sort((a, b) => {
              const orderDiff = getLayerSequenceOrder(a) - getLayerSequenceOrder(b);

              if (orderDiff !== 0) {
                return orderDiff;
              }

              return a.y - b.y;
            })
          : [];
        const columnIndex = columnMap[prefix];

        // Get all values for this column (skip header row)
        const values = cleanData
          .slice(headerRowIndex + 1)
          .map((row: string[]) => row[columnIndex])
          .filter(
            (value: string) =>
              value !== undefined &&
              value !== null &&
              value !== "" &&
              value !== "#N/A",
          );

        console.log(`Values for prefix ${prefix}:`, values);

        // Update each layer with corresponding value
        for (let i = 0; i < layers.length; i++) {
          const layer = layers[i];
          if (i < values.length && values[i] !== undefined) {
            const value = values[i];

            // Update the layer name for all matching layers
            const newName = String(value);
            layer.name = newName;
            updatedNameCount++;

            // Track layer types and update content
            if (layer.type === "TEXT") {
              textLayersCount++;
              // If it's a text layer, also update its content
              try {
                await figma.loadFontAsync(
                  (layer as TextNode).fontName as FontName,
                );
                (layer as TextNode).characters = String(value);
                updatedContentCount++;
              } catch (error) {
                console.error("Error loading font:", error);
                figma.notify(
                  `Error loading font for layer "${newName}". Only name was updated.`,
                );
              }
            } else if ("fills" in layer) {
              // Try to extract an image URL (supports markdown links and plain URLs)
              const imageUrlCandidate = extractImageUrl(String(value));
              const potentialUrl = imageUrlCandidate ?? (String(value).trim().startsWith("http") ? String(value).trim() : null);

              if (potentialUrl) {
                try {
                  // fetch, validate and create figma image (uses in-memory cache)
                  const img = await fetchAndCreateImage(potentialUrl);
                  const applied = applyImageToLayer(layer, img);
                  if (applied) {
                    imageLayersCount++;
                  } else {
                    otherLayersCount++;
                    figma.notify(`Cannot apply image to layer "${layer.name}": unsupported layer type or fills.`, { timeout: 3000 });
                  }
                } catch (error) {
                  console.error("Error loading image:", error);
                  figma.notify(
                    `Error loading image for layer "${layer.name}": ${error instanceof Error ? error.message : String(error)}`,
                  );
                  otherLayersCount++;
                }
              } else {
                otherLayersCount++;
              }
            } else {
              otherLayersCount++;
            }
          }
        }
      }

      if (updatedNameCount === 0) {
        figma.notify(
          "No layers were updated. Make sure layer names start with # matching column names 😕",
          { timeout: 3000 },
        );
      } else {
        let message = "";

        // Case 1: Only text layers
        if (
          textLayersCount > 0 &&
          otherLayersCount === 0 &&
          imageLayersCount === 0
        ) {
          message = `Tadaan 🥁 ${textLayersCount} Text layer${textLayersCount > 1 ? "s" : ""} updated (name & content)!`;
        }
        // Case 2: Only other layers
        else if (
          otherLayersCount > 0 &&
          textLayersCount === 0 &&
          imageLayersCount === 0
        ) {
          message = `Tadaan 🥁 ${otherLayersCount} Layer${otherLayersCount > 1 ? "s" : ""} renamed!`;
        }
        // Case 3: Only image layers
        else if (
          imageLayersCount > 0 &&
          textLayersCount === 0 &&
          otherLayersCount === 0
        ) {
          message = `Tadaan 🥁 ${imageLayersCount} Image layer${imageLayersCount > 1 ? "s" : ""} updated!`;
        }
        // Case 4: Mixed layers
        else {
          message = `Tadaan 🥁 ${updatedNameCount} layers updated:\n`;
          if (textLayersCount > 0) {
            message += `• ${textLayersCount} text layer${textLayersCount > 1 ? "s" : ""} (name & content)\n`;
          }
          if (imageLayersCount > 0) {
            message += `• ${imageLayersCount} image layer${imageLayersCount > 1 ? "s" : ""} (name & image)\n`;
          }
          if (otherLayersCount > 0) {
            message += `• ${otherLayersCount} other layer${otherLayersCount > 1 ? "s" : ""} (name only)`;
          }
        }

        figma.notify(message, { timeout: 4000 });
      }
    } catch (error) {
      console.error("Error:", error);
      figma.notify(
        `Error updating layers: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  } else if (msg.type === "sync-header") {
    syncSelectedLayersToHeader(msg.header);
  } else if (msg.type === "close") {
    figma.closePlugin();
  }
};

// Update selection info in UI
figma.on("selectionchange", () => {
  syncSelectionInfoToUI();
});
