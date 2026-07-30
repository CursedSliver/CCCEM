//author: @xxfillex and @cursedsliver over discord (fillex comes first)
//version 1.0: User Interface created, I'm sure it has no issues whatsoever and works perfectly fine. This is meant to be run by the Cookie Clicker Combo Execution Mod, if run otherwise it will not work.
//version 1.1: Changed the score system slightly, added more injections for seeding
//version 1.11: hotfix: accidentally broke the prompt system lol
//version 2.0: fixed scoring (hopefully), made the UI a bit more versatile, allowing others to create buttons using the lists, and made an example function (MoreTestButtons();) of how this can be done. Hopefully seeding is also fixed at this point
//version 2.01: adjusted score to make all settings give more or less the same score (hopefully)
//version 2.02: added the rebuy and time until next tick buttons
//version 2.03: added time until next golden cookie if you have nat off
//version 2.10: added p for pause, a mod for pausing the game using the P button as well as doing quick resets on R, as well as fixing sleep mode timeout saving the game
//below are the works of @cursedsliver, also over discord
//version 2.3: colored buttons, can adjust all building count, as well as the other stuff mentioned on the real doc
//version 2.31: more info on ctrl click!
//version 2.33: minor fixes, and lime colored buttons added
//version 2.4: implemented integration for the Cast Finder mod
//version 2.42: adjusted score icons to feel more rewarding
//version 2.43: added the ability to hide sections of the interface; interface is now divided into 4 sections with two additional sections for when P for Pause and Cast Finder is loaded
//version 2.44: added orange and blue colored buttons; orange for the alternate state for on/off toggles, while blues for cycling toggles; added auto saving, which is just vanilla's auto saving, but for CCCEM settings only
//version 2.45: added integration for the new Cast Finder buttons (pre-loading related)
//version 2.46: Added devastatedness and fixed issue with turning on and off natural golden cookies removing p for pause UI elements
//version 2.47: Fixed an issue where code will try to splice things with an index of -1, where it's not supposed to splice anything
//version 2.48: added rebuyedness
//version 2.481: hotfix to make clicks give the correct amount
//version 2.482: hotfix number two to make rebuy calculation not explode on dragon's fortune
//version 2.49: adds ability to tinker with score, as well as mute buildings
//version 2.491: bugfix for rebuy calculation when a buff dies, improved score display again
//version 2.5: tidied up the printscore function and tried fixing more score mult calculation issues
//version 2.51: added check for incorrect EB usage and automatic score correction
//version 2.511: minor bugfix for krumblor aura cycling
//version 2.6: refactor or some shit idk we love writing changelogs
//version 2.61: restructuring the onclick function
//version 2.7: added new starting buff handling logic
//version 2.71: RIP dot
//version 2.72: Made the triggerSetVar tied to button type
//version 2.721: Removed a wee info function
//version 2.8: Made it possible to change contents of inputButtons on click for stability
//version 2.9: improved logic for save handling
//version 2.91: incorporated stripping CCCEM data from imported saves to save space and increase stability
//version 2.92: spooky tulips
//version 2.93: BS score hotfix
//version 2.94: made iniGC true value fully numeric
//version 2.95: iniGC bugfix
//version 3.0: updated info display for buttons, are now proper tooltips
//version 3.01: fixing a couple of tooltips (featuring lie)
//version 3.02: fixing muteBuildings
//version 3.03: Made building muting and overriding selectors not save

Game.sesame=0 
if (l('fpsGraph')) { l('fpsGraph').style.display = 'none'; }
var promptN=0
var maxComboPow=1
var relComboPow=1
var maxBSCount=0
var maxGodz=1
var devastatedness=0
var rebuyedness=0
var maxUndevastated=0
var incorrectEBwarn=0
var iniRaw=1
var tickerCount=0
var isClickedGC=false;
var autoSaveCCCEM=false;
var pForPausePath = cccemDir+'PForPause.js';
var castFinderPath = cccemDir+'castFinder.js';
var invalidateScore=0

let cccemShiftDetect = false;
let cccemCtrlDetect = false;
document.addEventListener('keydown', function(e) { 
	cccemShiftDetect = e.shiftKey;
    cccemCtrlDetect = e.ctrlKey || e.metaKey;
});

document.addEventListener('keyup', function(e) { 
	cccemShiftDetect = e.shiftKey;
    cccemCtrlDetect = e.ctrlKey || e.metaKey;
});

function isShifting() {
  return cccemShiftDetect;
}

function isCtrl() { 
	return cccemCtrlDetect;
}

var CCCEMButtonsList = [];
var CCCEMButtons = {};
var CCCEMCategories = {};
var uncategorizedButtons = [];

class CCCEMButton {
  //options: newLine, preNewLine, watch, advanced, ignorePreset, nonInteractive
  constructor(key, name, type, info, updateVarFunc, options) {
    this.key = key;
    this.namesList = [].concat(name);
    this.type = type; //class type
    this.type.parent = this;
    this.state = this.type.default.call(this.type); //can be anything really, is the actual variable in a way
    this.updateVarFunc = updateVarFunc; //sets the variable so no need to rewrite everything, but can also do anything else really
    this.info = info; //class info
    if (options === true) { options = { newLine: true }; }
    options = options ?? {};
    if (options.newLine === true) { 
      options.newLine = '<div class="flexbreak"></div>';
    }
    if (options.preNewLine === true) { 
      options.preNewLine = '<div class="flexbreak"></div>';
    }
    this.parent = null;
    this.newLine = options.newLine ?? '';
    this.preNewLine = options.preNewLine ?? '';
    this.advanced = options.advanced ?? true;
    this.ignorePreset = options.ignorePreset ?? false;
    this.nonInteractive = options.nonInteractive ?? false;
    this.hidden = options.hidden ?? false;
    this.watch = options.watch ?? null; 
    //called every 5 frames with this keyword set to the button 
    // so state can be adjusted, mainly used in external categories, 
    // developing cccem itself shouldnt use it and it isnt functional 
    // in that context anyways

    this.id = CCCEMButtonsList.length;
    CCCEMButtonsList.push(this);
    CCCEMButtons[this.key] = this;
  }
  updateVarFunc = () => {}

  getLStr() {
    if (this.isHidden()) { return ''; }
    return this.preNewLine+'<a class="option '+this.type.getColorStr()+'" '+this.info.getTooltip(this)+' '+Game.clickStr+'="(CCCEMButtonsList['+this.id+'].triggerSetVar());">'+this.type.parse(this.namesList, this.state)+'</a>'+this.newLine;
  }
  getLStrPure(onclick) {
    return '<a data-buttonKey="'+this.key+'" class="option '+this.type.getColorStr()+'" '+this.info.getTooltip(this)+' '+Game.clickStr+'="'+onclick+'">'+this.type.parse(this.namesList, this.state)+'</a>'
  }

  isHidden() {
    const presetLimit = activePreset && !activePreset.visibleButtons.has(this.key);
    return this.hidden || this.nonInteractive || 
    ((!this.category.complexityHideImmune && !this.category.presetBypass) && presetLimit) || 
    (!this.category.complexityHideImmune && this.advanced && !advancedMode && !(activePreset && !presetLimit));
  }

  changeState(value, update) {
    this.state = value;
    if (this.updateVarFunc) { this.updateVarFunc.call(this, this.state); }
    if (update) { RedrawCCCEM(); }
  }
  
  save() {
    return this.type.save();
  }

  load(str) {
    return this.type.load(str);
  }
  triggerSetVar() {
    this.type.triggerSetVar();
    PlaySound('snd/tick.mp3');
  }
  updateStateFromWatch() {
    if (!this.watch) { return; }

    this.watch.call(this);
  }
}
function get(str) {
  return CCCEMButtons[str].state;
}
class buttonCategory {
  constructor(key, order, buttonsList, associatedToggleButton) {
    this.key = key;
    this.order = order ?? Object.keys(CCCEMCategories).length;
    this.hidden = false;
    this.buttons = buttonsList;
    if (typeof associatedToggleButton == 'string') {
      this.associatedToggleButton = CCCEMButtons[associatedToggleButton];
    } else {
      this.associatedToggleButton = associatedToggleButton ?? null;
    }
    this.complexityHideImmune = true;
    this.presetBypass = false;
    CCCEMCategories[key] = this;
    for (let i in this.buttons) {
      this.buttons[i].category = this;
    }
  }
  buttons = []
  external = false
  register(...buttons) {
    for (let i in arguments) {
      arguments[i].category = this;
      this.buttons.push(arguments[i]);
    }
  }
  insert(button, location) {
    button.category = this;
    this.buttons.splice(location, 0, button);
  }
  has(key) {
    for (let i in this.buttons) {
      if (this.buttons[i].key == key) { return this.buttons[i]; }
    }
    return null;
  }
  compileButtons() {
    if (this.hidden) {
      return '';
    }
    let str = '';
    for (let i in this.buttons) {
      str += this.buttons[i].getLStr();
    }
    return str;
  }
  addSaveData(obj) {
    for (let i in this.buttons) {
      if (!this.buttons[i].type.willSave) { continue; }
      obj[this.buttons[i].key] = this.buttons[i].save();
    }
  }
  setAssociatedButtonRedundantHideState() {
    if (!this.associatedToggleButton) { return null; }
    for (let i in this.buttons) { 
      if (this.buttons[i] && !this.buttons[i].isHidden()) { this.associatedToggleButton.hidden = false; return false; }
    }
    this.associatedToggleButton.hidden = true;
    return true;
  }
  dataSlot() {
    //externals only
    return null;
  }
  loadDataSlot() {
    //externals only
  }
  updateWatches() {
    //externals only
  }
}

