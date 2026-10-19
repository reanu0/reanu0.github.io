# Reanu's portfolio: how to update it

The page is built from one file: **content.js**. You never have to touch the
layout to add work.

```
portfolio/
  index.html      hero, contact form and footer
  content.js      ALL your projects, highlights and showcase cards  <- edit this
  render.js       builds the page from content.js (leave it alone)
  style.css       the look
  new-entry.html  helper that writes a new project for you
  images/         your images (see images/README.txt)
  play/           games that run on the page (Processing sketches ported to p5.js)
  cv.pdf          add your CV here
```

## Add a project (the easy way)

1. Open **new-entry.html** in your browser (double-click it).
2. Fill in the form. The ID is made from the title for you.
3. Click **Copy entry**.
4. Open **content.js**, find `const PROJECTS = [` and paste on a new line.
   Where you paste it is where it shows up. Paste right after the `[` to put it first.
5. Put the images in `images/` with the names the helper shows (`your-id-1.jpg`, `your-id-2.jpg` …).
6. Save and refresh the page.

The project appears in its list column at the top and in "All work", with a
link between the two.

## Add a project by hand

Copy an existing block in PROJECTS, from `{` to `},`, paste it, and change the values.
Every field is explained in the comment above PROJECTS.

## Other changes

- **Hide a project without deleting it:** add `hidden: true,` to its block.
- **Sharper images when enlarged:** the gallery uses the normal images (about 1800 px wide). If you also put a bigger copy with the same name in `images/full/` (up to about 3600 px), the viewer shows that one when someone clicks the image. Illustrations benefit most.
- **Image layout is automatic:** images are never cropped. They're arranged in rows that fill the width, and clicking one opens it big (arrow keys or swipe to browse). The old `fit: "whole"` setting is no longer needed.
- **A playable game:** put the game page in `play/` and add `play: { src: "play/my-game.html", ratio: "4 / 3", poster: "my-game-play.jpg", hint: "How to play" },`. The ratio is the sketch's width / height (`size(800, 600)` is `"4 / 3"`). The game only loads when someone presses Play. To port another Processing sketch, copy one of the pages in `play/`, and in the .js file turn `void setup()` into `function setup()`, `size(w, h)` into `createCanvas(w, h).parent('stage')`, `#FF0000` into `'#FF0000'`, and use `parc()`/`arcP()` from compat.js instead of `arc()` so arcs look the same as in Processing.
- **Videos:** put .mp4 files in `images/` and add `videos: ["my-video.mp4"],`.
- **Change the order:** move blocks up or down in the list.
- **New list column:** give a project a new `list:` name, e.g. `list: "Electronics",`.
- **Feature a project in a big card:** copy a block in FEATURED. Use `size: "big"` with an `image`, or `size: "small"` for a half-width card. Tints: `""`, `"lavender"` or `"teal"`.
- **Change the three highlights:** edit HIGHLIGHTS. Icons: screen, chip, cube, pen, code, camera, star.
- **Hero text, contact form, footer:** these are in index.html.

## If the page goes blank

Usually it's a small typo in content.js: a missing comma after `}`, or a missing `"`.
Open the browser console (F12, then Console). It shows the line number of the mistake.

## Put it online

- **Netlify Drop:** go to app.netlify.com/drop and drag the whole folder onto the page.
- **GitHub Pages:** upload the folder to a GitHub repository and turn on Pages in its settings.

After a change, upload the folder again (Netlify) or push the changed files (GitHub).

## Contact form

Make a free form at formspree.io and replace `YOUR_FORM_ID` in index.html.

**Changes not showing up?** Browsers keep the old style.css, content.js and render.js for a few minutes. To make everyone get the new version immediately, raise the number after `?v=` for those files at the top and bottom of index.html (for example `?v=2` → `?v=3`).
