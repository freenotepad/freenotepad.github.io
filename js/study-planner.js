(function () {
  "use strict";

  var TASKS_KEY = "sp_tasks_v1";
  var SCHEDULE_KEY = "sp_schedule_v1";

  var taskForm = document.getElementById("taskForm");
  var taskTitleInput = document.getElementById("taskTitleInput");
  var taskSubjectInput = document.getElementById("taskSubjectInput");
  var taskDueInput = document.getElementById("taskDueInput");
  var taskPriorityInput = document.getElementById("taskPriorityInput");
  var taskListEl = document.getElementById("taskList");
  var statTotal = document.getElementById("statTotal");
  var statDone = document.getElementById("statDone");
  var statPending = document.getElementById("statPending");
  var statProgress = document.getElementById("statProgress");
  var clearDoneBtn = document.getElementById("clearDoneBtn");

  var tabTasksBtn = document.getElementById("tabTasksBtn");
  var tabScheduleBtn = document.getElementById("tabScheduleBtn");
  var tasksPanel = document.getElementById("tasksPanel");
  var schedulePanel = document.getElementById("schedulePanel");
  var scheduleGrid = document.getElementById("scheduleGrid");
  var scheduleClearBtn = document.getElementById("scheduleClearBtn");

  var DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  var HOURS = ["7a", "9a", "11a", "1p", "3p", "5p", "7p", "9p"];

  var tasks = loadTasks();
  var schedule = loadSchedule();

  function loadTasks() {
    try {
      var raw = localStorage.getItem(TASKS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
  }
  function saveTasks() {
    try { localStorage.setItem(TASKS_KEY, JSON.stringify(tasks)); } catch (e) {}
  }
  function loadSchedule() {
    try {
      var raw = localStorage.getItem(SCHEDULE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {};
  }
  function saveSchedule() {
    try { localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedule)); } catch (e) {}
  }

  function fmtDate(d) {
    if (!d) return "";
    var parts = d.split("-");
    if (parts.length !== 3) return d;
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return months[parseInt(parts[1], 10) - 1] + " " + parseInt(parts[2], 10);
  }

  function renderStats() {
    var total = tasks.length;
    var done = tasks.filter(function (t) { return t.done; }).length;
    var pending = total - done;
    var pct = total ? Math.round((done / total) * 100) : 0;
    if (statTotal) statTotal.textContent = total;
    if (statDone) statDone.textContent = done;
    if (statPending) statPending.textContent = pending;
    if (statProgress) statProgress.textContent = pct + "%";
  }

  function renderTasks() {
    if (!taskListEl) return;
    taskListEl.innerHTML = "";
    if (tasks.length === 0) {
      taskListEl.innerHTML = '<div class="empty-state"><div class="empty-icon">📚</div>No tasks yet — add your first study task above.</div>';
      renderStats();
      return;
    }

    var sorted = tasks.slice().sort(function (a, b) {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return (a.due || "9999").localeCompare(b.due || "9999");
    });

    sorted.forEach(function (task) {
      var li = document.createElement("li");
      li.className = "task-item" + (task.done ? " done" : "");

      var check = document.createElement("div");
      check.className = "task-check";
      check.setAttribute("role", "checkbox");
      check.setAttribute("aria-checked", task.done ? "true" : "false");
      check.tabIndex = 0;
      check.innerHTML = task.done ? "✓" : "";
      function toggle() {
        task.done = !task.done;
        saveTasks();
        renderTasks();
      }
      check.addEventListener("click", toggle);
      check.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });

      var main = document.createElement("div");
      main.className = "task-main";
      var title = document.createElement("div");
      title.className = "task-title";
      title.textContent = task.title;
      var meta = document.createElement("div");
      meta.className = "task-meta";

      if (task.subject) {
        var subj = document.createElement("span");
        subj.className = "task-tag";
        subj.textContent = task.subject;
        meta.appendChild(subj);
      }
      if (task.due) {
        var due = document.createElement("span");
        due.className = "task-tag";
        due.textContent = "Due " + fmtDate(task.due);
        meta.appendChild(due);
      }
      var pr = document.createElement("span");
      pr.className = "task-tag priority-" + task.priority;
      pr.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1) + " priority";
      meta.appendChild(pr);

      main.appendChild(title);
      main.appendChild(meta);

      var actions = document.createElement("div");
      actions.className = "task-actions";
      var del = document.createElement("button");
      del.className = "icon-btn danger";
      del.type = "button";
      del.title = "Delete task";
      del.innerHTML = "✕";
      del.addEventListener("click", function () {
        tasks = tasks.filter(function (t) { return t.id !== task.id; });
        saveTasks();
        renderTasks();
      });
      actions.appendChild(del);

      li.appendChild(check);
      li.appendChild(main);
      li.appendChild(actions);
      taskListEl.appendChild(li);
    });

    renderStats();
  }

  if (taskForm) {
    taskForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var title = taskTitleInput.value.trim();
      if (!title) return;
      tasks.push({
        id: "t" + Date.now() + Math.floor(Math.random() * 1000),
        title: title,
        subject: taskSubjectInput.value.trim(),
        due: taskDueInput.value,
        priority: taskPriorityInput.value || "medium",
        done: false
      });
      taskTitleInput.value = "";
      taskSubjectInput.value = "";
      taskDueInput.value = "";
      saveTasks();
      renderTasks();
    });
  }

  if (clearDoneBtn) {
    clearDoneBtn.addEventListener("click", function () {
      tasks = tasks.filter(function (t) { return !t.done; });
      saveTasks();
      renderTasks();
    });
  }

  function buildScheduleGrid() {
    if (!scheduleGrid) return;
    scheduleGrid.innerHTML = "";
    scheduleGrid.appendChild(document.createElement("div"));
    DAYS.forEach(function (d) {
      var head = document.createElement("div");
      head.className = "sg-head";
      head.textContent = d;
      scheduleGrid.appendChild(head);
    });

    HOURS.forEach(function (hour) {
      var timeCell = document.createElement("div");
      timeCell.className = "sg-time";
      timeCell.textContent = hour;
      scheduleGrid.appendChild(timeCell);

      DAYS.forEach(function (day) {
        var key = day + "-" + hour;
        var cell = document.createElement("div");
        cell.className = "schedule-cell" + (schedule[key] ? " filled" : "");
        if (schedule[key]) {
          var label = document.createElement("div");
          label.className = "sg-label";
          label.textContent = schedule[key];
          cell.appendChild(label);
        }
        cell.addEventListener("click", function () {
          var current = schedule[key] || "";
          var value = window.prompt("Subject for " + day + " " + hour + " (leave blank to clear):", current);
          if (value === null) return;
          value = value.trim();
          if (value) {
            schedule[key] = value.slice(0, 14);
          } else {
            delete schedule[key];
          }
          saveSchedule();
          buildScheduleGrid();
        });
        scheduleGrid.appendChild(cell);
      });
    });
  }

  if (scheduleClearBtn) {
    scheduleClearBtn.addEventListener("click", function () {
      schedule = {};
      saveSchedule();
      buildScheduleGrid();
    });
  }

  function setTab(tab) {
    var isTasks = tab === "tasks";
    if (tabTasksBtn) tabTasksBtn.classList.toggle("active", isTasks);
    if (tabScheduleBtn) tabScheduleBtn.classList.toggle("active", !isTasks);
    if (tasksPanel) tasksPanel.style.display = isTasks ? "" : "none";
    if (schedulePanel) schedulePanel.style.display = isTasks ? "none" : "";
  }
  if (tabTasksBtn) tabTasksBtn.addEventListener("click", function () { setTab("tasks"); });
  if (tabScheduleBtn) tabScheduleBtn.addEventListener("click", function () { setTab("schedule"); });

  renderTasks();
  buildScheduleGrid();
  setTab("tasks");
})();
