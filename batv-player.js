(function(){
"use strict";
/* ============================================================
   CONFIG
   ============================================================ */
const CONFIG = {
  playlistId: 'PLalnBtJyVKSY',

  // Play immediately when a game is picked from the list or transport.
  autoplayOnSelect: true,

  // Wrap from the last game back to the first (and vice versa).
  loop: false,

  // Junk that YouTube titles tend to carry — trimmed off list rows.
  titleTrim: [
    /^\s*(20\d\d\s*)?battle at the villages\s*[-–—:|·]\s*/i,
    /\s*[-–—|]\s*battle at the villages\s*$/i,
    /\s*\(?live\)?\s*$/i
  ],

  // Optional: hand-written labels that win over the YouTube title.
  // Key = video ID.  e.g. 'dQw4w9WgXcQ': 'Game 5 · Bartow vs. The Villages'
  titleOverrides: {}
};

/* ============================================================
   STATE + HELPERS
   ============================================================ */
let player = null;
let ids = [];
let titles = {};
let current = -1;

const $ = id => document.getElementById(id);
const pad = n => String(n).padStart(2, '0');

function cleanTitle(raw){
  let t = (raw || '').trim();
  CONFIG.titleTrim.forEach(rx => { t = t.replace(rx, ''); });
  return t.trim() || raw || '';
}
function labelFor(i){
  const id = ids[i];
  return CONFIG.titleOverrides[id] || titles[id] || 'Game ' + (i + 1);
}

/* ============================================================
   YOUTUBE PLAYER
   ============================================================ */
const startIndex = (() => {
  const p = new URLSearchParams(location.search);
  const g = parseInt(p.get('game'), 10);
  return Number.isFinite(g) && g > 0 ? g - 1 : 0;
})();

$('batv-ytLink').href = 'https://www.youtube.com/playlist?list=' + CONFIG.playlistId;

const tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
tag.onerror = () => fail('The player could not load.');
document.head.appendChild(tag);

const __prevYTReady = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = function(){
    if (typeof __prevYTReady === 'function') __prevYTReady();
  const vars = { rel:0, modestbranding:1, playsinline:1, iv_load_policy:3 };
  // Only hand YouTube an origin when the page is actually served over http(s).
  // Opened as a file://, location.origin is "null" — passing that is the classic
  // cause of Error 153 (player configuration error).
  if (location.protocol === 'http:' || location.protocol === 'https:'){
    vars.origin = location.origin;
  }
  player = new YT.Player('batv-ytPlayer', {
    width:'100%', height:'100%',
    host:'https://www.youtube.com',
    playerVars: vars,
    events:{ onReady:onReady, onStateChange:onStateChange, onError:onError }
  });
};

function onReady(){
  // Load the playlist HERE rather than through playerVars. The list-in-playerVars
  // path throws Error 153 in many embeds; cuePlaylist after ready is reliable.
  try {
    player.cuePlaylist({
      listType: 'playlist',
      list: CONFIG.playlistId,
      index: startIndex > 0 ? startIndex : 0
    });
  } catch(err){ return fail('The playlist could not be loaded.'); }
  $('batv-stageFallback').hidden = true;
  waitForPlaylist(0);
}

function onError(e){
  const code = e && e.data;
  // 101 / 150: this specific video has embedding turned off — skip past it.
  if ((code === 101 || code === 150) && ids.length){
    if (current < ids.length - 1){ step(1); return; }
  }
  // 2 bad param · 5 HTML5 error · 100 not found · 153 config
  fail('This video can\u2019t play in the embed (YouTube error ' + (code == null ? '?' : code) + ').');
}

// getPlaylist() is not always populated the instant the player is ready.
function waitForPlaylist(tries){
  const list = player.getPlaylist && player.getPlaylist();
  if (list && list.length){
    ids = list;
    buildList();
    fetchTitles();
    if (startIndex > 0 && startIndex < ids.length){
      player.playVideoAt(startIndex);        // deep link ?game=4 — jump + play
    }
    syncIndex();
    setInterval(syncIndex, 1000);            // catches auto-advance
    return;
  }
  if (tries > 40) return fail('The playlist did not load.');
  setTimeout(() => waitForPlaylist(tries + 1), 250);
}

function fail(msg){
  const el = $('batv-stageFallback');
  el.hidden = false;
  let extra = '<a href="https://www.youtube.com/playlist?list=' + CONFIG.playlistId +
    '" target="_blank" rel="noopener">Watch the games on YouTube</a>';
  if (location.protocol === 'file:'){
    extra = 'Serve this page over http (a local server or the live site) rather than opening the file directly.<br>' + extra;
  }
  el.innerHTML = msg + '<br>' + extra;
  $('batv-games').innerHTML = '';
  $('batv-listEmpty').hidden = false;
  $('batv-listEmpty').textContent = 'The schedule appears once the player connects.';
}

function onStateChange(e){
  syncIndex();
  document.getElementById('now').classList.toggle('batv-is-playing', e.data === YT.PlayerState.PLAYING);
  $('batv-nowFlagText').textContent = e.data === YT.PlayerState.PLAYING ? 'Now playing' : 'Selected';

  // Pick up the real title from the player itself as a backstop.
  const data = player.getVideoData && player.getVideoData();
  if (data && data.video_id && data.title && !titles[data.video_id]){
    titles[data.video_id] = cleanTitle(data.title);
    paintTitles();
  }
}

/* ============================================================
   TITLES — oEmbed needs no API key
   ============================================================ */
async function fetchTitles(){
  for (const id of ids){
    try {
      const url = 'https://www.youtube.com/oembed?url=' +
        encodeURIComponent('https://www.youtube.com/watch?v=' + id) + '&format=json';
      const res = await fetch(url);
      if (!res.ok) continue;
      const json = await res.json();
      titles[id] = cleanTitle(json.title);
      paintTitles();
    } catch (err) { /* row keeps its "Game N" label */ }
  }
  document.querySelectorAll('.batv-game').forEach(el => el.classList.remove('batv-skeleton'));
}

function paintTitles(){
  document.querySelectorAll('.batv-game').forEach(el => {
    const i = +el.dataset.index;
    const node = el.querySelector('.game-title');
    const text = labelFor(i);
    if (node.textContent !== text){ node.textContent = text; el.classList.remove('batv-skeleton'); }
  });
  if (current > -1) $('batv-nowTitle').textContent = labelFor(current);
}

/* ============================================================
   LIST
   ============================================================ */
function buildList(){
  const ul = $('batv-games');
  ul.innerHTML = '';
  ids.forEach((id, i) => {
    const li = document.createElement('li');
    li.className = 'batv-game batv-skeleton';
    li.dataset.index = i;

    const btn = document.createElement('button');
    btn.className = 'batv-game-btn';
    btn.type = 'button';
    btn.innerHTML =
      '<span class="game-num">' + pad(i + 1) + '</span>' +
      '<span class="game-thumb"><img alt="" loading="lazy" ' +
        'src="https://i.ytimg.com/vi/' + id + '/mqdefault.jpg" ' +
        'onerror="this.onerror=null;this.src=\'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg\'"></span>' +
      '<span class="game-meta">' +
        '<span class="game-title">' + labelFor(i) + '</span>' +
        '<span class="game-sub">Now playing</span>' +
      '</span>';
    btn.addEventListener('click', () => goTo(i));

    li.appendChild(btn);
    ul.appendChild(li);
  });
  $('batv-listCount').textContent = ids.length + ' games';
  $('batv-posTotal').textContent = pad(ids.length);
}

function goTo(i){
  if (!player || i < 0 || i >= ids.length) return;
  CONFIG.autoplayOnSelect ? player.playVideoAt(i) : player.cueVideoById(ids[i]);
  current = i;
  paintCurrent();
}

function syncIndex(){
  if (!player || !player.getPlaylistIndex) return;
  const i = player.getPlaylistIndex();
  if (i === current || i < 0) return;
  current = i;
  paintCurrent();
}

function paintCurrent(){
  $('batv-posNow').textContent = pad(current + 1);
  $('batv-nowTitle').textContent = labelFor(current);
  $('batv-ytLink').href = 'https://www.youtube.com/watch?v=' + ids[current] + '&list=' + CONFIG.playlistId;

  $('batv-prevBtn').disabled = !CONFIG.loop && current <= 0;
  $('batv-nextBtn').disabled = !CONFIG.loop && current >= ids.length - 1;

  document.querySelectorAll('.batv-game').forEach(el => {
    const on = +el.dataset.index === current;
    el.classList.toggle('batv-is-live', on);
    if (on) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });

  // keep the address bar shareable
  const url = new URL(location.href);
  url.searchParams.set('game', current + 1);
  history.replaceState(null, '', url);
}

/* ============================================================
   TRANSPORT
   ============================================================ */
function step(dir){
  if (!ids.length) return;
  let i = current + dir;
  if (CONFIG.loop) i = (i + ids.length) % ids.length;
  goTo(i);
}
$('batv-prevBtn').addEventListener('click', () => step(-1));
$('batv-nextBtn').addEventListener('click', () => step(1));

document.addEventListener('keydown', e => {
  if (e.target.matches('input, textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === 'ArrowLeft'){ e.preventDefault(); step(-1); }
  if (e.key === 'ArrowRight'){ e.preventDefault(); step(1); }
});

/* ============================================================
   SEARCH
   ============================================================ */
$('batv-search').addEventListener('input', e => {
  const q = e.target.value.trim().toLowerCase();
  let shown = 0;
  document.querySelectorAll('.batv-game').forEach(el => {
    const hit = !q || labelFor(+el.dataset.index).toLowerCase().includes(q);
    el.hidden = !hit;
    if (hit) shown++;
  });
  $('batv-listEmpty').hidden = shown > 0;
});
})();