(function () {
  "use strict";

  var STORAGE_KEY = "mn_memos_v1";
  var COLORS = [
    { id: "yellow", bg: "#FBE6A8" },
    { id: "mint", bg: "#CDE7DD" },
    { id: "peach", bg: "#F6DCD1" },
    { id: "lilac", bg: "#E6E0F5" },
    { id: "sky", bg: "#D9E8F5" }
  ];

  var grid = document.getElementById("notesGrid");
  var addBtn = document.getElementById("addMemoBtn");
  var searchInput = document.getElementById("memoSearchInput");
  var colorPicker = document.getElementById("memoColorPicker");
  var memoCount = document.getElementById("memoCount");

  var selectedColor = COLORS[0].id;
  var memos = load();

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [
      { id: "m1", title: "Welcome 👋", body: "This is a sticky memo. Click any note to edit it — everything saves automatically.", color: "yellow", pinned: true, updated: Date.now() }
    ];
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(memos)); } catch (e) {}
  }

  function colorBg(id) {
    var c = COLORS.filter(function (c) { return c.id === id; })[0];
    return c ? c.bg : COLORS[0].bg;
  }

  function fmtDate(ts) {
    var d = new Date(ts);
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return months[d.getMonth()] + " " + d.getDate();
  }

  function buildColorPicker() {
    if (!colorPicker) return;
    colorPicker.innerHTML = "";
    COLORS.forEach(function (c) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "memo-color-dot" + (c.id === selectedColor ? " selected" : "");
      dot.style.background = c.bg;
      dot.title = c.id;
      dot.addEventListener("click", function () {
        selectedColor = c.id;
        buildColorPicker();
      });
      colorPicker.appendChild(dot);
    });
  }

  function render(filterText) {
    if (!grid) return;
    grid.innerHTML = "";
    var filtered = memos.filter(function (m) {
      if (!filterText) return true;
      var t = (m.title + " " + m.body).toLowerCase();
      return t.indexOf(filterText.toLowerCase()) !== -1;
    });

    filtered.sort(function (a, b) {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.updated - a.updated;
    });

    if (memoCount) memoCount.textContent = memos.length + (memos.length === 1 ? " memo" : " memos");

    if (filtered.length === 0) {
      grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><div class="empty-icon">🗒️</div>' + (filterText ? "No memos match your search." : "No memos yet — click \u201cNew Memo\u201d to add one.") + '</div>';
      return;
    }

    filtered.forEach(function (memo) {
      var card = document.createElement("div");
      card.className = "note-card";
      card.style.background = colorBg(memo.color);
      card.style.setProperty("--tilt", ((memo.id.charCodeAt(1) % 5) - 2) + "deg");

      var pin = document.createElement("span");
      pin.className = "note-pin";
      pin.title = memo.pinned ? "Unpin" : "Pin";
      pin.textContent = memo.pinned ? "📌" : "📍";
      pin.style.opacity = memo.pinned ? "1" : "0.4";
      pin.addEventListener("click", function () {
        memo.pinned = !memo.pinned;
        save();
        render(searchInput ? searchInput.value : "");
      });

      var titleInput = document.createElement("input");
      titleInput.className = "note-title";
      titleInput.value = memo.title;
      titleInput.placeholder = "Title";
      titleInput.addEventListener("input", function () {
        memo.title = titleInput.value;
        memo.updated = Date.now();
        save();
        if (memoCount) memoCount.textContent = memos.length + (memos.length === 1 ? " memo" : " memos");
      });

      var bodyArea = document.createElement("textarea");
      bodyArea.className = "note-body";
      bodyArea.value = memo.body;
      bodyArea.placeholder = "Write a quick note…";
      bodyArea.addEventListener("input", function () {
        memo.body = bodyArea.value;
        memo.updated = Date.now();
        save();
      });

      var footer = document.createElement("div");
      footer.className = "note-footer";
      var date = document.createElement("span");
      date.className = "note-date";
      date.textContent = fmtDate(memo.updated);
      var del = document.createElement("button");
      del.className = "note-delete";
      del.title = "Delete memo";
      del.innerHTML = "🗑";
      del.addEventListener("click", function () {
        memos = memos.filter(function (m) { return m.id !== memo.id; });
        save();
        render(searchInput ? searchInput.value : "");
      });
      footer.appendChild(date);
      footer.appendChild(del);

      card.appendChild(pin);
      card.appendChild(titleInput);
      card.appendChild(bodyArea);
      card.appendChild(footer);
      grid.appendChild(card);
    });
  }

  if (addBtn) {
    addBtn.addEventListener("click", function () {
      var memo = {
        id: "m" + Date.now() + Math.floor(Math.random() * 1000),
        title: "",
        body: "",
        color: selectedColor,
        pinned: false,
        updated: Date.now()
      };
      memos.unshift(memo);
      save();
      render(searchInput ? searchInput.value : "");
      var firstTitle = grid.querySelector(".note-title");
      if (firstTitle) firstTitle.focus();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      render(searchInput.value);
    });
  }

  buildColorPicker();
  render("");
})();
