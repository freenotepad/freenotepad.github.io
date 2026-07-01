// ==========================================================
// FreeNotepad — Header Component
// ==========================================================
(function () {
  const headerHTML = `
  <header class="site-header">
    <div class="container">
      <a href="/" class="brand">
        <span class="brand-mark">N</span>
        FreeNotepad
      </a>

      <nav class="main-nav" id="mainNav">
        <a href="#editor-top">Editor</a>
        <a href="#features">Features</a>
        <a href="#how-it-works">How It Works</a>
        <a href="#use-cases">Use Cases</a>
        <a href="#faq">FAQ</a>
        <a class="btn btn-primary btn-sm" href="#editor-top" style="margin-top:6px;">Start Writing</a>
      </nav>

      <div class="header-cta">
        <a href="#editor-top" class="btn btn-ghost btn-sm">Open Notepad</a>
        <button class="menu-toggle" id="menuToggle" aria-label="Toggle menu" aria-expanded="false">
          <span></span>
        </button>
      </div>
    </div>
  </header>
  `;

  document.write(headerHTML);

  document.addEventListener("DOMContentLoaded", function () {
    const toggle = document.getElementById("menuToggle");
    const nav = document.getElementById("mainNav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        const isOpen = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
      nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          nav.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });
    }
  });
})();
