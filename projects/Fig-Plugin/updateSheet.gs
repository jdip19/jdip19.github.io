function updatePluginData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sourceSheet = ss.getActiveSheet();
  const pluginSheet = ss.getSheetByName("Plugin Data") || ss.insertSheet("Plugin Data");
  
  try {
    // Clear the plugin sheet
    pluginSheet.clear();
    
    // Get the selected month from A1 (assuming that's where it is)
    const selectedMonth = sourceSheet.getRange("A1").getValue();
    
    // Get data using your getData function
    const data = getData(selectedMonth);
    
    // Check if data is an array (success) or string (error message)
    if (Array.isArray(data) && data.length > 0) {
      // Create headers
      const headers = ["Date", "Day", "spost"];
      pluginSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Process and write the data
      const processedData = data.map(row => {
        const date = row[0];
        const event = row[1];
        const formattedDate = Utilities.formatDate(date, Session.getScriptTimeZone(), "d MMM");
        return [
          formattedDate,           // Date column
          event,                   // Day column
          `UpTechMind Social Post/2025/May/May-SDays/${formattedDate}-${event}` // spost column
        ];
      });
      
      // Write the processed data
      if (processedData.length > 0) {
        pluginSheet.getRange(2, 1, processedData.length, processedData[0].length)
          .setValues(processedData);
      }
      
      // Auto-resize columns
      pluginSheet.autoResizeColumns(1, headers.length);
      
      return "Plugin Data sheet updated successfully with " + processedData.length + " events!";
    } else {
      // If data is a string, it's an error message
      return "No data to update: " + (typeof data === 'string' ? data : "Unknown error");
    }
    
  } catch (error) {
    return "Error updating Plugin Data: " + error.toString();
  }
}

// Trigger this function when the sheet changes
function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  const range = e.range;
  
  // Check if edit was made in column D (source column)
  if (range.getColumn() === 4) { // 4 represents column D
    copyProcessedData();
  }
}

function copyProcessedData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  
  try {
    // Get data from column D (source data)
    const sourceRange = sheet.getRange("D2:D" + sheet.getLastRow());
    const sourceData = sourceRange.getValues();
    
    // Get dates from column B for reference
    const dateRange = sheet.getRange("B2:B" + sheet.getLastRow());
    const dateData = dateRange.getValues();
    
    // Process the data
    const processedData = sourceData.map((row, index) => {
      const value = row[0];
      const dateCell = dateData[index][0];
      
      if (value && typeof value === 'string' && value.trim() !== '') {
        // Extract the date and format it
        let dateStr = "";
        if (dateCell) {
          const date = new Date(dateCell);
          dateStr = Utilities.formatDate(date, Session.getScriptTimeZone(), "d");
        }
        
        // Extract the event name from the path
        const eventName = value.split('/').pop().split('-').slice(1).join('-');
        
        // Create the processed format
        return [`UpTechMind Social Post/2025/May/May-SDays/${dateStr}-${eventName}`];
      }
      return ['']; // Empty cells remain empty
    });
    
    // Write to column E
    if (processedData.length > 0) {
      const targetRange = sheet.getRange(2, 5, processedData.length, 1); // Column E
      targetRange.setValues(processedData);
    }
    
    // Add a timestamp to show when the copy was made
    sheet.getRange("E1").setValue("Last Updated: " + new Date().toLocaleString());
    
  } catch (error) {
    console.error("Error copying data: " + error.toString());
  }
}

// Add a menu item to update the data
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Plugin Tools')
    .addItem('Update Plugin Data', 'updatePluginData')
    .addToUi();
}

// Add menu item to manually trigger the copy
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Data Tools')
    .addItem('Copy & Process Data', 'copyProcessedData')
    .addToUi();
} 