const addBtn = document.getElementById("addBookmark");
const list = document.getElementById("bookmarkList");

addBtn.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab.url.includes("youtube.com/watch")) {
    alert("Open a YouTube video first!");
    return;
  }

  const url = new URL(tab.url);
  const videoId = url.searchParams.get("v");
  const title = tab.title;

  chrome.storage.local.get(["bookmarks"], (result) => {
    const bookmarks = result.bookmarks || [];

    bookmarks.push({
      title: title,
      url: tab.url,
      time: new Date().toLocaleString()
    });

    chrome.storage.local.set({ bookmarks }, displayBookmarks);
  });
});

function displayBookmarks() {
  chrome.storage.local.get(["bookmarks"], (result) => {
    list.innerHTML = "";

    (result.bookmarks || []).forEach((bm) => {
      const li = document.createElement("li");
      const a = document.createElement("a");

      a.href = bm.url;
      a.textContent = bm.title;
      a.target = "_blank";

      li.appendChild(a);
      list.appendChild(li);
    });
  });
}

displayBookmarks();
