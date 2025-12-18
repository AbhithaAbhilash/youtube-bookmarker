// 1. Global variable (TOP of the file)
let currentVideo = null;

// 2. When popup opens
document.addEventListener("DOMContentLoaded", () => {
  detectCurrentVideo();
  loadBookmarks();
});

// 3. Button click listener
document.getElementById("saveBtn").addEventListener("click", saveBookmark);

// 4. Detect current YouTube video
function detectCurrentVideo() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];

    if (tab.url && tab.url.includes("youtube.com/watch")) {
      let cleanTitle = tab.title
        .replace(/^\(\d+\)\s*/, "")   // removes (60)
        .replace(" - YouTube", "")
        .trim();

      currentVideo = {
        title: cleanTitle,
        url: tab.url
      };
      document.getElementById("currentVideo").textContent =
  `📺 ${currentVideo.title}`;

    } else {
      document.getElementById("currentVideo").innerHTML =
        "Open a YouTube video to bookmark";
    }
  });
}

// 5. ✅ ADD YOUR saveBookmark FUNCTION HERE
function saveBookmark() {
  if (!currentVideo) {
    return alert("No YouTube video detected");
  }

  const category = document.getElementById("category").value;

  const bookmark = {
    id: Date.now(),
    title: currentVideo.title,
    url: currentVideo.url,
    category
  };

  chrome.storage.local.get(["bookmarks"], (result) => {
    const bookmarks = result.bookmarks || [];
    bookmarks.push(bookmark);
    chrome.storage.local.set({ bookmarks }, loadBookmarks);
  });
}

// 6. Remaining helper functions
function loadBookmarks() {
  chrome.storage.local.get(["bookmarks"], (result) => {
    displayBookmarks(result.bookmarks || []);
  });
}

function deleteBookmark(id) {
  chrome.storage.local.get(["bookmarks"], (result) => {
    const updated = result.bookmarks.filter(b => b.id !== id);
    chrome.storage.local.set({ bookmarks: updated }, loadBookmarks);
  });
}

function groupByCategory(bookmarks) {
  return bookmarks.reduce((groups, b) => {
    if (!groups[b.category]) groups[b.category] = [];
    groups[b.category].push(b);
    return groups;
  }, {});
}

function displayBookmarks(bookmarks) {
  const container = document.getElementById("bookmarkList");
  container.innerHTML = "";

  const grouped = groupByCategory(bookmarks);

  for (const category in grouped) {
    const h = document.createElement("h3");
    h.textContent = category;
    container.appendChild(h);

    grouped[category].forEach(b => {
      const div = document.createElement("div");
      div.className = "bookmark-item";
      div.innerHTML = `
        <a href="${b.url}" target="_blank">${b.title}</a>
        <button class="delete-btn">&times;</button>
      `;
      div.querySelector("button").onclick = () => deleteBookmark(b.id);
      container.appendChild(div);
    });
  }
}
