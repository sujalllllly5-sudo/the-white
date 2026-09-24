/* ============================================================
   PORTFOLIO CLIENT SCRIPT
   Needs server.js running:  node server.js  →  http://localhost:5173
   ============================================================ */

/* ============================================================
   1. SITE CONFIG  ✏️ EDIT EVERYTHING ABOUT YOUR PAGE HERE
   Add / remove / change projects and skills — the page and the
   AI assistant update automatically.
   ============================================================ */
const SITE = {
  name: "Sujal Dehariya",
  role: "Web Developer · BCA Student",
  bio: "19-year-old BCA student from India building premium, cinematic web experiences — and studying Japanese with the goal of working in Japan one day.",
  email: "",
  github: "https://github.com/sujalllllly5-sudo",

  projects: [
    {
      title: "AETHERION",
      description: "Premium automotive website concept — immersive, cinematic experience with 3D interaction and high-end UI.",
      tech: ["Next.js", "React", "Three.js", "GSAP", "Tailwind CSS"],
      link: ""
    },
    {
      title: "MEDUSA AI",
      description: "Dr. Stone–inspired AI landing experience — restricted-access feel, multi-stage scroll storytelling and a cinematic AI-core reveal.",
      tech: ["React", "Three.js", "Animation"],
      link: ""
    },
    {
      title: "Interactive Background Website",
      description: "A real Next.js project featuring a real-time WebGL background that reacts to your mouse, a glassmorphism UI and scroll-driven card animations.",
      tech: ["Next.js", "React", "TypeScript", "WebGL", "Tailwind CSS"],
      link: "http://localhost:3000",
      image: "assets/ib-preview.png"
    },
    {
      title: "AI Portfolio Assistant",
      description: "This very website — a minimalist portfolio whose assistant answers questions only from Sujal's profile, powered by OpenCode Zen through a secure local server.",
      tech: ["HTML", "CSS", "JavaScript", "Node.js"],
      link: ""
    }
  ],

  about: [
    { title: "Education", text: "Bachelor of Computer Applications (BCA) student, learning programming and web development alongside college." },
    { title: "Focus", text: "Frontend development with premium, cinematic UI — React, Next.js, Tailwind, and experimenting with Three.js." },
    { title: "Beyond Code", text: "Manga-style artist — sketches, character design and storyboards; has completed paid commissions. Studying Japanese." },
    { title: "The Goal", text: "To work as a web developer in Japan — combining engineering, visual design and language along the way." }
  ],

  skills: [
    "HTML", "CSS", "JavaScript", "React",
    "Next.js", "Tailwind CSS", "TypeScript",
    "Node.js", "Git & GitHub", "Three.js",
    "C++ Basics", "AI Tools & APIs"
  ]
};

/* ============================================================
   2. AI CONFIG  🤖 CONNECT YOUR MODEL HERE
   The page talks to YOUR OWN local server (server.js), which
   keeps the secret API key safe and forwards to OpenCode Zen.
   The AI's personality + knowledge live in ai-knowledge.txt —
   edit that file to change what the assistant knows.

   The server auto-falls-back through its free model list when
   one hits its rate limit, so no changes needed here normally.
   ============================================================ */
const AI = {
  endpoint: "/api/chat",
  fallbackError:
    "Sorry, I couldn't reach the model right now."
};

/* ============================================================
   3. PAGE RENDERING : fills the HTML with data from SITE
   ============================================================ */
document.getElementById("hero-name").textContent = SITE.name;
document.getElementById("hero-tagline").textContent = SITE.role;
document.getElementById("hero-bio").textContent = SITE.bio;
document.title = SITE.name + " — Portfolio";
const nameParts = SITE.name.toLowerCase().split(" ");
document.querySelector(".nav-logo").innerHTML =
  nameParts[0] + "<span>." + (nameParts[1] || "dev") + "</span>";
document.getElementById("footer-text").textContent =
  "© " + new Date().getFullYear() + " " + SITE.name;

