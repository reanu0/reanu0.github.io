/* =========================================================
   RENDER
   Builds the highlights, showcase cards, lists and the
   "All work" section from the data in content.js.
   You normally don't need to change this file.
   ========================================================= */


/* Line icons you can use in HIGHLIGHTS (the "icon" field) */
const ICONS = {
  screen: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  chip:   '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 4V2M15 4V2M9 22v-2M15 22v-2M4 9H2M4 15H2M22 9h-2M22 15h-2"/><rect x="9" y="9" width="6" height="6"/>',
  cube:   '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>',
  pen:    '<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>',
  code:   '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/>',
  camera: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7l2-3h4l2 3"/><circle cx="12" cy="13.5" r="3.5"/>',
  star:   '<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
};


/* ---------- Small helpers ---------- */

// Makes text safe to put inside HTML (so a < or & in your text can't break the page)
function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Turns "images: 4" or "images: [...]" into a list of file names
function imageList(project) {
  if (typeof project.images === 'number') {
    const files = [];
    for (let n = 1; n <= project.images; n++) files.push(`${project.id}-${n}.jpg`);
    return files;
  }
  return Array.isArray(project.images) ? project.images : [];
}

// One image; if the file is missing it shows a grey box with the file name
function figure(file, alt, className = '') {
  const path = `images/${file}`;
  return `
    <figure class="${className}" data-file="${esc(path)}">
      <img src="${esc(path)}" alt="${esc(alt)}" loading="lazy"${className ? '' : ' tabindex="0"'}>
    </figure>`;
}

function linkButton(button, className = 'pill') {
  if (!button || !button.url) return '';
  return `<a class="${className}" href="${esc(button.url)}">${esc(button.label || 'Open')}</a>`;
}


/* ---------- Highlights ---------- */
function renderHighlights() {
  const box = document.getElementById('highlights');
  if (!box) return;
  box.innerHTML = HIGHLIGHTS.map(item => `
    <article>
      <svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[item.icon] || ICONS.star}</svg>
      <h3>${esc(item.title)}</h3>
      <p>${esc(item.text)}</p>
      ${item.link ? `<a class="see-more" href="${esc(item.link)}">See more ↗</a>` : ''}
    </article>`).join('');
}


/* ---------- Featured showcase cards ---------- */
function bigCard(card) {
  const tint = card.tint ? ` tint-${esc(card.tint)}` : '';
  return `
    <article class="showcase${tint}">
      ${card.eyebrow ? `<p class="eyebrow">${esc(card.eyebrow)}</p>` : ''}
      <h2>${esc(card.title)}</h2>
      ${card.text ? `<p class="lead">${esc(card.text)}</p>` : ''}
      ${linkButton(card.button)}
      ${card.image ? figure(card.image, card.title, 'showcase-image') : ''}
    </article>`;
}

function smallCard(card) {
  const tint = card.tint ? ` tint-${esc(card.tint)}` : '';
  return `
    <article class="showcase-small${tint}">
      ${card.eyebrow ? `<p class="eyebrow">${esc(card.eyebrow)}</p>` : ''}
      <h3>${esc(card.title)}</h3>
      ${card.text ? `<p>${esc(card.text)}</p>` : ''}
      ${linkButton(card.button, '')}
    </article>`;
}

function renderFeatured() {
  const box = document.getElementById('work');
  if (!box) return;
  let html = '';
  let smalls = [];
  const flushSmalls = () => {
    if (smalls.length) html += `<div class="duo">${smalls.map(smallCard).join('')}</div>`;
    smalls = [];
  };
  FEATURED.forEach(card => {
    if (card.size === 'small') {
      smalls.push(card);
      if (smalls.length === 2) flushSmalls();
    } else {
      flushSmalls();
      html += bigCard(card);
    }
  });
  flushSmalls();
  box.innerHTML = html;
}


/* ---------- Lists (grouped by the "list" field) ---------- */
function renderLists() {
  const box = document.getElementById('lists');
  if (!box) return;
  const groups = {};
  visibleProjects().forEach(p => {
    const name = p.list || 'Projects';
    (groups[name] = groups[name] || []).push(p);
  });
  const order = (typeof LIST_ORDER !== 'undefined') ? LIST_ORDER : [];
  const names = Object.keys(groups).sort((a, b) => {
    const ia = order.indexOf(a), ib = order.indexOf(b);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });
  box.innerHTML = names.map(name => [name, groups[name]]).map(([name, items]) => `
    <div>
      <h3>${esc(name)}</h3>
      ${items.map(p => `
        <a href="#${esc(p.id)}"><span>${esc(p.shortTitle || p.title)}</span><span class="tag">${esc(p.tag)}</span></a>`).join('')}
    </div>`).join('');
}


