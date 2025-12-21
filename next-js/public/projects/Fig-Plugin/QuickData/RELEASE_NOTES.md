# QuickData Plugin Release Notes

## Version 2.0.0 (2024)

### Major Changes
- **Streamlined Data Syncing**
  - Simplified the core functionality to focus on direct Google Sheets integration
  - Improved data normalization for sheets with or without frozen headers
  - Enhanced error handling for invalid URLs and data formats

### UI Improvements
- **Tea Cup Animation**
  - Added animated steam effects with three particles
  - Implemented hover animations for the "Buy me tea" link
  - Refined positioning and styling of the tea cup SVG
  - Modified steam animation timing and positions

- **Instructions Modal**
  - Reorganized the "How to use" modal content for better clarity
  - Added clearer sections for:
    - Sheet preparation
    - Plugin usage
    - Layer syncing
  - Included tips about header rows and preview functionality

### Technical Improvements
- **Code Optimization**
  - Removed unused interfaces and functions for better maintainability
  - Streamlined the core data syncing logic
  - Improved error message handling
  - Enhanced logging for better debugging

### User Experience
- **Better Feedback**
  - Added clear success messages with layer count details
  - Improved error notifications with specific failure reasons
  - Added loading states during data fetch operations

### Documentation
- **Plugin Description**
  - Updated cover image text: "Instantly sync your Google Sheets data with Figma layers for seamless content updates"
  - Enhanced usage instructions and examples

## How to Use
1. **Prepare Your Google Sheet**
   - Make your sheet public (File → Share → Anyone with the link)
   - Ensure your first row contains column headers
   - For best results, freeze the header row

2. **In the Plugin**
   - Paste your Google Sheet URL
   - Preview your data in the table
   - Use the refresh button to update data if needed

3. **Layer Setup**
   - Name your layers with # followed by the column name
   - Example: For "Name" column → Layer "#Name"
   - Spaces and special characters are removed automatically

4. **Sync Data**
   - Select the layers you want to update
   - Click the "Sync" button
   - Text layers: Both name and content update
   - Other layers: Names update only 