const projectGrid = document.getElementById("project-grid");
SITE.projects.forEach(project => {
  const card = document.createElement("article");
  card.className = "project-card";

  if (project.image) {
    const img = document.createElement("img");
    img.className = "project-image";
    img.src = project.image;
    img.alt = project.title + " preview";
    img.loading = "lazy";
    card.appendChild(img);
  }

  const title = document.createElement("h3");
  title.textContent = project.title;

  const desc = document.createElement("p");
  desc.textContent = project.description;

  const tags = document.createElement("div");
  tags.className = "project-tags";
  project.tech.forEach(t => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = t;
    tags.appendChild(tag);
  });

  card.append(title, desc, tags);

  if (project.link) {
    const link = document.createElement("a");
    link.className = "project-link";
    link.href = project.link;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "View project →";
    card.appendChild(link);
  }

  projectGrid.appendChild(card);
});

const skillList = document.getElementById("skill-list");
SITE.skills.forEach(skill => {
  const chip = document.createElement("span");
  chip.className = "chip";
  chip.textContent = skill;
  skillList.appendChild(chip);
});

const aboutGrid = document.getElementById("about-grid");
(SITE.about || []).forEach(item => {
  const card = document.createElement("div");
  card.className = "about-card";

  const title = document.createElement("h3");
  title.textContent = item.title;

  const text = document.createElement("p");
  text.textContent = item.text;

  card.append(title, text);
  aboutGrid.appendChild(card);
});

const contactLinks = document.getElementById("contact-links");
[
  { label: SITE.email, href: "mailto:" + SITE.email },
  { label: "GitHub", href: SITE.github }
].forEach(item => {
  if (!item.href) return;
  const a = document.createElement("a");
  a.textContent = item.label;
  a.href = item.href;
  a.target = item.href.startsWith("mailto") ? "_self" : "_blank";
  a.rel = "noopener";
  contactLinks.appendChild(a);
});

/* ============================================================
   4. GET AI REPLY : sends the conversation to the local server.
   The system prompt (personality + knowledge) is injected by
   server.js from ai-knowledge.txt — edit THAT file to teach
   the assistant new things. No restart needed.
   ============================================================ */
async function getAIReply(history) {
  if (!AI.endpoint) {
    await new Promise(resolve => setTimeout(resolve, 800));
    const p = SITE.projects[Math.floor(Math.random() * SITE.projects.length)];
    return "Demo mode (server not started). One of my projects: " +
      p.title + " — " + p.description;
  }

  const response = await fetch(AI.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: history })
  });

  if (!response.ok) {
    let reason = "HTTP " + response.status;
    try {
      const errData = await response.json();
      if (errData.error) reason = errData.error.type + ": " + (errData.error.message || "");
    } catch {}
    throw new Error(reason);
  }

  const data = await response.json();
  if (data.error) throw new Error(data.error.message || data.error.type || "model error");

  const content = data.choices && data.choices[0] && data.choices[0].message.content;
  if (!content || !content.trim()) throw new Error("empty reply");
  return content.trim();
}

/* ============================================================
   5. CHAT UI LOGIC : open/close panel, send messages,
   show typing indicator while waiting for the reply.
   ============================================================ */
const panel = document.getElementById("chat-panel");
const messagesEl = document.getElementById("chat-messages");
const inputEl = document.getElementById("chat-input");
const sendBtn = document.getElementById("chat-send");
let history = [];
let openedOnce = false;

function addMessage(role, text, extraClass) {
  const el = document.createElement("div");
  el.className = "msg " + (extraClass || role);
  el.textContent = text;
  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return el;
}

function setBusy(busy) {
  sendBtn.disabled = busy;
  inputEl.disabled = busy;
}

/* ------------------------------------------------------------
   PAGE NAVIGATION : the companion can move you around.
   Works two ways: the chips above the chat, or typing
   things like "go to projects" / "take me to contact".
   ------------------------------------------------------------ */