/* ---------- All work ---------- */
function renderProjects() {
  const box = document.getElementById('project-list');
  if (!box) return;
  box.innerHTML = visibleProjects().map(p => {
    const files = imageList(p);
    const videos = Array.isArray(p.videos) ? p.videos : [];
    const count = files.length + videos.length;
    // Images keep their own shape; layoutGalleries() arranges them in even rows
    const items = files.map((f, i) => figure(f, `${p.title}, image ${i + 1}`))
      .concat(videos.map((v, i) => `
        <figure class="video">
          <video src="images/${esc(v)}" controls muted playsinline preload="metadata" aria-label="${esc(p.title)}, video ${i + 1}"></video>
        </figure>`));
    const gallery = count ? `<div class="gallery${count === 1 ? ' gallery-1' : ''}">${items.join('')}</div>` : '';
    const game = gameBlock(p);
    const embeds = (p.embeds || []).length
      ? `<div class="embeds">${p.embeds.map((url, i) =>
          `<iframe src="${esc(url)}" title="${esc(p.title)} on itch.io, ${i + 1}" width="552" height="167" loading="lazy"></iframe>`).join('')}</div>`
      : '';
    const buttons = [p.link].concat(p.links || []).filter(Boolean);
    if (p.play && p.play.src) buttons.push({ label: 'Play full screen ↗', url: p.play.src });
    const media = (game || gallery || embeds) ? `<div class="project-media">${game}${gallery}${embeds}</div>` : '';
    return `
      <article id="${esc(p.id)}" class="project">
        <div class="project-text">
          ${p.eyebrow ? `<p class="eyebrow">${esc(p.eyebrow)}</p>` : ''}
          <h3>${esc(p.title)}</h3>
          ${p.text ? `<p>${esc(p.text)}</p>` : ''}
          ${buttons.length ? `<div class="project-buttons">${buttons.map(b => linkButton(b)).join('')}</div>` : ''}
        </div>
        ${media}
      </article>`;
  }).join('');
}

// A game from the play folder: shows a cover with a Play button,
// and only loads the game when someone presses it.
function gameBlock(p) {
  const g = p.play;
  if (!g || !g.src) return '';
  const ratio = String(g.ratio || '4 / 3').replace(/[^0-9./ ]/g, '');
  const cover = g.poster ? ` style="background-image:url('images/${esc(g.poster)}')"` : '';
  return `
    <div class="game" style="aspect-ratio:${ratio}" data-src="${esc(g.src)}" data-title="${esc(p.title)}">
      <div class="game-cover"${cover}>
        <button type="button" class="pill game-start">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>
          Play in your browser
        </button>
        ${g.hint ? `<p class="game-hint">${esc(g.hint)}</p>` : ''}
      </div>
    </div>`;
}

function startGame(box) {
  const frame = document.createElement('iframe');
  frame.src = box.dataset.src;
  frame.title = `${box.dataset.title}, playable`;
  frame.allow = 'serial; fullscreen';
  box.replaceChildren(frame);
  box.classList.add('playing');
  frame.addEventListener('load', () => frame.focus());
}

document.addEventListener('click', e => {
  const button = e.target.closest('.game-start');
  if (button) startGame(button.closest('.game'));
});


/* ---------- Galleries: even rows, nothing cropped ----------
   Every image keeps its own shape. Images are grouped into rows that fill
   the full width, and every image in a row gets the same height.        */
function layoutGallery(gallery) {
  // real (sub-pixel) width, minus 1px so rounding never pushes an image to the next line
  const width = gallery.getBoundingClientRect().width - 1;
  if (width <= 0) return;
  const figures = [...gallery.children];
  const gap = 12;
  const ratioOf = f => parseFloat(f.dataset.ratio) || 4 / 3;

  if (figures.length === 1) {               // one image: as large as fits
    const f = figures[0], r = ratioOf(f);
    const h = Math.min(width / r, 620);
    f.style.width = `${h * r}px`;
    f.style.height = `${h}px`;
    return;
  }

  // Try every way of splitting the images into rows (in order) and keep the
  // one whose row heights are closest to the ideal height overall.
  const target = Math.max(150, Math.min(280, width * 0.36));
  const n = figures.length;
  const ratios = figures.map(ratioOf);
  const rowHeight = (from, to) => {
    let sum = 0;
    for (let k = from; k < to; k++) sum += ratios[k];
    return (width - gap * (to - from - 1)) / sum;
  };
  const best = [0], cut = [0];
  for (let i = 1; i <= n; i++) {
    best[i] = Infinity;
    for (let j = 0; j < i; j++) {
      const cost = best[j] + (rowHeight(j, i) - target) ** 2;
      if (cost < best[i]) { best[i] = cost; cut[i] = j; }
    }
  }
  const rows = [];
  for (let i = n; i > 0; i = cut[i]) rows.unshift([cut[i], i]);

  rows.forEach(([from, to]) => {
    const h = rowHeight(from, to);
    for (let k = from; k < to; k++) {
      figures[k].style.width = `${Math.floor(h * ratios[k] * 100) / 100}px`;
      figures[k].style.height = `${Math.floor(h)}px`;
    }
  });
}

