/**
 * Background service worker for the Proton Calendar Location extension.
 *
 * Handles geocoding requests so the content script doesn't need to
 * make cross-origin requests directly from Proton Calendar.
 */

const LOG_PREFIX = "[Proton Calendar Location]";

console.log(`${LOG_PREFIX} Background service worker started.`);

/**
 * Listens for messages from other parts of the extension.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Ignore messages that aren't location search requests.
  if (!message || message.type !== "SEARCH_LOCATION") {
    return false;
  }

  // Only accept search requests from our extension's content script
  // running on Proton Calendar.
  const isTrustedSender =
    sender.id === chrome.runtime.id &&
    sender.url?.startsWith("https://calendar.proton.me/");

  if (!isTrustedSender) {
    sendResponse({
      success: false,
      error: "Unauthorized location search request.",
    });

    return false;
  }

  // Validate the search query before contacting Photon.
  if (
    typeof message.query !== "string" ||
    !message.query.trim() ||
    message.query.length > 255
  ) {
    sendResponse({
      success: false,
      error: "Invalid location search query.",
    });

    return false;
  }

  // Process the asynchronous request separately.
  searchPhoton(message.query)
    .then((results) => {
      sendResponse({ success: true, results });
    })
    .catch((error) => {
      console.error(`${LOG_PREFIX} Photon request failed:`, error);

      sendResponse({
        success: false,
        error: error.message,
      });
    });

  // Keep the message channel open while the asynchronous request runs.
  return true;
});

/**
 * Searches the Photon geocoding API.
 *
 * @param {string} query - Address or place name to search for.
 * @returns {Promise<Array>} GeoJSON features returned by Photon.
 */
async function searchPhoton(query) {
  const url = new URL("https://photon.komoot.io/api");

  url.searchParams.set("q", query);
  url.searchParams.set("limit", "5");

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Photon returned HTTP ${response.status}`);
  }

  const data = await response.json();

  // Verify that Photon returned the expected GeoJSON feature list.
  // Reject unexpected response structures rather than forwarding
  // malformed data to the content script.
  if (!data || !Array.isArray(data.features)) {
    throw new Error("Photon returned an invalid response format.");
  }

  return data.features;
}