function invalidateScoreS() {
  if (!invalidateScore) { Game.Notify('Score invalidated', 'Settings changed, start another attempt to reenable scoring.', [15, 5]); }
  invalidateScore = 1;
}
class buttonType {
  constructor() {
    //this.parent = button owning this type
  }
  triggerSetVar() {
    this.onClick();
    this.triggerVarFunc();
    RedrawCCCEM();
  }
  getColorStr() {
    return 'neato';
  }
  parse(names, state) {
    //returns name of button based on namesList and whatever
    return loc(names[0]);
  }
  onClick() {
    invalidateScoreS();
    //does things to change the variable idk
  }
  triggerVarFunc() {
    if (this.parent.updateVarFunc) {
      this.parent.updateVarFunc.call(this.parent, this.parent.state);
    }
    //makes it overridable
  }
  getTip() {
    return '';
  }
  attachment = null; //for external use, can be used to attach a callback function that runs when this button is attached to a category, with this keyword set to the button and the category passed as an argument
  attach(configs) {
    this.willSave = false;
    this.parent = { state: null };
    if (!configs) { return this; }
    this.attachment = configs;
    this.parent.state = configs.state; //mainly make sure to have a key that matches
    return this;
  }
  assignState(value) {
    if (this.attachment && this.attachment.callback) {
      this.attachment.callback(value);
    } else { 
      this.parent.state = value;
      this.triggerVarFunc();
    }
  }
  willSave = true
  save() {
    return this.parent.state;
  }
  load(str) {
    //fallback
    if (!str) { return; }
    if (!isNaN(parseFloat(str))) { str = parseFloat(str); }
    this.assignState(str);
  }
  default() {
    return null; 
    //returns default value for the button/variable, but is actually changed later on by presets so it just prevents crashing and funny stuff
  }
  resetDefault() {
    //pretty much only used for attachments
    if (this.attachment && this.attachment.value) {
      this.state = this.attachment.value;
      return this;
    }
    this.state = this.default();
    return this;
  }
}
class triggerButton extends buttonType {
  //default green buttons that does something on click
  willSave = false
  getTip() {
    return loc('Click to activate.');
  }
}
class pesudoInputButton extends triggerButton {
  getColorStr() {
    return 'neatocyan';
  }
  getTip() {
    return loc('Click to view.');
  }
  onClick() {

  }
}
class presetButton extends buttonType {
  willSave = false
  constructor(preset) {
    super();
    if (typeof preset == 'string') { this.preset = CCCEMPresets[preset]; } 
    else { this.preset = preset ?? null; }
  }
  getColorStr() { 
    return 'neatofire';
  }
  getTip() {
    return loc('Click to apply this preset.');
  }
  onClick() {
    this.preset.openConfirmationMenu();
  }
}
class limeButton extends buttonType {
  //alternate color signifying something important
  //will not invalidate score
  constructor() { super(); }
  getColorStr() {
    return 'neatolime';
  }
  getTip() {
    return loc('Click to activate. Will not invalidate score.');
  }
  onClick() {

  }
  willSave = false
}
class resetButton extends limeButton {
  getColorStr() {
    return 'neatolime massive';
  }
}
class inputButton extends buttonType {
  //base class, should never be used in practice
  constructor(autoSet) {
    super();
    if (autoSet) { this.autoSet = autoSet; }
  }
  static heading = loc('Input variable')
  static subHeading = loc('Please input what you want the variable to be set to.')
  static readonly = false
  onClick() {
    invalidateScoreS();
    dynamicPrompt(this.getPromptStr(), this.getOptions());
    this.addEvents(getLatestPrompt());
  }
  getPromptStr() {
    let str = '<id NumImport><h3>'
      + this.constructor.heading
      + '</h3><div class="block">'
      + this.constructor.subHeading
      + '<div id="importError" class="warning" style="font-weight:bold;font-size:11px;"></div></div><div class="block"><textarea id="textareaPrompt" style="'+this.getStyles()+'"'
      + (this.constructor.readonly?'readonly':'')
      + '>'
      + this.parent.state
      + '</textarea></div>'
    return str;
  }
  getOptions() {
    return [
      [loc("Load"),
        `PlaySound(\'snd/tickOff.mp3\');`],
      [loc("Nevermind"), `PlaySound(\'snd/tickOff.mp3\');restorePromptLayer();`]
  ]}
  addEvents(baseNode) {
    const textareaPrompt = baseNode.querySelector('#textareaPrompt');
    if (this.autoSet) { textareaPrompt.value = this.autoSet.call(this) }
    textareaPrompt.focus();
    textareaPrompt.select();
    AddEvent(baseNode.querySelector('#promptOption0'), 'click', e => {
      const content = textareaPrompt.value.trim();
      restorePromptLayer();
      this.onInputConfirmation(content);
      RedrawCCCEM();
    })
  }
  getStyles() {
    return 'width:100%;height:128px;';
  }
  getTip() {
    return loc('Click to input value.');
  }
  onInputConfirmation(content) {
    this.assignState(content);
  }
  getColorStr() {
    return 'neatocyan';
  }
  parse(names, state) {
    return loc(names[0], state);
  }
  triggerSetVar() {
    this.onClick();
    RedrawCCCEM();
  }
  load(str) {
    this.parent.state = str;
    if (this.parent.updateVarFunc) { this.parent.updateVarFunc.call(this.parent, this.parent.state); }
  }
  default() {
    return '';
  }
}
class numberInputButton extends inputButton {
  //cyan button (number input)
  constructor(precision, autoSet) {
    super();
    if (precision) { this.precision = precision; }
    if (autoSet) { this.autoSet = autoSet; }
  }
  static precision = 3
  static heading = loc('Input number')
  static subHeading = loc('Please input a number the variable should be equal to.')
  parse(names, state) {
    const beautified = Beautify(state, this.constructor.precision);
    const prefix = (beautified !== Beautify(state, this.constructor.precision + 1)) ? '~' : '';
    return loc(names[0], prefix + beautified);
  }
  getStyles() {
    return 'width:100%;height:32px;font-size:24px;text-align:center;';
  }
  onInputConfirmation(content) {
    if (isNaN(Number(content))) { 
      Game.Notify(loc('Setting value failed!'), loc('The value set was not a number!'), [7, 7]);
      return; 
    }
    this.assignState(Number(content));
  }
  getTip() {
    return loc('Click to input number.');
  }
  load(str) {
    this.parent.state = Number(str);
    if (this.parent.updateVarFunc) { this.parent.updateVarFunc.call(this.parent, this.parent.state); }
  }
  default() {
    return 0;
  }
}
class stringInputButton extends inputButton {
  //cyan button (string input)
  constructor(parseConvert, autoSet) {
    super();
    if (parseConvert) { this.parseConvert = parseConvert; }
    if (autoSet) { this.autoSet = autoSet; }
  }
  parseConvert = e => e;
  parse(names, state) {
    return loc(names[0], this.parseConvert(state));
  }
}
class readonlyDisplayButton extends inputButton {
  //cyan button (no input)
  getOptions() {
    return [loc("All done!")]
  }
  getTip() {
    return loc('Click to export value.');
  }
  static heading = loc('Export variable')
  static subHeading = loc('Copy the contents of the box below to export it.')
  static readonly = true
}
class gardenPlantAgeSetButton extends inputButton {
  static header = loc('Input plant ages')
  static subHeading = loc('Input percentage, decimal, or words for plant stages (e.g. "mature" or "budding")')
  getTip() {
    return loc('Click to input plant age.');
  }
  getStyles() {
    return 'width:100%;height:32px;font-size:24px;text-align:center;';
  }
  onInputConfirmation(content) {
    content = content.toLowerCase();
    const map = {
      'bud': 'budding',
      'budding': 'budding',
      'sprout': 'sprouting',
      'sprouting': 'sprouting',
      'bloom': 'bloom',
      'blooming': 'bloom',
      'mature': 'mature',
      'maturity': 'mature',
      'maturing': 'mature',
      'decay': 'decaying',
      'decaying': 'decaying',
      'dying': 'decaying',
      'fading': 'decaying'
    }
    if (map[content]) { content = map[content]; }
    if (content.endsWith('%')) { content = content.slice(0, content.length - 1); }
    if (!isNaN(parseFloat(content))) { content = parseFloat(content); if (content < 1 && content >= 0) { content = content * 100; } }
    this.assignState(content);
  }
}
class cycleButton extends buttonType {
  //blue button
  constructor(min, max, parseConvert, aliases) {
    super();
    this.min = min;
    this.max = max;
    if (parseConvert) { this.parseConvert = parseConvert; }
    if (aliases) { this.aliases = aliases; }
  }
  parseConvert = e => e;
  fuseWrapper = null;
  aliases = {};
  static promptClass = 'widePrompt';
  static header = loc('Select value');
  attachment = {
    clickHtml: me => {
      return 'CCCEMButtons[\''+me.parent.key+'\'].type.onInputConfirmation(this.dataset.selectId);Game.ClosePrompt();'
    }
  }
  getTip() {
    return loc('Click to select a value.');
  }
  getColorStr() { 
    return 'neatoblue';
  }
  parse(names, state) {
    return loc(names[0], this.parseConvert(state));
  }
  onClick() {
    invalidateScoreS();
    dynamicPrompt(this.getPromptStr(), this.getOptions(), this.constructor.promptClass);
    this.addEvents(getLatestPrompt());
  }
  getPromptStr() {
    return `<id chooseOption><h3>
    ${this.constructor.header}</h3><div class="line"></div>
    <div class="block">
    <div style="display:flex;gap:3px;align-items:center;">
      <input id="cccemSearch" type="search" placeholder="${loc('Type to search for the value...')}" class="framed" style="flex:1;box-sizing:border-box;padding:6px;margin-left: 5px;" />
      <button id="cccemClear" class="framed" style="padding:4px 8px;height:34px;cursor:pointer;" onclick="l('cccemSearch').value='';l('cccemSearch').dispatchEvent(new Event('input'));l('cccemSearch').focus();">X</button>
    </div>
    <div id="cccemSearchResults" style="margin-top:6px;height:200px;overflow:auto;">${this.getEntries()}</div>
    </div>`;
  }
  getOptions() {
    return [
      [loc('Confirm'), 
        ''], 
      [loc('Nevermind')]
  ]}
  addEvents(baseNode) {
    AddEvent(baseNode.querySelector('#cccemSearch'), 'input', e => {
      baseNode.querySelector('#cccemSearchResults').innerHTML = this.getEntries(e.target.value);
    });
    baseNode.querySelector('#cccemSearch').focus();
    /*AddEvent(baseNode.querySelector('#promptOption0'), 'click', e => {
      restorePromptLayer();
      this.onInputConfirmation(getLatestPrompt().querySelector('#cccemSearchResults').childNodes[0].dataset.selectId);
    });*/
  }
  getEntries(searchString) {
    let str = '';
    const min = (typeof this.min === 'function')?this.min():this.min;
    const max = (typeof this.max === 'function')?this.max():this.max;
    if (!searchString) {
      for (let i = min; i <= max; i = this.next(i)) {
        str += this.getSearchButton(i);
      }
      return str;
    }
    if (typeof Fuse !== 'undefined' && Fuse) {
      if (!this.fuseWrapper) { 
        let list = [];
        for (let i = min; i <= max; i = this.next(i)) {
          list.push({ name: this.parseConvert(i), alias: (typeof this.aliases === 'function')?(this.aliases(i)):(this.aliases[i]?([].concat(this.aliases[i])):[]), id: i });
        }
        this.fuseWrapper = new Fuse(list, { ignoreLocation: true, threshold: 0.4, keys: ['name', 'alias'] }); 
      }
      const results = this.fuseWrapper.search(searchString, { limit: 7 });
      for (let i in results) {
        str += this.getSearchButton(results[i].item.id);
      }
      return str;
    }
    //below is backup method, real searching service is supplied by Fuse.js
    const maxEntriesToDisplay = 5;
    const list = new Array(maxEntriesToDisplay);
    list.fill(null);
    for (let i = min; i <= max; i = this.next(i)) {
      const label = this.parseConvert(i);
      if (!label) { continue; }
      const d = this.levenshtein(searchString, label);
      for (let ii = 0; ii < list.length; ii++) {
        if (!list[ii]) { list[ii] = { i: i, d: d }; break; }
        if (list[ii].d > d) { 
          list.splice(ii, 0, { i: i, d: d });
          list.pop();
          break;
        }
      }
    }
    
    let lim = Infinity;
    for (let i in list) {
      if (list[i].d > lim) { continue; }
      str += this.getSearchButton(list[i].i);
      if (i == 0 && list[i].d < 3) { lim = list[i].d; } 
    }
    return str;
  }
  next(from) {
    return from + 1;
  }
  onInputConfirmation(content) {
    if (!isNaN(content)) { 
      content = Number(content);
    }
    this.assignState(content);
    RedrawCCCEM();
  }
  getSearchButton(value) {
    return '<div id="cccemSearchEntry'+value+'" data-select-id="'+value+'" class="block cccemSearchDisplay" '+Game.clickStr+'="'+this.attachment.clickHtml(this)+'">'+this.parseConvert(value)+'</div>';
  }
  levenshtein(matcher, matchee) {
    //BACKUP METHOD
    matcher = matcher.toLowerCase();
    matchee = matchee.toLowerCase();
    const m = matcher.length, n = matchee.length;
    if (m === 0) return n;
    if (n === 0) return m;

    let prev = new Array(n + 1);
    for (let j = 0; j <= n; j++) prev[j] = j;

    for (let i = 1; i <= m; i++) {
      const cur = new Array(n + 1);
      cur[0] = i;
      const mi = matcher.charCodeAt(i - 1);
      for (let j = 1; j <= n; j++) {
      const cost = mi === matchee.charCodeAt(j - 1) ? 0 : 1;
      const deletion = prev[j] + 1;
      const insertion = cur[j - 1] + 1;
      const substitution = prev[j - 1] + cost;
      cur[j] = Math.min(deletion, insertion, substitution);
      }
      prev = cur;
    }
    
    return Math.min(...prev);
  }
  triggerSetVar() {
    this.onClick();
    RedrawCCCEM();
  }
  
  load(str) {
    this.parent.state = parseFloat(str);
    if (this.parent.updateVarFunc) { this.parent.updateVarFunc.call(this.parent, this.parent.state); }
  }
  default() { 
    return Math.min(Math.max(0, (typeof this.min === 'function')?this.min():this.min), (typeof this.max === 'function')?this.max():this.max); 
  }
}
class twoStepCycle extends cycleButton {
  constructor(min, max, parseConvert, aliases) { super(min, max, parseConvert, aliases); }
  next(from) { 
    return from + 2;
  }
  parseConvert = e => (e <= -1 ? loc('Random') : Game.goldenCookieChoices[e-1]);
}
class seasonalCycleButton extends cycleButton {
  static header = loc('Choose season');
  constructor() {
    super(0, 209, e => ((e > 0) ? Game.seasons[Game.UpgradesById[e].season].name : loc('none')));
  }
  next(from) {
    from++; 
    if (from == 186) { from = 209; }
    if (from == 1) { from = 182; }
    return from;
  }
}
class confirmationButton extends buttonType {
  constructor(warningStr) {
    super();
    //type: function
    this.warningStr = warningStr;
  }
  onClick() {
    dynamicPrompt(this.getPromptStr(), this.getOptions());
    this.addEvents(getLatestPrompt());
  }

  static heading = loc('Are you sure?');
  getPromptStr() {
    return `<id confirmInput><h3>${this.constructor.heading}</h3>
      <div class="line"></div>
      <div class="block" style="${this.warningStr?'':'display: none;'}">${this.warningStr(this.parent.state)}</div>
    `;
  }
  getOptions() {
    return [
      [loc("Yes"),
        `PlaySound(\'snd/tickOff.mp3\');`],
      [loc("Nevermind"), `PlaySound(\'snd/tickOff.mp3\');restorePromptLayer();`]
    ];
  }
  addEvents(baseNode) {
    AddEvent(baseNode.querySelector('#promptOption0'), 'click', e => {
      restorePromptLayer();
      this.assignState(true);
    });
  }
}
class iconSelectButton extends buttonType {
  constructor(autoSet) {
    super();
    if (autoSet) { this.autoSet = autoSet; }
  }
  getColorStr() {
    return 'neatopurple';
  }
  getTip() {
    return loc('Click to select an icon.');
  }
  buffer = null;
  static promptClass = 'widePrompt ultraWide';

  onClick() {
    invalidateScoreS();
    dynamicPrompt(this.getPromptStr(), this.getOptions(), this.constructor.promptClass);
    this.addEvents(getLatestPrompt());
  }
  getOptions() {
    return [
      [loc('Confirm'), 'PlaySound(\'snd/tickOff.mp3\');'], 
      [loc('Nevermind'), 'PlaySound(\'snd/tickOff.mp3\');restorePromptLayer();']
  ]}
  onInputConfirmation(result) {
    this.assignState(result.length?result:null);
    RedrawCCCEM();
  }
  parse(names, state) {
    if (!state || state.length !== 2) { return loc(names[0], loc('(none)')); }
    return loc(names[0], ['<span class="icon" style="background:url('+Game.resPath+'img/icons.png?v='+Game.version+');margin:-20px -20px -19px -18px;transform:scale(0.45);display:inline-block;'+writeIcon(state)+'"></span>', state[0], state[1]]);
  }

  getPromptStr() {
    return '<div id="cccem_icon_results" class="block">' + loc('Click an icon to select it. No selection yet.') + '</div>' +
      '<div class="block" style="text-align:center;">' +
      '<canvas id="cccem_icon_canvas" style="max-width:820px; max-height:520px; width:100%; height:auto; display:block; margin: 8px auto; border: 1px solid #555;"></canvas>' +
      '</div>';
  }
  addEvents(baseNode) {
    const l = s => baseNode.querySelector('#' + s);
    const canvas = l('cccem_icon_canvas');
    const results = l('cccem_icon_results');
    if (!canvas || !results) { return; }

    document.getElementById('prompt').classList.add('ultraWide');

    const image = Pic('img/icons.png');
    const ctx = canvas.getContext('2d');

    const defaultSelect = this.parent.state ?? [16, 5];
    this.buffer = defaultSelect;

    AddEvent(baseNode.querySelector('#promptOption0'), 'click', e => {
      const x = canvas.dataset.iconX;
      const y = canvas.dataset.iconY;
      if (x === undefined || y === undefined) {
        this.onExit();
        restorePromptLayer();
        return;
      }
      const result = this.onExit();
      restorePromptLayer();
      this.onInputConfirmation(result);
    });

    function setupAndDraw(img) {
      const tileW = 48;
      const tileH = 48;

      canvas.width = img.width;
      canvas.height = img.height;

      const maxW = 820;
      const maxH = 520;
      const scale = Math.min(maxW / canvas.width, maxH / canvas.height, 1);
      canvas.style.width = Math.round(canvas.width * scale) + 'px';
      canvas.style.height = Math.round(canvas.height * scale) + 'px';

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.rect(0, 0, 1000, 1000);
      ctx.drawImage(img, 0, 0);

      const handler = function (ev, x, y) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const cx = x ?? (ev.clientX - rect.left) * scaleX;
        const cy = y ?? (ev.clientY - rect.top) * scaleY;

        const ix = Math.floor(cx / tileW);
        const iy = Math.floor(cy / tileH);

        canvas.dataset.iconX = ix;
        canvas.dataset.iconY = iy;
        canvas.dataset.pixelX = Math.floor(cx);
        canvas.dataset.pixelY = Math.floor(cy);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const left = ix * tileW;
        const top = iy * tileH;
        const right = (ix + 1) * tileW;
        const bottom = (iy + 1) * tileH;

        ctx.lineWidth = Math.max(2, Math.round(Math.min(canvas.width, canvas.height) / 400));
        ctx.strokeStyle = 'rgba(255,80,80,0.95)';
        ctx.beginPath();

        ctx.moveTo(0, top + 0.5);
        ctx.lineTo(canvas.width, top + 0.5);

        ctx.moveTo(0, bottom + 0.5);
        ctx.lineTo(canvas.width, bottom + 0.5);

        ctx.moveTo(left + 0.5, 0);
        ctx.lineTo(left + 0.5, canvas.height);

        ctx.moveTo(right + 0.5, 0);
        ctx.lineTo(right + 0.5, canvas.height);
        ctx.stroke();

        ctx.lineWidth = Math.max(1, Math.round(Math.min(canvas.width, canvas.height) / 800));
        ctx.strokeStyle = 'rgba(255,200,80,0.95)';
        ctx.strokeRect(left + 0.5, top + 0.5, tileW - 1, tileH - 1);

        results.dataset.iconX = ix;
        results.dataset.iconY = iy;
        results.innerHTML = loc('Click on an icon to select it. Selected icon coordinates: <b>(%1, %2)</b>.', [ix, iy]);
      };

      if (canvas._cccem_icon_handler) {
        canvas.removeEventListener('click', canvas._cccem_icon_handler);
      }
      canvas._cccem_icon_handler = handler;
      canvas.addEventListener('click', handler);

      handler(null, defaultSelect[0] * tileW, defaultSelect[1] * tileH);
    }

    if (image.complete && image.width && image.height) {
      setupAndDraw(image);
    } else {
      const int = setInterval(() => {
        const newImg = Pic('img/icons.png');
        if (newImg.complete && newImg.width && newImg.height) {
          clearInterval(int);
          setupAndDraw(newImg);
        }
      }, 50);
    }
  }
  onExit() {
    const canvas = getLatestPrompt().querySelector('#cccem_icon_canvas');
    const results = getLatestPrompt().querySelector('#cccem_icon_results');
    // detach click handler if present
    if (canvas && canvas._cccem_icon_handler) {
      canvas.removeEventListener('click', canvas._cccem_icon_handler);
      delete canvas._cccem_icon_handler;
    }
    let x = null, y = null;
    if (canvas && canvas.dataset.iconX !== undefined && canvas.dataset.iconY !== undefined) {
      x = parseInt(canvas.dataset.iconX, 10);
      y = parseInt(canvas.dataset.iconY, 10);
    } else if (results && results.dataset.iconX !== undefined && results.dataset.iconY !== undefined) {
      x = parseInt(results.dataset.iconX, 10);
      y = parseInt(results.dataset.iconY, 10);
    }
    if (x === null || y === null || Number.isNaN(x) || Number.isNaN(y)) {
      return [];
    }
    canvas.width = 1;
    canvas.height = 1;
    canvas.replaceWith(canvas.cloneNode(true));
    if (canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
    this.buffer = [x, y];
    return [x, y];
  }
  default() {
    if (this.autoSet) { return this.autoSet; }
    return null;
  }
}
class listManagementButton extends cycleButton { 
  constructor() {
    super(...arguments);
  }
  static promptClass = 'widePrompt ultraWide';
  static header = loc('Edit list');
  static deletionSVG = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round">

