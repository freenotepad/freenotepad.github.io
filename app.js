// ==========================================================
// FreeNotepad — Editor Application Logic
// ==========================================================
document.addEventListener("DOMContentLoaded", function () {
  const editor = document.getElementById("editor");
  const wordCountEl = document.getElementById("wordCount");
  const charCountEl = document.getElementById("charCount");
  const lineCountEl = document.getElementById("lineCount");
  const autosaveLabel = document.getElementById("autosaveLabel");
  const fontSizeSelect = document.getElementById("fontSizeSelect");
  const fontFamilySelect = document.getElementById("fontFamilySelect");
  const notebook = document.getElementById("editor-top-app");

  const STORAGE_KEY = "freenotepad_content_v1";

  /* ---------- Load saved content ---------- */
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved !== null) {
    editor.innerHTML = saved;
  }

  updateStats();

  /* ---------- Autosave ---------- */
  let saveTimer = null;
  editor.addEventListener("input", function () {
    updateStats();
    if (autosaveLabel) autosaveLabel.textContent = "Saving…";
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, editor.innerHTML);
      if (autosaveLabel) autosaveLabel.textContent = "Saved to this browser";
    }, 500);
  });

  /* ---------- Stats ---------- */
  function updateStats() {
    const text = editor.innerText || "";
    const trimmed = text.trim();
    const words = trimmed.length ? trimmed.split(/\s+/).length : 0;
    const chars = text.length;
    const lines = trimmed.length ? trimmed.split(/\n/).length : 0;
    if (wordCountEl) wordCountEl.textContent = words + (words === 1 ? " word" : " words");
    if (charCountEl) charCountEl.textContent = chars + (chars === 1 ? " character" : " characters");
    if (lineCountEl) lineCountEl.textContent = lines + (lines === 1 ? " line" : " lines");
  }

  /* ---------- Toolbar: formatting commands ---------- */
  document.querySelectorAll("[data-command]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cmd = btn.getAttribute("data-command");
      editor.focus();
      document.execCommand(cmd, false, null);
      btn.classList.toggle("active");
      updateStats();
    });
  });

  /* ---------- Font size ---------- */
  if (fontSizeSelect) {
    fontSizeSelect.addEventListener("change", () => {
      editor.style.fontSize = fontSizeSelect.value + "px";
    });
  }

  /* ---------- Font family ---------- */
  if (fontFamilySelect) {
    fontFamilySelect.addEventListener("change", () => {
      editor.style.fontFamily = fontFamilySelect.value;
    });
  }

  /* ---------- Undo / Redo ---------- */
  const undoBtn = document.getElementById("undoBtn");
  const redoBtn = document.getElementById("redoBtn");
  if (undoBtn) undoBtn.addEventListener("click", () => { editor.focus(); document.execCommand("undo"); });
  if (redoBtn) redoBtn.addEventListener("click", () => { editor.focus(); document.execCommand("redo"); });

  /* ---------- Clear ---------- */
  const clearBtn = document.getElementById("clearBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (confirm("Clear all text? This cannot be undone.")) {
        editor.innerHTML = "";
        localStorage.removeItem(STORAGE_KEY);
        updateStats();
        if (autosaveLabel) autosaveLabel.textContent = "Cleared";
      }
    });
  }

  /* ---------- Copy ---------- */
  const copyBtn = document.getElementById("copyBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(editor.innerText).then(() => {
        flashLabel("Copied to clipboard!");
      });
    });
  }

  /* ---------- Download as .txt ---------- */
  const downloadBtn = document.getElementById("downloadBtn");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      const blob = new Blob([editor.innerText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "notepad-" + new Date().toISOString().slice(0, 10) + ".txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      flashLabel("Downloaded!");
    });
  }

  /* ---------- Print ---------- */
  const printBtn = document.getElementById("printBtn");
  if (printBtn) {
    printBtn.addEventListener("click", () => {
      const win = window.open("", "_blank");
      win.document.write(
        "<html><head><title>Print Notepad</title></head><body style='font-family:monospace; white-space:pre-wrap; padding:40px;'>" +
          editor.innerHTML +
          "</body></html>"
      );
      win.document.close();
      win.focus();
      win.print();
    });
  }

  /* ---------- Dark mode toggle ---------- */
  const darkBtn = document.getElementById("darkModeBtn");
  if (darkBtn) {
    darkBtn.addEventListener("click", () => {
      document.body.classList.toggle("dark-editor");
      const isDark = document.body.classList.contains("dark-editor");
      if (isDark) {
        editor.style.background = "#1E2A38";
        editor.style.color = "#F1EADA";
        darkBtn.classList.add("active");
      } else {
        editor.style.background = "";
        editor.style.color = "";
        darkBtn.classList.remove("active");
      }
    });
  }

  /* ---------- Focus mode (fullscreen) ---------- */
  const focusBtn = document.getElementById("focusBtn");
  if (focusBtn && notebook) {
    focusBtn.addEventListener("click", () => {
      notebook.classList.toggle("focus-mode");
      if (notebook.classList.contains("focus-mode")) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
      editor.focus();
    });
  }

  /* ---------- Find & Replace ---------- */
  const findReplaceBtn = document.getElementById("findReplaceBtn");
  const findReplacePanel = document.getElementById("findReplacePanel");
  const findInput = document.getElementById("findInput");
  const replaceInput = document.getElementById("replaceInput");
  const replaceAllBtn = document.getElementById("replaceAllBtn");
  const closeFindBtn = document.getElementById("closeFindBtn");

  if (findReplaceBtn && findReplacePanel) {
    findReplaceBtn.addEventListener("click", () => {
      findReplacePanel.classList.toggle("open");
      if (findReplacePanel.classList.contains("open") && findInput) findInput.focus();
    });
  }
  if (closeFindBtn) closeFindBtn.addEventListener("click", () => findReplacePanel.classList.remove("open"));
  if (replaceAllBtn) {
    replaceAllBtn.addEventListener("click", () => {
      const find = findInput.value;
      const replace = replaceInput.value;
      if (!find) return;
      const text = editor.innerText;
      const escaped = find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const updated = text.replace(new RegExp(escaped, "g"), replace);
      editor.innerText = updated;
      updateStats();
      localStorage.setItem(STORAGE_KEY, editor.innerHTML);
      flashLabel("Replaced all matches");
    });
  }

  function flashLabel(msg) {
    if (!autosaveLabel) return;
    const original = autosaveLabel.textContent;
    autosaveLabel.textContent = msg;
    setTimeout(() => (autosaveLabel.textContent = original), 1800);
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-q").forEach((q) => {
    q.addEventListener("click", () => {
      const item = q.closest(".faq-item");
      const wasOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item").forEach((i) => i.classList.remove("open"));
      if (!wasOpen) item.classList.add("open");
    });
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }
});
