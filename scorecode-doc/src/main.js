/* =====================================================================
   Scorecode Documentation - main script
   ---------------------------------------------------------------------
   - Builds a left sidebar of grouped tab buttons (sections -> tabs)
   - On click, fetches the matching .html file from /components and
     injects it into the main section via innerHTML.
   - Performs a lightweight "keyword replacement" pass on the loaded
     HTML so authors can drop in placeholder tokens (e.g.
     [[codebox:some text]]) and have them rendered as proper elements.
   ===================================================================== */

/* ---------------------------------------------------------------------
   Keyword / placeholder replacement
   ---------------------------------------------------------------------
   A "component" is a static .html file. To keep authoring simple, the
   file may contain inline placeholder tokens. Each token is matched
   by a regex and replaced with real DOM.

   Supported tokens:

     [[codebox:some text]]
         Renders a simple box that displays the supplied text/HTML.
         Newlines inside the token are preserved as <br> for readability.

     [[image:filename | styles: css string | caption: text]]
         Renders an <img> sourced from img/<filename>. The leading
         "img/" is added automatically, so the author only specifies
         the filename and optional subpath within the img/ folder.
         Additional pipe-separated options:
           - styles:  inline CSS applied to the <img> element.
           - caption: short text rendered below the image in a small
                      font (rendered as a <figcaption>-style caption).
         The first segment (the filename) is required; the rest are
         optional and can appear in any order. To include a literal
         "|" inside a value, escape it as "\|".

     [[script: relative/path.js]]
         Replaces the placeholder with a real <script src="..."> tag.
         Use this to attach behavior to a tab (event listeners, etc.)
         from a dedicated .js file living next to the .html. The path
         is resolved relative to the page root.

   Adding a new token type is a matter of pushing a new entry to
   KEYWORD_HANDLERS.
   --------------------------------------------------------------------- */

/* Path prefix prepended to any image filename in [[image:...]] tokens.
   Resolved relative to the site root (index.html), so img/foo.png
   loads from scorecode-doc/img/foo.png. */
const IMG_BASE_PATH = "img/";

const KEYWORD_HANDLERS = [
    {
        // Matches [[codebox:anything]] - non-greedy on the body.
        regex: /\[\[codebox:([\s\S]*?)\]\]/g,
        build: (match, body) => {
            const box = document.createElement("div");
            box.className = "codebox";

            const label = document.createElement("span");
            label.className = "codebox-label";
            label.textContent = "code";

            const content = document.createElement("span");
            content.className = "codebox-content";
            // Convert newlines to <br> so multi-line placeholders are readable.
            content.innerHTML = escapeForInnerHTML(body).replace(/\n/g, "<br>");

            box.appendChild(label);
            box.appendChild(content);
            return box;
        },
    },
    {
        // Matches [[image: ... ]]. Body is everything between "image:" and "]]".
        // Non-greedy so a "]]" later in the document does not get pulled in.
        regex: /\[\[image:([\s\S]*?)\]\]/g,
        build: (match, body) => {
            return buildImageElement(body);
        },
    },
    {
        // Matches [[script: <relative path>]] - replaces the placeholder
        // with a real <script src=...> tag, which the browser fetches
        // and executes once it is in the DOM. The path is resolved
        // relative to the page root, so authors can write e.g.
        //     [[script: components/testing-ground/playground.js]]
        // (no leading "../" needed for the scorecode-doc folder).
        // The token is only honoured if it appears inside a tab whose
        // .html file actually lives under the components/ folder, so
        // no component can pull in arbitrary scripts from outside the
        // site root.
        regex: /\[\[script:\s*([\s\S]*?)\]\]/g,
        build: (match, body) => {
            return buildScriptElement(body);
        },
    },
];

/* Parse the body of an [[image: ... ]] token and build the figure.
   The body is pipe-separated segments. The first segment is the
   filename (required). Subsequent segments are key: value options
   (styles, caption) and can appear in any order. */
