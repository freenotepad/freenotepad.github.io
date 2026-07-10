/* =========================================================
   all-tools.js
   Renders the "All Tools" card grid into any page that
   contains an empty mount point:  <div id="all-tools-mount"></div>

   Usage:
     1. Add   <div id="all-tools-mount"></div>   where you want
        the section to appear (usually just before the FAQ or
        right after the app section).
     2. Include this script:  <script src="js/all-tools.js"></script>
     3. Optionally mark the current page so its card is styled
        as "current" and isn't clickable, by setting on <body>:
        <body data-tool="decision-wheel">
   ========================================================= */

(function () {
  var TOOLS = [
    {
      id: "notepad",
      icon: "📝",
      name: "Notepad",
      description: "A distraction-free online notepad with autosave, formatting, and instant download.",
      url: "index.html"
    },
    {
      id: "list-maker",
      icon: "📋",
      name: "List Maker",
      description: "Build checklists and to-do lists that save automatically and check off in one tap.",
      url: "list-maker.html"
    },
    {
      id: "password-generator",
      icon: "🔐",
      name: "Password Generator",
      description: "Generate strong, random passwords with custom length and character rules.",
      url: "password-generator.html"
    },
    {
      id: "focus-timer",
      icon: "⏱️",
      name: "Focus Timer",
      description: "A simple Pomodoro-style timer to structure work and break sessions.",
      url: "focus-timer.html"
    },
    {
      id: "decision-wheel",
      icon: "🎡",
      name: "Decision Wheel",
      description: "Spin a customizable wheel to make random picks, fairly and instantly.",
      url: "decision-wheel.html"
    },
    {
      id: "study-planner",
      icon: "📚",
      name: "Study Planner",
      description: "Plan tasks, track priorities, and lay out a weekly study schedule.",
      url: "study-planner.html"
    },
    {
      id: "memo-notepad",
      icon: "🗒️",
      name: "Memo Notepad",
      description: "Jot quick colorful sticky-note memos and find them again with search.",
      url: "memo-notepad.html"
    },
    {
      id: "dream-journal",
      icon: "🌙",
      name: "Dream Journal",
      description: "Log your dreams with mood, tags, and lucidity to spot patterns over time.",
      url: "dream-journal.html"
    }
  ];

  function render() {
    var mount = document.getElementById("all-tools-mount");
    if (!mount) return;

    var currentId = document.body.getAttribute("data-tool") || "";

    var html = '';
    html += '<section class="all-tools" id="all-tools">';
    html += '<div class="container">';
    html += '<div class="section-head center reveal">';
    html += '<span class="eyebrow">Explore More</span>';
    html += '<h2 class="section-title" style="margin-top:14px;">All the free tools on this site</h2>';
    html += '<p>Every tool runs instantly in your browser — no sign-up, no installs, nothing to lose.</p>';
    html += '</div>';
    html += '<div class="tools-grid reveal">';

    TOOLS.forEach(function (tool) {
      var isCurrent = tool.id === currentId;
      var cardClass = "tool-card" + (isCurrent ? " current" : "");
      if (isCurrent) {
        html += '<div class="' + cardClass + '" aria-current="page">';
      } else {
        html += '<a class="' + cardClass + '" href="' + tool.url + '">';
      }
      html += '<div class="tool-icon">' + tool.icon + '</div>';
      html += '<h3>' + tool.name + '</h3>';
      html += '<p>' + tool.description + '</p>';
      html += '<span class="tool-link">' + (isCurrent ? "You're here" : "Open tool") + '</span>';
      html += isCurrent ? '</div>' : '</a>';
    });

    html += '</div></div></section>';

    mount.outerHTML = html;

    // Re-trigger scroll reveal for the newly inserted section, if the
    // host page's app.js exposes a global reveal observer helper.
    if (typeof window.reobserveReveals === "function") {
      window.reobserveReveals();
    } else {
      document.querySelectorAll("#all-tools .reveal").forEach(function (el) {
        el.classList.add("in");
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