    <path d="M3 6h18"/>
    <path d="M9 6V4h6v2"/>

    <rect x="6" y="6" width="12" height="14" rx="2"/>

    <line x1="10" y1="10" x2="10" y2="18"/>
    <line x1="14" y1="10" x2="14" y2="18"/>

    </svg>`;
  static deletionConfirmation = (new confirmationButton(e => loc('You are about to delete the item <b>%1</b>!<br>Deletion cannot be undone.', e))).attach();
  getPromptStr() {
    return `<id chooseOption><noClose><h3>
    ${this.constructor.header}</h3><div class="line"></div>
    <div class="block">
    <div style="display:flex;gap:3px;align-items:center;">
      <input id="cccemSearch" type="search" placeholder="${loc('Type to search for the value...')}" class="framed" style="flex:1;box-sizing:border-box;padding:6px;margin-left: 5px;" />
      <button id="cccemClear" class="framed" style="padding:4px 8px;height:34px;cursor:pointer;" onclick="l('cccemSearch').value='';l('cccemSearch').dispatchEvent(new Event('input'));l('cccemSearch').focus();">X</button>
    </div>

    <div id="cccemChoiceWrapper" data-current-entry="-1">
      <div id="cccemLeftCol" style="height: 100%; min-height: 200px;">
        <div id="cccemSearchResults" style="margin-top:6px;min-height:200px; height: 100%; max-height: 450px;overflow:auto;" data-cccem-list>
          ${this.getEntries()}
        </div>

        <div id="marginContainer" style="background: black;">
          ${this.getAddButtons()}
        </div>
      </div>

      <div id="cccemRightCol" style="max-height: 450px; overflow: auto;" data-cccem-entry-details>
        ${this.getEntryDetails(null)}
      </div>
    </div>
    </div>`;
  }
  getAddButtons() { return ''; }
  addEvents(baseNode) {
    AddEvent(baseNode.querySelector('#cccemSearch'), 'input', e => {
      baseNode.querySelector('#cccemSearchResults').innerHTML = this.getEntries(e.target.value);
    });
    baseNode.querySelector('#cccemSearch').focus();
    baseNode.querySelector('#cccemSearchResults').style.maxHeight = (450 - baseNode.querySelector('#marginContainer').offsetHeight) + 'px'
    this.addAdditionalEvents(baseNode);
  }
  addAdditionalEvents(baseNode) {
    
  }
  setEntryDetails(entry) {
    this.saveEntry();
    getLatestPrompt().querySelector('#cccemRightCol').innerHTML = this.getEntryDetails(entry);
    getLatestPrompt().querySelector('#cccemChoiceWrapper').dataset.currentEntry = entry;
    this.addPerEntryEvents(entry, getLatestPrompt().querySelector('#cccemRightCol'));
  }
  addPerEntryEvents(entry, baseNode) {

  }
  getEntryDetails(entry) {
    throw new Error('getEntryDetails not implemented');
  }
  getOptions() {
    return [
      [loc('All done!'), 
        'CCCEMButtons[\''+this.parent.key+'\'].type.saveEntry();'
        +'Game.ClosePrompt();'], 
      [loc('Close')]
  ]}
  parseFormulaAnnotation(str) {
    if (!str) { return ''; }
    return Scorecode.annotate(str);
  }
  saveEntry() {
    
  }
  getSearchButton(value) {
    return '<div id="cccemSearchEntry'+value+'" data-select-id="'+value+'" class="block cccemSearchDisplay" '+
    Game.clickStr+'="getLatestPrompt().querySelector(\'#cccemSearchEntry\'+getLatestPrompt().querySelector(\'#cccemChoiceWrapper\').dataset.currentEntry)?.classList?.remove(\'highlighted\');this.classList.add(\'highlighted\');CCCEMButtons[\''+this.parent.key+'\'].type.setEntryDetails('+value+');">'+this.parseConvert(value)+'</div>';
  }
}
class trackerManagementButton extends listManagementButton {
  constructor() {
    super(0, () => (trackersById.length - 1), e => { 
      if (trackersById[e].constructor.type === 'hook') {
        return trackersById[e].key;
      }
      return loc('%1: %2', [trackersById[e].constructor.type.toUpperCase(), trackersById[e].key]);
    });
  }
  static promptClass = 'widePrompt ultraWide';
  static header = loc('Edit trackers');
  static conditionSelect = (new cycleButton(0, () => (Object.keys(cccemModHooks).length - 1), e => cccemModHooksById[e].name, [])).attach();
  getAddButtons() {
    return `<a class="option focused" id="cccemAddTrackerBtn" data-cccem-action="add-tracker" style="display:block;margin-top:8px;background:black;">${loc('Add tracker')}</a>
        <a class="option" id="cccemAddFakeBtn" data-cccem-action="add-tracker" style="display:inline-block;width:calc(50%-16px);background:black;">${loc('Add relay')}</a>
        <a class="option" id="cccemAddHelperBtn" data-cccem-action="add-tracker" style="display:inline-block;width:calc(50%-16px);background:black;">${loc('Add helper')}</a>`;
  }
  addAdditionalEvents(baseNode) {
    AddEvent(baseNode.querySelector('#cccemAddTrackerBtn'), 'click', e => {
      const track = this.createNewTracker('hook');
      this.setEntryDetails(track.id);
      baseNode.querySelector('#cccemSearchResults').innerHTML = this.getEntries(e.target.value);
    });
    AddEvent(baseNode.querySelector('#cccemAddFakeBtn'), 'click', e => {
      const track = this.createNewTracker('relay');
      this.setEntryDetails(track.id);
      baseNode.querySelector('#cccemSearchResults').innerHTML = this.getEntries(e.target.value);
    });
    AddEvent(baseNode.querySelector('#cccemAddHelperBtn'), 'click', e => {
      const track = this.createNewTracker('helper');
      this.setEntryDetails(track.id);
      baseNode.querySelector('#cccemSearchResults').innerHTML = this.getEntries(e.target.value);
    });
  }

  getEntryDetails(entry) {
    if (entry === null) { 
      return '<div style="width:100%; height: 100%; margin: auto;">' + loc('Select a tracker to get started...') + '</div>';
    }
    const t = trackersById[entry];
    const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&#34;').replace(/'/g,'&#39;');
    return `
    <div class="block" style="text-align: center;">
      <div class="title minor">${loc('Name')}</div>
      <input id="trackerKey" class="framed trackerInput" value="${esc(t.key)}" />
      <div class="title minor" style="margin-top:8px;">${loc('Description')}</div>
      <textarea id="trackerDesc" class="framed trackerInput">${esc(t.description)}</textarea>
    </div>

    <div class="block" style="text-align: center;">
      <div class="title minor">${loc('Formula')}</div>
      <div class="framed trackerInput editor" style="height:${t.constructor.type === 'hook' ? '120px' : '360px' }; max-height: 75%; line-height:110%; position: relative;">
        <pre id="trackerFormulaDisplay">${this.parseFormulaAnnotation(t.originalFormula)}</pre>
        <textarea id="trackerFormula" spellcheck="false"
        onchange="trackersById[${entry}].setFormula(this.value);"
        oninput="getLatestPrompt().querySelector('#trackerFormulaDisplay').innerHTML = CCCEMButtons['${this.parent.key}'].type.parseFormulaAnnotation(this.value);"
        onscroll="getLatestPrompt().querySelector('#trackerFormulaDisplay').scrollLeft = this.scrollLeft; getLatestPrompt().querySelector('#trackerFormulaDisplay').scrollTop = this.scrollTop;"
        >${esc(t.originalFormula)}</textarea>
      </div>

      ${t.constructor.type === 'hook' ? `<div class="title minor" style="margin-top:8px;">${loc('Value on reset')}</div>
      <input id="trackerDefault" class="framed trackerInput" value="${esc(typeof t.defaultV === 'function' ? t.defaultV() : t.defaultV)}" />`:''}
    </div>

    ${t.constructor.type === 'hook' ? `
    <div class="block" style="text-align: center;" id="conditionConfigSection" data-current-configuring-condition="-1">
      <div class="title minor">${loc('Trigger conditions - triggers if any of the below is true')}</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;justify-content:center;">
      <a class="option" ${Game.clickStr}="getLatestPrompt().querySelector('#conditionConfigSection').dataset.currentConfiguringCondition = ${t.triggerConditions.length};CCCEMButtons['${this.parent.key}'].type.configureCondition(${i})">${'+'}</a>
      ${ (t.triggerConditions || []).map((c, i) => `
        <a class="option" ${Game.clickStr}="CCCEMButtons['${this.parent.key}'].type.configureCondition(${i})">${cccemModHooks[c].name}</a>
      `).join('') }
      </div>
    </div>
    ` : '' }

    <a id="deleteItem" class="option" style="margin-top: 5px;">${loc('Delete')}<span style="display: inline-flex; justify-content: center; align-items: center; transform: translateY(1px) translateX(2px);">${this.constructor.deletionSVG}</span></a>
    `;
  }
  configureCondition(item) {
    this.saveEntry();
    if (!getLatestPrompt().querySelector('#conditionConfigSection')) { return; }
    getLatestPrompt().querySelector('#conditionConfigSection').dataset.currentConfiguringCondition = parseInt(item);
    this.constructor.conditionSelect.attach({ 
      state: this.parent.state,
      clickHtml: me => {
        return `restorePromptLayer();CCCEMButtons['${this.parent.key}'].type.commitCondition(${item}, this.dataset.selectId);`
      },
      callback: value => {
        this.commitCondition(item, value);
      }
    }).onClick();
  }
  addPerEntryEvents(entry, baseNode) {
    const track = trackersById[entry];
    if (baseNode.querySelector('#deleteItem')) { AddEvent(baseNode.querySelector('#deleteItem'), 'click', e => {
      this.constructor.deletionConfirmation.attach({
        state: track.key,
        callback: value => {
          if (!value) { return; }
          delete trackers[entry];
          trackersById.splice(entry, 1);
          for (let i in trackersById) {
            trackersById[i].id = parseInt(i);
          }
          getLatestPrompt().querySelector('#cccemChoiceWrapper').dataset.currentEntry = -1;
          restorePromptLayer();
          this.onClick();
        }
      }).onClick();
    }); }
  }
  commitCondition(modifying, condition) {
    const modifyingEntry = trackersById[getLatestPrompt().querySelector('#cccemChoiceWrapper').dataset.currentEntry];

    if (modifying >= modifyingEntry.triggerConditions.length) { 
      modifyingEntry.addTriggerCondition(cccemModHooksById[condition].key);
    } else { 
      modifyingEntry.setTriggerConditions(modifyingEntry.triggerConditions.map((c, i) => (i === modifying ? cccemModHooksById[condition].key : c)));
    }
    this.setEntryDetails(modifyingEntry.id);
  }
  createNewTracker(type) {
    let name = 'tracker ' + Beautify(trackersById.length);
    while (trackers[name]) {
      name += 'qwertyuiopasdfghjklzxcvbnm'[Math.floor(26 * Math.random())];
    }
    switch(type) {
      case 'hook': return new HookTracker(name, '\'value\'', []);
      case 'relay': return new FakeTracker(name, '0');
      case 'helper': return new HelperTracker(name, '()#(0)');
      default: throw new Error('Unrecognized tracker type to create: ' + placeholderID);
    }
  }

  saveEntry() {
    if (!getLatestPrompt().querySelector('#cccemChoiceWrapper')) { return; }
    const track = trackersById[parseInt(getLatestPrompt().querySelector('#cccemChoiceWrapper').dataset.currentEntry)];
    if (!track) { return; } // = -1 for example

    track.save();
  }
}
class watcherViewButton extends listManagementButton {
  constructor() {
    super(0, () => (watchersById.length - 1), e => watchersById[e].key);
    for (let i in this.eventListeners) {
      this.eventListeners[i].bind(this);
    }
  }
  static promptClass = 'widePrompt ultraWide';
  static header = loc('View watchers');
  getEntryDetails(entry) {
    if (entry === null) { 
      return '<div style="width:100%; height: 100%; margin: auto;">' + loc('Select a watcher to get started...') + '</div>';
    }
    const w = watchersById[entry];
    const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&#34;').replace(/'/g,'&#39;');
    return `
    <div class="block" style="text-align: center;">
      <div class="title minor">${loc('Name: %1', esc(w.key))}</div>
      <textarea id="watcherDesc" class="framed trackerInput" style="height: 120px;" readonly>${esc(w.description)}</textarea>
    </div>
    `;
  }
}
class displayClauseEditingButton extends inputButton {
  constructor() {
    super();
  }

  static heading = loc('Input clause info')
  static subHeading = loc('Change details about the clause below.')
  static readonly = false
  getPromptStr() {
    return `<id NumImport><h3>${loc(this.constructor.heading)}</h3>
      <div class="block">${loc(this.constructor.subHeading)}
        <div id="importError" class="warning" style="font-weight:bold;font-size:11px;"></div>
      </div>
      <div class="block">
        <div class="framed trackerInput editor" style="height:50px; line-height:110%; position: relative;">
          <pre id="formulaDisplay" class="formulaDisplay">${this.parseFormulaAnnotation(this.parent.state[0])}</pre>
          <textarea id="textareaPrompt" class="framed formula" style="${this.getStyles()}"${this.constructor.readonly ? 'readonly' : ''}>${this.parent.state[0]}</textarea>
        </div>
        <div class="line"></div>
        <label class="displayAnnotation" style="text-align: center;">${loc('Text displayed when the formula matches.')}</label>
        <div class="framed trackerInput" style="height: 30px; line-height: 100%; position: relative;"> 
          <textarea id="clauseResult" class="framed centeredTextarea" style="width: 100%; height: 20px;" placeholder="${loc('Enter text here')}">${this.parent.state[1]}</textarea>
        </div>
      </div>`;
  }
  addEvents(baseNode) {
    const textareaPrompt = baseNode.querySelector('#textareaPrompt');
    const clauseResult = baseNode.querySelector('#clauseResult');
    if (this.autoSet) { textareaPrompt.value = this.autoSet.call(this) }
    textareaPrompt.focus();
    textareaPrompt.select();
    AddEvent(baseNode.querySelector('#promptOption0'), 'click', e => {
      const content = textareaPrompt.value.trim();
      const result = clauseResult.value.trim();
      restorePromptLayer();
      this.onInputConfirmation([content, result]);
      RedrawCCCEM();
    });
    AddEvent(baseNode.querySelector('#textareaPrompt'), 'input', e => {
      baseNode.querySelector('#formulaDisplay').innerHTML = this.parseFormulaAnnotation(e.target.value);
    });
  }
  parseFormulaAnnotation(str) {
    if (!str) { return ''; }
    return Scorecode.annotate(str);
  }
}
class statManagementButton extends listManagementButton {
  constructor() {
    super(0, () => (statTypesById.length - 1), e => { if (statTypesById.length) { return statTypesById[e].name } else { return '?'; } });
  }
  static promptClass = 'widePrompt ultraWide';
  static header = loc('Edit stats');
  static displayFormatSelect = (new cycleButton(0, () => (Object.keys(statDisplayTypes).length - 1), e => statDisplayTypesById[e].name, [])).attach();
  static iconSelect = (new iconSelectButton([0, 7]).attach());
  static iconThresholdInput = (new numberInputButton(0).attach());
  static displayClauseEditing = (new displayClauseEditingButton().attach());
  getAddButtons() {
    return `<a class="option focused" id="cccemAddStatBtn" data-cccem-action="add-stat" style="display:block;margin-top:8px;background:black;">${loc('Add stat')}</a>`;
  }
  addAdditionalEvents(baseNode) {
    AddEvent(baseNode.querySelector('#cccemAddStatBtn'), 'click', e => {
      const stat = this.createNewStat();
      this.setEntryDetails(stat.id);
      baseNode.querySelector('#cccemSearchResults').innerHTML = this.getEntries(e.target.value);
      getLatestPrompt().querySelector('[data-select-id="'+stat.id+'"]')?.click?.();
    });
  }
  getEntryDetails(entry) {
    if (entry === null) { 
      return '<div style="width:100%; height: 100%; margin: auto;">' + loc('Select a stat to get started...') + '</div>';
    }
    const w = statTypesById[entry];
    const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&#34;').replace(/'/g,'&#39;');
    return this.getEditingStr(w);
  }
  getEditingStr(stat) {
    const t = stat;
    const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&#34;').replace(/'/g,'&#39;');
    return `
    <div class="block" style="text-align: center;">
      <div class="title minor">${loc('Name')}</div>
      <input id="trackerKey" class="framed trackerInput" value="${esc(t.name)}" />
      <div class="title minor" style="margin-top:8px;">${loc('Description')}</div>
      <textarea id="trackerDesc" class="framed trackerInput" style="height: 50px;">${esc(t.description)}</textarea>
    </div>

