/* =========================================================
   CONTENT
   This is the only file you need to edit to change your work.
   The page builds itself from the lists below:

     HIGHLIGHTS  the three small items in the grey card under your portrait
     FEATURED    the big showcase cards (and the small ones beside each other)
     LIST_ORDER  the order of the list columns at the top
     PROJECTS    every project: the lists and the "All work" section

   The order in each list is the order on the page.
   Text goes between "quotes". If your text contains a " character,
   write \" instead. Every block ends with a comma.

   Easiest way to add a project: open new-entry.html in your browser,
   fill in the form and paste the result into PROJECTS below.
   ========================================================= */


/* ---------- HIGHLIGHTS ----------
   icon:  one of "screen", "chip", "cube", "pen", "code", "camera", "star"
   link:  "#" + the id of a project below, or a full web address        */

const HIGHLIGHTS = [
  {
    icon: "screen",
    title: "Client presentation",
    text: "Presented our bridge monitoring concept to Rijkswaterstaat at their office in Utrecht.",
    link: "#rijkswaterstaat",
  },
  {
    icon: "camera",
    title: "Art exhibition",
    text: "Built an installation for the Creative Technology art exhibition at Black Brick Underground, Enschede.",
    link: "#exhibition",
  },
  {
    icon: "cube",
    title: "Playable 3D",
    text: "Unity scenes made from my own Blender models, published on itch.io.",
    link: "#unity",
  },
];


/* ---------- FEATURED ----------
   size:   "big" for a full-width card, "small" for a half-width card
           (two small cards in a row sit next to each other)
   tint:   "", "lavender" or "teal"
   image:  only for big cards, a file name from the images folder        */

const FEATURED = [
  {
    size: "big",
    tint: "",
    eyebrow: "Rijkswaterstaat · Module 3",
    title: "A new way to monitor Dutch infrastructure",
    text: "A modular 3D map with LED-lit bridge models that open a data dashboard when you scan them. Designed with Rijkswaterstaat's asset managers.",
    button: { label: "See the project →", url: "#rijkswaterstaat" },
    image: "rijkswaterstaat-1.jpg",
  },
  {
    size: "big",
    tint: "lavender",
    eyebrow: "Blender · Unity",
    title: "Modelled from scratch, then brought to life",
    text: "My first Blender model built from scratch, with my own artwork textures, later placed in Unity alongside a Da Vinci tank.",
    button: { label: "Play it in your browser →", url: "#unity" },
    image: "japanese-house-1.jpg",
  },
  {
    size: "small",
    tint: "teal",
    eyebrow: "Electronics",
    title: "A PCB guide for my peers",
    button: { label: "Read the guide ↗", url: "https://docs.google.com/document/d/1zooBcqyrptsdPBeCEDaPWu8iJ5M0LH_fq9H4dy7rSPY/edit?usp=sharing" },
  },
  {
    size: "small",
    tint: "",
    eyebrow: "Installation · 2026",
    title: "A Decision on Perspective",
    button: { label: "See the exhibition ↓", url: "#exhibition" },
  },
];


/* ---------- LIST ORDER ----------
   The order of the list columns at the top. A list name that isn't
   here still shows up, after these.                                   */

const LIST_ORDER = ["Design", "3D", "Electronics", "Code", "Art"];


/* ---------- PROJECTS ----------
   id:          short name with dashes, no spaces. Used for links (#id)
                and, when images is a number, for the image file names.
   title:       the full title
   shortTitle:  (optional) shorter name used in the lists at the top
   list:        which list column it goes in, e.g. "Design", "3D", "Art".
                A new name makes a new column automatically.
   tag:         small grey label in the list, e.g. "3D"
   eyebrow:     small label above the title, e.g. "2025 · Blender"
   text:        the description
   images:      a number, e.g. 4, means images/<id>-1.jpg to images/<id>-4.jpg
                or a list of file names, e.g. ["poster-1.jpg", "poster-2.png"]
   videos:      (optional) video files in the images folder, e.g. ["demo.mp4"]
   fit:         (no longer needed) images are never cropped now; they are
                arranged in neat rows automatically. Click one to see it big.
   play:        (optional) a game that runs on the page, from the play folder, e.g.
                { src: "play/ducks.html", ratio: "4 / 3", poster: "creature-play.jpg",
                  hint: "Click a duck" }   ratio = the sketch's width / height
   link:        (optional) a button, e.g. { label: "Read it ↗", url: "https://..." }
   links:       (optional) several buttons, e.g. [{ label: "Play ↗", url: "https://..." }, …]
   embeds:      (optional) itch.io embed links, e.g. ["https://itch.io/embed/4233002"]
   hidden:      (optional) true hides the project without deleting it        */

