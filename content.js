const LOG_PREFIX = "[Proton Calendar Location]";

console.log(`${LOG_PREFIX} Extension loaded successfully.`);

// Keep track of the most recently detected popover element.
let currentPopover = null;

// Identifies the latest location search request.
let latestSearchId = 0;

/**
 * Finds the location text displayed in an event popover.
 *
 * Returns null if the event has no recognizable location.
 *
 * @param {HTMLElement} popover - The event popover element.
 * @returns {string|null}
 */
function getEventLocation(popover) {
  // Find the accessibility label identifying the location row.
  const locationLabel = Array.from(popover.querySelectorAll(".sr-only")).find(
    (element) => element.textContent.trim() === "Location",
  );

  if (!locationLabel) {
    return null;
  }

  // Find the row containing the location label.
  const locationRow = locationLabel.closest("label")?.parentElement;

  // Read the location text from the corresponding row.
  const locationText = locationRow?.querySelector(".text-break");

  return locationText?.textContent.trim() || null;
}

/**
 * Checks the current event popover and ensures its map link
 * corresponds to the currently displayed location.
 */
function checkForEventPopover() {
  const eventPopover = document.querySelector(".eventpopover");

  if (eventPopover !== currentPopover) {
    currentPopover = eventPopover;

    console.log(
      `${LOG_PREFIX} Event popover ${eventPopover ? "opened" : "closed"}.`,
    );
  }

  if (!eventPopover) {
    return;
  }

  // The popover may be reused when switching between events.
  // Keep its map link synchronized with the displayed location.
  addMapLink(eventPopover);
}

/**
 * Adds a link to OpenStreetMap beside an event's location.
 *
 * @param {HTMLElement} popover - The event popover element.
 */
function addMapLink(popover) {
  const location = getEventLocation(popover);

  // Find any map link we've previously added.
  const existingLink = popover.querySelector(".pcl-map-link");

  // If the current event has no location, remove any stale link.
  if (!location) {
    existingLink?.remove();
    return;
  }

  // Find a previously inserted map link, if one exists.

  if (existingLink) {
    const mapUrl = new URL("https://www.openstreetmap.org/search");
    mapUrl.searchParams.set("query", location);

    // Update the destination when the displayed location changes.
    existingLink.href = mapUrl.toString();

    return;
  }

  // Find the location's accessibility label.
  const locationLabel = Array.from(popover.querySelectorAll(".sr-only")).find(
    (element) => element.textContent.trim() === "Location",
  );

  const locationRow = locationLabel?.closest("label")?.parentElement;
  const locationText = locationRow?.querySelector(".text-break");

  if (!locationText) {
    return;
  }

  // Construct the OpenStreetMap search URL.
  const mapUrl = new URL("https://www.openstreetmap.org/search");
  mapUrl.searchParams.set("query", location);

  const link = document.createElement("a");

  link.href = mapUrl.toString();
  link.textContent = "Open in OpenStreetMap";
  link.className = "pcl-map-link";
  link.target = "_blank";
  link.rel = "noopener noreferrer";

  // Keep the link visually separate from the address.
  link.style.display = "block";
  link.style.marginTop = "4px";
  link.style.fontSize = "0.875rem";

  locationText.insertAdjacentElement("afterend", link);
}

