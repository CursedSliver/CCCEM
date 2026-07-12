// cccemStatsPanel.js
// Toggleable overlay panel that displays the live state of every CCCEM tracker.
//
// Layout:
//   - absolutely positioned at the top-right of the screen
//   - monospaced font, partially transparent background
//   - bounded height; the unpinned tracker list scrolls, pinned trackers are
//     kept in a separate non-scrolling section so they stay put while scrolling
//
// Pinning state lives EXCLUSIVELY in this module (pinnedTrackerKeys); it is
// never written onto the tracker objects themselves, so adding / removing /
// editing trackers cannot corrupt or be corrupted by the pin state.
//
// The panel reconciles its rows every frame against the live `trackersById`
// list, so trackers that are added, removed or renamed at runtime are picked
// up automatically without needing to rebuild the panel.

(function () {
  if (window.CCCEMStatsPanelLoaded) { return; }
  window.CCCEMStatsPanelLoaded = true;

  // --- pin state (panel-local only) --------------------------------------
  // Ordered array of tracker keys that are currently pinned to the top.
  var pinnedTrackerKeys = [];

  var panelVisible = true;    // whole panel on/off
  var bodyCollapsed = false;  // header-only collapse

  // key -> { row, valueEl, typeEl, pinBtn }
  var rowByKey = {};
  var lastKeysSignature = null;

  // --- styles ------------------------------------------------------------
  var styleEl = document.createElement('style');
  styleEl.id = 'cccemStatsPanelStyles';
  styleEl.textContent = [
    '#cccemStatsPanel{',
      'position:absolute;top:4px;right:20px;z-index:999999;',
      'width:288px;max-height:min(35vh,250px);display:flex;flex-direction:column;',
      'font-family:monospace;font-size:12px;line-height:1.25;color:#e8e8e8;',
      'background:rgba(18,18,22,0.72);',
      'border:1px solid rgba(255,255,255,0.18);border-radius:5px;',
      'box-shadow:0 2px 10px rgba(0,0,0,0.45);',
      'pointer-events:auto;overflow:hidden;',
    '}',
    '#cccemStatsPanel.ccsp-hidden{display:none;}',
    '#cccemStatsPanel .ccsp-header{',
      'display:flex;align-items:center;gap:6px;',
      'padding:4px 6px;cursor:pointer;user-select:none;',
      'background:rgba(0,0,0,0.42);border-bottom:1px solid rgba(255,255,255,0.12);',
    '}',
    '#cccemStatsPanel .ccsp-title{',
      'flex:1 1 auto;font-weight:bold;color:#ece2b6;',
      'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;',
    '}',
    '#cccemStatsPanel .ccsp-btn{',
      'flex:0 0 auto;cursor:pointer;padding:1px 5px;',
      'border:1px solid rgba(255,255,255,0.28);border-radius:3px;',
      'background:transparent;color:#ddd;font-family:monospace;font-size:12px;',
    '}',
    '#cccemStatsPanel .ccsp-btn:hover{background:rgba(255,255,255,0.14);}',
    '#cccemStatsPanel .ccsp-body{',
      'flex:1 1 auto;display:flex;flex-direction:column;min-height:0;',
    '}',
    '#cccemStatsPanel.ccsp-collapsed .ccsp-list{display:none;}',
    '#cccemStatsPanel.ccsp-collapsed .ccsp-footer{display:none;}',
    '#cccemStatsPanel .ccsp-pinned{',
      'flex:0 0 auto;padding:3px 5px;max-height:40vh;overflow-y:auto;',
      'border-bottom:1px dashed rgba(255,255,255,0.16);',
      'background:rgba(255,255,255,0.03);',
    '}',
    '#cccemStatsPanel.ccsp-collapsed .ccsp-pinned{border-bottom:none;}',
    '#cccemStatsPanel .ccsp-pinned:empty{display:none;}',
    '#cccemStatsPanel .ccsp-list{',
      'flex:1 1 auto;overflow-y:auto;padding:3px 5px;max-height:40vh;',
    '}',
    '#cccemStatsPanel .ccsp-row{',
      'display:flex;align-items:center;gap:5px;padding:1px 2px;',
      'white-space:nowrap;border-radius:3px;',
    '}',
    '#cccemStatsPanel .ccsp-row:hover{background:rgba(255,255,255,0.06);}',
    '#cccemStatsPanel .ccsp-type{',
      'flex:0 0 auto;font-size:10px;opacity:0.55;text-transform:uppercase;',
    '}',
    '#cccemStatsPanel .ccsp-key{',
      'flex:1 1 auto;overflow:hidden;text-overflow:ellipsis;',
      'color:#cfcfcf;',
    '}',
    '#cccemStatsPanel .ccsp-val{',
      'flex:0 0 auto;text-align:right;color:#9fe8a0;min-width:48px;',
    '}',
    '#cccemStatsPanel .ccsp-pin{',
      'flex:0 0 auto;cursor:pointer;padding:0 4px;',
      'border:1px solid rgba(255,255,255,0.25);border-radius:3px;',
      'background:transparent;color:#cfcfcf;font-family:monospace;font-size:11px;',
    '}',
    '#cccemStatsPanel .ccsp-pin:hover{background:rgba(255,255,255,0.14);}',
    '#cccemStatsPanel .ccsp-pin.ccsp-pinned-btn{border-color:#e8c44a;color:#e8c44a;}',
    '#cccemStatsPanel .ccsp-empty{',
      'opacity:0.5;font-style:italic;padding:4px 6px;',
    '}',
    '#cccemStatsPanel .ccsp-footer{',
      'padding:3px 6px;font-size:10px;opacity:0.6;',
      'border-top:1px solid rgba(255,255,255,0.08);',
      'background:rgba(0,0,0,0.3);',
    '}',
    '#cccemStatsShowBtn.hidden{display:none;}',
    '#cccemStatsShowBtn{',
      'position:absolute;top:4px;right:20px;z-index:999999;',
      'padding:3px 8px;cursor:pointer;font-family:monospace;font-size:12px;',
      'color:#ece2b6;background:rgba(18,18,22,0.72);',
      'border:1px solid rgba(255,255,255,0.18);border-radius:5px;',
    '}',
    '#cccemStatsShowBtn:hover{background:rgba(40,40,46,0.85);}',
    '#cccemStatsPanel .ccsp-list::-webkit-scrollbar,#cccemStatsPanel .ccsp-pinned::-webkit-scrollbar{width:6px;}',
    '#cccemStatsPanel .ccsp-list::-webkit-scrollbar-thumb,#cccemStatsPanel .ccsp-pinned::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.25);border-radius:3px;}',
    '#cccemStatsPanel .ccsp-list::-webkit-scrollbar-track,#cccemStatsPanel .ccsp-pinned::-webkit-scrollbar-track{background:transparent;}'
  ].join('\n');
  document.head.appendChild(styleEl);

  // --- build DOM ---------------------------------------------------------
  var panel = document.createElement('div');
  panel.id = 'cccemStatsPanel';

  var header = document.createElement('div');
  header.className = 'ccsp-header';

  var titleEl = document.createElement('span');
  titleEl.className = 'ccsp-title';
  titleEl.textContent = loc('Tracker states');

  var collapseBtn = document.createElement('span');
  collapseBtn.className = 'ccsp-btn ccsp-collapse';
  collapseBtn.textContent = '\u25BE';
  collapseBtn.title = loc('Collapse unpinned trackers');

  var hideBtn = document.createElement('span');
  hideBtn.className = 'ccsp-btn ccsp-hide';
  hideBtn.textContent = '\u00D7';
  hideBtn.title = loc('Hide panel');

  header.appendChild(titleEl);
  header.appendChild(collapseBtn);
  header.appendChild(hideBtn);

  var body = document.createElement('div');
  body.className = 'ccsp-body';

  var pinnedContainer = document.createElement('div');
  pinnedContainer.className = 'ccsp-pinned';

  var listContainer = document.createElement('div');
  listContainer.className = 'ccsp-list';

  var emptyHint = document.createElement('div');
  emptyHint.className = 'ccsp-empty';
  emptyHint.textContent = loc('No trackers');

  var footer = document.createElement('div');
  footer.className = 'ccsp-footer';
  footer.textContent = loc('Click a tracker\'s pin to keep it on top');

  body.appendChild(pinnedContainer);
  body.appendChild(listContainer);
  body.appendChild(footer);

  panel.appendChild(header);
  panel.appendChild(body);
  l('game').appendChild(panel);

  // small reopen button shown only while the panel is hidden
  var showBtn = document.createElement('div');
  showBtn.id = 'cccemStatsShowBtn';
  showBtn.textContent = loc('Trackers') + ' \u25B8';
  showBtn.title = loc('Show tracker panel');
  showBtn.classList.add('hidden');
  l('game').appendChild(showBtn);

  // --- helpers -----------------------------------------------------------
  function getTrackerList() {
    return (typeof trackersById !== 'undefined') ? trackersById : [];
  }

  function isPinned(key) {
    return pinnedTrackerKeys.indexOf(key) !== -1;
  }

  function setPinBtnLabel(btn, key) {
    var pinned = isPinned(key);
    btn.textContent = pinned ? loc('unpin') : loc('pin');
    btn.title = pinned ? loc('Unpin this tracker') : loc('Pin this tracker to the top');
    if (pinned) { btn.classList.add('ccsp-pinned-btn'); }
    else { btn.classList.remove('ccsp-pinned-btn'); }
  }

  function formatVal(v) {
    if (typeof v === 'number') {
      if (!isFinite(v)) { return v > 0 ? '\u221E' : '-\u221E'; }
      if (Math.abs(v) >= 1e15 || (v !== 0 && Math.abs(v) < 0.01)) {
        return v.toExponential(3);
      }
      return Beautify(v, 2);
    }
    if (typeof v === 'boolean') { return v ? 'true' : 'false'; }
    if (v === undefined || v === null) { return '\u2014'; }
    return '\u03BB'; // helper trackers expose a lambda AST, not a number
  }

  function createRow(t) {
    var row = document.createElement('div');
    row.className = 'ccsp-row';

    var typeEl = document.createElement('span');
    typeEl.className = 'ccsp-type';
    typeEl.textContent = '';

    var keyEl = document.createElement('span');
    keyEl.className = 'ccsp-key';
    keyEl.textContent = t.key;
    keyEl.title = t.description || t.key;

    var valEl = document.createElement('span');
    valEl.className = 'ccsp-val';

    var pinBtn = document.createElement('span');
    pinBtn.className = 'ccsp-pin';
    setPinBtnLabel(pinBtn, t.key);

    (function (key) {
      AddEvent(pinBtn, 'click', function (e) {
        if (e) { e.stopPropagation(); }
        togglePin(key);
      });
    })(t.key);

    //row.appendChild(typeEl);
    row.appendChild(keyEl);
    row.appendChild(valEl);
    row.appendChild(pinBtn);

    return { row: row, valueEl: valEl, typeEl: typeEl, pinBtn: pinBtn };
  }

  function togglePin(key) {
    var idx = pinnedTrackerKeys.indexOf(key);
    if (idx === -1) { pinnedTrackerKeys.push(key); }
    else { pinnedTrackerKeys.splice(idx, 1); }
    // refresh every button label (cheap) and re-place rows
    for (var k in rowByKey) { setPinBtnLabel(rowByKey[k].pinBtn, k); }
    placeRows();
  }

  // (Re)attaches existing row elements to the correct container, pinned first.
  function placeRows() {
    pinnedContainer.textContent = '';
    listContainer.textContent = '';

    var placed = {};
    for (var i = 0; i < pinnedTrackerKeys.length; i++) {
      var k = pinnedTrackerKeys[i];
      var entry = rowByKey[k];
      if (!entry) { continue; }
      // skip helpers in the pinned display (they expose a lambda AST, not a value)
      var tracker;
      try { tracker = (typeof trackers !== 'undefined') ? trackers[k] : null; } catch (e) { tracker = null; }
      if (tracker && tracker.constructor && tracker.constructor.type === 'helper') { continue; }
      pinnedContainer.appendChild(entry.row);
      placed[k] = true;
    }

    var list = getTrackerList();
    var anyInList = false;
    for (var i = 0; i < list.length; i++) {
      var k = list[i].key;
      if (list[i].constructor.type === 'helper') { continue; } // skip helpers in the list
      if (placed[k]) { continue; }
      var entry = rowByKey[k];
      if (entry) { listContainer.appendChild(entry.row); anyInList = true; }
    }

    if (!anyInList) { listContainer.appendChild(emptyHint); }
  }

  function reconcileRows() {
    var list = getTrackerList();

    // signature detects add / remove / rename / type-change
    var sig = '';
    for (var i = 0; i < list.length; i++) {
      sig += list[i].key + ':' + ((list[i].constructor && list[i].constructor.type) || '') + '|';
    }

    if (sig === lastKeysSignature) { return; }
    lastKeysSignature = sig;

    var present = {};
    for (var i = 0; i < list.length; i++) { present[list[i].key] = true; }

    // drop rows for trackers that no longer exist; clean stale pin entries
    for (var k in rowByKey) {
      if (!present[k]) {
        if (rowByKey[k].row.parentNode) { rowByKey[k].row.parentNode.removeChild(rowByKey[k].row); }
        delete rowByKey[k];
        var pi = pinnedTrackerKeys.indexOf(k);
        if (pi !== -1) { pinnedTrackerKeys.splice(pi, 1); }
      }
    }

    // create rows for new trackers
    for (var i = 0; i < list.length; i++) {
      var t = list[i];
      if (!rowByKey[t.key]) { rowByKey[t.key] = createRow(t); }
      else {
        // key may have been reused on a different tracker object; refresh label
        rowByKey[t.key].row.querySelector('.ccsp-key').textContent = t.key;
        rowByKey[t.key].row.querySelector('.ccsp-key').title = t.description || t.key;
        rowByKey[t.key].typeEl.textContent = (t.constructor && t.constructor.type) || '';
      }
    }

    placeRows();
    titleEl.textContent = loc('Tracker states') + ' (' + list.length + ')';
  }

  function updateValues() {
    var list = getTrackerList();
    for (var i = 0; i < list.length; i++) {
      var key = list[i].key;
      var entry = rowByKey[key];
      if (!entry) { continue; }
      var val;
      try {
        val = (typeof trackGet === 'function') ? trackGet(key) : list[i].getVal();
      } catch (e) {
        val = 'err';
      }
      entry.valueEl.textContent = (val === 'err') ? 'err' : formatVal(val);
    }
  }

  function updatePinnedValues() {
    // Pinned rows must keep refreshing even when the unpinned list is collapsed.
    // The pinned container already hides itself when empty (see CSS).
    for (var i = 0; i < pinnedTrackerKeys.length; i++) {
      var key = pinnedTrackerKeys[i];
      var entry = rowByKey[key];
      if (!entry) { continue; }
      var tracker;
      try { tracker = (typeof trackers !== 'undefined') ? trackers[key] : null; } catch (e) { tracker = null; }
      if (!tracker) { continue; }
      var val;
      try {
        val = (typeof trackGet === 'function') ? trackGet(key) : tracker.getVal();
      } catch (e) {
        val = 'err';
      }
      entry.valueEl.textContent = (val === 'err') ? 'err' : formatVal(val);
    }
  }

  // --- visibility / toggle ----------------------------------------------
  function applyVisibility() {
    if (panelVisible) {
      panel.classList.remove('ccsp-hidden');
      showBtn.classList.add('hidden');
    } else {
      panel.classList.add('ccsp-hidden');
      showBtn.classList.remove('hidden');
    }
  }

  function applyCollapse() {
    if (bodyCollapsed) {
      panel.classList.add('ccsp-collapsed');
      collapseBtn.textContent = '\u25B8';
      collapseBtn.title = loc('Show unpinned trackers');
    } else {
      panel.classList.remove('ccsp-collapsed');
      collapseBtn.textContent = '\u25BE';
      collapseBtn.title = loc('Collapse unpinned trackers');
    }
  }

  function setPanelVisible(v) {
    panelVisible = !!v;
    applyVisibility();
    if (panelVisible && !bodyCollapsed) { updateValues(); }
  }

  function togglePanel() { setPanelVisible(!panelVisible); }

  // expose programmatic toggle
  window.toggleCccemStatsPanel = togglePanel;
  window.setCccemStatsPanelVisible = setPanelVisible;

  // --- events ------------------------------------------------------------
  AddEvent(header, 'click', function (e) {
    // ignore clicks that originate on the header buttons (they have their own handlers)
    if (e && e.target && (e.target === collapseBtn || e.target === hideBtn)) { return; }
    bodyCollapsed = !bodyCollapsed;
    applyCollapse();
    if (!bodyCollapsed) { updateValues(); }
  });
  AddEvent(collapseBtn, 'click', function (e) {
    if (e) { e.stopPropagation(); }
    bodyCollapsed = !bodyCollapsed;
    applyCollapse();
    if (!bodyCollapsed) { updateValues(); }
  });
  AddEvent(hideBtn, 'click', function (e) {
    if (e) { e.stopPropagation(); }
    setPanelVisible(false);
  });
  AddEvent(showBtn, 'click', function () { setPanelVisible(true); });

  // --- per-frame update (registered once) -------------------------------
  function onLogic() {
    if (!panelVisible) { return; }
    if (typeof trackersById === 'undefined') { return; }
    reconcileRows();
    if (bodyCollapsed) {
      // even when unpinned trackers are hidden, pinned ones must keep updating
      updatePinnedValues();
      return;
    }
    updateValues();
  }

  // Game.registerHook is available by the time prerequisites run.
  try { Game.registerHook('logic', onLogic); } catch (e) { console.error('cccemStatsPanel hook failed', e); }

  // initial paint
  applyVisibility();
  applyCollapse();
  reconcileRows();
  updateValues();
  if (!get('visualizeTrackers')) { 
    l('cccemStatsPanel').style.display = 'none';
    l('cccemStatsShowBtn').style.display = 'none';
  }
})();
