(function () {
  "use strict";

  var STORAGE_KEY = "dw_options_v1";
  var HISTORY_KEY = "dw_history_v1";
  var COLORS = ["#F2B705", "#3F7A6B", "#C1502E", "#6C63A6", "#2F5C50", "#E4A0B7", "#4B7BA8", "#D98E3F"];

  var defaultOptions = ["Pizza", "Sushi", "Tacos", "Burgers", "Salad", "Pasta"];

  var canvas = document.getElementById("wheelCanvas");
  var ctx = canvas ? canvas.getContext("2d") : null;
  var listEl = document.getElementById("wheelOptionsList");
  var addForm = document.getElementById("wheelAddForm");
  var addInput = document.getElementById("wheelAddInput");
  var spinHub = document.getElementById("wheelHub");
  var resultBanner = document.getElementById("wheelResultBanner");
  var resultValue = document.getElementById("wheelResultValue");
  var historyList = document.getElementById("wheelHistoryList");
  var clearHistoryBtn = document.getElementById("wheelClearHistory");
  var removeAfterSpinToggle = document.getElementById("wheelRemoveToggle");
  var resetBtn = document.getElementById("wheelResetBtn");

  var options = loadOptions();
  var history = loadHistory();
  var rotation = 0;
  var spinning = false;

  function loadOptions() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (e) {}
    return defaultOptions.slice();
  }

  function saveOptions() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(options)); } catch (e) {}
  }

  function loadHistory() {
    try {
      var raw = localStorage.getItem(HISTORY_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
  }

  function saveHistory() {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch (e) {}
  }

  function drawWheel() {
    if (!ctx) return;
    var size = canvas.width;
    var cx = size / 2;
    var cy = size / 2;
    var radius = size / 2 - 6;
    var count = options.length;

    ctx.clearRect(0, 0, size, size);

    if (count === 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = "#F1EADA";
      ctx.fill();
      ctx.font = "600 16px Inter, sans-serif";
      ctx.fillStyle = "#8B98A2";
      ctx.textAlign = "center";
      ctx.fillText("Add options to begin", cx, cy);
      return;
    }

    var slice = (Math.PI * 2) / count;

    for (var i = 0; i < count; i++) {
      var start = i * slice + rotation;
      var end = start + slice;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();
      ctx.strokeStyle = "#26313C";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + slice / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#26313C";
      ctx.font = "600 " + Math.max(11, Math.min(16, 160 / count)) + "px Inter, sans-serif";
      var label = options[i];
      if (label.length > 16) label = label.slice(0, 15) + "…";
      ctx.fillText(label, radius - 16, 5);
      ctx.restore();
    }
  }

  function renderOptionsList() {
    if (!listEl) return;
    listEl.innerHTML = "";
    if (options.length === 0) {
      listEl.innerHTML = '<div class="empty-state" style="padding:20px;"><div class="empty-icon">🎡</div>Add at least one option to spin the wheel.</div>';
      return;
    }
    options.forEach(function (opt, idx) {
      var row = document.createElement("li");
      row.className = "wheel-option-row";

      var swatch = document.createElement("span");
      swatch.className = "wheel-swatch";
      swatch.style.background = COLORS[idx % COLORS.length];

      var input = document.createElement("input");
      input.type = "text";
      input.value = opt;
      input.setAttribute("aria-label", "Wheel option " + (idx + 1));
      input.addEventListener("change", function () {
        var val = input.value.trim();
        if (val) {
          options[idx] = val;
          saveOptions();
          drawWheel();
        } else {
          input.value = options[idx];
        }
      });

      var del = document.createElement("button");
      del.className = "icon-btn danger";
      del.type = "button";
      del.title = "Remove option";
      del.innerHTML = "✕";
      del.addEventListener("click", function () {
        options.splice(idx, 1);
        saveOptions();
        renderOptionsList();
        drawWheel();
      });

      row.appendChild(swatch);
      row.appendChild(input);
      row.appendChild(del);
      listEl.appendChild(row);
    });
  }

  function renderHistory() {
    if (!historyList) return;
    historyList.innerHTML = "";
    if (history.length === 0) {
      historyList.innerHTML = '<span style="color:var(--ink-faint);">No spins yet</span>';
      return;
    }
    history.slice(0, 12).forEach(function (item) {
      var span = document.createElement("span");
      span.textContent = item;
      historyList.appendChild(span);
    });
  }

  function spin() {
    if (spinning || options.length === 0) return;
    spinning = true;
    resultBanner.classList.remove("show");

    var count = options.length;
    var slice = (Math.PI * 2) / count;
    var winnerIndex = Math.floor(Math.random() * count);

    // Target rotation so that winnerIndex slice center lands under pointer (top, i.e. -90deg / -PI/2)
    var targetSliceCenter = winnerIndex * slice + slice / 2;
    var extraSpins = 6 + Math.floor(Math.random() * 3); // full turns
    var finalRotation = (Math.PI * 2 * extraSpins) + (-Math.PI / 2 - targetSliceCenter);

    var startRotation = rotation % (Math.PI * 2);
    var duration = 4200;
    var startTime = null;

    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

    function frame(ts) {
      if (!startTime) startTime = ts;
      var elapsed = ts - startTime;
      var t = Math.min(elapsed / duration, 1);
      var eased = easeOutCubic(t);
      rotation = startRotation + eased * (finalRotation - (startRotation % (Math.PI * 2)) + (Math.PI * 2 * extraSpins));
      drawWheel();
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        spinning = false;
        var winner = options[winnerIndex];
        resultValue.textContent = winner;
        resultBanner.classList.add("show");
        history.unshift(winner);
        history = history.slice(0, 30);
        saveHistory();
        renderHistory();
        if (removeAfterSpinToggle && removeAfterSpinToggle.checked) {
          options.splice(winnerIndex, 1);
          saveOptions();
          renderOptionsList();
          drawWheel();
        }
      }
    }
    requestAnimationFrame(frame);
  }

  if (addForm) {
    addForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = addInput.value.trim();
      if (!val) return;
      options.push(val);
      addInput.value = "";
      saveOptions();
      renderOptionsList();
      drawWheel();
    });
  }

  if (spinHub) {
    spinHub.addEventListener("click", spin);
  }
  if (canvas) {
    canvas.addEventListener("click", spin);
  }

  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", function () {
      history = [];
      saveHistory();
      renderHistory();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      options = defaultOptions.slice();
      saveOptions();
      renderOptionsList();
      drawWheel();
    });
  }

  renderOptionsList();
  renderHistory();
  drawWheel();
})();