function layoutGalleries() {
  document.querySelectorAll('.gallery').forEach(layoutGallery);
}

function watchGalleries() {
  document.querySelectorAll('.gallery').forEach(gallery => {
    gallery.querySelectorAll('figure').forEach(f => {
      const img = f.querySelector('img');
      const video = f.querySelector('video');
      const measure = () => {
        const w = img ? img.naturalWidth : video.videoWidth;
        const h = img ? img.naturalHeight : video.videoHeight;
        if (w && h) { f.dataset.ratio = w / h; layoutGallery(gallery); }
      };
      if (img) { if (img.complete) measure(); img.addEventListener('load', measure); }
      if (video) { if (video.readyState >= 1) measure(); video.addEventListener('loadedmetadata', measure); }
    });
    // relayout when the column changes width (window resize, phone rotation)
    let last = 0;
    new ResizeObserver(() => {
      if (gallery.clientWidth !== last) { last = gallery.clientWidth; layoutGallery(gallery); }
    }).observe(gallery);
  });
  layoutGalleries();                                   // first pass right away
  window.addEventListener('load', layoutGalleries);    // and again once fonts and images settle
}


/* ---------- Lightbox: click an image to see it big ---------- */
function setupLightbox() {
  const box = document.createElement('dialog');
  box.className = 'lightbox';
  box.setAttribute('aria-label', 'Image viewer');
  box.innerHTML = `
    <button type="button" class="lb-close" aria-label="Close">×</button>
    <button type="button" class="lb-prev" aria-label="Previous image">‹</button>
    <figure><img alt=""><figcaption></figcaption></figure>
    <button type="button" class="lb-next" aria-label="Next image">›</button>`;
  document.body.appendChild(box);

  const img = box.querySelector('img');
  const caption = box.querySelector('figcaption');
  let list = [], index = 0, title = '';

  const show = i => {
    index = (i + list.length) % list.length;
    img.src = list[index].currentSrc || list[index].src;
    img.alt = list[index].alt;
    caption.textContent = list.length > 1 ? `${title} · ${index + 1} / ${list.length}` : title;
    box.classList.toggle('single', list.length < 2);
  };

  const open = clicked => {
    const gallery = clicked.closest('.gallery');
    list = [...gallery.querySelectorAll('figure:not(.missing) img')];
    title = clicked.closest('.project')?.querySelector('h3')?.textContent || '';
    show(list.indexOf(clicked));
    box.showModal();
  };

  document.addEventListener('click', e => {
    const clicked = e.target.closest('.gallery figure:not(.missing) img');
    if (clicked) open(clicked);
  });
  document.addEventListener('keydown', e => {
    const focused = document.activeElement;
    if ((e.key === 'Enter' || e.key === ' ') && focused?.matches('.gallery figure:not(.missing) img')) {
      e.preventDefault();
      open(focused);
    }
  });

  box.querySelector('.lb-close').addEventListener('click', () => box.close());
  box.querySelector('.lb-prev').addEventListener('click', () => show(index - 1));
  box.querySelector('.lb-next').addEventListener('click', () => show(index + 1));
  box.addEventListener('click', e => {           // click outside the image closes it
    if (e.target === box || e.target.tagName === 'FIGURE') box.close();
  });
  box.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });
  let startX = null;                             // swipe on phones
  box.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', e => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
    startX = null;
  });
}

function visibleProjects() {
  return PROJECTS.filter(p => !p.hidden);
}


/* ---------- Missing images: show the file name instead ---------- */
function watchMissingImages() {
  document.querySelectorAll('figure[data-file] img').forEach(img => {
    const markMissing = () => img.parentElement.classList.add('missing');
    if (img.complete && img.naturalWidth === 0) markMissing();
    img.addEventListener('error', markMissing);
  });
}


/* ---------- Build everything ---------- */
renderHighlights();
renderFeatured();
renderLists();
renderProjects();
watchMissingImages();
watchGalleries();
setupLightbox();

// Jump to #project if the address had one (the page was empty when the browser tried)
if (location.hash) {
  const target = document.getElementById(location.hash.slice(1));
  if (target) target.scrollIntoView();
}
