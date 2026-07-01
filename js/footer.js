// ==========================================================
// FreeNotepad — Footer Component
// ==========================================================
(function () {
  const year = new Date().getFullYear();

  const footerHTML = `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="/" class="brand">
            <span class="brand-mark">N</span>
            FreeNotepad
          </a>
          <p>A free online notepad and text editor that opens straight in your browser. No sign-up, no installs — just a clean page and your words.</p>
        </div>

        <div class="footer-col">
          <h4>Editor</h4>
          <ul>
            <li><a href="#editor-top">Online Notepad</a></li>
            <li><a href="#features">All Features</a></li>
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#compare">Notepad vs. Word</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Use Cases</h4>
          <ul>
            <li><a href="#use-cases">For Students</a></li>
            <li><a href="#use-cases">For Writers</a></li>
            <li><a href="#use-cases">For Developers</a></li>
            <li><a href="#use-cases">For Work Notes</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Resources</h4>
          <ul>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="#seo-content">About Notepad Online</a></li>
            <li href="#">Privacy Policy</li>
            <li href="#">Terms of Use</li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <span>&copy; ${year} FreeNotepad.github.io — Free Online Notepad &amp; Text Editor.</span>
        <span>Built for writers, students, coders, and note-takers everywhere.</span>
      </div>
    </div>
  </footer>
  `;

  document.write(footerHTML);
})();
