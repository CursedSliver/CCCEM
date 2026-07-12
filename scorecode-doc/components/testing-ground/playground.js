/* =====================================================================
   Playground tab - behavior script.
   - Mocks the bits of the CCCEM runtime that Scorecode consults at
     evaluation time (window.watchKey, window.trackGet) so the
     standalone Scorecode interpreter loaded by the page can resolve
     Watchers and Trackers without a live game.
   - Renders a list of mock Watchers with varying arities and wires
     up "Insert" buttons to paste a call into the formula box.
   - Wires up the Evaluate / Clear buttons and Ctrl+Enter shortcut.
   ===================================================================== */

(function () {
    "use strict";

    /* ---- Mock runtime -------------------------------------------- */

    // Each entry: { key, arity, description, impl }.
    // impl(args) is the function that returns the watcher's value.
    // Scorecode parses dynamic variable calls as `key(arg1, arg2, ...)`
    // and dispatches them through window.watchKey(key, ...args).
    const MOCK_WATCHERS = [
        {
            key: "simple",
            arity: 0,
            description: "A constant 42 - no arguments.",
            impl: () => 42,
        },
        {
            key: "doubled",
            arity: 1,
            description: "Returns its argument times two.",
            impl: (a) => (a == null ? 0 : Number(a) * 2),
        },
        {
            key: "str",
            arity: 1,
            description: "Returns the argument in string.",
            impl: (a) =>
                a.toString(),
        },
        {
            key: "clamped",
            arity: 3,
            description:
                "Returns `value` clamped to [lo, hi] (value, lo, hi).",
            impl: (value, lo, hi) => {
                const v = Number(value);
                const l = Number(lo);
                const h = Number(hi);
                if (Number.isNaN(v) || Number.isNaN(l) || Number.isNaN(h)) {
                    return 0;
                }
                return Math.min(Math.max(v, l), h);
            },
        }
    ];

    // Tracker values keyed by tracker name. The test playground only
    // needs a couple of them - the real mod has hundreds.
    const MOCK_TRACKERS = {
        score: 0,
        bonus: 10,
    };

    // Install the mock runtime only if it isn't already provided.
    // (Loading the playground tab a second time would otherwise
    // overwrite a real implementation; we want to be additive.)
    if (typeof window.watchKey !== "function") {
        window.watchKey = function mockWatchKey(key /*, ...args */) {
            const w = MOCK_WATCHERS.find((x) => x.key === key);
            if (!w) return 0;
            const args = Array.prototype.slice.call(arguments, 1);
            // Scorecode may pass fewer args than arity if the user
            // wrote a call site without all of them. Pad with null
            // so the impl can decide what to do.
            while (args.length < w.arity) args.push(null);
            try {
                return w.impl(...args);
            } catch (_err) {
                return 0;
            }
        };
    }
    if (typeof window.trackGet !== "function") {
        window.trackGet = function mockTrackGet(name) {
            return Object.prototype.hasOwnProperty.call(MOCK_TRACKERS, name)
                ? MOCK_TRACKERS[name]
                : 0;
        };
    }

    /* ---- DOM wiring ---------------------------------------------- */

    const formulaEl = document.getElementById("pg-formula");
    const resultEl = document.getElementById("pg-result");
    const evalBtn = document.getElementById("pg-evaluate");
    const clearBtn = document.getElementById("pg-clear");
    const listEl = document.getElementById("pg-watcher-list");

    if (!formulaEl || !resultEl || !evalBtn || !listEl) {
        // The HTML is in an unexpected shape; bail out rather than
        // throwing on a null deref.
        return;
    }

    // Build the watcher list.
    function renderWatcherList() {
        listEl.innerHTML = "";
        for (const w of MOCK_WATCHERS) {
            const li = document.createElement("li");
            li.className = "watcher-item";

            const head = document.createElement("div");
            head.className = "watcher-item-head";

            const name = document.createElement("code");
            name.className = "watcher-item-name";
            // In Scorecode, dynamic variables (watchers) are invoked
            // with `[key;arg1;arg2;...]`. Show the canonical form in
            // the heading so users immediately know how to type one.
            name.textContent = scorecodeCall(w.key, w.arity, false);

            const arity = document.createElement("span");
            arity.className = "watcher-item-arity";
            arity.textContent =
                w.arity === 0 ? "0 args" : w.arity + " args";

            head.appendChild(name);
            head.appendChild(arity);

            const desc = document.createElement("div");
            desc.className = "watcher-item-desc";
            desc.textContent = w.description;

            const insertBtn = document.createElement("button");
            insertBtn.type = "button";
            insertBtn.className = "playground-button small";
            insertBtn.textContent = "Insert";
            insertBtn.addEventListener("click", () => {
                // Paste the canonical Scorecode call so the formula
                // is immediately evaluatable. Use the same arity but
                // numeric placeholder args (0) - the user can edit.
                insertAtCursor(scorecodeCall(w.key, w.arity, true));
            });

            li.appendChild(head);
            li.appendChild(desc);
            li.appendChild(insertBtn);
            listEl.appendChild(li);
        }
    }

    // Build a Scorecode watcher-call string. Scorecode uses the
    // `[key;arg1;arg2;...]` syntax for dynamic variables.
    // - If `useNumeric` is false the args are placeholder arg names.
    // - If `useNumeric` is true the args are 0 (so the call is
    //   evaluatable immediately - the user can swap them for real
    //   expressions).
    function scorecodeCall(key, arity, useNumeric) {
        const parts = [key];
        for (let i = 0; i < arity; i++) {
            parts.push(useNumeric ? "0" : "arg" + (i + 1));
        }
        return "[" + parts.join(";") + "]";
    }

    // Insert text at the user's current caret position in the formula
    // textarea; fall back to appending if there's no selection info.
    function insertAtCursor(text) {
        const start = formulaEl.selectionStart;
        const end = formulaEl.selectionEnd;
        const before = formulaEl.value.slice(0, start);
        const after = formulaEl.value.slice(end);
        formulaEl.value = before + text + after;
        const caret = start + text.length;
        formulaEl.focus();
        formulaEl.setSelectionRange(caret, caret);
    }

    // Render a result row: a plain value or a tagged error.
    function showResult(outcome) {
        resultEl.classList.remove("error");
        if (outcome === undefined) {
            resultEl.textContent = "—";
            return;
        }
        if (outcome && outcome.kind === "error") {
            resultEl.classList.add("error");
            resultEl.textContent = outcome.message;
        } else {
            resultEl.textContent = String(outcome);
        }
    }

    // Run Scorecode on the current formula text. Catch and display
    // any error raised by the interpreter.
    function evaluate() {
        const src = formulaEl.value;
        if (!src.trim()) {
            showResult("—");
            return;
        }
        if (typeof Scorecode !== "function") {
            showResult({
                kind: "error",
                message:
                    "Scorecode interpreter not loaded. Check that ../Scorecode.js is reachable.",
            });
            return;
        }
        try {
            const value = Scorecode(src, {});
            showResult(value);
        } catch (err) {
            showResult({
                kind: "error",
                message: (err && err.message) ? err.message : String(err),
            });
        }
    }

    evalBtn.addEventListener("click", evaluate);
    clearBtn.addEventListener("click", () => {
        formulaEl.value = "";
        showResult(undefined);
        formulaEl.focus();
    });
    formulaEl.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault();
            evaluate();
        }
    });

    renderWatcherList();
})();