    <div class="block" style="text-align: center;">
      <div class="title minor">${loc('Formula')}</div>
      <div class="framed trackerInput editor" style="height:50px; line-height:110%; position: relative;">
        <pre id="trackerFormulaDisplay" class="formulaDisplay">${this.parseFormulaAnnotation(t.formula)}</pre>
        <textarea id="trackerFormula" spellcheck="false"
        oninput="getLatestPrompt().querySelector('#trackerFormulaDisplay').innerHTML = CCCEMButtons['${this.parent.key}'].type.parseFormulaAnnotation(this.value);"
        onscroll="getLatestPrompt().querySelector('#trackerFormulaDisplay').scrollLeft = this.scrollLeft; getLatestPrompt().querySelector('#trackerFormulaDisplay').scrollTop = this.scrollTop;"
        >${esc(t.formula)}</textarea>
      </div>
    </div>
    
    ${t.iconsList ? `
    <div class="block" style="text-align: center;">
      <div class="title minor">${loc('Icons')}</div>
      <div class="line"></div>
      <div id="iconsList" style="display: flex; flex-direction: row; justify-content: center; flex-wrap: wrap;" data-modifying-icon="-1">
        ${t.iconsListSorted.map(this.getIconEditingStr, stat).reverse().join('')}
        <div style="display: flex; justify-content: center; align-items: center; padding: 5px;"><a id="addIconButton" class="option">+</a></div>
      </div>
      <label class="displayAnnotation">${loc('Click on an icon or its threshold to edit it. Shift-click to delete an icon.')}</label>
    </div>
    ` : ''}
    
    ${t.detailDisplayConfigs ? `
    <div class="block" style="text-align: center;">
      <div class="title minor">${loc('Display format')}</div>
      <div class="line"></div>
      <div style="display: flex; flex-direction: column; justify-content: center;">
        <div id="displayFormatDemo" class="title stat small">${t.detailDisplayConfigs.type.parse(1234567890, true, t.detailDisplayConfigs.args)}</div>
        <label class="displayAnnotation">${loc('Click on the above display to edit type.')}</label>
        <textarea id="displayFormatTestInput" class="framed trackerInput" style="margin-top: 6px; text-align: center; height: 28px; line-height: 15px;" placeholder="${loc('Type a number here to test the display format...')}" " >${1234567890}</textarea>
        <div id="displayFormatEditing">${this.getDisplayFormatEditingStr(t)}</div>
      </div>

      <div class="title minor" style="margin-top: 12px;">${loc('Display clauses')}</div>
      <div class="line"></div>
      <div id="displayClausesEditing" style="display: flex; flex-direction: row; justify-content: center;">
        ${t.detailDisplayConfigs.clauses.map(this.getDisplayFormatClause).join('')}
        <a class="option">+</a>
      </div>
      <label class="displayAnnotation">${loc('Click on a clause to edit it, or shift-click to delete it.')}</label>
    </div>
    ` : ''}
    
    <div class="block" style="text-align: center;">
      <div class="title minor">${loc('Miscellaneous')}</div>
      <a id="notifDisplayButton" class="option prefButton option${t.noteworthy?'':' off'}" style="${t.key=='score'?'display: none;':''}"
        ${Game.clickStr}="if (this.classList.contains('off')) { this.classList.remove('off'); } else { this.classList.add('off'); }">${loc('Displayed in notif')}</a>
      <a id="summaryDisplayButton" class="option prefButton option${t.summaryworthy?'':' off'}"
        ${Game.clickStr}="if (this.classList.contains('off')) { this.classList.remove('off'); } else { this.classList.add('off'); }">${loc('Displayed in history viewer')}</a>
      <label for="cellsOccupying" class="argInputLabel" style="margin-right: 5px;">${loc('Cells occupied:').toUpperCase()}</label><input id="cellsOccupying" class="option framed argInput" value="${t.cellsOccupying}" type="number" min="1" max="5" />
    </div>
    
