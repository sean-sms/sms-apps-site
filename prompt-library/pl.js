/* Prompt Library page behaviour: sticky nav, reveal-on-scroll, and the
   ⌘K palette demo. Same conventions as deskcockpit/dc.js — the page is
   readable and complete with scripts off. */
(function () {
  "use strict";

  // --- Download buttons, from the single constant in the page head -----
  var url = (typeof DOWNLOAD_URL === "string" && DOWNLOAD_URL) || "#install";
  ["dl-nav", "dl-top", "dl-main"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.href = url;
  });
  // Keep the page honest in both states: while DOWNLOAD_URL is still an
  // in-page anchor there is no build, and the install section says so.
  if (url.charAt(0) !== "#") {
    var note = document.getElementById("no-build");
    if (note && note.parentNode) note.parentNode.removeChild(note);
  }

  // --- Nav goes solid once you leave the hero --------------------------
  var nav = document.getElementById("nav");
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("solid", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // --- Reveal on scroll -------------------------------------------------
  var reveals = [].slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  // --- The palette ------------------------------------------------------
  var PROMPTS = [
    { t: "Exec Summary Rewriter", g: "exsum", tags: "writing exec",
      d: "Turns a long technical status update into five lines with a clear ask at the end.",
      body: "You are an executive communications editor.\n\nRewrite the update below for an executive audience:\n- Five lines or fewer.\n- Lead with the decision or the risk, not the chronology.\n- End with one explicit ask.\n- No jargon a non-practitioner would have to look up.\n\nUPDATE:\n{update}" },
    { t: "Meeting Notes to Actions", g: "notes2act", tags: "meetings",
      d: "Pulls owners, dates and decisions out of raw notes and flags what was left unresolved.",
      body: "From the raw meeting notes below, produce:\n1. Decisions made, one line each.\n2. Action items as owner — action — due date. Mark any missing owner or date as UNASSIGNED.\n3. Open questions nobody answered.\n\nDo not invent owners or dates.\n\nNOTES:\n{notes}" },
    { t: "Code Review Pass", g: "cr", tags: "dev",
      d: "Reviews a diff for correctness, naming and the edge cases the author probably skipped.",
      body: "Review this diff as a senior engineer who will have to maintain it.\n\nIn order:\n1. Anything outright wrong, with the input that breaks it.\n2. Edge cases not handled.\n3. Naming or structure that will confuse the next reader.\n\nSkip style nits a formatter would catch. If it looks correct, say so plainly.\n\nDIFF:\n{diff}" },
    { t: "Email Reply Drafter", g: "reply", tags: "writing email",
      d: "Drafts a reply in my voice at a tone I choose, and says what it assumed.",
      body: "Draft a reply to the email below.\n\nTone: {tone}\nWhat I want out of it: {goal}\n\nShort paragraphs, no corporate filler, no apologising for the delay. After the draft, list any assumption you had to make.\n\nEMAIL:\n{email}" },
    { t: "Statement of Work Skeleton", g: "sow", tags: "consulting",
      d: "Builds scope, assumptions, deliverables and exclusions from a short brief.",
      body: "From the brief below, draft a statement of work skeleton:\n- Scope: what is in\n- Explicit exclusions: what is out\n- Deliverables, each with an acceptance criterion\n- Assumptions the estimate depends on\n- Key risks\n\nFlag anything in the brief too vague to price.\n\nBRIEF:\n{brief}" },
    { t: "Diagram From Description", g: "dia", tags: "docs",
      d: "Turns a described architecture into a Mermaid diagram I can paste into a doc.",
      body: "Turn the description below into a Mermaid diagram.\n\nDiagram type: {type}\n\nLabel every edge, keep node names short enough to read at a glance, and don't add components the description doesn't mention. Output only the Mermaid block.\n\nDESCRIPTION:\n{description}" },
    { t: "Explain This Error", g: "err", tags: "dev",
      d: "Explains a stack trace in plain terms and names the two likeliest causes.",
      body: "Explain this error to a competent engineer who has not seen this codebase.\n\n1. What the error actually means, in two sentences.\n2. The two likeliest causes, most likely first.\n3. The single fastest check to tell them apart.\n\nERROR:\n{error}" },
    { t: "Weekly Status Roll-up", g: "roll", tags: "status exec",
      d: "Merges several team updates into one status with the risks pulled to the top.",
      body: "Merge the updates below into a single weekly status.\n\nStructure: Headline, one line · Risks and blockers · Progress by workstream · Coming next week.\n\nRisks go first even if they came last in the source. Collapse duplicates. Keep names attached to commitments.\n\nUPDATES:\n{updates}" }
  ];

  var q = document.getElementById("q"),
      list = document.getElementById("pres"),
      toast = document.getElementById("ptoast"),
      sel = 0,
      shown = PROMPTS.slice();

  if (!q || !list) return;

  function esc(s) {
    return s.replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function hit(s, needle) {
    if (!needle) return esc(s);
    var i = s.toLowerCase().indexOf(needle.toLowerCase());
    if (i < 0) return esc(s);
    return esc(s.slice(0, i)) + "<mark>" + esc(s.slice(i, i + needle.length)) + "</mark>" + esc(s.slice(i + needle.length));
  }
  function score(p, n) {
    if (!n) return 1;
    var t = p.t.toLowerCase(), g = p.g.toLowerCase(), tg = p.tags.toLowerCase(), d = p.d.toLowerCase();
    if (g === n) return 100;
    if (t.indexOf(n) === 0) return 90;
    if (t.indexOf(n) > 0) return 70;
    if (g.indexOf(n) === 0) return 60;
    if (tg.indexOf(n) >= 0) return 40;
    if (d.indexOf(n) >= 0) return 20;
    return 0;
  }
  function render() {
    var n = q.value.trim().toLowerCase();
    shown = PROMPTS.map(function (p) { return { p: p, s: score(p, n) }; })
                   .filter(function (x) { return x.s > 0; })
                   .sort(function (a, b) { return b.s - a.s; })
                   .map(function (x) { return x.p; });
    if (sel >= shown.length) sel = Math.max(0, shown.length - 1);
    if (!shown.length) {
      list.innerHTML = '<li class="palette-empty">No prompt matches that. In the app, this is where you would press Return to write one.</li>';
      q.removeAttribute("aria-activedescendant");
      return;
    }
    list.innerHTML = shown.map(function (p, i) {
      return '<li class="prow" role="option" id="opt' + i + '" aria-selected="' + (i === sel) + '" data-i="' + i + '">' +
             '<span class="prow-top"><span class="nm">' + hit(p.t, n) + '</span>' +
             '<span class="tg">' + hit(p.g, n) + '</span>' +
             '<span class="tags">' + esc(p.tags.split(" ").map(function (x) { return "#" + x; }).join(" ")) + '</span></span>' +
             '<span class="ds">' + esc(p.d) + '</span></li>';
    }).join("");
    q.setAttribute("aria-activedescendant", "opt" + sel);
  }
  function say(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("on");
    clearTimeout(say._t);
    say._t = setTimeout(function () { toast.classList.remove("on"); }, 1900);
  }
  function copy(i) {
    var p = shown[i];
    if (!p) return;
    var done = function () { say("Copied “" + p.t + "”"); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(p.body).then(done, function () { say("Press ⌘C to copy"); });
    } else {
      var ta = document.createElement("textarea");
      ta.value = p.body;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { say("Press ⌘C to copy"); }
      document.body.removeChild(ta);
    }
  }

  q.addEventListener("input", function () { sel = 0; render(); });
  q.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(sel + 1, shown.length - 1); render(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(sel - 1, 0); render(); }
    else if (e.key === "Enter") { e.preventDefault(); copy(sel); }
  });
  list.addEventListener("click", function (e) {
    var li = e.target.closest(".prow");
    if (!li) return;
    sel = +li.dataset.i;
    render();
    copy(sel);
  });
  document.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      q.focus();
      q.select();
      q.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  });

  render();

  // One orchestrated moment: the palette types a query itself, then hands
  // over. Skipped entirely when reduced motion is asked for.
  if (!(window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches)) {
    var typed = "exec", k = 0;
    var tick = setInterval(function () {
      q.value = typed.slice(0, ++k);
      render();
      if (k >= typed.length) clearInterval(tick);
    }, 130);
  }
})();