const NAV_TARGETS = [
  { match: /\b(home|top)\b/i,        selector: "#top",      name: "Home" },
  { match: /\babout\b/i,             selector: "#about",    name: "About" },
  { match: /\bprojects?\b|\bwork\b/i, selector: "#projects", name: "Projects" },
  { match: /\bskills?\b|\bstack\b/i, selector: "#skills",   name: "Skills" },
  { match: /\bcontact\b|\bemail\b|\bgithub\b/i, selector: "#contact", name: "Contact" }
];
const NAV_COMMAND = /(navigat|go|jump|take|scroll|show|bring|move)/i;

function findNavIntent(text) {
  if (!NAV_COMMAND.test(text)) return null;
  for (const target of NAV_TARGETS) {
    if (target.match.test(text)) return target;
  }
  return null;
}

function scrollToSection(selector) {
  const el = document.querySelector(selector);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.querySelectorAll(".chat-nav [data-scroll]").forEach(button => {
  button.addEventListener("click", () => scrollToSection(button.dataset.scroll));
});

async function handleSend(text) {
  addMessage("user", text);

  const navIntent = findNavIntent(text);
  if (navIntent) {
    scrollToSection(navIntent.selector);
    addMessage("bot", "Taking you to " + navIntent.name + " ✦");
    inputEl.focus();
    return;
  }

  history.push({ role: "user", content: text });

  const typing = addMessage("bot", "●●●", "typing");
  setBusy(true);

  try {
    const reply = await getAIReply(history);
    typing.remove();
    addMessage("bot", reply);
    history.push({ role: "assistant", content: reply });
  } catch (err) {
    typing.remove();
    addMessage("bot", AI.fallbackError + " (" + err.message + ")");
  } finally {
    setBusy(false);
    inputEl.focus();
  }
}

function openPanel() {
  panel.classList.add("open");
  if (!openedOnce) {
    openedOnce = true;
    document.getElementById("chat-status").textContent =
      AI.endpoint ? "online" : "demo mode";
    addMessage("bot", "Hi! Ask me anything about Sujal — projects, skills, art, or the Japan plan.");
  }
  inputEl.focus();
}

document.getElementById("chat-toggle").addEventListener("click", () =>
  panel.classList.contains("open") ? panel.classList.remove("open") : openPanel()
);
document.getElementById("open-chat").addEventListener("click", openPanel);
document.getElementById("hero-chat").addEventListener("click", openPanel);

document.getElementById("chat-form").addEventListener("submit", event => {
  event.preventDefault();
  const text = inputEl.value.trim();
  if (!text || sendBtn.disabled) return;
  inputEl.value = "";
  handleSend(text);
});

/* ============================================================
   7. INTRO SEQUENCE : 4 swipes assemble the site.
   A swipe = wheel down / touch swipe up / ArrowDown /
   PageDown / Space / Enter / click on the screen.
   Stage 0        -> letters scattered, floating.
   Stages 1-3     -> letters tighten + one identity line appears.
   Stage 4 (last) -> letters fly off, curtain lifts, hero rises.
   ============================================================ */
(function () {
  const intro = document.getElementById("intro");
  if (!intro) return;

  // ---- HARD TOP LOCK ------------------------------------------
  // The intro must always play out at, and end at, the very top.
  // - Disable the browser's own scroll restoration.
  // - Jump instantly (bypassing html { scroll-behavior: smooth },
  //   which would otherwise animate the trip back up).
  // - Lock scrolling on <html> AND <body> (some browsers let one
  //   of them scroll even when the other is hidden).
  function jumpToTop() {
    const htmlEl = document.documentElement;
    const prev = htmlEl.style.scrollBehavior;
    htmlEl.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    htmlEl.style.scrollBehavior = prev;
  }

  // A stale #hash in the URL (e.g. reloaded after clicking
  // "View Projects") makes the browser snap to that anchor even
  // with manual scroll restoration -> strip it so top always wins.
  // Wrapped in try/catch: replaceState throws on file:// pages,
  // which would otherwise kill every listener registered below.
  function landAtTop() {
    if (location.hash && location.protocol !== "file:") {
      try {
        history.replaceState(null, "", location.pathname + location.search);
      } catch {}
    }
    jumpToTop();
  }

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  landAtTop();
  window.addEventListener("load", () => {
    if (document.getElementById("intro")) landAtTop();
  });

  // Back/forward navigation restores this page mid-scroll AFTER
  // the intro was removed from the DOM -> force the landing view
  // again so the navbar is always visible on arrival.
  window.addEventListener("pageshow", () => {
    if (!document.getElementById("intro")) landAtTop();
  });

  document.documentElement.classList.add("intro-lock");
  document.body.classList.add("intro-lock");

  const letters = Array.from(intro.querySelectorAll(".lt-inner"));
  const lines = Array.from(intro.querySelectorAll(".intro-line"));
  const dots = Array.from(intro.querySelectorAll(".dot"));
  const MAX_SWIPES = 4;

  // One random scatter offset per letter, reused every stage so
  // the assembly feels intentional, not jittery.
  const scatter = letters.map(() => ({
    x: (Math.random() * 2 - 1) * 110,
    y: (Math.random() * 2 - 1) * 80,
    r: (Math.random() * 2 - 1) * 28
  }));

  let stage = 0;
  let busy = false;

  function render() {
    const k = 1 - stage / MAX_SWIPES; // remaining scatter amount
    letters.forEach((el, i) => {
      const s = scatter[i];
      el.style.transform =
        "translate(" + s.x * k + "px," + s.y * k + "px) rotate(" + s.r * k + "deg)";
    });
    dots.forEach((d, i) => d.classList.toggle("active", i <= Math.min(stage, dots.length - 1)));
    lines.forEach((l, i) => l.classList.toggle("show", i < stage));
  }
  render();

  function advance() {
    if (busy || stage >= MAX_SWIPES) return;
    busy = true;
    stage += 1;
    if (stage < MAX_SWIPES) {
      render();
      setTimeout(() => { busy = false; }, 450);
    } else {
      finish();
    }
  }

  function finish() {
    render();
    landAtTop(); // always land on the landing page — instantly, navbar visible
    letters.forEach((el, i) => {
      el.style.transitionDelay = i * 70 + "ms";
      el.style.setProperty("--bye-x", ((Math.random() * 2 - 1) * 260) + "px");
      el.style.setProperty("--bye-y", (-150 - Math.random() * 200) + "px");
      el.style.setProperty("--bye-r", ((Math.random() * 2 - 1) * 40) + "deg");
      el.classList.add("bye");
    });
    intro.classList.add("done");
    document.documentElement.classList.remove("intro-lock");
    document.body.classList.remove("intro-lock");
    document.body.classList.add("entered"); // triggers hero rise-in
    setTimeout(() => intro.remove(), 1200);
  }

  window.addEventListener("wheel", e => {
    if (e.deltaY > 24) advance();
  }, { passive: true });

  let touchY = null;
  window.addEventListener("touchstart", e => {
    touchY = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener("touchend", e => {
    if (touchY === null) return;
    if (touchY - e.changedTouches[0].clientY > 45) advance();
    touchY = null;
  }, { passive: true });

  window.addEventListener("keydown", e => {
    if (["ArrowDown", "PageDown", " ", "Enter"].indexOf(e.key) !== -1) advance();
  });
  intro.addEventListener("click", advance);
})();

/* ============================================================
   8. SCROLL REVEAL : [data-reveal] blocks rise softly the
   first time they enter the viewport. Pure polish.
   ============================================================ */
(function () {
  const els = document.querySelectorAll("[data-reveal]");
  if (!els.length || !("IntersectionObserver" in window)) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add("revealed");
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.14 });

  els.forEach(el => io.observe(el));
})();
