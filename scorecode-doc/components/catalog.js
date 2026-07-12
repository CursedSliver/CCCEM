/**
 * Catalog of sections and tabs.
 * Each section becomes a sidebar group, each tab fetches a .html file
 * from components/<section>/<tab>.html.
 *
 * Each tab entry may include an optional `aliases` array. Aliases are
 * alternate strings (synonyms, abbreviations, related keywords) that
 * the sidebar's fuzzy search will also match against, in addition to
 * the tab's `name`. The search bar uses Fuse.js with the same
 * configuration the mod uses in `cccemInterface.js`.
 */
const CATALOG = [
    {
        id: "testing-ground",
        name: "Testing ground",
        tabs: [
            { id: "playground",   name: "Playground",
              aliases: ["playground", "test", "sandbox", "try", "evaluate", "run", "repl", "mock", "watcher test"] },
        ],
    },
    {
        id: "conceptual-overview",
        name: "Conceptual overview",
        tabs: [
            { id: "high-level-overview",   name: "High-level overview",
              aliases: ["overview", "intro", "introduction", "summary"] },
            { id: "scorecode-overview",   name: "Scorecode overview",
              aliases: ["scorecode", "language", "syntax intro"] },
            { id: "trigger-methods-overview",   name: "Trigger methods",
              aliases: ["triggers", "firing", "activation"] },
        ],
    },
    {
        id: "scorecode",
        name: "Scorecode",
        tabs: [
            { id: "data-types",             name: "Data types",
              aliases: ["types", "numbers", "strings", "booleans"] },
            { id: "math-operators",         name: "Math operators",
              aliases: ["math", "arithmetic", "add", "subtract", "multiply", "divide", "+", "-", "*", "/", "%", "^"] },
            { id: "boolean-operators",      name: "Boolean operators",
              aliases: ["boolean", "logic", "and", "or", "not", "&&", "||", "!"] },
            { id: "parentheses-scoping",    name: "Parentheses/scoping",
              aliases: ["parentheses", "scoping", "brackets", "()", "grouping", "order of operations"] },
            { id: "comparison-operators",   name: "Comparison operators",
              aliases: ["comparison", "equals", "less than", "greater than", "=", "<", ">", "compare"] },
            { id: "branching",              name: "Branching",
              aliases: ["if", "else", "ternary", "conditional", "branch"] },
            { id: "constants",              name: "Constants",
              aliases: ["const", "literal", "true", "false"] },
            { id: "math-utilities",         name: "Math utilities",
              aliases: ["math", "sqrt", "sin", "cos", "tan", "log", "abs", "min", "max", "floor", "ceil", "round"] },
            { id: "functions",              name: "Functions",
              aliases: ["function", "fn", "lambda", "call", "definition", "def", "...", "recursion"] },
            { id: "iterations",             name: "Iterations",
              aliases: ["loop", "for", "while", "repeat", "iterate", "iteration"] },
            { id: "watchers",               name: "Watchers",
              aliases: ["watcher", "observe", "event", "hook"] },
            { id: "trackers",               name: "Referencing trackers",
              aliases: ["tracker", "reference", "store", "variable", "state"] },
            { id: "cccem-settings",         name: "CCCEM settings",
              aliases: ["settings", "config", "options", "cccem", "preferences"] },
        ],
    },
    {
        id: "trigger-methods",
        name: "Trigger methods",
        tabs: [
            { id: "manual",                name: "Manual triggers",
              aliases: ["manual", "user", "click", "button", "fire"] },
            { id: "automatic",             name: "Automatic triggers",
              aliases: ["automatic", "auto", "polling", "conditional", "expression"] },
            { id: "composite",             name: "Composite triggers",
              aliases: ["composite", "combined", "sequence", "chain", "combo"] },
        ],
    },
];