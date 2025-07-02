document.addEventListener("DOMContentLoaded", function () {
  const searchBtn = document.getElementById("searchBtn");
  const queryInput = document.getElementById("query");
  queryInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      searchBtn.click();
    }
  });
  searchBtn.addEventListener("click", function () {
    const query = queryInput.value.trim();
    if (!query) return;
    const sites = document.querySelectorAll(".site:checked");
    const urls = {
      unsplash: "https://unsplash.com/s/photos/",
      freepik: "https://www.freepik.com/search?format=search&query=",
      pexels: "https://www.pexels.com/search/",
      google: "https://www.google.com/search?tbm=isch&q=",
    };
    sites.forEach((site) => {
      const baseUrl = urls[site.value];
      const searchUrl = baseUrl + encodeURIComponent(query);
      chrome.tabs.query({}, function (tabs) {
        let domainMatch;
        domainMatch = (tab) => tab.url && tab.url.includes(site.value + ".com");

        const existingTab = tabs.find(domainMatch);
        if (existingTab) {
          chrome.tabs.update(existingTab.id, { url: searchUrl, active: true });
        } else {
          chrome.tabs.create({ url: searchUrl });
        }
      });
    });
    chrome.storage.local.set({ lastQuery: query });
  });

  // Restore last value
  chrome.storage.local.get("lastQuery", function(data) {
    if (data.lastQuery) {
      queryInput.value = data.lastQuery;
    }
  });
  queryInput.focus();
});