// Watch for elements being added or removed.
const observer = new MutationObserver(() => {
  checkForEventPopover();
  addLocationSearchButton();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Perform an initial check when the content script loads.
checkForEventPopover();
addLocationSearchButton();

/**
 * Requests location suggestions from the background service worker.
 *
 * @param {string} query - The address or place to search for.
 */
function searchLocations(query) {
  const searchContainer = document.querySelector(".pcl-search-container");

  // Invalidate any previous search, including when this query is empty.
  const searchId = ++latestSearchId;

  // Remember which editor initiated this search.
  const locationInput = document.querySelector("#event-location-input");
  const searchButton = document.querySelector(".pcl-search-button");

  // Clear previous validation messages and search results.
  searchContainer?.querySelector(".pcl-search-error")?.remove();
  searchContainer?.querySelector(".pcl-search-results")?.remove();

  if (!query.trim()) {
    const error = document.createElement("div");

    error.className = "pcl-search-error";
    error.textContent = "Enter a location above before searching.";
    error.setAttribute("role", "alert");

    error.style.color = "#e57373";
    error.style.fontSize = "0.875rem";
    error.style.marginTop = "4px";

    searchContainer?.appendChild(error);

    return;
  }

  chrome.runtime.sendMessage(
    {
      type: "SEARCH_LOCATION",
      query: query.trim(),
    },
    (response) => {
      // Ignore results from searches that are no longer current,
      // or from an event editor that has since been closed or replaced.
      if (
        searchId !== latestSearchId ||
        !locationInput?.isConnected ||
        !searchButton?.isConnected ||
        document.querySelector("#event-location-input") !== locationInput ||
        document.querySelector(".pcl-search-button") !== searchButton
      ) {
        return;
      }

      if (chrome.runtime.lastError) {
        console.error(
          `${LOG_PREFIX} Messaging error:`,
          chrome.runtime.lastError.message,
        );
        return;
      }

      if (!response?.success) {
        console.error(`${LOG_PREFIX} Location search failed:`, response?.error);
        return;
      }

      displayLocationResults(response.results);
    },
  );
}

/**
 * Displays Photon search results in the event editor.
 *
 * @param {Array} results - GeoJSON features returned by Photon.
 */
function displayLocationResults(results) {
  const searchButton = document.querySelector(".pcl-search-button");

  if (!searchButton) {
    return;
  }

  // Remove any previous search results.
  document.querySelector(".pcl-search-results")?.remove();

  const container = document.createElement("div");
  container.className = "pcl-search-results";

  container.style.marginTop = "8px";
  container.style.fontSize = "0.875rem";

  // Limit how much of Proton's event editor the results can occupy.
  container.style.maxHeight = "220px";
  container.style.overflowY = "auto";
  container.style.overscrollBehavior = "contain";

  for (const result of results) {
    const properties = result.properties;

    // Build a readable label from the available address fields.
    const address = [
      properties.name,
      [properties.housenumber, properties.street].filter(Boolean).join(" "),
      properties.city,
      properties.state,
    ]
      .filter(Boolean)
      .join(", ");

    // Use a button so results are clickable and keyboard accessible.
    const item = document.createElement("button");

    item.type = "button";
    item.textContent = address;
    item.className = "pcl-search-result";

    item.style.display = "block";
    item.style.width = "100%";
    item.style.padding = "8px 6px";
    item.style.textAlign = "left";
    item.style.borderBottom = "1px solid #ccc";
    item.style.cursor = "pointer";

    item.addEventListener("click", () => {
      selectLocation(address);
    });

    container.appendChild(item);
  }

  if (results.length === 0) {
    container.textContent = "No matching locations found.";
  }

  // Display results immediately after our search button.
  searchButton.insertAdjacentElement("afterend", container);
  container.style.width = "100%";

  // Scroll the event editor just enough to reveal the search results.
  container.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
  });
}

/**
 * Populates Proton Calendar's location field with a selected result.
 *
 * Uses the native input setter and dispatches an input event
 * so React recognizes the change.
 *
 * @param {string} address - The selected location.
 */
function selectLocation(address) {
  const input = document.querySelector("#event-location-input");

  if (!input) {
    return;
  }

  // Use the native setter to work with React-controlled inputs.
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  ).set;

  setter.call(input, address);

  // Notify React that the input value changed.
  input.dispatchEvent(new Event("input", { bubbles: true }));

  // Remove search results after selection.
  document.querySelector(".pcl-search-results")?.remove();
}

/**
 * Adds a location search button to Proton Calendar's event editor.
 *
 * The button uses the existing location input as its search query.
 * No request is sent until the user clicks the button.
 */
function addLocationSearchButton() {
  const locationInput = document.querySelector("#event-location-input");

  if (!locationInput) {
    return;
  }

  // Avoid adding multiple buttons to the same editor.
  if (document.querySelector(".pcl-search-button")) {
    return;
  }

  const button = document.createElement("button");

  button.type = "button";
  button.textContent = "Search locations";
  // Reuse Proton Calendar's existing button styles.
  button.className =
    "pcl-search-button button-underline button-medium button-underline-norm";

  button.addEventListener("click", () => {
    searchLocations(locationInput.value);
  });

  // Search when Enter is pressed in Proton's location field.
  // Prevent the event form from being submitted.
  locationInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.isComposing) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    searchLocations(locationInput.value);
  });

  // Create a container for our extension's search controls.
  const searchContainer = document.createElement("div");
  searchContainer.className = "pcl-search-container";

  searchContainer.style.display = "flex";
  searchContainer.style.flexDirection = "column";
  searchContainer.style.alignItems = "flex-start";
  searchContainer.style.width = "100%";

  // Add the search button to our container.
  searchContainer.appendChild(button);

  // Place our container below Proton's existing input component.
  const inputContainer = locationInput.closest('[data-testid="input-root"]');

  inputContainer.insertAdjacentElement("afterend", searchContainer);
}