const PROJECTS = [

  /* ----- Design ----- */
  {
    id: "rijkswaterstaat",
    title: "Bridges beyond concrete",
    shortTitle: "Rijkswaterstaat",
    list: "Design",
    tag: "UX · Client",
    eyebrow: "2026 · Module 3 project · Rijkswaterstaat",
    text: "Rijkswaterstaat's asset managers track the state of bridges in a database that mostly data analysts can read. With a team of six we designed a physical alternative: a 90 × 90 cm modular map of Gorinchem with removable 3D-printed bridge models. LEDs on each model show at a glance which parts work (green), need maintenance (orange), are broken (red) or are being serviced (blue). Hold a model over the NFC scanner and a dashboard opens with its cost, risk and inspection data. The next module, our client invited us to present the concept at Rijkswaterstaat in Utrecht.",
    images: [
      "rijkswaterstaat-concept.jpg",
      "rijkswaterstaat-1.jpg", "rijkswaterstaat-2.jpg", "rijkswaterstaat-3.jpg", "rijkswaterstaat-4.jpg",
      "rijkswaterstaat-5.jpg", "rijkswaterstaat-6.jpg",
    ],
  },
  {
    id: "exhibition",
    title: "A Decision on Perspective",
    shortTitle: "Art exhibition",
    list: "Design",
    tag: "Installation",
    eyebrow: "2026 · Module 4 · Art exhibition",
    text: "Our group's installation for the Creative Technology art exhibition at Black Brick Underground in Enschede, on 2 June 2026. The poster asked visitors whether they would look beyond themselves or within themselves. We split the room in two with draped fabric, with a separate entrance and exit and a camera inside. Made with Liam Townsley, Martina Germano, Lapo D'Auria, Elena Andreucci and Teo Peeters.",
    images: 5,
    videos: ["exhibition-1.mp4", "exhibition-2.mp4"],
    fit: "whole",
  },
  {
    id: "ai-poster",
    title: "Is this AI?",
    list: "Design",
    tag: "Poster",
    eyebrow: "Module 3 · Technology and Society",
    text: "A poster about spotting AI-generated images and video. It shows that the usual tricks, like checking hands or listening for odd audio, no longer work, and that reading, verifying sources and going outside are better habits.",
    images: 1,
    fit: "whole",
  },
  {
    id: "poster",
    title: "Anti-litter poster",
    list: "Design",
    tag: "Poster",
    eyebrow: "Module 1 · Design for Behavioural Change",
    text: "Coming from Singapore, I was surprised by how much litter I sometimes see on the streets in the Netherlands. For this assignment I combined humour with a strong message to encourage people to be cleaner.",
    images: 1,
    fit: "whole",
  },

  /* ----- 3D ----- */
  {
    id: "unity",
    title: "Unity scenes",
    list: "3D",
    tag: "Unity",
    eyebrow: "Module 2 · Interactive Visualisation",
    text: "My Blender models brought into Unity: a Da Vinci tank in a desert landscape, and the Japanese house placed in a mountain valley. Both run in your browser on itch.io.",
    images: 6,
    links: [
      { label: "Play the Da Vinci tank ↗", url: "https://reanu0.itch.io/evil-davinci-tank" },
      { label: "Explore the Japanese house ↗", url: "https://reanu0.itch.io/so4reanu" },
    ],
  },
  {
    id: "japanese-house",
    title: "Japanese house",
    list: "3D",
    tag: "Blender",
    eyebrow: "Module 2 · Blender",
    text: "My first time modelling from scratch in Blender. Textures and HDRIs are from PolyHaven and BlenderKit. All models and artwork textures were made by me.",
    images: 5,
  },
  {
    id: "minecraft-house",
    title: "Minecraft house on a table",
    shortTitle: "Minecraft house",
    list: "3D",
    tag: "Blender",
    eyebrow: "Module 2 · Blender",
    text: "Learning the basics of Blender.",
    images: 1,
  },
  {
    id: "statue",
    title: "Statue on a plinth",
    shortTitle: "Statue",
    list: "3D",
    tag: "Blender",
    eyebrow: "Module 2 · Blender",
    text: "An early Blender exercise: a bust on a stepped stone plinth.",
    images: 1,
  },

  /* ----- Electronics ----- */
  {
    id: "pcb",
    title: "PCB design guide",
    list: "Electronics",
    tag: "PCB",
    eyebrow: "Electronics",
    text: "I made a PCB design guide for peers within the course. I hope to eventually turn it into a full workshop within the DIY committee.",
    images: ["pcb-1.png"],
    fit: "whole",
    link: { label: "Read the guide ↗", url: "https://docs.google.com/document/d/1zooBcqyrptsdPBeCEDaPWu8iJ5M0LH_fq9H4dy7rSPY/edit?usp=sharing" },
  },
  {
    id: "smart-bench",
    title: "Smart bench",
    list: "Electronics",
    tag: "Arduino",
    eyebrow: "Module 2 · Smart Environments",
    text: "A concept for a public bench that encourages people to sort their waste, with sortable bins and a fill meter, a screen with a speaker, and a pressure sensor under the seat. I programmed the bin sensor on an Arduino: an ultrasonic sensor notices new trash, waits for it to settle, then reports how full the bin is as a percentage.",
    images: 4,
    fit: "whole",
  },
  {
    id: "target-game",
    title: "Target Hit",
    list: "Electronics",
    tag: "Arduino",
    eyebrow: "Module 2 · Physical computing",
    text: "A two-player game with physical controls. Player one hides five targets on the screen, steering with a potentiometer (left and right) and a light sensor (up and down). Player two then races to hit them all with the same controls, and the fastest times go on a high-score list. The game is written in Processing and reads the sensors from an Arduino over serial. You can try it below with the keyboard, or plug in the Arduino and connect it in Chrome.",
    images: 1,
    play: {
      src: "play/target.html",
      ratio: "10 / 7",
      poster: "target-game-play.jpg",
      hint: "Keyboard needed. Player 1: WASD and click to place targets. Player 2: IJKL and hold F to hit.",
    },
    fit: "whole",
  },

  /* ----- Code ----- */
  {
    id: "axe-throw",
    title: "Axe Throw",
    list: "Code",
    tag: "Game",
    eyebrow: "Module 4 · Algorithms for Creative Technology",
    text: "A Processing game made with Teo Peeters, where you launch weapons from a catapult at a target. I drew the pixel-art sprites (the catapult, the target, the weapons and the background) and painted concept art for the sword and the axe. Daggers need to land blade first, the heavy axe is picky, and the shuriken always sticks.",
    images: 3,
    play: {
      src: "play/axe-throw.html",
      ratio: "16 / 9",
      poster: "axe-throw-play.jpg",
      hint: "Drag away from the catapult and let go to throw. Space switches the weather.",
    },
    fit: "whole",
  },
  {
    id: "bakery",
    title: "Bakery game",
    list: "Code",
    tag: "Processing",
    eyebrow: "Module 1 · Introduction to Programming final project",
    text: "My final project for Introduction to Programming: a bakery game in Processing, made for a shop window. Bread comes out of a pipe onto a conveyor belt every few seconds, and you drag each loaf into the basket or the bin. Score pop-ups and a price tracker keep count. Play it right here; the sketch below is my mockup of the game in the shop window.",
    images: 1,
    play: {
      src: "play/bakery.html",
      ratio: "4 / 3",
      poster: "bakery-play.jpg",
      hint: "Drag each loaf into the basket, or into the bin. Watch out for ducks.",
    },
    fit: "whole",
  },
  {
    id: "creature",
    title: "Introduction to Programming: creature",
    shortTitle: "Processing ducks",
    list: "Code",
    tag: "Processing",
    eyebrow: "Module 1 · Processing",
    text: "For my first programming assignment, I made a duck in Processing. Click on the ducks to make them move. They also bob gently up and down, and you can drag them around.",
    play: {
      src: "play/ducks.html",
      ratio: "4 / 3",
      poster: "creature-play.jpg",
      hint: "Click a duck to send it swimming, drag it around, or use the slider to add more ducks.",
    },
    link: { label: "See the code ↗", url: "https://pastebin.com/GfAx2LA0" },
  },

  /* ----- Art ----- */
  {
    id: "manga",
    title: "Manga",
    list: "Art",
    tag: "Comic",
    eyebrow: "Illustration",
    text: "A short Japanese-style manga about a girl's strange first day, told in four-panel (4-koma) chapters, plus a character turnaround sheet. Read each page from right to left, top to bottom.",
    images: 4,
    fit: "whole",
  },
  {
    id: "prodaccie",
    title: "Artworks for Prodaccie",
    list: "Art",
    tag: "Painting · Comic",
    eyebrow: "Illustration",
    text: "",
    images: 2,
    fit: "whole",
  },
  {
    id: "paintings",
    title: "Digital illustrations",
    list: "Art",
    tag: "Illustration",
    eyebrow: "Illustration",
    text: "",
    images: ["paintings-2.jpg", "paintings-1.jpg", "paintings-3.jpg", "paintings-4.jpg", "paintings-5.jpg"],
    fit: "whole",
  },
  {
    id: "older",
    title: "Older works",
    list: "Art",
    tag: "Archive",
    eyebrow: "Archive",
    text: "Paintings, studies, 3D hand renders and a poster.",
    images: 18,
    fit: "whole",
  },
];
