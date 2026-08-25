<!-- wp:html -->
<div class="batv-shell">
<div class="batv-shell">
  <header class="batv-masthead">
    <div>
      <p class="batv-eyebrow" id="batv-eyebrow">Livestream</p>
      <h1>2026 <em>Livestreams</em></h1>
    </div>
    <a class="batv-yt-link" id="batv-ytLink" href="https://www.youtube.com/playlist?list=PLalnBtJyVKSY" target="_blank" rel="noopener">Watch On YouTube</a>
  </header>
  <div class="batv-grid">
    <div class="batv-main">
      <div class="batv-stage">
        <div class="batv-stage-fallback" id="batv-stageFallback">Loading The Playlist…</div>
        <div id="batv-ytPlayer"></div>
      </div>
      <div class="batv-now" id="batv-now">
        <span class="batv-now-flag"><span class="batv-pip"></span><span id="batv-nowFlagText">Selected</span></span>
        <h2 class="batv-now-title" id="batv-nowTitle"> </h2>
      </div>
      <nav class="batv-transport" aria-label="Playlist Controls">
        <button class="batv-tbtn batv-tbtn-prev" id="batv-prevBtn" disabled>
          <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M9.5 0.5 4 6l5.5 5.5V0.5zM3 0.5h1.6v11H3z"/></svg>
          Previous Game
        </button>
        <p class="batv-pos" aria-live="polite">
          <span class="batv-pos-now" id="batv-posNow">--</span>
          <span class="batv-pos-sep">/</span>
          <span class="batv-pos-total" id="batv-posTotal">--</span>
          <span class="batv-pos-label">Game</span>
        </p>
        <button class="batv-tbtn batv-tbtn-next" id="batv-nextBtn" disabled>
          Next Game
          <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 0.5 8 6l-5.5 5.5V0.5zM7.4 0.5H9v11H7.4z"/></svg>
        </button>
      </nav>
    </div>
    <aside class="batv-list-panel">
      <div class="batv-list-head">
        <h2>Full Schedule <span id="batv-listCount"></span></h2>
        <label class="sr-only" for="batv-search" hidden>Search Games</label>
        <input class="batv-search" id="batv-search" type="search" placeholder="Search By Team Or Round" autocomplete="off">
      </div>
      <ul class="batv-games" id="batv-games" aria-label="Games In This Playlist"></ul>
      <p class="batv-list-empty" id="batv-listEmpty" hidden>No Games Match That Search.</p>
    </aside>
  </div>
  <footer class="batv-foot">
    <span>Battle At The Villages · The Villages High School, Middleton, FL</span>
    <span><span class="batv-kbd">←</span> <span class="batv-kbd">→</span> To Change Games</span>
  </footer>
</div>
</div>
<link rel="stylesheet" href="https://buffalo-stampeders.github.io/batv-livestream/batv-player.css">
<script src="https://buffalo-stampeders.github.io/batv-livestream/batv-player.js" defer></script>
<!-- /wp:html -->
