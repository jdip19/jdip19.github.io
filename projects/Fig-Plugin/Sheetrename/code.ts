interface TaggedLayer {
  id: string;
  name: string;
  type: string;
  tags: string[];
}

interface SheetToLayerMapping {
  [columnName: string]: string; // column name -> layer id
}

// Show UI with dimensions
figma.showUI(__html__, { width: 450, height: 550 });

// Handle messages from the UI
figma.ui.onmessage = async (msg: any) => {
  if (msg.type === 'get-frame-layers') {
    const selection = figma.currentPage.selection;
    if (selection.length === 0) {
      figma.ui.postMessage({ 
        type: 'error', 
        message: 'Please select a frame or group first' 
      });
      return;
    }
    
    const container = selection[0];
    if (container.type !== 'FRAME' && container.type !== 'GROUP') {
      figma.ui.postMessage({ 
        type: 'error', 
        message: 'Please select a frame or group' 
      });
      return;
    }
    
    // Get all text layers with "#" prefix in their name
    const taggedLayers = findTaggedLayers(container);
    figma.ui.postMessage({ 
      type: 'frame-layers', 
      layers: taggedLayers 
    });
  }
  
  else if (msg.type === 'sync-sheet-data') {
    const { sheetUrl, mappings, rowIndex } = msg;
    
    if (!mappings || Object.keys(mappings).length === 0) {
      figma.ui.postMessage({ 
        type: 'error', 
        message: 'No column to layer mappings provided' 
      });
      return;
    }
    
    // Let the UI handle the Google Sheets API call
    figma.ui.postMessage({ 
      type: 'fetch-sheet-data', 
      sheetUrl: sheetUrl,
      rowIndex: rowIndex
    });
  }
  
  else if (msg.type === 'update-layers') {
    const { data, mappings } = msg;
    
    try {
      await updateLayers(data, mappings);
      figma.ui.postMessage({ 
        type: 'success', 
        message: 'Layers updated successfully!' 
      });
    } catch (error) {
      figma.ui.postMessage({ 
        type: 'error', 
        message: `Error updating layers: ${error instanceof Error ? error.message : String(error)}` 
      });
    }
  }
  
  else if (msg.type === 'close') {
    figma.closePlugin();
  }
};

// Find all text layers with "#" prefix in their name
function findTaggedLayers(node: SceneNode): TaggedLayer[] {
  const taggedLayers: TaggedLayer[] = [];
  
  // Helper function to traverse nodes
  function traverse(node: SceneNode): void {
    // Check if node has a name property and it includes a hashtag
    if ('name' in node && typeof node.name === 'string' && node.name.includes('#')) {
      // Check if it's a supported node type
      if (node.type === 'TEXT' || node.type === 'FRAME' || node.type === 'GROUP' || 
          node.type === 'RECTANGLE' || node.type === 'INSTANCE') {
        
        // Extract tag from name (format: "Layer Name #tagname")
        const tagMatch = node.name.match(/#([a-zA-Z0-9_]+)/g);
        
        if (tagMatch) {
          const tags = tagMatch.map(tag => tag.slice(1)); // Remove '#' prefix
          
          taggedLayers.push({
            id: node.id,
            name: node.name,
            type: node.type,
            tags: tags
          });
        }
      }
    }
    
    // Traverse children if they exist
    if ('children' in node) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }
  
  traverse(node);
  
  return taggedLayers;
}

// Update layers with data from Google Sheet
async function updateLayers(data: string[][], mappings: SheetToLayerMapping): Promise<void> {
  // Convert header row to mapping
  const headers = data[0];
  const columnMap: {[key: string]: number} = {};
  headers.forEach((header, index) => {
    columnMap[header.trim()] = index;
  });

  // Get data row
  const rowData = data[1]; // Default to first data row
  
  // Update each mapped layer
  for (const columnName in mappings) {
    const layerId = mappings[columnName];
    if (!layerId) continue;
    
    const layer = figma.getNodeById(layerId);
    if (!layer) continue;
    
    const columnIndex = columnMap[columnName];
    if (columnIndex === undefined) continue;
    
    const value = rowData[columnIndex] || '';
    
    // Apply value based on layer type
    if (layer.type === 'TEXT') {
      // Need to type cast to access text properties
      const textNode = layer as TextNode;
      
      // Load font before setting text
      await figma.loadFontAsync(textNode.fontName as FontName);
      textNode.characters = String(value);
    } 
    else if (layer.type === 'RECTANGLE' || layer.type === 'FRAME') {
      const shapeNode = layer as RectangleNode | FrameNode;
      
      // Handle image URL if it starts with "http" and ends with an image extension
      if (typeof value === 'string' && 
          value.toLowerCase().startsWith('http') && 
          /\.(jpg|jpeg|png|gif|svg)$/i.test(value)) {
        // We can't directly set images from URLs in Figma plugin API
        // Just notify the user about this limitation
        figma.ui.postMessage({
          type: 'info',
          message: `Image URL detected for layer ${layer.name}. Image URLs can't be automatically applied.`
        });
      } 
      // For other values, update the layer name or a property
      else if (typeof value === 'string' && /^#([0-9A-F]{6}|[0-9A-F]{3})$/i.test(value)) {
        // If the value is a hex color
        const [r, g, b] = hexToRgb(value);
        shapeNode.fills = [{
          type: 'SOLID',
          color: { r, g, b },
          opacity: 1
        }];
      }
    } 
    else if (layer.type === 'GROUP' || layer.type === 'INSTANCE') {
      // For groups/instances, set plugin data
      layer.setPluginData('sheetValue', String(value));
    }
  }
}

// Helper: Convert hex color to RGB components (0-1 range for Figma)
function hexToRgb(hex: string): [number, number, number] {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse the hex value
  let r: number, g: number, b: number;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16) / 255;
    g = parseInt(hex[1] + hex[1], 16) / 255;
    b = parseInt(hex[2] + hex[2], 16) / 255;
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16) / 255;
    g = parseInt(hex.substring(2, 4), 16) / 255;
    b = parseInt(hex.substring(4, 6), 16) / 255;
  } else {
    // Default to black if invalid format
    r = g = b = 0;
  }
  
  return [r, g, b];
}