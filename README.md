# Proton Calendar Location Enhancer

An open-source browser extension that adds location search and OpenStreetMap integration to [Proton Calendar](https://calendar.proton.me).

**Status: Experimental — Early Development**

This is an unofficial community project and is not affiliated with or endorsed by Proton AG.

## Features

### Open locations in OpenStreetMap

When viewing an event containing a location, the extension adds an **Open in OpenStreetMap** link.

- Opens the location in a new browser tab.
- Does not modify the calendar event.
- Does not send the location to OpenStreetMap until the link is clicked.

### Search for locations

When creating or editing events, the extension adds a **Search locations** button beneath Proton Calendar's existing location field.

- Search for addresses, businesses, and points of interest.
- View matching locations from the Photon geocoding service, which uses OpenStreetMap data.
- Select a result to populate Proton Calendar's location field.
- Press Enter in the location field to initiate a search.
- Save events normally using Proton Calendar.

Location searches are initiated explicitly by the user. The extension does not automatically transmit location information while typing.

## Installation

The extension is not yet available through the Chrome Web Store.

To install the development version in Brave or Chrome:

1. Download or clone this repository.
2. Open `brave://extensions` or `chrome://extensions`.
3. Enable **Developer mode**.
4. Select **Load unpacked**.
5. Select the directory containing `manifest.json`.
6. Open or refresh [Proton Calendar](https://calendar.proton.me).

After modifying the extension's source code, reload the extension from the browser's Extensions page and refresh Proton Calendar.

## Privacy

Privacy is a primary design consideration.

- The extension operates only on Proton Calendar's website.
- It does not access Proton authentication credentials or encryption keys.
- It does not intentionally collect or transmit event titles, descriptions, attendees, or unrelated calendar information.
- Location searches are sent to the public [Photon](https://github.com/komoot/photon) service only when the user initiates a search.
- Clicking **Open in OpenStreetMap** sends the selected event's location to OpenStreetMap through the resulting navigation.
- The extension does not include analytics or tracking.
- Calendar events continue to be saved through Proton Calendar's normal functionality.

**Important:** The extension runs within Proton Calendar's webpage and can interact with its displayed content. As with any browser extension, users should review its permissions and source code before installing it.

## Known Limitations

- The extension currently supports Chromium-based browsers, with initial testing performed in Brave.
- Location search quality depends on the available OpenStreetMap data and Photon geocoding results.
- Some residential addresses may be inaccurate or unavailable.
- Suite, apartment, floor, and other secondary address information may interfere with map searches. For best results, use the primary street address, city, state, and postal code.
- Search results may contain duplicate or closely related geographic features.
- The extension depends on Proton Calendar's current HTML structure and may require updates when Proton changes its interface.
- Network error handling and some asynchronous search scenarios are not yet fully addressed.
- The public Photon server is currently used for development and evaluation; its suitability for wider distribution remains under review.

## Planned Improvements

Potential future enhancements include:

- Search-as-you-type autocomplete with debouncing.
- Improved error handling and asynchronous request management.
- Better search-result presentation and keyboard navigation.
- Configurable mapping and geocoding providers.
- TypeScript migration.
- Browser compatibility improvements.

These features are not guaranteed and will be prioritized based on development progress and community feedback.

## Development

The extension currently uses:

- JavaScript
- Chrome Extension Manifest V3
- Content scripts for Proton Calendar interface enhancements
- A background service worker for geocoding requests
- Photon for location search
- OpenStreetMap for map links

No build process, external JavaScript libraries, or backend server are currently required.

## Contributing and Feedback

Bug reports, suggestions, and contributions are welcome through GitHub Issues and pull requests.

Because the extension interacts with Proton Calendar's user interface, please include relevant browser and Proton Calendar interface details when reporting compatibility problems.

## License

This project is licensed under the MIT License. See LICENSE for details.
