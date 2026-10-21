const root = document.documentElement;
const round = Number(document.body.getAttribute("data-round") || "1");
const gate = document.body.getAttribute("data-gate") || "agreed";
const storeKey = `module-page:${location.pathname}:round-${round}`;
const themeKey = "module-page:theme";
const darkQuery = matchMedia("(prefers-color-scheme: dark)");

const nodeKinds = {
  part: ["--accent-soft", "--accent"],
  adapter: ["--adapter-soft", "--adapter"],
  test: ["--warn-soft", "--warn"],
  store: ["--store-soft", "--store"],
  external: ["--sunk", "--ink-3"],
  blocked: ["--bad-soft", "--bad"],
};

const nodeCss = [
  ...Object.entries(nodeKinds).map(
    ([kind, [fill, ink]]) =>
      `.node.${kind} :is(rect, polygon, circle, path.basic, .label-container) { fill: var(${fill}) !important; stroke: var(${ink}) !important; stroke-width: 1.5px !important; }`,
  ),
  ".node.test :is(rect, polygon) { stroke-dasharray: 5 3 !important; }",
  ".cluster rect { fill: transparent !important; stroke: var(--line-strong) !important; stroke-dasharray: 4 4 !important; }",
  ".cluster-label, .cluster .nodeLabel { font-family: var(--font-mono) !important; font-size: 11px !important; fill: var(--ink-3) !important; color: var(--ink-3) !important; }",
  ".edgeLabel, .edgeLabel p { background: var(--surface) !important; color: var(--ink-2) !important; font-family: var(--font-mono) !important; font-size: 11px !important; }",
].join("\n");

const themeColours = {
  background: "--surface",
  primaryColor: "--surface",
  primaryBorderColor: "--line-strong",
  primaryTextColor: "--ink",
  lineColor: "--ink-3",
  textColor: "--ink",
  actorBkg: "--surface",
  actorBorder: "--line-strong",
  actorTextColor: "--ink",
  signalColor: "--ink-2",
  signalTextColor: "--ink",
  noteBkgColor: "--warn-soft",
  noteBorderColor: "--warn",
  noteTextColor: "--ink",
  sequenceNumberColor: "--surface",
};

const isDark = () =>
  root.getAttribute("data-theme") === "dark" ||
  (!root.hasAttribute("data-theme") && darkQuery.matches);

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.append(area);
    area.select();
    const done = document.execCommand("copy");
    area.remove();
    return done;
  }
};

const flash = (button, label, rest) => {
  button.replaceChildren(label);
  setTimeout(() => button.replaceChildren(rest), 1400);
};

const decisionId = /^D\d/;

const make = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
};

const readField = (field) => {
  const id = field.getAttribute("data-call") || "";
  const checked = field.querySelector("input[type=radio]:checked");
  const text = field.querySelector("textarea");

  if (checked instanceof HTMLInputElement) {
    return {
      id,
      value: checked.value,
      differs: !checked.hasAttribute("data-rec"),
    };
  }

  if (text instanceof HTMLTextAreaElement && text.value.trim()) {
    return { id, value: text.value.trim(), differs: true };
  }

  return { id, value: "", differs: false };
};

const stateLabel = (answer) => {
  if (!answer.differs) return "recommended";
  if (decisionId.test(answer.id)) return `option ${answer.value}`;
  return "answered";
};

const themeButton = document.querySelector("[data-theme-toggle]");
const labelTheme = () =>
  themeButton?.replaceChildren(isDark() ? "Light theme" : "Dark theme");

try {
  const stored = localStorage.getItem(themeKey);
  if (stored === "dark" || stored === "light")
    root.setAttribute("data-theme", stored);
} catch {}

labelTheme();

const fields = [...document.querySelectorAll("fieldset[data-call]")];
const stats = document.querySelector("[data-stats]");