    <a id="deleteItem" class="option" style="margin-top: 5px;">${loc('Delete')}<span style="display: inline-flex; justify-content: center; align-items: center; transform: translateY(1px) translateX(2px);">${this.constructor.deletionSVG}</span></a>`;
  }
  eventListeners = {
    displayFormatTestInput: e => {
      this.setDisplayDemo();
    },
    displayFormatDemo: e => {
      this.constructor.displayFormatSelect.attach({ 
        state: this.parent.state,
        clickHtml: me => {
          return `restorePromptLayer();CCCEMButtons['${this.parent.key}'].type.setDisplayType(this.dataset.selectId);`
        },
        callback: value => {
          this.setDisplayType(value);
        }
      }).onClick();
    },
    statIcon: e => {
      if (e.shiftKey) { 
        const t = statTypesById[getLatestPrompt().querySelector('#cccemChoiceWrapper').dataset.currentEntry];
        const modifying = parseInt(e.target.parentNode.dataset.index);
        if (modifying < 0 || modifying >= t.iconsListSorted.length) { return; }
        const threshold = t.iconsListSorted[modifying];
        delete t.iconsList[threshold];
        t.iconsListSorted.splice(modifying, 1);
        this.setEntryDetails(t.id);
        return;
      }
      getLatestPrompt().querySelector('#iconsList').dataset.modifyingIcon = e.target.parentNode.dataset.index;
      this.constructor.iconSelect.attach({
        state: statTypesById[getLatestPrompt().querySelector('#cccemChoiceWrapper').dataset.currentEntry].iconsList[statTypesById[getLatestPrompt().querySelector('#cccemChoiceWrapper').dataset.currentEntry].iconsListSorted[e.target.parentNode.dataset.index]],
        callback: value => {
          this.setStatIcon(value);
        }
      }).onClick();
    },
    statIconThreshold: e => {
      if (e.shiftKey) { 
        const t = statTypesById[getLatestPrompt().querySelector('#cccemChoiceWrapper').dataset.currentEntry];
        const modifying = parseInt(e.target.parentNode.dataset.index);
        if (modifying < 0 || modifying >= t.iconsListSorted.length) { return; }
        const threshold = t.iconsListSorted[modifying];
        delete t.iconsList[threshold];
        t.iconsListSorted.splice(modifying, 1);
        this.setEntryDetails(t.id);
        return;
      }
      getLatestPrompt().querySelector('#iconsList').dataset.modifyingIcon = e.target.parentNode.dataset.index;
      this.constructor.iconThresholdInput.attach({
        state: statTypesById[getLatestPrompt().querySelector('#cccemChoiceWrapper').dataset.currentEntry].iconsListSorted[e.target.parentNode.dataset.index],
        callback: value => {
          this.setStatIconThreshold(value);
        }
      }).onClick();
    },
    displayClause: e => {
      const t = statTypesById[getLatestPrompt().querySelector('#cccemChoiceWrapper').dataset.currentEntry];
      const modifying = parseInt(e.target.dataset.index);
      if (e.shiftKey) { 
        t.detailDisplayConfigs.clauses.splice(modifying, 1); 
        this.setEntryDetails(t.id); 
        return; 
      }
      this.constructor.displayClauseEditing.attach({
        state: [t.detailDisplayConfigs.clauses[modifying].condition ?? '', t.detailDisplayConfigs.clauses[modifying].displayText],
        callback: value => {
          t.detailDisplayConfigs.clauses[modifying].condition = value[0];
          t.detailDisplayConfigs.clauses[modifying].displayText = value[1];
          this.setEntryDetails(t.id);
        }
      }).onClick();
    },
    displayClauseCreation: e => {
      const t = statTypesById[getLatestPrompt().querySelector('#cccemChoiceWrapper').dataset.currentEntry];
      t.detailDisplayConfigs.clauses.push({ formula: '()#(0)', displayText: '' });
      this.setEntryDetails(t.id);
    }
  }
  addPerEntryEvents(entry, baseNode) {
    const t = statTypesById[entry];
    if (baseNode.querySelector('#displayFormatTestInput')) { AddEvent(baseNode.querySelector('#displayFormatTestInput'), 'input', this.eventListeners.displayFormatTestInput); }
    if (baseNode.querySelector('#displayFormatDemo')) {
      AddEvent(baseNode.querySelector('#displayFormatDemo'), 'click', this.eventListeners.displayFormatDemo);
    }
    if (baseNode.querySelector('.statIcon')) {
      baseNode.querySelectorAll('.statIcon').forEach(icon => {
        AddEvent(icon, 'click', this.eventListeners.statIcon);
      });
    }
    if (baseNode.querySelector('.iconThreshold')) {
      baseNode.querySelectorAll('.iconThreshold').forEach(threshold => {
        AddEvent(threshold, 'click', this.eventListeners.statIconThreshold);
      });
    }
    if (baseNode.querySelector('#addIconButton')) {
      AddEvent(baseNode.querySelector('#addIconButton'), 'click', e => {
        const t = statTypesById[getLatestPrompt().querySelector('#cccemChoiceWrapper').dataset.currentEntry];
        const newThreshold = t.iconsListSorted.length ? (t.iconsListSorted[0] + 1) : 0;
        t.iconsList[newThreshold] = [0, 7];
        t.iconsListSorted.unshift(newThreshold);
        this.setEntryDetails(t.id);
      });
    }
    if (baseNode.querySelector('#displayClausesEditing')) {
      AddEvent(baseNode.querySelector('#displayClausesEditing').querySelector('a.option:last-child'), 'click', this.eventListeners.displayClauseCreation);
      baseNode.querySelectorAll('#displayClausesEditing a.option:not(:last-child)').forEach(clause => {
        AddEvent(clause, 'click', this.eventListeners.displayClause);
      });
    }
    if (baseNode.querySelector('#deleteItem')) { AddEvent(baseNode.querySelector('#deleteItem'), 'click', e => {
      this.constructor.deletionConfirmation.attach({
        state: t.name,
        callback: value => {
          if (!value) { return; }
          delete statTypesList[entry];
          statTypesById.splice(entry, 1);
          for (let i in statTypesById) {
            statTypesById[i].id = parseInt(i);
          }
          getLatestPrompt().querySelector('#cccemChoiceWrapper').dataset.currentEntry = -1;
          restorePromptLayer();
          this.onClick();
        }
      }).onClick();
    }); }
  }
  getIconEditingStr(threshold, index) {
    const t = this;
    let icon = [].concat(t.iconsList[threshold]);
    if (icon[2] === 'cccemSpritesheet') { icon[2] = cccemSpritesheet; }
    return `<div class="iconEditCell" data-index="${index}">
      <div class="statIcon hasIcon" style="${writeIcon(icon)}"></div>
      <div class="iconThreshold">${Beautify(threshold)}</div>
    </div>`;
  }
  setStatIcon(value) {
    const t = statTypesById[getLatestPrompt().querySelector('#cccemChoiceWrapper').dataset.currentEntry];
    const modifying = parseInt(getLatestPrompt().querySelector('#iconsList').dataset.modifyingIcon);
    if (modifying < 0 || modifying >= t.iconsListSorted.length) { return; }
    t.iconsList[t.iconsListSorted[modifying]] = value;
    this.setEntryDetails(t.id);
  }
  setStatIconThreshold(value) {
    const t = statTypesById[getLatestPrompt().querySelector('#cccemChoiceWrapper').dataset.currentEntry];
    const modifying = parseInt(getLatestPrompt().querySelector('#iconsList').dataset.modifyingIcon);
    if (modifying < 0 || modifying >= t.iconsListSorted.length) { return; }
    const oldThreshold = t.iconsListSorted[modifying];
    t.iconsList[value] = t.iconsList[oldThreshold];
    delete t.iconsList[oldThreshold];
    t.iconsListSorted.splice(t.iconsListSorted.indexOf(oldThreshold), 1);
    t.iconsListSorted.push(value);
    t.iconsListSorted.sort((a, b) => b - a);
    this.setEntryDetails(t.id);
  }
  getDisplayFormatEditingStr(stat) {
    const t = stat;
    let str = `<div style="display: flex; flex-direction: column; gap: 6px;">
      <div style="flex-direction: row; display: flex; justify-content: center;">`;

    for (let i in t.detailDisplayConfigs.type.requiredArgs) {
      const arg = t.detailDisplayConfigs.type.requiredArgs[i];
      str += `<div class="block" style="display: flex; align-items: center; gap: 6px;">
        <label for="${arg.replace(' ', '-')}-field" class="argInputLabel">${arg.toUpperCase()}:</label>
        <input id="${arg.replace(' ', '-')}-field" type="number" class="option framed argInput" oninput="statTypesList['${t.key}'].detailDisplayConfigs.args['${arg}'] = Number(this.value); CCCEMButtons['${this.parent.key}'].type.setDisplayDemo();" value="${t.detailDisplayConfigs.args[arg] ?? t.detailDisplayConfigs.type.defaults[arg]}" />
      </div>`;
    }

    str += `</div></div>`;
    return str;
  }
  setDisplayType(type) {
    const t = statTypesById[getLatestPrompt().querySelector('#cccemChoiceWrapper').dataset.currentEntry];
    t.detailDisplayConfigs.type = statDisplayTypesById[type];
    getLatestPrompt().querySelector('#displayFormatDemo').innerHTML = statDisplayTypes[t.detailDisplayConfigs.type.type].parse(Number(getLatestPrompt().querySelector('#displayFormatTestInput').value), true, t.detailDisplayConfigs.args);
    getLatestPrompt().querySelector('#displayFormatEditing').innerHTML = this.getDisplayFormatEditingStr(t);
  }
  setDisplayDemo() {
    const t = statTypesById[getLatestPrompt().querySelector('#cccemChoiceWrapper').dataset.currentEntry];
    getLatestPrompt().querySelector('#displayFormatDemo').innerHTML = statDisplayTypes[t.detailDisplayConfigs.type.type].parse(Number(getLatestPrompt().querySelector('#displayFormatTestInput').value), true, t.detailDisplayConfigs.args);
  }
  getDisplayFormatClause(clause, index) {
    const t = clause;
    return `<a class="option" data-index="${index}">${t.displayText?(t.displayText.slice(0, 16) + (t.displayText.length > 16?'...':'')):loc('Clause #%1', Beautify(index + 1))}</a>`;
  }

  createNewStat() {
    let keyStr = '';
    while (!keyStr || statTypesList[keyStr]) {
      keyStr = ('qwertyuiopasdfghjklzxcvbnm')[Math.floor(Math.random() * 26)];
    }
    return stat.prototype.register(createStatClass(keyStr, 
      'New stat', 
      'New stat description', 
      { type: statDisplayTypes.simpleNumber }, { 0: [0, 7] }, `0`, { }
    ));
  }

  saveEntry() {
    if (!getLatestPrompt().querySelector('#cccemChoiceWrapper')) { return; }
    const t = statTypesById[parseInt(getLatestPrompt().querySelector('#cccemChoiceWrapper').dataset.currentEntry)];
    if (!t) { return; } // = -1 for example

    t.name = l('trackerKey').value;
    t.description = l('trackerDesc').value;
    t.formula = l('trackerFormula').value;
    t.noteworthy = !getLatestPrompt().querySelector('#notifDisplayButton').classList.contains('off');
    t.summaryworthy = !getLatestPrompt().querySelector('#summaryDisplayButton').classList.contains('off');
    t.cellsOccupying = parseInt(l('cellsOccupying').value) || 1;
  }
}
class multiSelectButton extends buttonType {
  //this is unimplemented
  constructor(selection) {
    this.selection = selection; //array, object, or function returning those
    //this.parent.state is the index in the selection
  }
  onClick() {
    
  }
  triggerSetVar() {

  }
  getTip() {
    return loc('Click to select options.');
  }
  getColorStr() { 
    return 'neatoblue';
  }
}
class boolButton extends buttonType {
  //yellow/orange button
  constructor(truthy, falsy) {
    super();
    if (truthy) { this.truthy = truthy; }
    if (falsy) { this.falsy = falsy; }
  }
  truthy = loc('On')
  falsy = loc('Off')
  getColorStr() {
    return this.parent.state?'neatoorange':'neatoyellow';
  }
  getTip() {
    return loc('Click to toggle.');
  }
  parse(names, state) {
    return loc(names[0], state?this.truthy:this.falsy)
  }
  onClick() {
    invalidateScoreS();
    this.assignState(!this.parent.state);
  }
  save() {
    return (this.parent.state?1:0);
  }
  load(str) {
    this.assignState(Boolean(parseInt(str)));
  }
  default() { 
    return false; 
  }
}
class categoryToggleButton extends buttonType {
  constructor(category) {
    super();
    this.categoryToToggle = category;
  }
  getTip() {
    return loc('Click to hide/unhide category.');
  }
  getColorStr() {
    if (!CCCEMCategories[this.categoryToToggle]) { return ''; }
    return CCCEMCategories[this.categoryToToggle].hidden?'neatogray':'neatowhite';
  }
  parse(names, state) {
    return loc(names[0], CCCEMCategories[this.categoryToToggle].hidden?'hidden':'visible')
  }
  onClick() {
    CCCEMCategories[this.categoryToToggle].hidden = !CCCEMCategories[this.categoryToToggle].hidden;
  }
  willSave = false
}
window.toChangeKeyBind = null;
window.keyBindEvents = [];
class keySelectButton extends buttonType {
  constructor(defaultKey, parseConvert) {
    super();
    if (defaultKey) { this.defaultKey = defaultKey; }
    if (parseConvert) { this.parseConvert = parseConvert; }
  }
  parseConvert = key => { return String.fromCharCode((96 <= key && key <= 105) ? key - 48 : key).toUpperCase(); }
  defaultKey = 0
  
  parse(names, state) {
    return loc(names[0], this.parseConvert(state));
  }
  getTip() {
    return loc('Click to make the next key press set the key.');
  }
  getColorStr() {
    return 'neatopurple';
  }
  onClick() {
    window.toChangeKeyBind = this.parent.key;
    Game.Notify(loc('Press a key to set!'), '');
  }
  default() {
    window.keyBindEvents.push(this.parent);
    return this.defaultKey;
  }
  triggerVarFunc() {

  }
  save() {
    return this.parent.state;
  }
  load(num) {
    this.parent.state = parseInt(num);
  }

  onKeyConfirmation(e) {
    this.assignState(e.keyCode);
    window.toChangeKeyBind = null;
    Game.Notify(loc('Key set: %1', e.key.toUpperCase()), '');
  }
}
AddEvent(window, 'keydown', function (e) {
  if (Game.promptOn) { return; }

  if (window.toChangeKeyBind) {
    CCCEMButtons[window.toChangeKeyBind].type.onKeyConfirmation(e);
    RedrawCCCEM();
    return;
  }

  for (let i in window.keyBindEvents) {
    if (window.keyBindEvents[i].state == e.keyCode) {
      if (window.keyBindEvents[i].updateVarFunc) { window.keyBindEvents[i].updateVarFunc.call(window.keyBindEvents[i], true); }
    }
  }
});

AddEvent(window, 'keyup', function (e) {
  for (let i in window.keyBindEvents) {
    if (window.keyBindEvents[i].state == e.keyCode) {
      if (window.keyBindEvents[i].updateVarFunc) { window.keyBindEvents[i].updateVarFunc.call(window.keyBindEvents[i], false); }
    }
  }
});
class savingModule extends buttonType {
  constructor(savingFunc, loadingFunc) {
    super();
    this.savingFunc = savingFunc ?? null;
    this.loadingFunc = loadingFunc ?? null;
    this.savingEnabled = true;
    this.loadingEnabled = true;
  }
  getColorStr() {
    return 'nonexistent';
  }
  default() {
    this.parent.nonInteractive = true;
    return '';
  }
  setSavingEnabled(enabled) {
    this.savingEnabled = enabled;
    return this;
  }
  setLoadingEnabled(enabled) {
    this.loadingEnabled = enabled;
    return this;
  }
  save() {
    if (!this.savingFunc || !this.savingEnabled) { 
      return null;
    }
    return this.savingFunc();
  }
  load(str) {
    if (!this.loadingFunc || !this.loadingEnabled) {
      return;
    }
    this.loadingFunc(str);
    if (this.parent.updateVarFunc) { this.parent.updateVarFunc.call(this.parent, this.parent.state); }
  }
}
class HTML extends buttonType {
  getColorStr() {
    return 'nonexistent';
  }
  default() {
    this.parent.nonInteractive = true;
    return null;
  }
}
class openExternal extends buttonType {
  constructor(url) {
    super();
    this.url = url;
  }
  parse(names) {
    return loc(names[0]) + '<span class="external"></span>';
  }
  onClick() {
    window.open(this.url, '_blank', 'noopener,noreferrer');
    l('devConsoleContent').classList.add('widthCapped');
    l('devConsoleContent').classList.add('fadeOut');
  }
  getTip() {
    return loc('Click to open external resource in a new tab.');
  }
}

class buttonInfo {
  constructor(header, content, icon) {
    this.header = loc(header);
    this.content = loc(content);
    this.icon = icon;
  }

  getTooltip(parentButton) {
    const tip = parentButton.type.getTip();
    let str = '<div style="position:absolute;left:1px;top:1px;right:1px;bottom:1px;background:linear-gradient(125deg,'+'rgba(50,40,40,1) 0%,rgba(50,40,40,0)'+' 20%);mix-blend-mode:screen;z-index:1;"></div><div style="z-index:10;padding:8px 4px;min-width:350px;position:relative;" id="tooltipCrate">'+
			'<div class="icon" style="float:left;margin-left:-8px;margin-top:-8px;'+writeIcon(this.icon)+'"></div>'+
			'<div class="name">'+this.header+'</div>'+
      '<div class="description" style="font-size: 10px;">'+loc('ID: %1', parentButton.key)+'</div>'+
			'<div class="line"></div><div class="description">'+this.content+'</div></div>'+
			(tip!=''?('<div class="line"></div><div style="font-size:10px;font-weight:bold;color:#999;text-align:center;padding-bottom:4px;line-height:100%;" class="crateTip">'+tip+'</div>'):'');
    return Game.getTooltip(str, 'cccemMenu', true);
  }
}
let devConsoleL = l('devConsole')
eval('Game.tooltip.update='+Game.tooltip.update.toString().replace('else', `else if (this.origin == 'cccemMenu') {
  if (!devConsoleL) { return false; } 
  X = devConsoleL.getBoundingClientRect().width;
  Y = Game.mouseY - 32;
  if (Game.onCrate) Y = Game.onCrate.getBounds().top-42;
  Y = Math.max(0,Math.min(Game.windowH-height-44,Y));
} else`));

class CCCEMExternalCategory extends buttonCategory {
  constructor(modCategoryName, modName, buttonsList, categoryToggleInfo, defaults) {
    const modKey = modCategoryName;
    super(modKey, 1000 + Object.keys(CCCEMCategories).length, buttonsList);

    if (CCCEMCategories['categoryTogglePanel'].has('optionsBatch'+modKey)) {
      CCCEMCategories['categoryTogglePanel'].has('optionsBatch'+modKey).hidden = false;
    } else {
      CCCEMCategories['categoryTogglePanel'].register(new CCCEMButton('optionsBatch'+modKey, modName+' options %1', 
        new categoryToggleButton(modKey),
        categoryToggleInfo
      ));
    }
    this.associatedToggleButton = CCCEMButtons['optionsBatch'+modKey];

    if (defaults) {
      defaults.call(this);
    }

    if (modDataSlotsYetToBeLoaded.has(modCategoryName)) {
      this.loadDataSlot(modDataSlotsYetToBeLoaded.get(modCategoryName));
      modDataSlotsYetToBeLoaded.delete(modCategoryName);
    }

    RedrawCCCEM();
  }
  external = true;

  addSaveData() {

  }
  dataSlot() {
    let obj = {};
    for (let i in this.buttons) {
      if (this.buttons[i].type.willSave) { obj[this.buttons[i].key] = this.buttons[i].save(); }
    }
    return obj;
  }
  loadDataSlot(obj, fromPreset) {
    for (let i in obj) {
      for (let ii in this.buttons) {
        if (this.buttons[ii].key == i && !(fromPreset && this.buttons[ii].ignorePreset)) { 
          this.buttons[ii].load(obj[i]);
          break;
        }
      }
    }
  }
  updateWatches() {
    for (let i in this.buttons) {
      this.buttons[i].updateStateFromWatch();
    }
  }
}
Game.registerHook('logic', function() {
  if (Game.T % 5 != 0) { return; }

  for (let i in CCCEMCategories) {
    if (!CCCEMCategories[i].external) { continue; }

    CCCEMCategories[i].updateWatches();
  }
});

function compileAllButtons() {
  for (let i in CCCEMCategories) {
    CCCEMCategories[i].setAssociatedButtonRedundantHideState();
  }
  const cats = Object.keys(CCCEMCategories)
    .map(k => CCCEMCategories[k])
    .filter(Boolean)
    .filter(cat => !cat.hidden);

  cats.sort((a, b) => {
    const oa = Number.isFinite(a.order) ? a.order : 0;
    const ob = Number.isFinite(b.order) ? b.order : 0;
    if (oa !== ob) return oa - ob;
    return (a.name || '').localeCompare(b.name || '');
  });

  let str = '';
  const gap = '<div class="line"></div>';
  for (const cat of cats) {
    const content = cat.compileButtons();
    if (content) {
      str += content + gap;
    }
  }
  str = str.slice(0, str.length - gap.length);
  return str;
}

var advancedMode = false;

new buttonCategory('interfaceBegin', 0, [
  new CCCEMButton('tryAgain', 'Try again',
    new resetButton(),
    new buttonInfo('Try again', 'Resets everything and starts another attempt.', [21, 6]),
    () => {
      ResetAll(1); if (hasHarbor && netcodeSettingsExport.hosting) { MacadamiaModList.cccem.mod.tryAgainRPC.send(); }
    }, true
  ),
  new CCCEMButton('resetKey','(%1)',
    new keySelectButton(82),
    new buttonInfo('Reset key select', 'Selects the key that restarts the current attempt on press.', [0, 8]),
    down => { if (!down) { return; } ResetAll(1); }
  ),
  new CCCEMButton('history','History',
    new pesudoInputButton(),
    new buttonInfo('Combo history', 'The history of your combo attempts in the current session.', [28, 26]),
    down => { openHistory(); }
  ),
]);

new buttonCategory('categoryTogglePanel', 1, [
  new CCCEMButton('optionsBatch2', 'Presets %1',
    new categoryToggleButton('presetSettings'),
    new buttonInfo('Options group: Presets', 'Options related to wide-spread setting changes. ', [27, 29]),
    null, true
  ),
  new CCCEMButton('optionsBatch3', 'Game settings options %1',
    new categoryToggleButton('gameSettings'),
    new buttonInfo('Options group: Game settings', 'Options related to the game\'s core features, including adjusting cookies, buildings, and lumps. ', [28, 29]),
  ),
  new CCCEMButton('optionsBatch4', 'Minigame options %1',
    new categoryToggleButton('minigameSettings'),
    new buttonInfo('Options group: Minigames', 'Options related to the four minigames. ', [28, 29]),
    null, true
  ),
  new CCCEMButton('optionsBatch5', 'Buff options %1',
    new categoryToggleButton('buffSettings'),
    new buttonInfo('Options group: Buffs', 'Settings related to starting golden cookie buffs', [28, 29])
  ),
  new CCCEMButton('optionsBatch6', 'GC options %1',
    new categoryToggleButton('gcSettings'),
    new buttonInfo('Options group: GCs', 'Options related to buffs and Golden cookies. Also includes many randomness-related options.', [28, 29]),
    null, true
  ),
  new CCCEMButton('optionsBatch7', 'Scoring & Evaluation options %1',
    new categoryToggleButton('evaluationSettings'),
    new buttonInfo('Options group: Evaluation', 'Options related to how an attempt is scored, encompassing the score and other stats.', [28, 29]),
    null, true
  ),
  new CCCEMButton('loadPForPause', 'Load P for Pause', 
    new triggerButton(),
    new buttonInfo('Load P for Pause', 'Loads the P for Pause mod, which enables you to speed up, slow down, and stop time.', [8, 35]),
    function() {
      window.__PForPauseDefaultHotkeysEnabled__ = false;
      Game.LoadMod(pForPausePath); if (hasHarbor) { MacadamiaModList.cccem.mod.loadModRPC.send({ path: pForPausePath }); } this.hidden = true;
    }
  ),
  new CCCEMButton('optionsBatchPForPause', 'P for Pause options %1',
    new categoryToggleButton('PForPause'),
    new buttonInfo('Extras: P for Pause', 'Options related to the P for Pause mod. ', [28, 26])
  ),
  new CCCEMButton('loadCastFinder', 'Load Cast Finder', 
    new triggerButton(),
    new buttonInfo('Load Cast Finder', 'Loads the Grimoire Cast Finder mod, which allows you to program specific strings of cast outcomes to find.<br>Disables the FtHoF button on load.', [17, 27]),
    function() {
      Game.LoadMod(castFinderPath); if (hasHarbor) { MacadamiaModList.cccem.mod.loadModRPC.send({ path: castFinderPath }); } this.hidden = true;
    }
  ),
  new CCCEMButton('optionsBatchCastFinder', 'Cast Finder options %1',
    new categoryToggleButton('CastFinder'),
    new buttonInfo('Extras: Cast Finder', 'Options related to the Cast Finder mod. ', [28, 26])
  ),
]);
CCCEMButtons['optionsBatchPForPause'].hidden = true;
CCCEMButtons['optionsBatchCastFinder'].hidden = true;

new buttonCategory('presetSettings', 3, [
  new CCCEMButton('importSettings', 'Import settings',
    new stringInputButton(null, ()=> {return ""}),
    new buttonInfo('Import settings', 'Imports a setting.', [2, 32]),
    s => { setSettings(s); freePreset(); }, { advanced: false }
  ),
  new CCCEMButton('exportSettings', 'Export settings',
    new readonlyDisplayButton(() => {
      return getSettingsCode();
    }),
    new buttonInfo('Export settings', 'Opens a prompt that allows you to store and reuse a setting for later.', [0, 32]), null,
     { advanced: false }
  ),
  new CCCEMButton('saveSave','%1 save',
    new boolButton(loc('Include'), loc('Exclude')),
    new buttonInfo('Export save', 'Whether the save currently used will be exported together with settings', [16, 5]),
    s => CCCEMButtons['importSave'].type.willSave = s, { advanced: false, ignorePreset: true, newLine: true }
  ),
  new CCCEMButton('revertPreset', 'Undo preset', 
    new triggerButton(),
    new buttonInfo('Undo preset', 'Revert your settings to what it was before.<br>Only records the settings before the most recent preset trigger.', [8, 15]),
    function() { 
      cancelActivePreset();
      CCCEMContainerModObj.load(b64_to_utf8(unescape(CCCEMButtons['revertPresetContainer'].state)), true);
      ResetAll();
      Game.CloseNotes();
      CCCEMButtons['revertPresetContainer'].state = '';
      this.hidden = true;
    }, { preNewLine: true, hidden: true }
  ),
  new CCCEMButton('revertPresetContainer', 'Undo preset', 
    new readonlyDisplayButton(),
    new buttonInfo('Savedata container', 'You are not supposed to see this.', [0, 0]),
    s => { 

    }, { preNewLine: true, ignorePreset: true, hidden: true }
  ),
  new CCCEMButton('editPreset', 'Edit settings', 
    new triggerButton(),
    new buttonInfo('Unlock settings', 'Unhides other settings, for further customization of the preset.', [15, 7]),
    () => { cancelActivePreset(); }, { hidden: true }
  ),
  new CCCEMButton('advancedMode', 'Advanced mode %1', 
    new boolButton(),
    new buttonInfo('Advanced mode', 'Reveal even more buttons and customization options.', [12, 27]),
    s => { advancedMode = s }, { ignorePreset: true }
  ),
  new CCCEMButton('blockBeginningDiv', 'M', 
    new HTML(),
    new buttonInfo('', 'Hidden option', [12, 27]),
    null, { newLine: '<div class="block">' }
  ),
], 'optionsBatch2'),
CCCEMButtons['exportSettings'].type.willSave = false;
CCCEMButtons['importSettings'].type.willSave = false;

new buttonCategory('gameSettings', 4, [
  new CCCEMButton('importSave', 'Import save',
    new stringInputButton(null, ()=> {return ""}),
    new buttonInfo('Import Save', 'Import a save of your own. Some settings will be overridden by the save\'s contents.', [24, 7]),
    function(s) {s = StripCCCEMData(s);
      this.state = s
      iniLoadSave = s
      CCCEMButtons['clearImportedSave'].hidden = false;
      if (!s) { 
        CCCEMButtons['clearImportedSave'].hidden = true;
        CCCEMButtons['clearImportedSave'].changeState(null);
        return;
      }
      const settingsOverriden = ['cookies', 'cookiesBTA', 'prestige', 'buildingCountAnchor'];
      for (let i in settingsOverriden) {
        CCCEMButtons[settingsOverriden[i]].hidden = true;
      }
    }, { advanced: false }
  ),
  new CCCEMButton('clearImportedSave', 'Clear imported save',
    new triggerButton(),
    new buttonInfo('Clear import', 'Remove the currently imported save, if any.', [24, 7]),
    function(s) {
      CCCEMButtons['importSave'].state = '';
      iniLoadSave = '';
      const settingsOverriden = ['cookies', 'cookiesBTA', 'prestige', 'buildingCountAnchor'];
      for (let i in settingsOverriden) {
        CCCEMButtons[settingsOverriden[i]].hidden = false;
      }
      this.hidden = true;
    }, { advanced: false }
  ),
  new CCCEMButton('iniSeed', 'Initial seed %1',
    new stringInputButton(),
    new buttonInfo('Initial seed', 'Seed to determine RNG outcomes, or leave as \'R\' for random. <br>Also requires either toggling on Force cast count or change FtHoF to \'random\'.', [25, 25]),
    s => iniSeed = s
  ),
  new CCCEMButton('cookies', 'Cookies %1',
    new numberInputButton(),
    new buttonInfo('Cookies', 'The amount of cookies you start with each attempt.', [10, 0]),
    s => iniC = s
  ),
  new CCCEMButton('cookiesBTA', 'CookiesBTA %1',
    new numberInputButton(),
    new buttonInfo('Cookies Baked All Time', 'The Cookies Baked All Time statistic. Tied to your prestige level.', [29, 4]),
    s => iniCE = s
  ),
  new CCCEMButton('prestige', 'Prestige %1',
    new numberInputButton(),
    new buttonInfo('Prestige', 'Sets the amount of prestige you have.', [20, 7]),
    s => iniP = s
  ),
  new CCCEMButton('lumps', 'Lumps %1',
    new numberInputButton(),
    new buttonInfo('Lumps', 'The amount of Sugar lumps you start with each attempt.', [29, 14]),
    s => iniLumps = s
  ),
  new CCCEMButton('lumpType', 'Lump type %1',
    new cycleButton(0, 4, e => ["Normal", "Bifurcated", "Golden", "Meaty", "Caramel"][e]),
    new buttonInfo('Lump type', 'The type of Sugar lump you start with each attempt.', [29, 27]),
    s => chooseLump = s
  ),
  new CCCEMButton('gcClickCount', '%1 Golden clicks',
    new numberInputButton(),
    new buttonInfo('Golden cookie click count', 'The amount of all time golden cookie clicks.', [23, 6]),
    s => GCCount = s
  ),
  new CCCEMButton('clickCooldown', 'Click cooldown %1ms',
    new numberInputButton(),
    new buttonInfo('Click cooldown', 'The minimum amount of milliseconds between each click.', [0, 15]),
    s => clickWait = s
  ),
  new CCCEMButton('buildingCountAnchor', 'Building count anchor %1',
    new numberInputButton(),
    new buttonInfo('Building count anchor', 'The amount of Cursors you start with each attempt. Other buildings scale off this value.', [33, 6]),
    s => iniBC = s, { advanced: false }
  ),
  new CCCEMButton('useEB', '%1',
    new boolButton(loc('Use Elder Battalion'), loc('No Elder Battalion')),
    new buttonInfo('Elder Battalion strategy', 'Changes the building distribution and scoring formula to better fit an Elder Battalion strategy.', [1, 25]),
    s => useEB = s, { advanced: false }
  ),
  new CCCEMButton('useRebuy', '%1',
    new boolButton(loc('Rebuy'), loc('No Rebuy')),
    new buttonInfo('Elder Battalion rebuy', 'Changes the building distribution to better fit a strategy rebuying after godzamok.', [1, 27]),
    s => useRebuy = s, { newLine: true, advanced: false }
  ),
  new CCCEMButton('buildingSelect', '%1:',
    new cycleButton(0, Object.keys(Game.Objects).length - 1, e => Game.ObjectsById[e].dname),
    new buttonInfo('Select building', 'The specific building to override or mute. Once overridden, the anchor will not affect this building.', [35, 33]),
    s => {
      CCCEMButtons['overridingNumber'].changeState(manualBuildings[s]);
      CCCEMButtons['muteBuilding'].changeState(muteBuildings[s]);
    }, { advanced: false, preNewLine: true }
  ),
  new CCCEMButton('overridingNumber', 'Overriding number %1',
    new numberInputButton(),
    new buttonInfo('Overriding count', 'The number of that building you start with each attempt. An assignment of 0 disables override.', [29, 21]),
    s => { manualBuildings[get('buildingSelect')] = s; }, { advanced: false }
  ),
  new CCCEMButton('muteBuilding', '%1',
    new boolButton(loc('Muted'), loc('Unmuted')),
    new buttonInfo('Mute', 'Whether a building should start muted. Minigames will always unmute unless that option is disabled.', [28, 6]),
    s => { muteBuildings[get('buildingSelect')] = s?1:0; }
  ),
  new CCCEMButton('unmuteMinigames', 'Minigame %1',
    new boolButton('Unmuted', 'Muteable'),
    new buttonInfo('Unmute minigames', 'Forces minigames to be unmuted on reset. If disabled, minigames can be freely muted and unmuted with the mute option.', [23, 15]),
    s => unmuteMinigames = s, true
  ),
  new CCCEMButton('wizCount', 'Wizard towers %1',
    new numberInputButton(),
    new buttonInfo('Wizard towers', 'The amount of Wizard towers you start with each attempt.', [17, 0]),
    s => { wizCount = s; }, { advanced: false }
  ),
  new CCCEMButton('wizLevel', 'Tower Level %1',
    new numberInputButton(),
    new buttonInfo('Tower Level', 'The level of Wizard towers you start with each attempt.', [17, 26]),
    s => { wizLevel = s; }, { newLine: true, advanced: false }
  ),
  new CCCEMButton('buyOption1', '%1',
    new cycleButton(0, 1, e => e ? 'Sell' : 'Buy'),
    new buttonInfo('Sell/Buy select', 'Selects whether you are selecting \'Sell\' or \'Buy\' on the building list with the start of each attempt.', [9, 9]),
    s => { buyOption1 = s; }, { advanced: false }
  ),
  new CCCEMButton('buyOption2', '%1',
    new cycleButton(2, 5, e => (e > 4 ? loc('All') : String(Math.pow(10, e - 2)))),
    new buttonInfo('Sell/Buy amount', 'Selects the bulk-buying amount you are selecting at the start of each attempt.', [1, 6]),
    s => { buyOption2 = s; }, { advanced: false }
  ),
  new CCCEMButton('heraldsOverride', 'Herald override %1', 
    new boolButton(),
    new buttonInfo('Heralds override', 'Whether or not to override the amount of heralds to a fixed value.', [21, 29]),
    s => { if (!CCCEMButtons['heraldsOverride'].hidden) { 
        CCCEMButtons['heraldsN'].hidden = !s; 
        if ((!s) && Game.realExternalDataLoaded && Game.UpdateHeralds) { Game.UpdateHeralds(); } else if (s) { CCCEMButtons['heraldsN'].type.triggerVarFunc(); } 
        RedrawCCCEM();
      } 
    }
  ),
  new CCCEMButton('heraldsN', 'Heralds %1',
    new numberInputButton(),
    new buttonInfo('Heralds', 'Changes the amount of Heralds you have.<br>Max 100, usually around 100.', [21, 29]),
    s => { if (get('heraldsOverride') || !Game.realExternalDataLoaded) { Game.heralds = s; l('heraldsAmount').textContent = s; Game.recalculateGains = 1; } }, { hidden: true }
  ),
  new CCCEMButton('leftAura', 'Left Aura %1',
    new cycleButton(0, 21, e => Game.dragonAuras[e].name, {
      1: 'bom',
      3: 'eb',
      4: ['dh', 'dragon harvest', 'rof', 'x15', 'x17'],
      9: 'aa',
      10: ['df', 'x1111', 'x1223'],
      13: 'em',
      14: 'mom',
      15: ['ra', 'x2 cps'],
      16: ['fortune', '123'],
      18: 'rb',
      19: ['do', 'orbs'],
      20: 'si',
      21: ['dg', 'guts']
    }),
    new buttonInfo('Left Aura', 'The Dragon Aura you start with for the slot on the left.', [2, 25]),
    s => { d2Aura = s; }
  ),
  new CCCEMButton('rightAura', 'Right Aura %1',
    new cycleButton(0, 21, e => Game.dragonAuras[e].name, {
      1: 'bom',
      3: 'eb',
      4: ['dh', 'dragon harvest', 'rof', 'x15', 'x17'],
      9: 'aa',
      10: ['df', 'x1111', 'x1223'],
      13: 'em',
      14: 'mom',
      15: ['ra', 'x2 cps'],
      16: ['fortune', '123'],
      18: 'rb',
      19: ['do', 'orbs'],
      20: 'si',
      21: ['dg', 'guts']
    }),
    new buttonInfo('Right Aura', 'The Dragon Aura you start with for the slot on the right.', [8, 25]),
    s => { d1Aura = s; }
  ),
  new CCCEMButton('fortuneChance', 'Fortune chance: %1%',
    new numberInputButton(0),
    new buttonInfo('Fortune chance', 'The chance for a natural News ticker scroll to be a Fortune. No O fortuna: 2%. Enter in terms of percentage.', [10, 32]),
    s => { forceFortune = s / 100; }
  ),
  new CCCEMButton('fortuneClaim', 'Fortune %1 claimed',
    new boolButton(loc('already'), loc('not yet')),
    new buttonInfo('Fortune claim', 'Whether or not the GC fortune (Today is your lucky day!) has already been claimed (and thus won\'t appear again).', [10, 32]),
    s => { fortuneG = s; }
  ),
  new CCCEMButton('startingSeason', 'Starting season: %1',
    new seasonalCycleButton(),
    new buttonInfo('Starting season', 'The season that you start with upon trying again.', [16, 6]),
    s => { setSeason = s; }
  ),
  new CCCEMButton('scriedSeason', 'Scried season: %1',
    new seasonalCycleButton(),
    new buttonInfo('Scried season', 'The season that the starting effect is scried (or predicted) in.', [16, 6]),
    s => { initCastFindSeason = (s === 210 ? null : s); }
  ),
  new CCCEMButton('reindeerCount', 'Popped %1 reindeer',
    new numberInputButton(),
    new buttonInfo('Reindeers popped', 'The amount of reindeers popped.', [12, 9]),
    s => { iniRein = s; }
  ),
  new CCCEMButton('pledgeStatus', 'Elder Pledge %1',
    new boolButton(),
    new buttonInfo('Elder Pledge activity', 'Whether of not Elder Pledge is active.', [9, 9]),
    s => { setPledge = s; }
  ),
  new CCCEMButton('prefsRecord', 'Record game settings', 
    new triggerButton(),
    new buttonInfo('Record game settings in options', 'Makes all subsequent resets set the game settings (as in the options in the options menu) to be the options at the time of clicking.', [11, 10]),
    function() {
      this.state = getPrefsCompilation();
      Game.Notify('Game settings recorded!', 'You will get the same settings when you use try again.', 0);
    }, { advanced: false }
  )
], 'optionsBatch3');
CCCEMCategories.gameSettings.complexityHideImmune = false;
CCCEMButtons['buildingSelect'].type.willSave = false;
CCCEMButtons['overridingNumber'].type.willSave = false;
CCCEMButtons['muteBuilding'].type.willSave = false;
CCCEMButtons['prefsRecord'].state = {};

var dataLoaded = Game.externalDataLoaded;
if (dataLoaded) { 
  CCCEMButtons['heraldsOverride'].hidden = false;
  CCCEMButtons['heraldsN'].hidden = true;
}
Game.registerHook('check', function() {
  if (Game.realExternalDataLoaded && !dataLoaded) { 
    CCCEMButtons['heraldsOverride'].hidden = false;
    if (!get('heraldsOverride')) { CCCEMButtons['heraldsN'].hidden = true; }
    dataLoaded = true;
  }
});
Game.realExternalDataLoaded = Game.externalDataLoaded;
if (Game.UpdateHeralds) { eval('Game.UpdateHeralds='+Game.UpdateHeralds.toString().replaceAll('Game.externalDataLoaded=true;', 'Game.externalDataLoaded=true; Game.realExternalDataLoaded=true;')); } 
Game.externalDataLoaded = true;
if (Game.UpdateHeralds) { Game.UpdateHeralds(); }

const plantAliases = {
  1: 'bw', 
  2: 'tc',
  3: 'cr', 
  4: 'gm',
  5: 'cl',
  6: ['gc', 'gclover', 'clover'],
  7: 'sl',
  8: 'ew',
  9: 'bb',
  10: 'ch',
  11: ['wch', 'wc'],
  12: 'wm',
  13: 'bm',
  14: 'mw',
  15: 'wb',
  16: 'ci',
  17: ['nt', 'tulip', 'ntulip'],
  18: ['df', 'fern'],
  19: 'wl',
  20: ['km', 'moss'],
  21: 'qb',
  22: 'jqb', 
  23: ['duke', 'tater', 'dt'],
  24: 'gl',
  25: 'cc',
  26: ['fb', 'bolete'],
  27: 'wg',
  28: 'gr',
  29: 'sb',
  30: ['tg', 'grass'], 
  31: 'ed', 
  32: 'ic'
};
let offsetPlantAlises = {};
for (let i in plantAliases) {
  offsetPlantAlises[parseInt(i) - 1] = plantAliases[i];
}

new buttonCategory('minigameSettings', 5, [
  new CCCEMButton('forceFtHoF', 'Force the Hand of Fate outcome: %1',
    new cycleButton(0, FtHoFOutcomes.length - 1, e => loc(FtHoFOutcomesMap[FtHoFOutcomes[e]]), e => allGCAndBuffsMap[FtHoFOutcomesMap[FtHoFOutcomes[e]]]),
    new buttonInfo('FtHoF outcome', 'The outcome of the first Force the Hand of Fate cast upon starting an attempt.', [27, 11]),
    s => { forceFtHoF = FtHoFOutcomes[s]; }, { advanced: false, newLine: true }
  ),
  new CCCEMButton('forceCastToggle', 'Force cast count %1',
    new boolButton('On', 'Off'),
    new buttonInfo('Force cast count', 'Forces the Grimoire\'s Spells casted all time stat to be whatever you choose.', [22, 11]),
    s => { forcedCastCount[1] = s; }
  ),
  new CCCEMButton('forcedCastValue', 'Forced cast count %1',
    new numberInputButton(),
    new buttonInfo('Forced cast count', 'The value to assign to the Grimoire\'s Spells casted all time.', [30, 5]),
    s => { forcedCastCount[0] = s; }
  ),
  new CCCEMButton('gardenLevel', 'Farm Level %1',
    new numberInputButton(),
    new buttonInfo('Farm Level', 'The level of your Farm, which controls the size of your garden.', [2, 26]),
    s => { gardenLevel = s; }, { advanced: false }
  ),
  new CCCEMButton('gardenSeed', 'Holding %1',
    new cycleButton(-1, 33, e => {
      if (e == -1) { return 'Nothing'; }
      const mg = Game.Objects['Farm'].minigame;
      if (!mg) { return ''; }
      return mg.plantsById[e].name;
    }, offsetPlantAlises),
    new buttonInfo('Holding seed', 'The seed you are holding.', [0, 0]),
    s => { gardenSeed = s; }
  ),
  new CCCEMButton('gardenRotation', 'Rotation %1',
    new cycleButton(0, 4, e => loc(['random', 'bottom', 'top', 'left', 'right'][e])),
    new buttonInfo('Rotation', 'The orientation of the garden upon starting an attempt.', [28, 18]),
    s => { setGardenR = s; }
  ),
  new CCCEMButton('gardenFrozen', 'Garden %1',
    new boolButton('frozen', 'unfrozen'),
    new buttonInfo('Freeze', 'Whether or not the garden is frozen initially.', [13, 10]),
    s => { setGardenR = s; }
  ),
  new CCCEMButton('toNextTick', 'Tick %1s',
    new numberInputButton(),
    new buttonInfo('Tick', 'Progress to next tick in seconds.', [24, 18]),
    s => { toNextTick = s; }
  ),
  new CCCEMButton('plant1', 'Plant 1 %1',
    new cycleButton(0, 34, e => loc(e?Game.Objects['Farm'].minigame.plantsById[e - 1].name:'Nothing'), plantAliases),
    new buttonInfo('Plant 1', 'One of the plants in the garden at the start of each attempt.', [26, 20]),
    s => { gardenP1[0] = s; }
  ),
  new CCCEMButton('plant1Age', 'Plant 1 age %1',
    new gardenPlantAgeSetButton(),
    new buttonInfo('Plant 1 age', 'The age of the first plant at the start of each attempt.', [25, 20]),
    s => { gardenP1[1] = s; }, true
  ),
  new CCCEMButton('gTulips', '%1 Ghost Tulips',
    new boolButton(loc('Add'), loc('No')),
    new buttonInfo('Ghost Tulips', 'Adds ghost tulips in addition to other specified plants. Useful for starting an attempt in the middle of a combo, after you would already have replanted.', [26, 20])
  ),
  new CCCEMButton('plant2', 'Plant 2 %1',
    new cycleButton(0, 34, e => loc(e?Game.Objects['Farm'].minigame.plantsById[e - 1].name:'Nothing'), plantAliases),
    new buttonInfo('Plant 2', 'The other plant in the garden at the start of each attempt.', [26, 20]),
    s => { gardenP2[0] = s; }
  ),
  new CCCEMButton('plant2Age', 'Plant 2 age %1',
    new gardenPlantAgeSetButton(),
    new buttonInfo('Plant 2 age', 'The age of the second plant at the start of each attempt.', [25, 20]),
    s => { gardenP2[1] = s; }, true
  ),
  new CCCEMButton('office', 'Office level %1',
    new cycleButton(0, 5, e => (e + 1)),
    new buttonInfo('Office', 'The Stock market Office level. The office level determines the amount of loans available.', [18, 33]),
    s => { officeL = s; }
  ),
  new CCCEMButton('diamondGod', 'Diamond %1',
    new cycleButton(0, 10, e => loc(['Holobore', 'Vomitrax', 'Godzamok', 'Cyclius', 'Selebrak', 'Dotjeiess', 'Muridal', 'Jeremy', 'Mokalsium', 'Skruuia', 'Rigidel'][e]), { 5: 'js' }),
    new buttonInfo('Pantheon Diamond slot', 'The god slotted within the Diamond slot of the Pantheon at the start of each attempt.', [23, 15]),
    s => { spirit1 = s; }, { advanced: false }
  ),
  new CCCEMButton('rubyGod', 'Ruby %1',
    new cycleButton(0, 10, e => loc(['Holobore', 'Vomitrax', 'Godzamok', 'Cyclius', 'Selebrak', 'Dotjeiess', 'Muridal', 'Jeremy', 'Mokalsium', 'Skruuia', 'Rigidel'][e]), { 5: 'js' }),
    new buttonInfo('Pantheon Ruby slot', 'The god slotted within the Ruby slot of the Pantheon at the start of each attempt.', [25, 18]),
    s => { spirit2 = s; }, { advanced: false }
  ),
  new CCCEMButton('jadeGod', 'Jade %1',
    new cycleButton(0, 10, e => loc(['Holobore', 'Vomitrax', 'Godzamok', 'Cyclius', 'Selebrak', 'Dotjeiess', 'Muridal', 'Jeremy', 'Mokalsium', 'Skruuia', 'Rigidel'][e]), { 5: 'js' }),
    new buttonInfo('Pantheon Jade slot', 'The god slotted within the Jade slot of the Pantheon at the start of each attempt.', [27, 18]),
    s => { spirit3 = s; }, { advanced: false }
  )
], 'optionsBatch4');
CCCEMCategories.minigameSettings.complexityHideImmune = false;

function getProperBuffName(buff) {
  const buffDisambiguator = {
    'building buff': 'Building special',
    'building debuff': 'Building rust'
  };
  if (buffDisambiguator[buff.name]) { return loc(buffDisambiguator[buff.name]); }
  try { return loc(buff.func(1, 1)?.name); }
  catch { return loc(buff.name); }
}
new buttonCategory('buffSettings', 6, [
  new CCCEMButton('buffs', 'Buffs',
    new stringInputButton(null, () => {
      return BuffsDesc(get('buffs'))
    }),
    new buttonInfo('Starting buffs', 'The buffs you will start with when you reset. Can import/export in both the format the textbox gives and the collapsed format (which saving uses)', [10, 25]),
    s => {s = MakeBuffsStr(s)
      let hide = s?false:true
      let len = s.split(";").length-1
      CCCEMButtons['buffs'].state = s
      CCCEMButtons['removeType'].hidden=hide
      //CCCEMButtons['removeBuff'].hidden=hide
      CCCEMButtons['clearBuffs'].hidden=hide
      CCCEMButtons['removeType'].type.max = Math.max(len-1,0)
      if (len) {
        CCCEMButtons['removeType'].state = Math.max(0, len-2)
        if (CCCEMButtons['removeType'].updateVarFunc) { CCCEMButtons['removeType'].updateVarFunc(); }
      }
    }, { advanced: false }
  ),
  new CCCEMButton('snapBuffs', 'Snapshot buffs',
    new triggerButton(),
    new buttonInfo('Snapshot', 'Will alter your starting buff settings to be the buffs you currently have active.', [30, 20]),
    () => CCCEMButtons['buffs'].changeState(ExportBuffs()), { newLine: true, advanced: false }
  ),
  new CCCEMButton('buffType', 'Add buff',
    new cycleButton(0, Game.buffTypes.length-1, e => {
      return getProperBuffName(Game.buffTypes[e]);
    }, e => allGCAndBuffsMap[getProperBuffName(Game.buffTypes[e])]),
    new buttonInfo('Add buff', 'Which type of buff to add. BS type is selectable after cycling to building buff or building debuff.', [0, 14]),
    s => {
      let name=""
      if ((s==9 || s==10) && get('buffObj') >= 0) {
        let obj=Game.ObjectsById[get('buffObj')].name; 
        name=loc(Game.goldenCookieBuildingBuffs[obj][s-9])} 
      else {
        name=Game.buffTypes[s].name
        }
      CCCEMButtons['buffObj'].hidden = (s==9 || s==10)?false:true
      RedrawCCCEM();
      }, { advanced: false }
  ),
  new CCCEMButton('buffObj', 'Cycle BS',
    new cycleButton(-1, Object.keys(Game.goldenCookieBuildingBuffs).length-1, e => loc(Game.goldenCookieBuildingBuffs[e])),
    new buttonInfo('Cycle BS type', 'Cycle through BS types. If left at Building Buff or Building Debuff, a random one will be selected', [4, 14]),
    () => CCCEMButtons['buffType'].updateVarFunc(get('buffType')), { advanced: false, hidden: true }
  ),
  new CCCEMButton('addBuff', 'Confirm add %1',
    new triggerButton(),
    new buttonInfo('Add starting buff', 'Will add another starting buff based on the subsequent settings (incl type, max time, time, power, BS type)', [33, 25]),
    () => AddStartBuff(get('buffType'), get('buffMaxTime'), get('buffTime'), get('buffPow'), get('buffObj')), { newLine: true, advanced: false }
  ),
  new CCCEMButton('buffMaxTime', 'Max Time %1',
    new numberInputButton(),
    new buttonInfo('Maximum buff duration', 'How much maximum time the added buff has, if left at 0 the buff default will be used.', [23, 11]),
    null
  ),
  new CCCEMButton('buffTime', 'Time %1',
    new numberInputButton(),
    new buttonInfo('Buff duration', 'How much remaining time the added buff has, if left at 0 max time will be used.', [23, 11]),
    null, { advanced: false }
  ),
  new CCCEMButton('buffPow', 'Power %1',
    new numberInputButton(),
    new buttonInfo('Buff power', 'This is used to determine the strength of the added buff, if left at 0 the buff default will be used.', [30, 5]),
    null, { newLine: true }
  ),
  new CCCEMButton('removeType', 'Select buff to remove',
    new cycleButton(0, 0, e => {
      const buff = Game.buffTypesByName[Game.buffTypes[get('buffs').split(';')[e].split(',')[0]].name];

      return getProperBuffName(buff);
    }, e => allGCAndBuffsMap[getProperBuffName(Game.buffTypesByName[Game.buffTypes[get('buffs').split(';')[e].split(',')[0]].name])]),
    new buttonInfo('Cycle current buffs', 'Will cycle through all the buffs you are starting with, so that one can be removed with the remove buff button.', [0, 15]),
    s => {if (s) CCCEMButtons['removeBuff'].state=getProperBuffName[Game.buffTypesByName[Game.buffTypes[get('buffs').split(';')[s].split(',')[0]].name]]; CCCEMButtons['removeBuff'].hidden = false; },
    { hidden: true }
  ),
  new CCCEMButton('removeBuff', 'Confirm remove %1',
    new triggerButton(),
    new buttonInfo('Remove starting buff', 'Remove one starting buff. All current starting buffs can be cycled through with the cycle remove button.', [33, 24]),
    () => RemoveStartBuff(get("removeType")), { hidden: true }
  ),
  new CCCEMButton('clearBuffs', 'Clear buffs',
    new triggerButton(),
    new buttonInfo('Clear starting buffs', 'Will remove all starting buffs, making you have no buffs when resetting', [0, 31]),
    () => CCCEMButtons['buffs'].changeState(""), { advanced: false, hidden: true }
  )
], 'optionsBatch5');
CCCEMCategories.buffSettings.complexityHideImmune = false;
for (let i in CCCEMCategories["buffSettings"].buttons) {
  CCCEMCategories["buffSettings"].buttons[i].type.willSave=false
  };
CCCEMButtons['buffs'].type.willSave=true
CCCEMButtons['buffs'].type.heading=loc('Buffs')
CCCEMButtons['buffs'].type.subHeading=loc('Buffs that will be active when you reset');

new buttonCategory('gcSettings', 7, [
  new CCCEMButton('seedNats', 'Seeding GC %1',
    new boolButton(),
    new buttonInfo('Seeded natural Golden cookies toggle', 'Whether naturally spawned Golden cookies will have their effects be determined by the current game seed.', [22, 6]),
    s => { seedNats = s; }
  ),
  new CCCEMButton('seedTicker', 'Seeding News %1',
    new boolButton(),
    new buttonInfo('Seeded News ticker messages toggle', 'Whether Fortune appearances in the News ticker are seeded by the current game seed.', [29, 8]),
    s => { seedTicker = s; }
  ),
  new CCCEMButton('gSwitch', 'Golden Switch %1',
    new boolButton(),
    new buttonInfo('Golden switch state', 'Whether golden switch will start on or off', [20, 10]),
    null, true
  ),
  new CCCEMButton('iniSpawn', 'Natural GC %1',
    new boolButton(),
    new buttonInfo('Initial natural Golden cookie spawn toggle', 'Whether a Golden Cookie will spawn at the start of each attempt.', [23, 6]),
    function (s) {
      iniSpawn = s;
      CCCEMButtons['iniSpawnTimer'].hidden = s;
    }, { advanced: false }
  ),
  new CCCEMButton('iniSpawnTimer', 'Nat spawn timer: %1',
    new numberInputButton(),
    new buttonInfo('Natural spawn timer', 'The amount of time after each reset for the first Golden cookie to naturally spawn (in frames, this game is 30 fps).', [22, 6]),
    s => { iniTimer = s; }, { advanced: false }
  ),
  new CCCEMButton('iniDO', 'Dragon Orbs %1',
    new boolButton(),
    new buttonInfo('Initial Dragon Orbs spawn toggle', 'Whether a Golden cookie from Dragon Orbs usage will spawn at the start of each attempt.', [33, 25]),
    s => { iniDO = s; }
  ),
  new CCCEMButton('iniDEoRL', 'DEoRL %1',
    new boolButton(),
    new buttonInfo('Initial Distilled Essence of Redoubled Luck spawn toggle', 'Whether an invoke of DEoRL at the start of each attempt will be successful.', [27, 12]),
    s => { iniDEoRL = s; }
  ),
  new CCCEMButton('iniGC', 'GC1 %1',
    new twoStepCycle(-1, 27, e => (e === -1 ? 'R' : Game.goldenCookieChoices[e-1]), e => allGCAndBuffsMap[Game.goldenCookieChoices[e-1]]),
    new buttonInfo('First Golden cookie effect', 'The (guaranteed) effect of the Golden cookie from the initial natural Golden cookie spawn.', [0, 10]),
    s => { s=(s%2 === 0)?s-1:s;
      CCCEMButtons['iniGC'].state=s}, { advanced: false }
  ),
  new CCCEMButton('iniGC2', 'GC2 %1',
    new twoStepCycle(-1, 27, e => (e === -1 ? 'R' : Game.goldenCookieChoices[e-1]), e => allGCAndBuffsMap[Game.goldenCookieChoices[e-1]]),
    new buttonInfo('Second Golden cookie effect', 'The (guaranteed) effect of the Golden cookie from the initial Dragon Orbs Golden cookie spawn.', [1, 10]),
    s => { s=(s%2 === 0)?s-1:s;
      CCCEMButtons['iniGC2'].state=s}
  ),
  new CCCEMButton('iniGC3', 'GC3 %1',
    new twoStepCycle(-1, 27, e => (e === -1 ? 'R' : Game.goldenCookieChoices[e-1]), e => allGCAndBuffsMap[Game.goldenCookieChoices[e-1]]),
    new buttonInfo('Third Golden cookie effect', 'The (guaranteed) effect of the Golden cookie from the initial, successful invoke of DEoRL.', [2, 10]),
    s => { s=(s%2 === 0)?s-1:s;
      CCCEMButtons['iniGC3'].state=s}
  ),
  new CCCEMButton('boughtSF', 'Sugar frenzy %1',
    new boolButton(loc('used'), loc('unused')),
    new buttonInfo('Sugar frenzy state', 'Whether sugar frenzy has been used before, determining whether it is available to use.', [22, 17]),
    s => { boughtSF = s; }
  ),
  new CCCEMButton('boughtCE', 'Chocolate egg %1',
    new boolButton(loc('bought'), loc('available')),
    new buttonInfo('Chocolate egg purchasability', 'Whether chocolate egg has been purchased already, thus determining whether it can be purchased again.', [18, 12]),
    s => { boughtCE = s; }
  ),
  new CCCEMButton('DFChanceMult', 'Dragonflight chance x%1',
    new numberInputButton(),
    new buttonInfo('Dragonflight chance', 'Sets a multiplier to Dragonflight (buff) chance.', [5, 25]),
    s => { DFChanceMult = s; }, { advanced: false }
  ),
  new CCCEMButton('gcRateMult', 'Golden cookie spawnrate x%1',
    new numberInputButton(),
    new buttonInfo('Golden cookie spawnrate', 'Sets a multiplier to the spawn rate of golden cookies.', [10, 14]),
    s => { gcRateMult = s; }
  )
], 'optionsBatch6');
CCCEMCategories.gcSettings.complexityHideImmune = false;
CCCEMButtons['iniSpawnTimer'].hidden = true;

const EVALUATION_UI_ENABLED = false;
new buttonCategory('evaluationSettings', 8, [
  new CCCEMButton('documentationLink', 'Help & Documentation regarding this section', 
    new openExternal('https://cursedsliver.github.io/CCCEM/scorecode-doc'),
    new buttonInfo('Documentation', 'Opens a link to the documentation for this section.', [0, 22.5]),
    null, { newLine: true, hidden: !EVALUATION_UI_ENABLED }
  ),
  new CCCEMButton('manageTrackers', 'Manage trackers', 
    new trackerManagementButton(),
    new buttonInfo('Manage trackers', 'Create and edit trackers used for scoring and tracking stats within an attempt.', [0, 22.5]),
    null, { newLine: true, hidden: !EVALUATION_UI_ENABLED }
  ),
  new CCCEMButton('viewWatchers', 'View watchers', 
    new watcherViewButton(),
    new buttonInfo('View watchers', 'View watchers', [0, 22.5]),
    null, { hidden: !EVALUATION_UI_ENABLED }
  ),
  new CCCEMButton('exportTrackers', 'Export trackers',
    new readonlyDisplayButton(() => {
      return stringifyAllTrackers();
    }),
    new buttonInfo('Export trackers', 'Exports the current state of all trackers in a string format that can be imported back with the import button. This includes all information about the trackers, including their type, so it can be used to transfer trackers between saves.', [0, 22.5]),
    null, { hidden: !EVALUATION_UI_ENABLED }
  ),
  new CCCEMButton('importTrackers', 'Import trackers',
    new stringInputButton(),
    new buttonInfo('Import trackers', 'Imports trackers from a data string. This will overwrite all current trackers, so be careful when using this. The string format is the same as the one given by the export button.', [0, 22.5]),
    s => {
      const prevState = CCCEMButtons['immunizeTrackerImports'].state;
      try {
        CCCEMButtons['immunizeTrackerImports'].state = false;
        createTrackersFromData(s);
        CCCEMButtons['immunizeTrackerImports'].state = prevState;
        RedrawCCCEM();
        Game.Notify('Trackers imported!', 'Your trackers have been successfully imported from the provided data string.', 0);
      } catch (e) {
        CCCEMButtons['immunizeTrackerImports'].state = prevState;
        Game.Notify('Import failed', 'The provided string could not be parsed as valid tracker data.', 0);
      }
    }, { hidden: !EVALUATION_UI_ENABLED }
  ),
  new CCCEMButton('visualizeTrackers', 'Visualizer %1',
    new boolButton(),
    new buttonInfo('Tracker visualizer', 'Whether to show the tracker visualizer, which shows and updates with the current state of all trackers.', [0, 22.5]),
    s => {
      if (!window.CCCEMStatsPanelLoaded) { return; }
      if (s) {
        l('cccemStatsPanel').style.display = '';
        l('cccemStatsShowBtn').style.display = '';
      } else {
        l('cccemStatsPanel').style.display = 'none';
        l('cccemStatsShowBtn').style.display = 'none';
      }
    }, { newLine: true, hidden: !EVALUATION_UI_ENABLED }
  ),
  new CCCEMButton('immunizeTrackerImports', 'Immunize imports %1',
    new boolButton(),
    new buttonInfo('Immunize tracker imports', 'Prevents trackers from being overridden by other sources, such as settings. This setting will not save.', [0, 22.5]),
    null, { ignorePreset: true, newLine: true, hidden: true }
  ), 
  new CCCEMButton('editStats', 'Edit stats', 
    new statManagementButton(),
    new buttonInfo('Edit stats', 'Create and edit stats that can be called by trackers to track custom information within an attempt.', [0, 22.5]),
    null, { hidden: !EVALUATION_UI_ENABLED }
  ),
  new CCCEMButton('freezeStats', 'Freeze stats', 
    new triggerButton(),
    new buttonInfo('Freeze stats', 'Make the stats of all existing combo attempts permanently immune to further changes to the stat types. Will erase stat descriptions.', [0, 22.5]),
    () => { 
      putAllStatsInStorage();
    }, { hidden: !EVALUATION_UI_ENABLED }
  ),
  new CCCEMButton('exportStats', 'Export stats',
    new readonlyDisplayButton(() => {
      return exportStats();
    }),
    new buttonInfo('Export stats', 'Exports stats', [0, 12.5]),
    null, { hidden: !EVALUATION_UI_ENABLED }
  ),
  new CCCEMButton('importStats', 'Import stats',
    new stringInputButton(),
    new buttonInfo('Import stats', 'Imports stats', [0, 11.5]),
    s => { 
      importStats(s);
    }, { newLine: true, hidden: !EVALUATION_UI_ENABLED }
  ),
  new CCCEMButton('scoreMult', 'Score mult x%1',
    new numberInputButton(),
    new buttonInfo('Correction value', 'The value the score should be multiplied by to better match standard values.', [16, 5]),
    s => scoreCorVal = s, { advanced: false }
  ),
  new CCCEMButton('scoreMultVerify', 'Score info %1',
    new boolButton(),
    new buttonInfo('Score correction notifications', 'Whether to notify when the score does not conform to the baseline.', [1, 7]),
    s => scoreCorNotify = s, { advanced: false }
  )
], 'optionsBatch7');
CCCEMButtons['exportTrackers'].type.willSave = false;
CCCEMButtons['importTrackers'].type.willSave = false;
CCCEMButtons['immunizeTrackerImports'].type.willSave = false;
CCCEMButtons['exportStats'].type.willSave = false;
CCCEMButtons['importStats'].type.willSave = false;
window.ENABLE_EVALUATION_UI = function() {
  const buttons = ['documentationLink', 'manageTrackers', 'viewWatchers', 'exportTrackers', 'importTrackers', 'visualizeTrackers', 'immunizeTrackerImports', 'editStats', 'freezeStats', 'exportStats', 'importStats'];
  buttons.forEach(e => CCCEMButtons[e].hidden = false);
}

new buttonCategory('savingControls', 1e6, [
  new CCCEMButton('saveSettings', 'Save current settings',
    new limeButton(),
    new buttonInfo('Save current settings', 'Saves the settings in the CCCEM interface to the save before CCCEM was loaded, as mod data.<br>You can change the saved setting by saving again.<br>You can remove it by clearing mod data with the options menu while CCCEM is not loaded.', [25, 7]),
    () => { customSave(); }
  ),
  new CCCEMButton('autosave', 'Auto save %1',
    new boolButton(),
    new buttonInfo('Auto Save', 'If on, the game will save CCCEM settings (identical to pressing the Save current settings button) every minute.', [26, 7]),
    s => autoSaveCCCEM = s
  ),
  new CCCEMButton('quit', 'Exit practice',
    new limeButton(),
    new buttonInfo('Exit practice mode', 'Unloads CCCEM without saving its current setting, returning you to your original save.', [2, 7]),
    () => { Game.toReload = true; }, { hidden: !App || !window.locally_hosted, preNewLine: true }
  ),
  new CCCEMButton('saveAndQuit', 'Save and Exit',
    new limeButton(),
    new buttonInfo('Save and exit', 'Saves CCCEM settings, then unloads the changes, returning you to your original save.', [2, 7]),
    () => { customSave(); Game.toReload = true; }, { hidden: !App || !window.locally_hosted }
  ),
  new CCCEMButton('buildingRelatedSaveData', '', 
    new savingModule(() => {
      return manualBuildings.join('_') + ',' + muteBuildings.join('_');
    }, str => {
      let strs = str.split(',');
      let manualB = strs[0].split('_');
      for (let i in manualB) {
        manualBuildings[i] = parseInt(manualB[i]);
      }
      let mutes = strs[1].split('_');
      for (let i in mutes) {
        muteBuildings[i] = parseInt(mutes[i]);
      }
      CCCEMButtons['buildingSelect'].changeState(get('buildingSelect'), 1);
    }), new buttonInfo('Building related info save', 'Saves building override and mute related information (hidden button)', [0, 0])
  ),
  new CCCEMButton('gamePrefsSaveData', '',
    new savingModule(() => {
      const src = get('prefsRecord');
      return (src.particles ? '1' : '0') +
        (src.numbers ? '1' : '0') +
        (src.autosave ? '1' : '0') +
        (src.autoupdate ? '1' : '0') +
        (src.milk ? '1' : '0') +
        (src.fancy ? '1' : '0') +
        (src.warn ? '1' : '0') +
        (src.cursors ? '1' : '0') +
        (src.focus ? '1' : '0') +
        (src.format ? '1' : '0') +
        (src.notifs ? '1' : '0') +
        (src.wobbly ? '1' : '0') +
        (src.monospace ? '1' : '0') +
        (src.filters ? '1' : '0') +
        (src.cookiesound ? '1' : '0') +
        (src.crates ? '1' : '0') +
        (src.showBackupWarning ? '1' : '0') +
        (src.extraButtons ? '1' : '0') +
        (src.askLumps ? '1' : '0') +
        (src.customGrandmas ? '1' : '0') +
        (src.timeout ? '1' : '0') +
        (src.cloudSave ? '1' : '0') +
        (src.bgMusic ? '1' : '0') +
        (src.notScary ? '1' : '0') +
        (src.fullscreen ? '1' : '0') +
        (src.screenreader ? '1' : '0') +
        (src.discordPresence ? '1' : '0'); //copy pasted from Game.WriteSave
    }, str => {
      const spl = str.split('');
      const src = get('prefsRecord');
      src.particles = parseInt(spl[0]);
      src.numbers = parseInt(spl[1]);
      src.autosave = parseInt(spl[2]);
      src.autoupdate = spl[3] ? parseInt(spl[3]) : 1;
      src.milk = spl[4] ? parseInt(spl[4]) : 1;
      src.fancy = parseInt(spl[5]); if (src.fancy) Game.removeClass('noFancy'); else if (!src.fancy) Game.addClass('noFancy');
      src.warn = spl[6] ? parseInt(spl[6]) : 0;
      src.cursors = spl[7] ? parseInt(spl[7]) : 0;
      src.focus = spl[8] ? parseInt(spl[8]) : 0;
      src.format = spl[9] ? parseInt(spl[9]) : 0;
      src.notifs = spl[10] ? parseInt(spl[10]) : 0;
      src.wobbly = spl[11] ? parseInt(spl[11]) : 0;
      src.monospace = spl[12] ? parseInt(spl[12]) : 0;
      src.filters = spl[13] ? parseInt(spl[13]) : 1; if (src.filters) Game.removeClass('noFilters'); else if (!src.filters) Game.addClass('noFilters');
      src.cookiesound = spl[14] ? parseInt(spl[14]) : 1;
      src.crates = spl[15] ? parseInt(spl[15]) : 0;
      src.showBackupWarning = spl[16] ? parseInt(spl[16]) : 1;
      src.extraButtons = spl[17] ? parseInt(spl[17]) : 1; if (!src.extraButtons) Game.removeClass('extraButtons'); else if (src.extraButtons) Game.addClass('extraButtons');
      src.askLumps = spl[18] ? parseInt(spl[18]) : 0;
      src.customGrandmas = spl[19] ? parseInt(spl[19]) : 1;
      src.timeout = spl[20] ? parseInt(spl[20]) : 0;
      src.cloudSave = spl[21] ? parseInt(spl[21]) : 1;
      src.bgMusic = spl[22] ? parseInt(spl[22]) : 1;
      src.notScary = spl[23] ? parseInt(spl[23]) : 0;
      src.fullscreen = spl[24] ? parseInt(spl[24]) : 0; if (App) App.setFullscreen(src.fullscreen);
      src.screenreader = spl[25] ? parseInt(spl[25]) : 0;
      src.discordPresence = spl[26] ? parseInt(spl[26]) : 1;
    }), new buttonInfo('Game prefs save', 'Saves game prefs (hidden button)', [0, 0])
  ),
  new CCCEMButton('activePresetSave', '',
    new savingModule(() => {
      return (activePreset?activePreset.key:'N');
    }, str => {
      if (str != 'N' && CCCEMPresets[str]) { CCCEMPresets[str].partialInvoke(); }
    }),
    new buttonInfo('Active preset save', 'Saves the active preset (hidden button)', [0, 0]), null, { ignorePreset: true }
  ),
  new CCCEMButton('historySettingsSave', '',
    new savingModule(() => {
      return saveHistorySettings();
    }, str => {
      loadHistorySettings(str);
    }),
    new buttonInfo('History settings save', 'Saves the history settings (hidden button)', [0, 0]), null, { ignorePreset: true }
  ),
  new CCCEMButton('trackersSaveData', '',
    new savingModule(() => {
      return stringifyAllTrackers();
    }, str => {
      createTrackersFromData(str);
    }).setSavingEnabled(false),
    new buttonInfo('Trackers saving', 'Saves trackers and their data', [0, 0])
  ),
  new CCCEMButton('statsSaveData', '',
    new savingModule(() => {
      return exportStats();
    }, str => {
      console.log(str);
      importStats(str);
    }).setSavingEnabled(false),
    new buttonInfo('Stats saving', 'Saves stats', [0, 0])
  ),
  new CCCEMButton('miscSaveData', '',
    new savingModule(() => {
      return Game.volume + '_' + (App ? Game.volumeMusic : 'N') + '_' + 'N' + '_' + utf8_to_b64(Game.bakeryName);
    }, str => {
      const strs = str.split('_');
      if (strs[0] && !isNaN(parseFloat(strs[0]))) { Game.volume = parseFloat(strs[0]); }
      if (strs[1] && !isNaN(parseFloat(strs[1]))) { Game.volumeMusic = parseFloat(strs[1]); }
      if (strs[2] && strs[2] != 'N') { CCCEMPresets[strs[2]].partialInvoke(); }
      if (strs[3]) { Game.bakeryNameSet(b64_to_utf8(strs[3])); }
    }),
    new buttonInfo('Miscellaneous save', 'Saves other random stuff (hidden button)', [0, 0])
  ),
]);

/*CCCEMCategories['savingSettings'].hidden = true;
CCCEMCategories['presetSettings'].hidden = true;
CCCEMCategories['gameSettings'].hidden = true;
CCCEMCategories['minigameSettings'].hidden = true;
CCCEMCategories['buffSettings'].hidden = true;
CCCEMCategories['gcSettings'].hidden = true;*/
CCCEMButtons['buffType'].updateVarFunc(get('buffType'));
CCCEMButtons['buffObj'].changeState(-1);

function RedrawCCCEM(noinvalidate) {
  if (hasHarbor) { MacadamiaModList.cccem.mod.syncSettingsRPC.send({ code: getSettingsCode() }); }
  var str='';
  str+='<div class="icon" style="position:absolute;left:-9px;top:-6px;background-position:'+(-28*48)+'px '+(-12*48)+'px;"></div>';
  
  str+='<div id="devConsoleContent" class="'+(l('devConsoleContent')?((l('devConsoleContent').classList.contains('fadeOut') || l('devConsoleContent').classList.contains('initHidden'))?'initHidden':''):'initHidden')+'">';
  str+='<div class="title" style="font-size:14px;margin:6px;">CCCEM interface</div><div class="line"></div>';
  
  str+=compileAllButtons();

  str+='</div>';
  l('devConsole').innerHTML=str;
  l('debug').style.display='block';
  devConsoleL = l('devConsole');
  };
l('devConsole').classList.add('CCCEMInterface');
l('devConsole').style.maxHeight = `calc(100vh - ${((App?0:l('topBar').getBoundingClientRect().height) + 18)}px)`;
l('devConsole').addEventListener('mouseenter', () => { l('devConsoleContent').classList.remove('fadeOut'); l('devConsoleContent').classList.remove('initHidden'); l('devConsoleContent').classList.remove('widthCapped'); });
l('devConsole').addEventListener('mouseleave', () => { l('devConsoleContent').classList.add('fadeOut'); l('devConsoleContent').classList.add('widthCapped'); });
RedrawCCCEM();
l('devConsoleContent').classList.add('initHidden');
l('devConsoleContent').classList.add('fadeOut');
invalidateScore=0;

window.CCCEMInterfaceReady = true;
var CCCEMUILoaded = true; // backward compatibility purposes