/// <reference types="@figma/plugin-typings" />

// Show UI with dimensions
figma.showUI(__html__, { width: 300, height: 450 });

// Load saved URL when plugin starts
figma.clientStorage.getAsync('lastSheetUrl').then(savedUrl => {
  if (savedUrl) {
    figma.ui.postMessage({
      type: 'load-url',
      url: savedUrl
    });
  }
});

// Handle messages from the UI
figma.ui.onmessage = async (msg: any) => {
  if (msg.type === 'update-layers') {
    const { data } = msg;
    console.log("Received data structure:", JSON.stringify(data, null, 2));
    
    // Save the URL
    if (msg.sheetUrl) {
      await figma.clientStorage.setAsync('lastSheetUrl', msg.sheetUrl);
    }

    if (!data || data.length < 2) {
      figma.notify('No data found in the sheet');
      return;
    }

    const selection = figma.currentPage.selection;
    if (selection.length === 0) {
      figma.notify('Please select at least one layer. 😊');
      return;
    }

    try {
      // Clean and process the data
      const cleanData = data.map((row: any[]) => row.map((cell: any) => 
        cell !== null && cell !== undefined ? String(cell).trim() : ''
      ));

      // Find the header row - first non-empty row
      let headerRowIndex = 0;
      for (let i = 0; i < cleanData.length; i++) {
        if (cleanData[i].some((cell: string) => cell !== '')) {
          headerRowIndex = i;
          break;
        }
      }

      // Get headers and create column mapping
      const headers = cleanData[headerRowIndex];
      console.log("Raw headers from sheet:", headers);
      const columnMap: { [key: string]: number } = {};
      headers.forEach((header: string, index: number) => {
        if (header && header.trim()) {
          // Remove any whitespace and special characters
          const cleanHeader = header.trim().replace(/[^a-zA-Z0-9]/g, '');
          if (cleanHeader) {
            columnMap['#' + cleanHeader] = index;
          }
        }
      });
      console.log("Created column mapping:", columnMap);

      // Group selected layers by their prefix
      const layerGroups: { [prefix: string]: SceneNode[] } = {};
      console.log("Selected layers:", selection.map(layer => ({ name: layer.name, type: layer.type })));
      
      for (const layer of selection) {
        const layerName = layer.name;
        console.log("Checking layer:", layerName);
        let matched = false;
        for (const prefix in columnMap) {
          console.log(`- Comparing with prefix "${prefix}"`);
          if (layerName.startsWith(prefix)) {
            if (!layerGroups[prefix]) {
              layerGroups[prefix] = [];
            }
            layerGroups[prefix].push(layer);
            matched = true;
            console.log(`  ✓ Matched with prefix "${prefix}"`);
            break;
          }
        }
        if (!matched) {
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

      for (const prefix in layerGroups) {
        const layers = layerGroups[prefix];
        const columnIndex = columnMap[prefix];
        
        // Get all values for this column (skip header row)
        const values = cleanData.slice(headerRowIndex + 1)
          .map((row: string[]) => row[columnIndex])
          .filter((value: string) => value !== undefined && value !== null && value !== '' && value !== '#N/A');
        
        console.log(`Values for prefix ${prefix}:`, values);
        
        // Update each layer with corresponding value
        for (let i = 0; i < layers.length; i++) {
          const layer = layers[i];
          if (i < values.length && values[i] !== undefined) {
            const value = values[i];
            
            // Always update the layer name
            layer.name = String(value);
            updatedNameCount++;

            // Track layer types and update content
            if (layer.type === 'TEXT') {
              textLayersCount++;
              // If it's a text layer, also update its content
              try {
                await figma.loadFontAsync((layer as TextNode).fontName as FontName);
                (layer as TextNode).characters = String(value);
                updatedContentCount++;
              } catch (error) {
                console.error('Error loading font:', error);
                figma.notify(`Error loading font for layer "${layer.name}". Only name was updated.`);
              }
            } else if (layer.type === 'FRAME' || layer.type === 'RECTANGLE' || layer.type === 'ELLIPSE' || layer.type === 'POLYGON' || layer.type === 'STAR' || layer.type === 'VECTOR') {
              // Check if the value is a valid image URL (now allow any http/https URL)
              if (value.startsWith('http')) {
                try {
                  // Fetch the image data
                  const response = await fetch(value);
                  if (!response.ok) {
                    throw new Error(`Failed to fetch image: ${response.statusText}`);
                  }
                  // Convert the response to array buffer
                  const imageData = await response.arrayBuffer();
                  // Create a new image fill
                  const imageHash = await figma.createImage(new Uint8Array(imageData));
                  const fills = JSON.parse(JSON.stringify(layer.fills));
                  fills[0] = {
                    type: 'IMAGE',
                    scaleMode: 'FILL',
                    imageHash: imageHash.hash,
                    visible: true,
                    opacity: 1
                  };
                  layer.fills = fills;
                  imageLayersCount++;
                } catch (error) {
                  console.error('Error loading image:', error);
                  figma.notify(`Error loading image for layer "${layer.name}". Only name was updated.`);
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
        figma.notify('No layers were updated. Make sure layer names start with # matching column names 😕', { timeout: 3000 });
      } else {
        let message = '';
        
        // Case 1: Only text layers
        if (textLayersCount > 0 && otherLayersCount === 0 && imageLayersCount === 0) {
          message = `Tadaan 🥁 ${textLayersCount} Text layer${textLayersCount > 1 ? 's' : ''} updated (name & content)!`;
        }
        // Case 2: Only other layers
        else if (otherLayersCount > 0 && textLayersCount === 0 && imageLayersCount === 0) {
          message = `Tadaan 🥁 ${otherLayersCount} Layer${otherLayersCount > 1 ? 's' : ''} renamed!`;
        }
        // Case 3: Only image layers
        else if (imageLayersCount > 0 && textLayersCount === 0 && otherLayersCount === 0) {
          message = `Tadaan 🥁 ${imageLayersCount} Image layer${imageLayersCount > 1 ? 's' : ''} updated!`;
        }
        // Case 4: Mixed layers
        else {
          message = `Tadaan 🥁 ${updatedNameCount} layers updated:\n`;
          if (textLayersCount > 0) {
            message += `• ${textLayersCount} text layer${textLayersCount > 1 ? 's' : ''} (name & content)\n`;
          }
          if (imageLayersCount > 0) {
            message += `• ${imageLayersCount} image layer${imageLayersCount > 1 ? 's' : ''} (name & image)\n`;
          }
          if (otherLayersCount > 0) {
            message += `• ${otherLayersCount} other layer${otherLayersCount > 1 ? 's' : ''} (name only)`;
          }
        }
        
        figma.notify(message, { timeout: 4000 });
      }
    } catch (error) {
      console.error('Error:', error);
      figma.notify(`Error updating layers: ${error instanceof Error ? error.message : String(error)}`);
    }
  } else if (msg.type === 'close') {
    figma.closePlugin();
  }
};

// Update selection info in UI
figma.on('selectionchange', () => {
  const selection = figma.currentPage.selection;
  const names = selection.map(node => node.name);
  const types = selection.map(node => node.type);

  figma.ui.postMessage({
    type: 'selection-info',
    names,
    types
  });
});