if (stats) {
  const words = (document.querySelector("main")?.textContent || "")
    .trim()
    .split(/\s+/).length;
  const decisions = fields.filter((f) =>
    decisionId.test(f.getAttribute("data-call") || ""),
  ).length;
  const questions = fields.length - decisions;
  const chips = [`${Math.max(1, Math.round(words / 220))} min read`];
  if (decisions)
    chips.push(`${decisions} decision${decisions === 1 ? "" : "s"}`);
  if (questions)
    chips.push(`${questions} question${questions === 1 ? "" : "s"}`);
  stats.prepend(...chips.map((text) => make("span", "chip plain", text)));
}

const toc = document.querySelector("nav.toc");
const sections = [...document.querySelectorAll("main > section[id]")].filter(
  (s) => s.querySelector(":scope > h2"),
);

if (toc && sections.length) {
  const list = make("ol");
  const links = sections.map((section, index) => {
    const link = make("a");
    link.href = `#${section.id}`;
    link.append(
      make("span", "num", String(index + 1).padStart(2, "0")),
      section.querySelector(":scope > h2")?.textContent || "",
    );
    const item = make("li");
    item.append(link);
    list.append(item);
    return link;
  });
  toc.append(list);

  const spy = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const link of links)
          link.classList.toggle("active", link.hash === `#${entry.target.id}`);
      }
    },
    { rootMargin: "0px 0px -70% 0px" },
  );

  for (const section of sections) spy.observe(section);
}

const changed = [...document.querySelectorAll(`[data-changed="${round}"]`)];
const banner = document.querySelector("[data-round-banner]");

const showChanges = round > 1 && changed.length > 0 && banner !== null;

if (showChanges) {
  root.classList.add("highlight-changes");
  const list = make("ul");

  for (const element of changed) {
    element.classList.add("is-current");
    const target = element.id ? element : element.closest("[id]");
    const link = make(
      "a",
      "",
      element.getAttribute("data-label") ||
        element.querySelector("h2, h3")?.textContent?.trim() ||
        target?.id ||
        "Change",
    );
    link.href = `#${target?.id || ""}`;
    const item = make("li");
    item.append(link);
    list.append(item);
  }

  const hide = make("button", "", "Hide highlights");
  hide.type = "button";
  hide.addEventListener("click", () => {
    root.classList.remove("highlight-changes");
    banner.classList.remove("shown");
  });
  banner.append(make("strong", "", `Changed in round ${round}`), list, hide);
  banner.classList.add("shown");
}

const replyList = document.querySelector("[data-reply-list]");
const replyNotes = document.querySelector("[data-reply-notes]");
const replyOutput = document.querySelector("[data-reply-output]");

