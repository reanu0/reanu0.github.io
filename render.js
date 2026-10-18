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
      <img src="${esc(path)}" alt="${esc(alt)}" loading="lazy">
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
    let galleryClass = count === 1 ? 'gallery gallery-1'
      : (count === 2 || count === 4) ? 'gallery gallery-2'
      : 'gallery';
    if (p.fit === 'whole') galleryClass += ' gallery-whole';   // show whole images, no cropping
    const items = files.map((f, i) => figure(f, `${p.title}, image ${i + 1}`))
      .concat(videos.map((v, i) => `
        <figure class="video">
          <video src="images/${esc(v)}" controls muted playsinline preload="metadata" aria-label="${esc(p.title)}, video ${i + 1}"></video>
        </figure>`));
    const gallery = count ? `<div class="${galleryClass}">${items.join('')}</div>` : '';
    const embeds = (p.embeds || []).length
      ? `<div class="embeds">${p.embeds.map((url, i) =>
          `<iframe src="${esc(url)}" title="${esc(p.title)} on itch.io, ${i + 1}" width="552" height="167" loading="lazy"></iframe>`).join('')}</div>`
      : '';
    const buttons = [p.link].concat(p.links || []).filter(Boolean);
    const media = (gallery || embeds) ? `<div class="project-media">${gallery}${embeds}</div>` : '';
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

// Jump to #project if the address had one (the page was empty when the browser tried)
if (location.hash) {
  const target = document.getElementById(location.hash.slice(1));
  if (target) target.scrollIntoView();
}
