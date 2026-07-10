(function () {
  "use strict";

  var STORAGE_KEY = "dj_entries_v1";
  var MOODS = [
    { id: "peaceful", icon: "😌" },
    { id: "happy", icon: "😊" },
    { id: "confused", icon: "😵‍💫" },
    { id: "scary", icon: "😱" },
    { id: "sad", icon: "😢" },
    { id: "exciting", icon: "🤩" }
  ];

  var form = document.getElementById("journalForm");
  var dateInput = document.getElementById("entryDate");
  var titleInput = document.getElementById("entryTitle");
  var bodyInput = document.getElementById("entryBody");
  var lucidCheckbox = document.getElementById("entryLucid");
  var moodPicker = document.getElementById("moodPicker");
  var tagInput = document.getElementById("tagInput");
  var tagWrap = document.getElementById("tagInputWrap");
  var entriesListEl = document.getElementById("journalEntries");
  var newEntryBtn = document.getElementById("newEntryBtn");
  var deleteEntryBtn = document.getElementById("deleteEntryBtn");
  var statTotal = document.getElementById("djStatTotal");
  var statLucid = document.getElementById("djStatLucid");
  var statStreak = document.getElementById("djStatStreak");
  var formTitleLabel = document.getElementById("journalFormTitle");

  var entries = load();
  var selectedMood = "";
  var currentTags = [];
  var editingId = null;

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); } catch (e) {}
  }

  function todayStr() {
    var d = new Date();
    return d.toISOString().slice(0, 10);
  }

  function fmtDate(str) {
    if (!str) return "";
    var parts = str.split("-");
    if (parts.length !== 3) return str;
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return months[parseInt(parts[1], 10) - 1] + " " + parseInt(parts[2], 10) + ", " + parts[0];
  }

  function buildMoodPicker() {
    if (!moodPicker) return;
    moodPicker.innerHTML = "";
    MOODS.forEach(function (m) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mood-option" + (m.id === selectedMood ? " selected" : "");
      btn.textContent = m.icon;
      btn.title = m.id;
      btn.addEventListener("click", function () {
        selectedMood = selectedMood === m.id ? "" : m.id;
        buildMoodPicker();
      });
      moodPicker.appendChild(btn);
    });
  }

  function renderTags() {
    if (!tagWrap) return;
    var chips = tagWrap.querySelectorAll(".tag-chip");
    chips.forEach(function (c) { c.remove(); });
    currentTags.forEach(function (tag, idx) {
      var chip = document.createElement("span");
      chip.className = "tag-chip";
      chip.textContent = tag;
      var x = document.createElement("button");
      x.type = "button";
      x.textContent = "✕";
      x.addEventListener("click", function () {
        currentTags.splice(idx, 1);
        renderTags();
      });
      chip.appendChild(x);
      tagWrap.insertBefore(chip, tagInput);
    });
  }

  if (tagInput) {
    tagInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        var val = tagInput.value.trim().replace(/,/g, "");
        if (val && currentTags.indexOf(val) === -1) {
          currentTags.push(val);
          renderTags();
        }
        tagInput.value = "";
      }
    });
  }

  function resetForm() {
    editingId = null;
    if (dateInput) dateInput.value = todayStr();
    if (titleInput) titleInput.value = "";
    if (bodyInput) bodyInput.value = "";
    if (lucidCheckbox) lucidCheckbox.checked = false;
    selectedMood = "";
    currentTags = [];
    buildMoodPicker();
    renderTags();
    if (formTitleLabel) formTitleLabel.textContent = "New dream entry";
    if (deleteEntryBtn) deleteEntryBtn.style.display = "none";
    renderEntriesList();
  }

  function loadEntryIntoForm(entry) {
    editingId = entry.id;
    if (dateInput) dateInput.value = entry.date;
    if (titleInput) titleInput.value = entry.title;
    if (bodyInput) bodyInput.value = entry.body;
    if (lucidCheckbox) lucidCheckbox.checked = !!entry.lucid;
    selectedMood = entry.mood || "";
    currentTags = (entry.tags || []).slice();
    buildMoodPicker();
    renderTags();
    if (formTitleLabel) formTitleLabel.textContent = "Editing entry";
    if (deleteEntryBtn) deleteEntryBtn.style.display = "";
    renderEntriesList();
  }

  function renderStats() {
    var total = entries.length;
    var lucid = entries.filter(function (e) { return e.lucid; }).length;

    var dates = entries.map(function (e) { return e.date; }).sort().reverse();
    var streak = 0;
    if (dates.length) {
      var cursor = new Date(todayStr());
      var set = {};
      dates.forEach(function (d) { set[d] = true; });
      while (true) {
        var key = cursor.toISOString().slice(0, 10);
        if (set[key]) { streak++; cursor.setDate(cursor.getDate() - 1); } else { break; }
      }
    }

    if (statTotal) statTotal.textContent = total;
    if (statLucid) statLucid.textContent = lucid;
    if (statStreak) statStreak.textContent = streak;
  }

  function renderEntriesList() {
    if (!entriesListEl) return;
    entriesListEl.innerHTML = "";

    if (entries.length === 0) {
      entriesListEl.innerHTML = '<div class="empty-state"><div class="empty-icon">🌙</div>No dreams logged yet.</div>';
      renderStats();
      return;
    }

    var sorted = entries.slice().sort(function (a, b) { return b.date.localeCompare(a.date) || b.created - a.created; });

    sorted.forEach(function (entry) {
      var card = document.createElement("div");
      card.className = "entry-card" + (entry.id === editingId ? " active" : "");

      var head = document.createElement("div");
      head.className = "entry-card-head";
      var title = document.createElement("div");
      title.className = "entry-title";
      var moodObj = MOODS.filter(function (m) { return m.id === entry.mood; })[0];
      title.textContent = (moodObj ? moodObj.icon + " " : "") + (entry.title || "Untitled dream") + (entry.lucid ? " 🔮" : "");
      head.appendChild(title);

      var dateEl = document.createElement("div");
      dateEl.className = "entry-card-date";
      dateEl.textContent = fmtDate(entry.date);

      var tagsEl = document.createElement("div");
      tagsEl.className = "entry-card-tags";
      (entry.tags || []).forEach(function (t) {
        var s = document.createElement("span");
        s.textContent = t;
        tagsEl.appendChild(s);
      });

      card.appendChild(head);
      card.appendChild(dateEl);
      if ((entry.tags || []).length) card.appendChild(tagsEl);

      card.addEventListener("click", function () { loadEntryIntoForm(entry); });
      entriesListEl.appendChild(card);
    });

    renderStats();
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var title = titleInput.value.trim() || "Untitled dream";
      var body = bodyInput.value.trim();
      var date = dateInput.value || todayStr();

      if (editingId) {
        var existing = entries.filter(function (en) { return en.id === editingId; })[0];
        if (existing) {
          existing.title = title;
          existing.body = body;
          existing.date = date;
          existing.mood = selectedMood;
          existing.lucid = !!lucidCheckbox.checked;
          existing.tags = currentTags.slice();
        }
      } else {
        entries.push({
          id: "d" + Date.now() + Math.floor(Math.random() * 1000),
          title: title,
          body: body,
          date: date,
          mood: selectedMood,
          lucid: !!lucidCheckbox.checked,
          tags: currentTags.slice(),
          created: Date.now()
        });
      }
      save();
      resetForm();
    });
  }

  if (newEntryBtn) {
    newEntryBtn.addEventListener("click", resetForm);
  }

  if (deleteEntryBtn) {
    deleteEntryBtn.addEventListener("click", function () {
      if (!editingId) return;
      entries = entries.filter(function (e) { return e.id !== editingId; });
      save();
      resetForm();
    });
  }

  buildMoodPicker();
  renderTags();
  if (dateInput) dateInput.value = todayStr();
  renderEntriesList();
})();