function buildImageElement(body) {
    const segments = splitUnescaped(body, "|").map((s) => s.trim());

    if (segments.length === 0 || !segments[0]) {
        return makeErrorFigure("[[image:]] is missing a filename");
    }

    const filename = segments[0];
    const options = { styles: "", caption: "" };

    for (let i = 1; i < segments.length; i++) {
        const seg = segments[i];
        const colonIdx = seg.indexOf(":");
        if (colonIdx === -1) continue;
        const key = seg.slice(0, colonIdx).trim().toLowerCase();
        const value = unescapePipes(seg.slice(colonIdx + 1).trim());
        if (key === "styles") options.styles = value;
        else if (key === "caption") options.caption = value;
    }

    const figure = document.createElement("figure");
    figure.className = "doc-image";

    const img = document.createElement("img");
    img.className = "doc-image-img";
    img.src = IMG_BASE_PATH + filename;
    img.alt = options.caption || filename;
    img.loading = "lazy";
    if (options.styles) {
        img.setAttribute("style", options.styles);
    }
    figure.appendChild(img);

    if (options.caption) {
        const cap = document.createElement("figcaption");
        cap.className = "doc-image-caption";
        // Captions may include simple inline HTML written by the author
        // (since they've opted into the body of a component). We still
        // escape angle brackets so the author cannot inject raw HTML
        // by accident, and we render newlines as <br>.
        cap.innerHTML =
            escapeForInnerHTML(options.caption).replace(/\n/g, "<br>");
        figure.appendChild(cap);
    }

    return figure;
}

function makeErrorFigure(msg) {
    const figure = document.createElement("figure");
    figure.className = "doc-image doc-image-error";
    const cap = document.createElement("figcaption");
    cap.className = "doc-image-caption";
    cap.textContent = msg;
    figure.appendChild(cap);
    return figure;
}

/* Replace a [[script: <path>]] token with a real <script> tag. The
   script is appended to the current document; the browser fetches
   and executes it asynchronously, so any DOM the script depends on
   must already be in the page. Authors should reference scripts by
   their public path (relative to index.html), not by a path that
   requires "..". */
function buildScriptElement(body) {
    const src = String(body).trim();
    if (!src) {
        const span = document.createElement("span");
        span.className = "doc-image-error";
        span.textContent = "[[script:]] is missing a path";
        return span;
    }
    const script = document.createElement("script");
    script.src = src;
    script.defer = false; // run as soon as it loads
    script.dataset.docKeyword = "script";
    return script;
}

/* Split a string on a separator, ignoring any separator characters
   that were escaped with a backslash. */
function splitUnescaped(str, sep) {
    const out = [];
    let buf = "";
    for (let i = 0; i < str.length; i++) {
        if (str[i] === "\\" && i + 1 < str.length && str[i + 1] === sep) {
            buf += sep;
            i++;
        } else if (str[i] === sep) {
            out.push(buf);
            buf = "";
        } else {
            buf += str[i];
        }
    }
    out.push(buf);
    return out;
}

function unescapePipes(str) {
    return str.replace(/\\\|/g, "|");
}

/* Escape the minimal set needed to safely inject user-supplied text
   into innerHTML. We only need to neutralise the angle brackets and
   the ampersand - everything else is fine. */
function escapeForInnerHTML(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

/* Apply all keyword handlers to a freshly-loaded root element.
   Returns the same element with placeholder tokens replaced. */
function applyKeywords(rootEl) {
    // We work on a wrapper of innerHTML to make token scanning easier
    // regardless of where the tokens sit in the DOM tree.
    const html = rootEl.innerHTML;

    // Build a temporary container, parse the HTML once, then walk the
    // text nodes and replace tokens with real elements.
    const tmp = document.createElement("div");
    tmp.innerHTML = html;

    // Collect all text nodes first, then mutate (to keep the walker
    // tree valid).
    const textNodes = [];
    const walker = document.createTreeWalker(tmp, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walker.nextNode())) {
        textNodes.push(node);
    }

    for (const textNode of textNodes) {
        const text = textNode.nodeValue;

        // Quick bail-out: if no handler's regex appears anywhere in the
        // text, leave the node alone.
        let anyPossible = false;
        for (const handler of KEYWORD_HANDLERS) {
            handler.regex.lastIndex = 0;
            if (handler.regex.test(text)) { anyPossible = true; break; }
        }
        if (!anyPossible) continue;

        // Collect every match across all handlers into a single
        // (start, end, handler, raw) list, then sort by start so we
        // can walk the text in order.
        const hits = [];
        for (const handler of KEYWORD_HANDLERS) {
            // Each handler's regex may be /g/, so reset before use.
            const re = new RegExp(handler.regex.source, handler.regex.flags);
            let m;
            while ((m = re.exec(text)) !== null) {
                // We only need the raw match for dispatch - each
                // handler re-parses its own body from the raw string.
                hits.push({
                    start: m.index,
                    end: m.index + m[0].length,
                    handler: handler,
                    raw: m[0],
                });
                // Defend against zero-width matches so we never spin.
                if (m.index === re.lastIndex) re.lastIndex++;
            }
        }
        if (hits.length === 0) continue;
        hits.sort((a, b) => a.start - b.start);

        // Walk the text emitting a fragment of plain text + expanded
        // elements. If two handlers ever overlap, the first one wins
        // and the overlapping span is consumed as part of that match.
        const frag = document.createDocumentFragment();
        let lastIndex = 0;
        for (const hit of hits) {
            if (hit.start < lastIndex) continue; // skip overlapping match
            if (hit.start > lastIndex) {
                frag.appendChild(
                    document.createTextNode(text.slice(lastIndex, hit.start))
                );
            }
            // Strip the leading "<keyword>:" and trailing "]]" from
            // the raw match so the handler receives just the body.
            const inner = stripKeywordWrappers(hit.raw, hit.handler);
            const el = hit.handler.build(hit.raw, inner);
            if (el) {
                frag.appendChild(el);
            } else {
                frag.appendChild(document.createTextNode(hit.raw));
            }
            lastIndex = hit.end;
        }
        if (lastIndex < text.length) {
            frag.appendChild(document.createTextNode(text.slice(lastIndex)));
        }

        textNode.parentNode.replaceChild(frag, textNode);
    }

    // Swap the original root's children with the processed tree.
    rootEl.innerHTML = "";
    while (tmp.firstChild) {
        rootEl.appendChild(tmp.firstChild);
    }
    return rootEl;
}