const readSaved = () => {
  try {
    const value = JSON.parse(localStorage.getItem(storeKey) || "{}");
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
};

const saved = readSaved();

for (const field of fields) {
  const value = saved[field.getAttribute("data-call") || ""];
  if (typeof value !== "string") continue;
  const radio = [...field.querySelectorAll("input[type=radio]")].find(
    (input) => input instanceof HTMLInputElement && input.value === value,
  );
  const text = field.querySelector("textarea");
  if (radio instanceof HTMLInputElement) radio.checked = true;
  else if (text instanceof HTMLTextAreaElement) text.value = value;
}

if (
  replyNotes instanceof HTMLTextAreaElement &&
  typeof saved.notes === "string"
) {
  replyNotes.value = saved.notes;
}

const buildReply = () => {
  const answers = fields.map(readField);
  const notes =
    replyNotes instanceof HTMLTextAreaElement ? replyNotes.value.trim() : "";

  try {
    const state = Object.fromEntries(answers.map((a) => [a.id, a.value]));
    localStorage.setItem(storeKey, JSON.stringify({ ...state, notes }));
  } catch {}

  replyList?.replaceChildren(
    ...answers.map((answer) => {
      const link = make("a", "", answer.id);
      link.href = `#${answer.id}`;
      const item = make("li");
      item.append(
        link,
        make(
          "span",
          answer.differs ? "state changed" : "state",
          stateLabel(answer),
        ),
      );
      return item;
    }),
  );

  const lines = answers
    .filter((a) => a.differs)
    .map((a) => `${a.id}: ${a.value}`);
  if (notes) lines.push(notes);
  const reply = lines.length ? lines.join("\n") : gate;
  replyOutput?.replaceChildren(reply);
  return reply;
};

for (const field of fields) field.addEventListener("input", buildReply);
replyNotes?.addEventListener("input", buildReply);

document
  .querySelector("[data-copy-reply]")
  ?.addEventListener("click", async (event) => {
    const button = event.currentTarget;
    const done = await copyText(buildReply());
    if (button instanceof HTMLElement)
      flash(button, done ? "Copied" : "Copy failed", "Copy reply");
  });

document.querySelector("[data-reset-reply]")?.addEventListener("click", () => {
  for (const field of fields) {
    const rec = field.querySelector("input[data-rec]");
    if (rec instanceof HTMLInputElement) rec.checked = true;
    const text = field.querySelector("textarea");
    if (text instanceof HTMLTextAreaElement) text.value = "";
  }

  if (replyNotes instanceof HTMLTextAreaElement) replyNotes.value = "";
  buildReply();
});

if (replyOutput) buildReply();

for (const block of document.querySelectorAll("pre.cmd")) {
  const button = make("button", "copy", "Copy");
  button.type = "button";
  button.addEventListener("click", async () => {
    const code = block.querySelector("code") || block;
    const done = await copyText((code.textContent || "").trim());
    flash(button, done ? "Copied" : "Copy failed", "Copy");
  });
  block.append(button);
}

const figures = [...document.querySelectorAll("figure.diagram")];

const setExpanded = (open) => {
  for (const { figure, button } of expanders) {
    const isOpen = figure === open;
    figure.classList.toggle("expanded", isOpen);
    button.replaceChildren(isOpen ? "Close" : "Expand");
  }
};

const expanders = figures.map((figure) => {
  const button = make("button", "expand", "Expand");
  button.type = "button";
  button.addEventListener("click", () =>
    setExpanded(figure.classList.contains("expanded") ? null : figure),
  );
  figure.prepend(button);
  return { figure, button };
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setExpanded(null);
});

const diagrams = [...document.querySelectorAll("pre.mermaid")];
for (const diagram of diagrams)
  diagram.setAttribute("data-src", diagram.textContent || "");

const renderDiagrams = async () => {
  if (!diagrams.length) return;

  try {
    const { default: mermaid } =
      await import("https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.esm.min.mjs");
    const css = getComputedStyle(root);
    const themeVariables = Object.fromEntries(
      Object.entries(themeColours).map(([key, name]) => [
        key,
        css.getPropertyValue(name).trim(),
      ]),
    );
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "base",
      fontFamily: css.getPropertyValue("--font-text").trim(),
      themeVariables: {
        ...themeVariables,
        darkMode: isDark(),
        fontSize: "14px",
      },
      themeCSS: nodeCss,
      flowchart: { curve: "basis", padding: 12, htmlLabels: true },
      sequence: { showSequenceNumbers: true, mirrorActors: false },
    });

    for (const diagram of diagrams) {
      diagram.removeAttribute("data-processed");
      diagram.replaceChildren(diagram.getAttribute("data-src") || "");
    }

    await mermaid.run({ nodes: diagrams });
  } catch (error) {
    console.warn(
      "Diagrams need a network connection; showing their source instead.",
      error,
    );
  }
};

const renderState = { running: false, again: false };

const queueRender = async () => {
  if (renderState.running) {
    renderState.again = true;
    return;
  }

  renderState.running = true;

  try {
    do {
      renderState.again = false;
      await renderDiagrams();
    } while (renderState.again);
  } finally {
    renderState.running = false;
  }
};

themeButton?.addEventListener("click", () => {
  const next = isDark() ? "light" : "dark";
  root.setAttribute("data-theme", next);

  try {
    localStorage.setItem(themeKey, next);
  } catch {}

  labelTheme();
  void queueRender();
});

darkQuery.addEventListener("change", () => {
  labelTheme();
  if (!root.hasAttribute("data-theme")) void queueRender();
});

void queueRender();
