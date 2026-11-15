# Privacy Policy — Proton Calendar Location Enhancer

**Last updated: November 14, 2026**

Proton Calendar Location Enhancer is a free, open-source browser extension that adds location search and OpenStreetMap links to Proton Calendar. It is an unofficial community project and is not affiliated with Proton AG.

## Information Accessed and Processed

The extension operates on `https://calendar.proton.me` and accesses location information displayed in Proton Calendar events or entered into the location field.

This information is used solely to provide location search, populate the event's location field, and create OpenStreetMap links.

The extension does not intentionally access or collect event titles, descriptions, attendees, authentication credentials, or encryption keys.

## Location Searches

When a user explicitly initiates a location search, the search query is sent over HTTPS to the public Photon geocoding service at `https://photon.komoot.io`.

Photon returns matching location suggestions, which the extension displays within Proton Calendar.

No location-search requests are sent automatically while the user types.

Because Photon is an external service, it may receive technical information associated with the request, including the user's IP address. Photon's handling and retention of that information are governed by its own practices.

## OpenStreetMap Links

When viewing an event containing a location, the extension adds a link to OpenStreetMap.

The location is not sent to OpenStreetMap merely because the event is displayed. If the user clicks the link, the browser opens OpenStreetMap and includes the event's location in the search URL.

OpenStreetMap may receive the location and associated connection information when the page is opened.

## Data Storage and Tracking

The extension does not:

- Maintain a developer-operated database of user information or location searches.
- Include analytics, advertising, or tracking functionality.
- Sell user data.
- Transmit unrelated calendar event information to the developer.
- Store a history of location searches.

Selected locations are saved through Proton Calendar's normal event-saving functionality.

## Browser Permissions

The extension's access is limited to Proton Calendar's website and the Photon geocoding service.

Its content script operates within Proton Calendar's webpage and can technically interact with displayed page content, but its functionality is designed to process only the information needed for location-related features.

## Data Use

Information accessed by the extension is used only to provide its stated location-enhancement functionality.

The extension's use of user data adheres to the Chrome Web Store User Data Policy, including its Limited Use requirements.

## Changes to This Policy

This policy may be updated if the extension's functionality or data-handling practices change. Updates will be published in the project's GitHub repository.

## Contact and Questions

For privacy questions, bug reports, or other concerns, please open a GitHub Issue:

https://github.com/dvdmon/proton-calendar-location/issues

Source code:

https://github.com/dvdmon/proton-calendar-location