/* Given the raw text of a matched token (e.g. "[[codebox:hello]]"),
   return the body that sits between the keyword prefix and the
   trailing "]]". We drop everything up to and including the first
   ":", and the trailing "]]". This is robust regardless of how
   many capture groups the handler's regex has. */
function stripKeywordWrappers(raw /*, handler */) {
    const colonIdx = raw.indexOf(":");
    if (colonIdx === -1) return raw;
    if (!raw.endsWith("]]")) return raw;
    return raw.slice(colonIdx + 1, raw.length - 2);
}

/* ---------------------------------------------------------------------
   Sidebar construction
   --------------------------------------------------------------------- */
const sidebarEl = document.getElementById("search-results");
const searchInputEl = document.getElementById("sidebar-search");
const mainEl = document.getElementById("main-section");
const loadingEl = document.getElementById("loading-placeholder");

/* Flat list of every tab in the catalog. Each entry corresponds to
   one rendered tab button; we keep references to the DOM nodes so
   the search can show/hide them without re-creating the tree. */
const TAB_ENTRIES = [];

function buildSidebar() {
    for (const section of CATALOG) {
        const group = document.createElement("div");
        group.className = "section-group";
        group.dataset.sectionId = section.id;

        const name = document.createElement("div");
        name.className = "section-name";
        name.textContent = section.name;
        group.appendChild(name);

        for (const tab of section.tabs) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "tab-button";
            btn.textContent = tab.name;
            btn.dataset.sectionId = section.id;
            btn.dataset.tabId = tab.id;
            btn.addEventListener("click", () => {
                loadTab(section.id, tab.id, btn);
            });
            group.appendChild(btn);

            // The search index only needs strings - Fuse walks them
            // for the configured keys.
            const aliases = Array.isArray(tab.aliases) ? tab.aliases : [];
            TAB_ENTRIES.push({
                sectionId: section.id,
                tabId: tab.id,
                name: tab.name,
                aliases: aliases,
                buttonEl: btn,
                groupEl: group,
            });
        }

        sidebarEl.appendChild(group);
    }
}

function setActiveButton(activeBtn) {
    for (const btn of sidebarEl.querySelectorAll(".tab-button")) {
        btn.classList.toggle("active", btn === activeBtn);
    }
}

/* ---------------------------------------------------------------------
   Sidebar search
   ---------------------------------------------------------------------
   Uses Fuse.js (loaded from a CDN in index.html) with the same
   options the mod uses in cccemInterface.js:
     ignoreLocation: true, threshold: 0.4, keys: ['name', 'alias']
   We index against `name` and a flattened `alias` string so authors
   can supply multiple aliases per tab. */
let fuseInstance = null;
let noResultsEl = null;
let currentQuery = "";

