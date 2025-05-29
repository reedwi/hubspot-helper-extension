# HubSpot Helper

A Chrome extension that enhances the HubSpot interface by making property management and administration more efficient.

## Features

- **Property Internal Names Display**: Shows internal property names next to their labels throughout the HubSpot interface
- **Quick Copy**: Click on any internal property name to copy it to your clipboard
- **Direct Property Editing**: Click the gear icon (⚙️) next to any property to quickly access its settings page
- **Line Items Support**: Works with line items in quotes and deals, showing internal names for all fields
- **Real-time Updates**: Automatically detects and updates new properties as they appear on the page

## Installation (Developer Mode)

1. Clone this repository to your local machine:
   ```bash
   git clone [repository-url]
   cd hubspot-helper-extension
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" by toggling the switch in the top right corner

4. Click "Load unpacked" and select the `hubspot-helper` directory from this repository

5. The extension should now be installed and active when you visit HubSpot

## Usage

Once installed, the extension automatically activates when you visit any HubSpot page. You'll see:

- Internal property names in parentheses next to field labels
- A gear icon (⚙️) next to each property for quick access to property settings
- Click any internal name to copy it to your clipboard
- Double-click any internal name to open the property settings page

## Development

The extension is built using vanilla JavaScript and CSS. The main components are:

- `content.js`: Contains the core functionality for displaying and managing property information
- `styles.css`: Handles the styling of the added elements
- `manifest.json`: Defines the extension configuration and permissions

## Permissions

The extension requires the following permissions:
- `storage`: For potential future feature storage
- `activeTab`: To interact with the current HubSpot tab
- `tabs`: To open property settings in new tabs
- `notifications`: For potential future feature notifications

## Contributing

Feel free to submit issues and enhancement requests!
 