function buildSearchIndex() {
    if (typeof Fuse === "undefined") {
        // Fuse failed to load (e.g. offline). Bail out gracefully -
        // every tab stays visible and the search input is a no-op.
        searchInputEl.disabled = true;
        searchInputEl.placeholder = "Search unavailable";
        return;
    }
    const list = TAB_ENTRIES.map((t) => ({
        _entry: t,
        name: t.name,
        // Fuse iterates each string entry of the array as a separate
        // searchable value, so passing the alias array directly is
        // equivalent to keys: ['name', 'alias'].
        alias: t.aliases,
    }));
    fuseInstance = new Fuse(list, {
        ignoreLocation: true,
        threshold: 0.4,
        keys: ["name", "alias"],
    });

    noResultsEl = document.createElement("div");
    noResultsEl.className = "no-results";
    noResultsEl.textContent = "No matching tabs.";
    noResultsEl.style.display = "none";
    sidebarEl.appendChild(noResultsEl);

    searchInputEl.addEventListener("input", () => {
        currentQuery = searchInputEl.value;
        applyFilter();
    });
    // Pressing Escape clears the query.
    searchInputEl.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && searchInputEl.value) {
            searchInputEl.value = "";
            currentQuery = "";
            applyFilter();
        }
    });
}

function applyFilter() {
    if (!fuseInstance) return;
    const q = currentQuery.trim();

    if (!q) {
        // Empty query -> show everything, in catalog order.
        for (const t of TAB_ENTRIES) {
            t.buttonEl.style.display = "";
            t.groupEl.style.display = "";
        }
        noResultsEl.style.display = "none";
        return;
    }

    const hits = fuseInstance.search(q, { limit: TAB_ENTRIES.length });
    const matched = new Set(hits.map((h) => h.item._entry));

    let anyVisible = false;
    for (const t of TAB_ENTRIES) {
        const show = matched.has(t);
        t.buttonEl.style.display = show ? "" : "none";
        anyVisible = anyVisible || show;
    }
    // Hide a section group entirely if none of its tabs matched.
    for (const t of TAB_ENTRIES) {
        const anyTabVisible = t.groupEl.querySelector(
            ".tab-button:not([style*='display: none'])"
        );
        t.groupEl.style.display = anyTabVisible ? "" : "none";
    }
    noResultsEl.style.display = anyVisible ? "none" : "";
}

/* ---------------------------------------------------------------------
   Tab loading
   --------------------------------------------------------------------- */
const loadedCache = new Map(); // key: "section/tab" -> HTML string

async function loadTab(sectionId, tabId, buttonEl) {
    setActiveButton(buttonEl);
    if (loadingEl.parentNode) loadingEl.remove();

    const key = `${sectionId}/${tabId}`;

    // Clear current main content and show a transient placeholder
    // while fetching (only on cache miss, to keep the UI snappy).
    if (!loadedCache.has(key)) {
        mainEl.innerHTML = '<div class="loading-placeholder">Loading...</div>';
    }

    let html;
    if (loadedCache.has(key)) {
        html = loadedCache.get(key);
    } else {
        try {
            const resp = await fetch(`components/${sectionId}/${tabId}.html`);
            if (!resp.ok) {
                throw new Error(`HTTP ${resp.status}`);
            }
            html = await resp.text();
            loadedCache.set(key, html);
        } catch (err) {
            mainEl.innerHTML = `<div class="loading-placeholder">
                Failed to load <code>${sectionId}/${tabId}.html</code>: ${err.message}
            </div>`;
            return;
        }
    }

    // Inject and process keyword tokens.
    const wrapper = document.createElement("div");
    wrapper.className = "tab-content";
    wrapper.innerHTML = html;
    applyKeywords(wrapper);
    mainEl.innerHTML = "";
    mainEl.appendChild(wrapper);
}

/* ---------------------------------------------------------------------
   Boot
   --------------------------------------------------------------------- */
buildSidebar();
buildSearchIndex();

// Auto-load the first tab of the first section so the user sees
// content immediately on page load.
(function autoLoadFirst() {
    if (CATALOG.length === 0 || CATALOG[0].tabs.length === 0) return;
    const firstSection = CATALOG[0];
    const firstTab = firstSection.tabs[0];
    const firstBtn = sidebarEl.querySelector(
        `.tab-button[data-section-id="${firstSection.id}"][data-tab-id="${firstTab.id}"]`
    );
    if (firstBtn) loadTab(firstSection.id, firstTab.id, firstBtn);
})();
