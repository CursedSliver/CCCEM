class CCCEMPreset {
  constructor(key, settings, onTriggerFunc, visibleButtons, name, icon, additionalInfo) {
    this.key = key;
    this.settings = settings;
    this.onTriggerFunc = onTriggerFunc;
    this.visibleButtons = new Set(visibleButtons);
    this.name = name;
    this.icon = icon;
    this.additionalInfo = additionalInfo ?? null;

    addLoc(name);
    addLoc(additionalInfo);

    this.registerInList();
  }
  external = false

  registerInList() {
    CCCEMPresets[this.key] = this;
  }

  invoke(noStoreToUndo) {
    console.log(this.key + ' invoked!');
    if (!noStoreToUndo) { CCCEMButtons['revertPresetContainer'].type.willSave = false;
    const saveSaveStatus = CCCEMButtons['saveSave'].state;
    CCCEMButtons['saveSave'].changeState(true);
    CCCEMButtons['revertPresetContainer'].changeState(escape(utf8_to_b64(getSettingsCode())));
    CCCEMButtons['saveSave'].changeState(saveSaveStatus);
    CCCEMButtons['revertPresetContainer'].type.willSave = true; }
    if (typeof this.settings == 'object') { 
      for (let i in this.settings) {
        if (CCCEMButtons[i]) { CCCEMButtons[i].changeState(this.settings[i]); }
      }
    }
    if (typeof this.settings == 'string') {
      CCCEMContainerModObj.load(this.settings, true);
    }

    invalidateScore = 1;

    activePreset = this;
    CCCEMButtons['revertPreset'].hidden = false;
    CCCEMButtons['editPreset'].hidden = false;
    CCCEMButtons['advancedMode'].hidden = true;

    CCCEMCategories['interfaceBegin'].hidden = false;
    CCCEMCategories['savingControls'].hidden = false;
    CCCEMButtons['loadPForPause'].hidden = false;
    CCCEMButtons['loadCastFinder'].hidden = false;
    CCCEMButtons['createPreset'].hidden = false;

    ResetAll();
    this.onTriggerFunc();
    ResetAll();
    Game.CloseNotes();

    Game.Notify(loc('Preset %1 set!', this.name), loc('Click "Try again" through the presets option category to restart practice or aim for higher scores.') + (this.additionalInfo?('<br><br><div class="block" style="border: 1px solid #ffffff; box-shadow: 0px 0px 3px 3px #ffffff;">' + this.additionalInfo + '</div>'):''), this.icon);
    RedrawCCCEM();
    invalidateScore = 0;
  }
  
  openConfirmationMenu() {
    Game.Prompt('<id presetApplicationConfirm><h3>'+loc('Confirm preset')+'</h3><div class="line"></div><div class="block">'+loc('You are about to apply the <b>%1</b> preset.', this.name)+(this.additionalInfo?'<div class="line"></div><h4 style="margin-bottom: 3px;">'+loc('Additional reminder')+'</h4><br>'+this.additionalInfo:'')+'</div>', [[loc('Confirm'), 'CCCEMPresets["'+this.key+'"].invoke();Game.ClosePrompt();'], [loc('Nevermind'), 'Game.ClosePrompt();']]);
  }

  partialInvoke() {
    console.log(this.key + ' invoked!');

    invalidateScore = 1;

    activePreset = this;
    CCCEMButtons['revertPreset'].hidden = false;
    CCCEMButtons['editPreset'].hidden = false;
    CCCEMButtons['advancedMode'].hidden = true;

    CCCEMCategories['interfaceBegin'].hidden = false;
    CCCEMCategories['savingControls'].hidden = false;
    CCCEMButtons['loadPForPause'].hidden = false;
    CCCEMButtons['loadCastFinder'].hidden = false;
    CCCEMButtons['createPreset'].hidden = false;

    ResetAll();
    this.onTriggerFunc();
    ResetAll();
    Game.CloseNotes();

    Game.Notify(loc('Preset %1 set!', this.name), loc('Click "Try again" through the presets option category to restart practice or aim for higher scores.') + (this.additionalInfo?('<br><br><div class="block" style="border: 1px solid #ffffff; box-shadow: 0px 0px 3px 3px #ffffff;">' + this.additionalInfo + '</div>'):''), this.icon);
    RedrawCCCEM();
    invalidateScore = 0;
  }
}
class externalPreset extends CCCEMPreset {
  constructor(...args) {
    super(...args);
  }
  external = true
  openConfirmationMenu() {
    Game.Prompt('<id presetApplicationConfirm><h3>'+loc('Confirm preset (external!)')+'</h3><div class="line"></div><div class="block">You are about to apply the <b>'+this.name+'</b> preset.'+(this.additionalInfo?'<div class="line"></div><h4 style="margin-bottom: 3px;">Additional reminder</h4><br>'+this.additionalInfo:'')+'</div>', [[loc('Confirm'), 'Game.ClosePrompt();'], [loc('Nevermind'), 'Game.ClosePrompt();']]);
    AddEvent(l('promptOption0'), 'click', e => {
      this.invoke();
    });
  }
}
function cancelActivePreset() {
  activePreset = null;
  if (!get('revertPresetContainer')) { CCCEMButtons['revertPreset'].hidden = true; }
  CCCEMButtons['editPreset'].hidden = true;
  CCCEMButtons['advancedMode'].hidden = false;
  RedrawCCCEM();
}

function __GENERATE_PRESETS__() {
const presetButtonsToRegister = [];
function getTitlePreNewLine(title, noPadding) { return (noPadding?'':'<div class="flexbreak" style="height: 10px;"></div>')+'<h4 class="cccemPresetCategoryTitle">'+title+'</h4><div class="flexbreak"></div>'; }

presetButtonsToRegister.push(new CCCEMButton('earlygameInfo', 'Guide', 
  new triggerButton(),
  new buttonInfo('Basic combo instructions', 'Click to read about doing the basic combo. It\'s actually really simple, trust me.', [15, 9]),
  () => {
    Game.Prompt(`<id FCFComboInfo><h3>${loc('Combo info')}</h3><div class="line"></div><div class="block" style="line-height: 120%;">
      ${loc('The <b>Force the Hand of Fate</b> Grimoire spell has an unusually high chance of giving Click frenzy (x777 clicks). If you cast it during a Frenzy (x7 CpS) and get Click frenzy, sell buildings to the Godzamok pantheon god, then click as fast as you can to get <b>a lot of cookies</b>!')}
      <div class="line"></div>
      ${loc('What should I sell for Godzamok? A useful rule is to sell <b>every building</b> making less than <b>2%</b> of your total CpS. If you quickly sell multiple times you might see the buff not increase in strength, but <b>it\'s actually lying</b>; the buff does get stronger as shown if you try clicking the big cookie. In this case, you should sell from cursors all the way up to temples, but when you are actually doing it, you may need to sell more or less.')}
      <div class="line"></div>
      ${loc('In the preset the spell is being forced to give Click frenzy, but in reality you only have about a ~25% chance of getting it each attempt. Still, it remains an extremely powerful cookie-making strategy.')}
      </div>`, [[loc('Got it!'), 'Game.ClosePrompt();']], 0, 'widePrompt');
  }, { preNewLine: getTitlePreNewLine('Earlygame combos', true) }
));

const FCFPreset = `>>CCCEMContainerTop:v2.95<<{"resetKey":82,"importSave":"Mi4wNTh8fDE1OTQzMDM2MzIyNTY7MTU5NDMwMzYzMjI1NjsxNzY5ODQ1MDA1MDkwO0YgICBDRiBwcmFjdGljZTt0aGVzejswLDEsMCwwLDAsMCwwfDExMTExMTAxMTAwMTAxMTEwMTAxMDExMDAwMXwzMjM0MTg4MDQzNzM5LjEzNjszMzA5ODI4OTA1NDUxNTU3LjU7Mzk2MDEwOzM2OzE5MDc4MzUwNjUyNC4wODA3ODsxNDswOzA7MDswOzA7MDswOzA7MDszNjswOzA7MDswOzA7MDs7MDswOzA7MDswOzA7MDstMTstMTstMTstMTstMTswOzA7MDswOzUwOzA7MDsyMDI3OzIwMzE7MTc2OTc4MjAzMjI1NzswOzA7OzA7MDswOzQ3MjM1MTE3MC4zMTYwNDQ0OzUwOzA7MDt8MTUzLDE1Myw3NDM5OTgyODQ2LDAsLDAsMTUzOzEzMywxMzMsMzQwMjE4MDg4MywwLCwxLDEzMzsxMDAsMTAwLDQzMzk1NjAzMywxLDE3Njk4NDUwMTgxMDg6MDoxNzY5ODQ0MzM3NjkyOjA6MDowOjA6MDoxNzY5ODQ0MzM3NjkyOiAxMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwIDA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOiwwLDEwMDs4Myw4MywxMzM0MzY0NDIzLDAsLDEsODM7NjEsNjEsMzU3MDc4ODk5OCwwLCwxLDYxOzU0LDU0LDE0NzgzNzI2Mzc0LDEsMDowOjE6MDowOiAyNDQ6NDotMzY6MTgxOjA6MDowOjAhMzE1OjQ6LTk3OjIxNzowOjA6MDowITI5Mjc6NTotMTM6NjQwOjA6MDowOjAhNjEyOjQ6LTg1OjQ2MjowOjA6MDowITU1NDU6MToyNzoxMDE6MDowOjA6MCExMTUxOTozOjQzOjU2NjowOjA6MDowITcxMTQ6NTo0MDoyODowOjA6MDowITgwMzM6MDo2OjEyMjowOjA6MDowITY1MzQ6NDotMjA6NDg4OjA6MDowOjAhMTAyNDk6MDotMTM6MjU1OjA6MTowOjAhMTE3NDM6NDoxOjI3MTowOjE6MDowITExNTY4OjU6LTUxOjI2MzowOjE6MDowITEyNjUzOjA6MDozMzk6MDoxOjA6MCExODUwNjozOjM3Ojc6MDoxOjA6MCExNDg2MjoxOjE0OjYzMjowOjE6MDowITE0ODg0OjI6LTI1OjQ5OjA6MTowOjAhMTE5MjI6NDotNTU6NTI6MDoxOjA6MCExNzE3MToyOi0zOToxODM6MDoxOjA6MCEgMCwwLDU0OzQ3LDQ3LDQ3OTUxNTM4MTc5LDEsLTEvLTEvLTEgMyAxNzY5ODQ0MzM3Njk5IDAsMCw0NzszNSwzNSw2MzQ0NjA2ODg1MCwxLDMwIDAgMCAxLDAsMzU7MjUsMjUsNjQ5NzIwMzEwOTksMCwsMSwyNTsxNSwxNSw2NzQ4OTE3Mjk1MSwwLCwxLDE1OzEsMSw0MzUzNTAxNjQ4LDAsLDAsMTswLDAsMCwwLCwwLDA7MCwwLDAsMCwsMCwwOzAsMCwwLDAsLDAsMDswLDAsMCwwLCwwLDA7MCwwLDAsMCwsMCwwOzAsMCwwLDAsLDAsMDswLDAsMCwwLCwwLDA7MCwwLDAsMCwsMCwwOzAsMCwwLDAsLDAsMDt8MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDAxMDAwMDAwMDAwMDAxMTExMTExMTExMTExMTExMTExMTExMTEwMDExMTExMTExMDAwMDAwMDAxMTExMTAxMTExMTExMTExMTExMDAwMDAxMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTExMTExMTEwMDExMTAwMDAwMDAwMDAwMDAxMDEwMTAwMDEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDEwMTAxMDEwMDAwMDExMTEwMDAwMDAwMDAwMDAwMDEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTAxMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxMTExMTExMTAwMDAxMTExMTEwMDAwMDAxMTExMTEwMDAwMDAxMTExMTEwMDAwMDAxMDEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxMTExMTEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxMTExMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwfDExMTExMTExMTEwMDAwMDAxMTExMTExMTAwMDAwMDExMTExMTExMDAxMTExMTExMTAxMTAxMDAxMDAxMDAwMDAwMDAxMTEwMTExMTEwMDAwMDEwMDAwMDAwMDAwMDExMDAwMDAxMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDExMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDExMDAwMDAwMDAwMTExMDAwMTAwMDAxMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDEwMDAwMDAwMDAwMDAwMDAwMDAwMDEwMTExMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDB8fA%3D%3D%21END%21","saveSave":1,"advancedMode":1,"blockBeginningDiv":null,"endgameInfo":null,"blockClosingDiv":null,"iniSeed":"R","cookies":4e+69,"cookiesBTA":1e+78,"prestige":1e+22,"scoreMult":120000000000000,"scoreMultVerify":0,"lumps":1,"lumpType":0,"gcClickCount":77777,"clickCooldown":20,"buildingCountAnchor":1095,"useEB":0,"useRebuy":0,"unmuteMinigames":0,"wizCount":35,"wizLevel":1,"buyOption1":1,"buyOption2":5,"heraldsOverride":0,"heraldsN":100,"leftAura":0,"rightAura":0,"fortuneChance":4,"fortuneClaim":0,"startingSeason":0,"scriedSeason":0,"reindeerCount":0,"pledgeStatus":0,"forceFtHoF":2,"forceCastToggle":0,"forcedCastValue":0,"gardenLevel":1,"gardenSeed":14,"gardenRotation":0,"gardenFrozen":1,"toNextTick":0,"plant1":2,"plant1Age":"mature","gTulips":0,"plant2":2,"plant2Age":"mature","office":0,"diamondGod":2,"rubyGod":6,"jadeGod":5,"buffs":"0,2310,1500,7;","seedNats":1,"seedTicker":1,"gSwitch":0,"iniSpawn":0,"iniSpawnTimer":0,"iniDO":0,"iniDEoRL":0,"iniGC":-1,"iniGC2":21,"iniGC3":1,"boughtSF":0,"boughtCE":0,"DFChanceMult":1,"gcRateMult":1,"autosave":0,"buildingRelatedSaveData":"0_0_0_0_0_0_0_0_0_0_0_0_0_0_0_0_0_0_0_0,0_1_0_1_1_0_0_0_1_1_0_1_1_1_1_1_1_1_1_1","gamePrefsSaveData":"110111111011001101110111011","miscSaveData":"50_N_N_RiAgIENGIHByYWN0aWNl"}>>ContainerEnd<<`;
new CCCEMPreset('f+cf', FCFPreset, 
  () => {
    Game.bakeryNameSet('Basic combo');
  }, ['buyOption1', 'buyOption2', 'prefsRecord'], 'Basic combo', [12, 0], 'After finishing execution, click <b>Try again</b> in the menu to practice more or try for a higher score.<br>Check the Guide button for instructions.<br>For reliable execution, aim for <b>100% score</b> adjusted for <b>10 clicks/s</b>.' 
)
presetButtonsToRegister.push(new CCCEMButton('F+CFPreset', 'Basic combo', 
  new presetButton('f+cf'),
  new buttonInfo('F + CF', 'Sets the settings to one for a typical earlygame combo involving a Frenzy (shorthand F) and Click frenzy (shorthand CF).', [12, 0])
));

presetButtonsToRegister.push(new CCCEMButton('earlygameAdditionalInfo', 'Additional info', 
  new openExternal('https://docs.google.com/document/d/1QmvHrYLo-knZpETbC9Lx1siXnFIia9SBHLuU5UYvcsg/edit?usp=sharing'),
  new buttonInfo('Combo guide', 'Opens up a combo guide for earlygame and midgame, containing more information about the subject.', [10, 10]),
  null, { }
));

presetButtonsToRegister.push(new CCCEMButton('endgameInfo', 'Information & Instruction', 
  new openExternal('https://docs.google.com/document/d/178UEqEgOy6M3DsiGmhan68k6fepBpShuiBPQoscSlco/edit?tab=t.0#heading=h.bil9jv80hbvw'),
  new buttonInfo('Endgame combo instructions', 'Opens to a specific section in a guide detailing how to do the 100% consistency, BS scry, and Grail. Setup combo is in another section of the guide.<br>The document also contains other information regarding endgame comboing.', [21, 7]),
  null, { newLine: true, preNewLine: getTitlePreNewLine('Lategame combos') }
));
const grailPreset = `>>CCCEMContainerTop:v2.95<<{"resetKey":82,"importSave":"","saveSave":1,"advancedMode":0,"blockBeginningDiv":null,"earlygameAdditionalInfo":null,"endgameInfo":null,"blockClosingDiv":null,"iniSeed":"R","cookies":4e+69,"cookiesBTA":1e+78,"prestige":1e+22,"scoreMult":1,"scoreMultVerify":0,"lumps":105,"lumpType":0,"gcClickCount":77777,"clickCooldown":20,"buildingCountAnchor":1095,"useEB":0,"useRebuy":0,"unmuteMinigames":0,"wizCount":951,"wizLevel":10,"buyOption1":1,"buyOption2":4,"heraldsOverride":0,"heraldsN":100,"leftAura":13,"rightAura":4,"fortuneChance":4,"fortuneClaim":0,"startingSeason":184,"scriedSeason":0,"reindeerCount":0,"pledgeStatus":1,"forceFtHoF":1,"forceCastToggle":0,"forcedCastValue":0,"gardenLevel":10,"gardenSeed":14,"gardenRotation":0,"gardenFrozen":0,"toNextTick":0,"plant1":6,"plant1Age":"mature","gTulips":0,"plant2":17,"plant2Age":"mature","office":5,"diamondGod":1,"rubyGod":4,"jadeGod":6,"buffs":"0,18000,18000,7;3,18000,18000,15;","seedNats":1,"seedTicker":1,"gSwitch":0,"iniSpawn":1,"iniSpawnTimer":0,"iniDO":0,"iniDEoRL":0,"iniGC":19,"iniGC2":21,"iniGC3":1,"boughtSF":0,"boughtCE":0,"DFChanceMult":1,"gcRateMult":1,"autosave":0,"buildingRelatedSaveData":"0_0_0_0_0_0_0_0_0_0_0_0_0_0_0_0_0_0_0_9,1_1_0_1_1_0_0_0_1_1_0_1_1_1_1_1_1_1_1_1","gamePrefsSaveData":"010100101011001101010111011","activePresetSave":"N","miscSaveData":"75_N_N_Z3JhaWwgbW9tZW50cw=="}>>ContainerEnd<<`
new CCCEMPreset('grail', grailPreset, () => {
  Game.bakeryNameSet('grail moments');
  Game.bgType = 23;

  Game.specialTab="dragon";
  if (typeof hasFinder != 'undefined') { code = 'b^blood frenzy'; codes = compile(code); }
}, ['useEB', 'useRebuy', 'wizCount', 'wizLevel', 'gardenLevel', 'buyOption1', 'buyOption2'], 'Grail', [14, 6], 'For reliable execution, aim for a score of at least <b>100%</b> adjusted for <b>10 clicks/s</b>.<br>Also note that this combo is almost exclusively for post-endgame (after all cookie-related achievements).');

const consistPreset = `>>CCCEMContainerTop:v2.95<<{"resetKey":82,"importSave":"Mi4wNTJ8fDE2ODY0NDE5MDA0MTg7MTYwMzQ2NjgwMjcyMDsxNjg2NjQ4OTQ5MjcxO3ByZXNldCBjb25zaXN0ZW5jeTttaG9mYjswLDEsMCwwLDAsMCwwfDAxMTEwMDEwMTAxMTAwMTEwMTAxMDExMTAxMXw2LjA0NDM0MTA5NTQxMTAwNGUrNjQ7MS4wMDEwNTE5ODEzMzI1MTA5ZSs2NTs1OTsyNzc3NzsxLjQzODUxNDE0NzAxMTYyMDllKzYwOzM2MTsyMzszMTsxLjEwMDAwMDU5MDQ2NTk3NDJlKzY2OzA7NDsxMDE1NjE7MDstMTsxMTY7Nzs2LjE0NDEzMDgxMTE2MjI5NGUrNTU7NTsxNDsyOy0xOzE7OzA7MDsxMDMyMjgwMzAwMTYxMjY2MzAwOzU0MjM3Nzc2NTc2MjUwNDIwMDsyNTk0Mjg3MzE4Nzk2NTI4MDswOzA7NTM7NTI7NjQxOzIyMjs2Mzk7Mjc7MDswOzQ7NjU7MDswOzcxOzE0NzsxNjg2NTk1MDEwNDk5OzA7MTsyMjc7NDE7MDsxOzIuMjU0MzA3Mzc0NzM2MzA0ZSs1NTs1MDswOzA7fDEwMTEsMTM2MSwzLjY2MDg3NDYyMjAxMzQxNWUrNTcsMTIsLDAsMTAxMTsxMDAzLDEzNTMsMi4yODQ1MDgxNTI4MjQ5MjY3ZSs1NiwwLCwxLDEwMDM7OTY2LDEzMTYsNC4xMzcxNjM4MDU2MDA2NDVlKzU2LDcsMTY4NjY0ODk5NjIyMzoxOjE2ODY0NDMxMzg4MjE6MDowOjA6MTowOjE2ODY0NDE5MDA0NDQ6IDEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAgMDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6LDAsOTY2Ozk0NiwxMjk2LDkuOTI3Mjk3ODc3NjY0MTQzZSs1NiwwLCwxLDk0Njs5MTksMTI2OSw2LjM2NDE3ODg3NjQ1NDUwOGUrNTUsMCwsMSw5MTk7ODkxLDEyNDEsNy41MDgyNjE1NjI1MjI2NGUrNTQsMSwwOjA6MTowOjE6IDM3ODI6MTo3OTo0OjA6MDowOjAhMjY0OjQ6LTg2OjQyODowOjA6MDowITMyMDA6MTotNDI6NTgwOjA6MDowOjAhNDMzODoxOjEzOjM5NjowOjA6MDowITI1NTI6NDotMTA1OjIyMTowOjA6MDowITQwODg6MjotMTI1OjE1MTowOjA6MDowITc5NzU6MTo0NzoyOTA6MDowOjA6MCE5MzQwOjE6NDI6MTk3OjA6MDowOjAhNzYyNTo1OjEyOjU0MTowOjA6MDowITMzNDY6NDotOTY6NjA4OjA6MDowOjAhMTA2MjE6MTo3OjQ1MTowOjA6MDowITEyNTEwOjE6LTM6MTgzOjA6MDowOjAhMTMxNjE6MToxOjQ2OTowOjA6MDowITEzMjY0OjA6LTI6NDA2OjA6MDowOjAhMTM4NjQ6NTotOToyMTU6MDowOjA6MCExNzkwODozOjQwOjU2NTowOjA6MDowITgzMzI6NDotODU6NTYxOjA6MDowOjAhMTY3Mzk6NDotMTAyOjU0NTowOjA6MDowISAxLDAsODkxOzg5MSwxMjQxLDYuODI0NzMwNTQ3ODY0MDczZSs1NiwxLC0xLy0xLy0xIDMgMTY4NjQ0MTkwMDQ0OSAxLDAsODkxOzg1NywxMjA3LDMuNDUzMzY1MTY1NTA0NjQyZSs1NCwyLDQzLjY2OTAwMTIyNTQyNDg5IDAgNzM0NiAxLDAsODU3Ozg0NywxMTk3LDUuNDYwODkwNjU1MzY3NjU4ZSs1MywwLCwxLDg0Nzs4MTksMTE2OSwxLjY4NzI4MDIxNDg2Njk4NWUrNTQsMCwsMSw4MTk7ODEwLDExNjAsMS45NDQ0NzQ3ODUzOTM2NDllKzU2LDAsLDEsODEwOzc5MiwxMTQyLDYuNTA3NDc1NzI4MDA4NjAzZSs1NiwwLCwxLDc5Mjs3NzMsMTEyMywxLjM3NjMzOTgyNTg4MDQxMDJlKzU2LDAsLDEsNzczOzc1NiwxMTA2LDQuMjIzMTQzNDUxODg3NTA2ZSs1NiwwLCwxLDc1Njs3MzcsMTA4Nyw0LjcxNjg4NDc5NTI5NjUzOGUrNTYsMCwsMSw3Mzc7NzIxLDEwNzEsMS43MTMxMTYxNDY2NTY5MTVlKzU3LDAsLDEsNzIxOzY4MSwxMDMxLDUuNTkyNTI2MTY2NzY0NDc2ZSs1NywwLCwxLDY4MTs2NDUsOTk1LDQuNzU4MzU2MzI4MzQyODgxZSs1NiwwLCwxLDY0NTs2MjAsOTcwLDEuMjE0NTc4MjIzNTIxNTllKzU3LDAsLDEsNjIwOzYwMCw5NTAsMi43ODcwNzgwNDg0NDU1ODg2ZSs1NywwLCwwLDYwMDt8MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDEwMTAxMDEwMTAxMDEwMTExMTExMTExMTEwMDExMTExMTAwMTAxMTExMDExMTExMTEwMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMDExMTExMTExMTExMTExMTExMTAxMDEwMTAxMDEwMTAxMTEwMDAxMDEwMTAxMDEwMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAwMTEwMTAxMDEwMTAxMDExMTExMTExMTExMTExMTEwMTAxMDEwMDAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMDEwMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMTEwMTAxMDEwMTAwMDAwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDAwMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAwMDAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTExMDAxMTExMTExMTExMTExMTExMTExMTAwMDAwMDAxMDEwMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAwMTExMTExMDEwMTAxMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAwMTExMTExMTExMTExMTEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDExMTExMTExMTExMTExMTExMDEwMTAxMDEwMTAxMTExMTAxMTExMTEwMTExMTExMTExMTExMTExMTExMTExMDExMTExMTEwMTAwMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTAxMTExMTEwMDExMTExMTExMDAwMDAwMDAwMDAwMTExMXwxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTExMTEwMDAwMDAwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMDExMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMDAwMDAwMDAwMDAxMTEwMTExMTExMTExMTEwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTExMTExMDAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTEwMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDAxMDEwMDAxMTEwMDAxMTExMTExMTExMTExMDExMTAxMTExMTExMTExMTExMTEwMDAwMDAxMTExfHw%3D%21END%21","saveSave":1,"revertPresetContainer":"","advancedMode":0,"blockBeginningDiv":null,"earlygameAdditionalInfo":null,"endgameInfo":null,"blockClosingDiv":null,"iniSeed":"R","cookies":4e+69,"cookiesBTA":1e+78,"prestige":1e+22,"scoreMult":1,"scoreMultVerify":0,"lumps":105,"lumpType":0,"gcClickCount":77777,"clickCooldown":20,"buildingCountAnchor":1095,"useEB":0,"useRebuy":0,"unmuteMinigames":0,"wizCount":951,"wizLevel":10,"buyOption1":1,"buyOption2":4,"heraldsOverride":0,"heraldsN":100,"leftAura":13,"rightAura":9,"fortuneChance":4,"fortuneClaim":0,"startingSeason":184,"scriedSeason":0,"reindeerCount":0,"pledgeStatus":1,"forceFtHoF":2,"forceCastToggle":0,"forcedCastValue":0,"gardenLevel":9,"gardenSeed":14,"gardenRotation":0,"gardenFrozen":0,"toNextTick":0,"plant1":6,"plant1Age":"mature","gTulips":0,"plant2":17,"plant2Age":"mature","office":5,"diamondGod":2,"rubyGod":8,"jadeGod":6,"buffs":"0,18000,18000,7;3,18000,18000,15;","seedNats":1,"seedTicker":1,"gSwitch":0,"iniSpawn":1,"iniSpawnTimer":0,"iniDO":0,"iniDEoRL":0,"iniGC":19,"iniGC2":21,"iniGC3":1,"boughtSF":0,"boughtCE":0,"DFChanceMult":1,"gcRateMult":1,"autosave":0,"buildingRelatedSaveData":"0_0_0_0_0_0_0_0_0_0_0_0_0_0_0_0_0_0_0_9,1_1_0_1_1_0_0_0_1_1_0_1_1_1_1_1_1_1_1_1","gamePrefsSaveData":"010100101011001101010111011","activePresetSave":"N","miscSaveData":"65_N_N_cHJlc2V0IGNvbnNpc3RlbmN5"}>>ContainerEnd<<`;
new CCCEMPreset('consist', consistPreset, () => {
  CCCEMButtons['prefsRecord'].changeState();

  Game.specialTab="dragon";
  if (typeof hasFinder != 'undefined') { code = 'b^click frenzy'; codes = compile(code); }
}, ['useEB', 'useRebuy', 'wizCount', 'wizLevel', 'gardenLevel', 'buyOption1', 'buyOption2'], 'Consistency', [12, 6], 'For reliable execution, aim for a score of at least <b>60%</b> adjusted for <b>10 clicks/s</b>.');

presetButtonsToRegister.push(new CCCEMButton('consistPreset', '100% consistency',
    new presetButton('consist'),
    new buttonInfo('100% consistency', 'Resets settings to a preset setting for a combo with a scried Click frenzy.', [12, 6]),
    () => { }
  ));

const bsScryPreset = `>>CCCEMContainerTop:v2.95<<{"resetKey":82,"importSave":"Mi4wNTJ8fDE2ODY0NDE5MDA0MTg7MTYwMzQ2NjgwMjcyMDsxNjg2NjQ5MDYyMTM5O3ByZXNldCBCUyBzY3J5O21ob2ZiOzAsMSwwLDAsMCwwLDB8MDExMTAwMTAxMDExMDAxMTAxMDEwMTExMDExfDkuNTkyMzU0NDg3MzcwOTFlKzY2OzEuMDAwMDAwMDAwMTkwNjUwNWUrNzE7NTk7Mjc3Nzc7MS40Mzg1MTQxNDcwMTE2MjA5ZSs2MDszNjA7MjM7MzE7MS4xMDAwMDA1OTA0NjU5NzQyZSs2NjswOzU7MTA2Nzk1OzA7LTE7MTE2OzEwOzEuMDUxOTI0NTMzMjM3MDkxMWUrNTQ7NDsxNDs0Oy0xOzE7OzA7MDsxMDMyMjgwMzAwMTYxMjY2MzAwOzU0MjM3Nzc2NTc2MjUwNDIwMDsyNTk0Mjg3MzE4Nzk2NTI4MDswOzA7NTM7NTI7NjQxOzIyMjs2Mzk7Mjc7MDswOzQ7NjU7MDswOzg2OzE0NzsxNjg2NTk1MDEwNDk5OzA7MTsyMjc7NDE7MDsxOzIuNTU0OTA2NTg1ODQ1OTI4M2UrNTc7NTA7MDswO3wxMDQxLDI1NDEsMy45Mjc3MTQ2Mzc0MjE3MjdlKzU5LDEwLCwwLDEwNTE7MTAzMywxMzgzLDIuNTE1MTk1MjYyNzk1MDUxZSs1OCwwLCwxLDEwMzM7MTAxNiwxMzY2LDUuMzUyNDIxMTAzODYyMTU4ZSs1OCw4LDE2ODY2NDkxNTU1NDY6MToxNjg2NDQzMTM4ODIxOjA6MDowOjE6MDoxNjg2NDQxOTAwNDQ0OiAxMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwIDA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOiwwLDEwMTY7OTk2LDEzNDYsMS4yNzQ4OTI5NzE4NTcyMzIzZSs1OSwwLCwxLDk5Njs5NjksMTMxOSw4LjAwNzA3Mzk3NTQxNjM1OWUrNTcsMCwsMSw5Njk7OTQxLDEyOTEsOS4xOTgwNjY1MDIyNjQwMzJlKzU2LDEsNDowOjE6MDoxOiAzOTA3OjM6NjE6MzUwOjA6MDowOjAhMjQ4OjQ6LTkxOjQyMTowOjA6MDowITMxMTU6MTotMjQ6NTczOjA6MDowOjAhMzcxNjoxOjM2OjM4OTowOjA6MDowITE0MzM6NDotMTE1OjIxNDowOjA6MDowITQwMzg6MjotOTA6MTQ0OjA6MDowOjAhODM3MDoxOjY5OjI4MzowOjA6MDowITkyNzQ6MTo1NDoxOTA6MDowOjA6MCE2ODk4OjU6MTA6NTM0OjA6MDowOjAhMjQ0OjQ6LTEyNjo2MDE6MDowOjA6MCExMDg5OToxOjEyOjQ0NDowOjA6MDowITEyNjYxOjE6MjM6MTc2OjA6MDowOjAhMTM0ODc6MToxOjQ2MjowOjA6MDowITEyOTg0OjA6LTI6Mzk5OjA6MDowOjAhMTMyNzY6NTotODk6MjA4OjA6MDowOjAhMTk4ODU6Mzo1NTo1NTg6MDowOjA6MCE2OTU1OjQ6LTk0OjU1NDowOjA6MDowITE0MTQxOjQ6LTEyNTo1Mzg6MDowOjA6MCEgMSwwLDk0MTs5NDEsMTI5MSw4LjkwNzI5MTUzNDM3MDYzZSs1OCwxLC0xLy0xLy0xIDMgMTY4NjQ0MTkwMDQ0OSAxLDAsOTQxOzg1NywxMjA3LDMuOTY5NjIxNjc2MTcyNTkzZSs1NiwyLDYyLjY3MDc0ODQxNjk4NTc0IDAgNzM0NiAxLDAsODU3Ozg5NywxMjQ3LDYuMjgzMzIyMDEzMzkzMDIyZSs1NSwwLCwxLDg5Nzs4NjksMTIxOSwxLjk1MDAzMzU1ODU2MDM3NzdlKzU2LDAsLDEsODY5Ozg2MCwxMjEwLDIuNDMyODY1ODI4OTE2OTI0MmUrNTgsMCwsMSw4NjA7ODQyLDExOTIsOC4zODE5NDUzNDY4MjMyNTVlKzU4LDAsLDEsODQyOzgyMywxMTczLDEuNjM2NzgwMzQ5OTkwNTk5MmUrNTgsMCwsMSw4MjM7ODA2LDExNTYsNS4yOTYwOTg2MjM0MjkzMDdlKzU4LDAsLDEsODA2Ozc4NywxMTM3LDUuODM0MzI0MDQwODc2ODA4ZSs1OCwwLCwxLDc4Nzs3NzEsMTEyMSwyLjEzMDYwNjA1MDI5Mzk2NjZlKzU5LDAsLDEsNzcxOzczMSwxMDgxLDcuMzYyMDk5ODcyODQ5NDI3NWUrNTksMCwsMSw3MzE7Njk1LDEwNDUsNy4zOTQzNDc3MzM4OTM0MmUrNTgsMCwsMSw2OTU7NjYwLDEwMTAsMi41OTMwNzgwOTE0NjcxNjkzZSs1OSwwLCwxLDY2MDs2NTAsMTAwMCw0LjkxMTYzMzc3OTQ5NTA1NWUrNTksMCwsMCw2NTA7fDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMDEwMTAxMDEwMTAxMDExMTExMTExMTExMDAxMTExMTEwMDEwMTExMTAxMTExMTExMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDAxMTExMTExMTExMTExMTExMTEwMTAxMDEwMTAxMDEwMTExMDAwMTAxMDEwMTAxMDEwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMDExMDEwMTAxMDEwMTAxMTExMTExMTExMTExMTExMDEwMTAxMDAwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDAxMDAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTExMDEwMTAxMDEwMDAwMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAwMDEwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMDAwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTAwMTExMTExMTExMTExMTExMTExMTEwMDAwMDAwMTAxMDEwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMDExMTExMTAxMDEwMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMTExMTExMTExMTExMTExMTAxMDEwMTAxMDEwMTExMTEwMTExMTExMDExMTExMTExMTExMTExMTExMTExMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTExMTExMDExMDExMTExMTExMTExMDEwMTAxMDExMTF8MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTExMDAwMDAwMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMTExMTAxMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTAwMDAwMDAwMDAwMTExMDExMTExMTExMTExMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTExMTAwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTExMDEwMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTExMTExMTAwMTExMTExMXx8%21END%21","saveSave":1,"advancedMode":1,"blockBeginningDiv":null,"earlygameAdditionalInfo":null,"endgameInfo":null,"blockClosingDiv":null,"iniSeed":"R","cookies":4e+69,"cookiesBTA":1e+78,"prestige":1e+22,"scoreMult":1,"scoreMultVerify":0,"lumps":103,"lumpType":0,"gcClickCount":77777,"clickCooldown":20,"buildingCountAnchor":1095,"useEB":0,"useRebuy":0,"unmuteMinigames":0,"wizCount":951,"wizLevel":10,"buyOption1":1,"buyOption2":4,"heraldsOverride":0,"heraldsN":100,"leftAura":13,"rightAura":4,"fortuneChance":4,"fortuneClaim":0,"startingSeason":184,"scriedSeason":0,"reindeerCount":0,"pledgeStatus":1,"forceFtHoF":3,"forceCastToggle":0,"forcedCastValue":0,"gardenLevel":9,"gardenSeed":14,"gardenRotation":0,"gardenFrozen":0,"toNextTick":0,"plant1":17,"plant1Age":"mature","gTulips":0,"plant2":6,"plant2Age":"mature","office":4,"diamondGod":1,"rubyGod":4,"jadeGod":6,"buffs":"0,18000,18000,7;3,18000,18000,15;","seedNats":1,"seedTicker":1,"gSwitch":0,"iniSpawn":1,"iniSpawnTimer":0,"iniDO":0,"iniDEoRL":0,"iniGC":19,"iniGC2":21,"iniGC3":1,"boughtSF":0,"boughtCE":0,"DFChanceMult":1,"gcRateMult":1,"autosave":0,"buildingRelatedSaveData":"0_0_0_0_0_0_0_0_0_0_0_0_0_0_0_0_0_0_0_9,1_1_0_1_1_0_0_0_1_1_0_1_1_1_1_1_1_1_1_1","gamePrefsSaveData":"010100101011001101010111011","activePresetSave":"N","miscSaveData":"65_N_N_cHJlc2V0IEJTIHNjcnk="}>>ContainerEnd<<`
new CCCEMPreset('bsScry', bsScryPreset, () => {
  CCCEMButtons['prefsRecord'].changeState();

  Game.specialTab="dragon";
  if (typeof hasFinder != 'undefined') { code = 'b^building special'; codes = compile(code); }
}, ['useEB', 'useRebuy', 'wizCount', 'wizLevel', 'gardenLevel', 'buyOption1', 'buyOption2'], 'BS Scry', [13, 6], 'For reliable execution, aim for a score of at least <b>60%</b> adjusted for <b>10 clicks/s</b>.');

presetButtonsToRegister.push(
  new CCCEMButton('bsScryPreset', 'BS scry',
    new presetButton('bsScry'),
    new buttonInfo('BS scry', 'Resets settings to a preset setting for a combo with a scried Building special.', [13, 6]),
    () => { }
  ));

presetButtonsToRegister.push(
  new CCCEMButton('defaultPreset', 'Grail',
    new presetButton('grail'),
    new buttonInfo('Grail', 'Resets settings to a preset setting for a combo with a scried Elder frenzy, which if combined with Dragonflight and Click frenzy, is called a grail.', [14, 6]),
    () => { }
  ));

const soupPreset = `>>CCCEMContainerTop:v2.95<<{"resetKey":82,"importSave":"Mi4wNTh8fDE3Njg3MDUxNzI0MjE7MTYwMzQ2NjgwMjcyMDsxNzY5ODU4ODgyOTI4O3NvdXAgZW5qb3llcjtudGNydTswLDEsMCwwLDAsMCwwfDExMTExMTEwMTAxMTAwMTEwMTAxMDExMTAxMXwyLjIzODAxNTIxOTA0NTI0MjRlKzYxOzEuNzgwNjUxODM5NDQwMTk1ZSs2Mjs4NTc7Mjc3ODg7MS41NTUwNzY0OTYxMzUwNzA0ZSs2MjszNjI7MjM7MzE7MS4yMDAyNzM1ODUzNzA5MTE1ZSs2NjsyOzEwOzA7MDstMTsxMTc7MTA7NC40Nzg3NDY4Mzc2OTAxMjA1ZSs1NTsxOzE0OzU7LTE7Njs7MDswOzEwNjI3MzkzMjA3NzkxMjY5MDA7NTcyODM2Nzg2MzgwMzY0ODAwOzI1OTQyODczMTg3OTY1MjgwOzA7MDs1Mzs1Mjs2NDE7MjIyOzYzOTsyNzsxOzE1OzQ7NTA7MDswOzExMDU7MTE5OTsxNzY5ODM0MjEwNDk5OzA7MDsyMjc7MDswOzA7NC42MTI1NTEzMjUyNjU5ODFlKzU1OzUwOzA7MDt8OTIzLDQwNDUsMi4xMzY1OTM1ODY5ODIzMTdlKzU4LDEyLCwwLDk1Mzs5MTAsMjIwMCw0Ljk2Mjk0MDYzNDYzMTk1MWUrNTYsMCwsMSw5ODM7ODg4LDIwOTgsMS40NDY0NTg4MTIwMzc1NThlKzU3LDksMTc2OTg1OTA1ODEzOToxOjE3Njg3MDU5MTM0MTg6MDowOjA6MTowOjE3Njg3MDUxNzI0MjU6IDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEgMDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6LDAsODg4Ozg1NiwyMDQzLDMuNDAwMDg2NjI0MTk4NDY0ZSs1NywwLCwxLDg1Njs4NTgsMjAzMCwyLjUxODk3ODYyMDQzNDcxMmUrNTYsMCwsMSw4Njg7ODQ4LDE5OTYsMy4zNTM4MjM2NTk0NjYwNDFlKzU1LDEsNTowOjE6MDoxOiA0NTA6MjotNDA6NjY1OjA6MTowOjAhMzk0Mjo1Oi0yODoxNjg6MDoxOjA6MCE1ODc6MjotMzg6MjY6MDoxOjA6MCE1MTk2OjE6NTI6MTc2OjA6MTowOjAhNTIwMTo0Oi0yNToxNTU6MDowOjA6MCEyMjA4OjE6NTY6MjIyOjA6MDowOjAhNzI3Mzo1OjUwOjM5OjA6MDowOjAhMzk4OjQ6LTEzMDoxNzc6MDowOjA6MCExMDA1MToyOi0xNDo0NTA6MDowOjA6MCE3MzA5OjI6MTY6NDA1OjA6MDowOjAhMTEwMDU6NTotMTAyOjQ4OTowOjA6MDowITEwNjYxOjU6LTc5OjQ3OjA6MDowOjAhMTMzODY6MDotMTE6MzcwOjA6MDowOjAhMTIwNTA6NTotNjk6NTIzOjA6MDowOjAhMTU4NTY6MToxMTozNjY6MDowOjA6MCExNTg0MToyOi02Njo0MTY6MDowOjA6MCExNTkxMjoyOi03MToyNDg6MDowOjA6MCE5ODE4OjU6LTQ0OjY2MzowOjA6MDowISAxLDAsODU4OzgyMSwxMTcxLDIuNzU0OTY0OTI3Nzg5NDEyOGUrNTcsMSwtMS80LzYgMyAxNzY4NzA2NDUwNjgwIDEsMCw4MjE7Nzc4LDExMjgsMS42ODI5NjY5NDEyODAzMjdlKzU1LDIsNjguMzkyNjI3NTgyODEzNDYgMCA3MzQ2IDEsMCw3Nzg7NzQ5LDE4MzMsMi40NTc1NjM1MjYxODQ4NTVlKzU0LDAsLDEsNzQ5OzcyOSwxNzg4LDguNDc5MDEwOTE0MTA3NDA1ZSs1NCwwLCwxLDcyOTs3MTQsMTc1OCw4LjQzMDkzNjMyMzIwNjQ4NGUrNTYsMCwsMSw3MTQ7Njk0LDE3MjEsMi42NzkzODY5MDQ0NTM3ODllKzU3LDAsLDEsNjk0OzY3MywxNjgyLDYuOTE3NDk4NTY0MDczMjU3ZSs1NiwwLCwxLDY3Mzs2NTcsMTY1MiwyLjIyNDExOTU2Mjg5NTg4MzNlKzU3LDAsLDEsNjU3OzY0NywxNjM3LDIuNDI2NTQ0ODg4MjI4ODM5OGUrNTcsMCwsMSw2NDc7NjQzLDE1OTgsOS41NTI2MTE3MTQ2OTI0MjRlKzU3LDAsLDEsNjQzOzYxOSwxNTM5LDEuNDI2NTQyNzk3MDE0MjU3NGUrNTgsMCwsMSw2MTk7NjAxLDE0NzksMS4yNjA5MjYyNzU5ODQ3OTllKzU3LDAsLDEsNjAxOzU2OSwxNDIwLDMuODA3MDgwMjMwODE0NjkwNmUrNTcsMCwsMCw1Njk7NTUwLDE0MTUsMS4wMzg2NjI2MDQ1ODI2NjU3ZSs1OCwwLCwxLDU1MDt8MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTExMTExMTEwMDExMTExMTAwMTAxMTExMTExMTExMTEwMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTAxMDEwMDAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMDEwMTExMTExMTExMTExMTExMTExMTExMTExMTEwMDAwMTEwMDEwMDAwMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAwMDAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTExMDAxMTExMTExMTExMTExMTExMTExMTAwMDAwMDAwMDAwMDAwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDAxMTExMTExMTExMTExMTExMDAwMDAwMTEwMDExMTExMTAwMTExMTExMTExMTAwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTAwMTExMTExMTExMTExMTEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDExMTExMTExMTExMTExMTExMDEwMTAxMDEwMTAxMTExMTAxMTExMTEwMTExMTEwMTAxMDEwMTAxMDAwMDAwMDExMTEwMDAwMDAwMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMDAwMDAxMTExMTEwMDExMTExMTExMDAwMDAwMDAwMDAwMTExMTAwfDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMTExMTExMTExMTExMTAwMDAwMDAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTExMTExMTEwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDEwMDAwMDAwMDAwMDExMTAxMTExMTExMTExMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTExMTExMTExMTAxMTExMTExMTExMTExMTEwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMTExMTExMTExMTAxMTExMTExMTExMTExMTExMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMDEwMTAwMDExMTAwMDExMTExMTExMTExMTEwMTExMDExMTExMTExMTExMTExMTAwMDAwMDExMTF8fA%3D%3D%21END%21","saveSave":1,"revertPresetContainer":"","advancedMode":0,"blockBeginningDiv":null,"earlygameAdditionalInfo":null,"endgameInfo":null,"blockClosingDiv":null,"iniSeed":"R","cookies":4e+69,"cookiesBTA":1e+78,"prestige":1e+22,"scoreMult":1,"scoreMultVerify":0,"lumps":103,"lumpType":0,"gcClickCount":77777,"clickCooldown":20,"buildingCountAnchor":1095,"useEB":0,"useRebuy":0,"unmuteMinigames":0,"wizCount":802,"wizLevel":10,"buyOption1":1,"buyOption2":5,"heraldsOverride":0,"heraldsN":100,"leftAura":10,"rightAura":4,"fortuneChance":4,"fortuneClaim":0,"startingSeason":185,"scriedSeason":0,"reindeerCount":0,"pledgeStatus":1,"forceFtHoF":0,"forceCastToggle":0,"forcedCastValue":0,"gardenLevel":9,"gardenSeed":1,"gardenRotation":0,"gardenFrozen":0,"toNextTick":0,"plant1":17,"plant1Age":"mature","gTulips":0,"plant2":6,"plant2Age":"mature","office":4,"diamondGod":2,"rubyGod":4,"jadeGod":6,"buffs":"0,21000,18000,7;3,4590,1760,17;","seedNats":1,"seedTicker":1,"gSwitch":0,"iniSpawn":1,"iniSpawnTimer":0,"iniDO":0,"iniDEoRL":0,"iniGC":23,"iniGC2":21,"iniGC3":1,"boughtSF":0,"boughtCE":0,"DFChanceMult":1,"gcRateMult":1,"autosave":0,"buildingRelatedSaveData":"0_0_0_0_0_0_0_0_0_0_0_0_0_0_0_0_0_0_0_0,1_1_0_1_1_0_0_0_1_1_0_1_1_1_1_1_1_1_1_1","gamePrefsSaveData":"010100101011001101010111011","activePresetSave":"N","miscSaveData":"50_N_N_c291cCBlbmpveWVy"}>>ContainerEnd<<`;
new CCCEMPreset('soup', soupPreset, () => {
  buildingRelList=  [[-8, -33, -17, -17, -17, -26, -13, -20, -19, -19, -14, -23, -20, -12, -16, -32, -47, -39, -24],0,
                    [-18, -22, -17, -17, -17, -19, -21, -18, -24, -16, -13, -27, -12, -15, -17, -34, -46, -33, -31],0]
  buildingRelListEB=[[-4, -36, -17, -17, -18, -22, -17, -19, -19, -11, -25, -20, -20, -15, -16, -26, -51, -39, -28],-2,
                    [-18, -22, -18, -17, -17, -19, -20, -21, -22, -5, -28, -23, -14, -16, -17, -26, -53, -34, -33],1]
  CCCEMButtons['prefsRecord'].changeState();

  Game.specialTab="dragon";
}, ['useEB', 'useRebuy', 'wizCount', 'wizLevel', 'gardenLevel', 'buyOption1', 'buyOption2'], 'Setup combo', [9, 26], '<b>Score greatly varies for the amount of cps boosters used</b>. For reliable execution, aim for a score of at least <b>100%</b> adjusted for <b>10 clicks/s</b> with mokal swap used.');

presetButtonsToRegister.push(
  new CCCEMButton('soupPreset', 'Setup combo', 
    new presetButton('soup'),
    new buttonInfo('Setup combo', 'Resets settings to a present setting for a typical setup combo.', [9, 26]),
    () => { }
  ));

presetButtonsToRegister.push(new CCCEMButton('findPreset', 'Find presets', 
  new pesudoInputButton(),
  new buttonInfo('Browse preset', 'Browse presets in the database.', [7, 31]),
  () => {
    browsePreset();
  }, { preNewLine: getTitlePreNewLine('Community-made') }
));
presetButtonsToRegister.push(new CCCEMButton('createPreset', 'Create preset', 
  new triggerButton(),
  new buttonInfo('Create preset', 'Create a preset to submit from your current settings, allowing anyone else to find and play on it.', [7, 27]),
  () => {
    createPreset(0);
  }, { }
));

const initSettings = `>>CCCEMContainerTop:v2.95<<{"resetKey":82,"importSave":"Mi4wNTh8fDE3Njk3ODA5NzAyNTQ7MTc2OTc4MDk3MDI1NDsxNzY5NzgyMzgxNjYwO0F3YWl0aW5nIElucHV0O3hwbmx3OzAsMSwwLDAsMCwwLDB8MTExMTExMDExMDAxMDExMDAxMDEwMTEwMDAxfDA7MDswOzA7MDswOzA7MDswOzA7MDswOzA7MDswOzA7MDswOzA7MDswOzA7OzA7MDswOzA7MDswOzA7LTE7LTE7LTE7LTE7LTE7MDswOzA7MDs3NTswOzA7LTE7LTE7MTc2OTc4MDk3MDI1NDswOzA7OzA7MDswOzA7NTA7MDswO3wwLDAsMCwwLCwwLDA7MCwwLDAsMCwsMCwwOzAsMCwwLDAsLDAsMDswLDAsMCwwLCwwLDA7MCwwLDAsMCwsMCwwOzAsMCwwLDAsLDAsMDswLDAsMCwwLCwwLDA7MCwwLDAsMCwsMCwwOzAsMCwwLDAsLDAsMDswLDAsMCwwLCwwLDA7MCwwLDAsMCwsMCwwOzAsMCwwLDAsLDAsMDswLDAsMCwwLCwwLDA7MCwwLDAsMCwsMCwwOzAsMCwwLDAsLDAsMDswLDAsMCwwLCwwLDA7MCwwLDAsMCwsMCwwOzAsMCwwLDAsLDAsMDswLDAsMCwwLCwwLDA7MCwwLDAsMCwsMCwwO3wwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDB8MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMHx8%21END%21","saveSave":1,"advancedMode":0,"blockBeginningDiv":null,"earlygameAdditionalInfo":null,"endgameInfo":null,"blockClosingDiv":null,"iniSeed":"R","cookies":0,"cookiesBTA":0,"prestige":0,"scoreMult":1,"scoreMultVerify":0,"lumps":0,"lumpType":0,"gcClickCount":0,"clickCooldown":20,"buildingCountAnchor":0,"useEB":0,"useRebuy":0,"unmuteMinigames":0,"wizCount":0,"wizLevel":0,"buyOption1":0,"buyOption2":2,"heraldsOverride":0,"heraldsN":100,"leftAura":0,"rightAura":0,"fortuneChance":4,"fortuneClaim":0,"startingSeason":0,"scriedSeason":0,"reindeerCount":0,"pledgeStatus":0,"forceFtHoF":0,"forceCastToggle":0,"forcedCastValue":0,"gardenLevel":0,"gardenSeed":-1,"gardenRotation":0,"gardenFrozen":0,"toNextTick":0,"plant1":0,"plant1Age":0,"gTulips":0,"plant2":0,"plant2Age":0,"office":0,"diamondGod":0,"rubyGod":0,"jadeGod":0,"buffs":"","seedNats":1,"seedTicker":1,"gSwitch":0,"iniSpawn":0,"iniSpawnTimer":1500,"iniDO":0,"iniDEoRL":0,"iniGC":-1,"iniGC2":-1,"iniGC3":-1,"boughtSF":0,"boughtCE":0,"DFChanceMult":1,"gcRateMult":1,"autosave":0,"buildingRelatedSaveData":"0_0_0_0_0_0_0_0_0_0_0_0_0_0_0_0_0_0_0_0,1_1_0_1_1_0_0_0_1_1_0_1_1_1_1_1_1_1_1_1","gamePrefsSaveData":"110111011001011001010110001","activePresetSave":"N","miscSaveData":"75_N_N_QXdhaXRpbmcgSW5wdXQ="}>>ContainerEnd<<`;
new CCCEMPreset('initialization', initSettings, //used for loading the mod for the first time, prompting user to select a preset
  () => {
  CCCEMButtons['editPreset'].hidden = true;

  CCCEMCategories['interfaceBegin'].hidden = true;
  CCCEMCategories['savingControls'].hidden = true;

  CCCEMButtons['loadPForPause'].hidden = true;
  CCCEMButtons['loadCastFinder'].hidden = true;
  CCCEMButtons['createPreset'].hidden = true;
}, [], 'Initializing', [0, 0]);


presetButtonsToRegister.push(new CCCEMButton('blockClosingDiv', 'N', new HTML(), new buttonInfo('', 'hidden button', [0, 0]), null, { preNewLine: '</div>' }));

CCCEMCategories.presetSettings.register(...presetButtonsToRegister);

window.presetsGenerated = true;
}

function injectCSS(str) {
  let h = document.createElement('style');
  h.textContent = str;
  l('game').appendChild(h);
}
injectCSS(`
  .cccem-preset-split label { font-variant: small-caps; font-family: 'Merriweather', Georgia,serif; font-weight: bold; }
  .cccem-preset-split { display: flex; gap: 12px; align-items: flex-start; }
  .cccem-preset-split .left { flex: 0 0 30%; }
  .cccem-preset-split .right { flex: 0 0 70%; }
  .cccem-preset-label { display: block; margin-bottom: 6px; }
  .cccem-name-input { width: 100%; height: 32px; font-size: 14px; padding: 6px; box-sizing: border-box; text-align: center; }
  .cccem-desc-textarea { font-size: 12px; padding: 4px; width: 100%; height: 220px; box-sizing: border-box; }
  .cccem-icon-input { width: 64px !important; margin-right: 4%; box-sizing: border-box; }

  .framed.widePrompt.ultraWide { width: min(80vw, 800px) !important; left: max(-40vw, -400px) !important; }
`);
function switchVisibleSettingButtonLocation(node) {
  const hidden = l('buttonsHidden');
  const visible = l('buttonsVisible');
  if (node.parentNode == hidden) {
    visible.appendChild(node);
  } else if (node.parentNode == visible) {
    hidden.appendChild(node);
  }
}
let presetCreationStages = {
  0: {
    title: 'Creating preset',
    promptFunc: function() {
      if (presetCreationCurrentStep == 0) { presetCreationBufferObj = {}; }
      return '<div class="block">You are about to create a preset from your current settings.<br>Continue? Note that once you finish submitting, the preset cannot be changed!</div>'
    },
    options: [[loc('Go next'), 'createPreset(1);'], [loc('Nevermind'), 'Game.ClosePrompt();']]
  },
  1: {
    title: 'Basic details',
    promptFunc: function() {
      const existingValues = presetCreationBufferObj;
      const esc = (s) => (s === undefined || s === null) ? '' : String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
      return '<div id="fieldInfoDisplay" class="block" style="height: 26px; overflow-y: auto;">'+loc('Enter information below about your preset.')+'</div><div class="block cccem-preset-split">' +
        '<div class="left">' +
          '<label class="cccem-preset-label" for="cccem_preset_name">Ingame name</label>' +
          '<input id="cccem_preset_name" class="cccem-name-input" type="text" maxlength="30" value="' + esc(existingValues.name) + '" onmouseover="l(\'fieldInfoDisplay\').innerHTML=\''+loc('Name displayed in the notification and tooltip when applying your preset. Keep it short.')+'\';">' +
          '<div class="line"></div>' +
          '<label class="cccem-preset-label" for="cccem_preset_ingame">Button description</label>' +
          '<textarea id="cccem_preset_ingame" type="text" class="cccem-desc-textarea" style="height: 140px;" maxlength="400" onmouseover="l(\'fieldInfoDisplay\').innerHTML=\''+loc('A shortened version of the description for small tooltips. Displayed when hovering over the preset button. Keep it relatively short.')+'\';">' + esc(existingValues.ingame) + '</textarea><div class="line"></div>' +
          '<label class="cccem-preset-label" for="cccem_preset_reminder">Reminder to player</label>' +
          '<textarea id="cccem_preset_reminder" type="text" class="cccem-desc-textarea" style="height: 80px;" maxlength="140" onmouseover="l(\'fieldInfoDisplay\').innerHTML=\''+loc('Displayed on the confirmation prompt when applying the preset, and in the notification afterwards.')+'\';">' + esc(existingValues.reminder) + '</textarea>' +
        '</div>' +
        '<div class="right">' +
          '<label class="cccem-preset-label" for="cccem_preset_extendedName">Extended name</label>' +
          '<input id="cccem_preset_extendedName" class="cccem-name-input" type="text" maxlength="80" value="' + esc(existingValues.extendedName) + '" onmouseover="l(\'fieldInfoDisplay\').innerHTML=\''+loc('Only displayed in the preset browser.')+'\';">' +
          '<div class="line"></div>' +
          '<label class="cccem-preset-label" for="cccem_preset_desc">Description</label>' +
          '<textarea id="cccem_preset_desc" class="cccem-desc-textarea" rows="6" maxlength="3000" onmouseover="l(\'fieldInfoDisplay\').innerHTML=\''+loc('Only displayed in the preset browser. Put information such as what it\\\'s for and how to use it in here. Up to 3000 characters.')+'\';">' + esc(existingValues.description) + '</textarea><div class="line"></div>' +
          '<label class="cccem-preset-label" for="cccem_preset_creator">Creator</label>' +
          '<input id="cccem_preset_creator" type="text" style="width :100%; padding: 4px; text-align: center;" maxlength="80" value="' + esc(existingValues.creator) + '" onmouseover="l(\'fieldInfoDisplay\').innerHTML=\''+loc('Put your name here (or what you would like others to refer to you). Optional.')+'\';">' +
        '</div>' +
        '</div>';
    },
    onExit: function() {
      const name = (l('cccem_preset_name') || { value: '' }).value;
      const extendedName = (l('cccem_preset_extendedName') || { value: '' }).value;
      const ingame = (l('cccem_preset_ingame') || { value: '' }).value;
      const reminder = (l('cccem_preset_reminder') || { value: '' }).value;
      const desc = (l('cccem_preset_desc') || { value: '' }).value;
      const creator = (l('cccem_preset_creator') || { value: '' }).value;
      const h = { name: name.trim(), extendedName: extendedName.trim(), ingame: ingame.trim(), reminder: reminder.trim(), description: desc.trim(), creator: creator.trim() };
      for (let i in h) {
        presetCreationBufferObj[i] = h[i];
      }
    },
    options: [[loc('Go next'), 'createPreset(2);'], [loc('Go back'), 'createPreset(0);'], [loc('Abort'), 'Game.ClosePrompt();']]
  },
  2: {
    title: 'Set visible settings',
    promptFunc: function() {
      let str = '<div class="block">Choose buttons that will be visible and modifiable when your preset is used.<br>Note: buttons are always inserted at the end of the list.</div><div class="block" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">';
      str += '<div class="block" style=""><h4>'+loc('Hidden')+'</h4><div class="line"></div><div id="buttonsHidden" style="max-height: 400px; overflow-y: scroll;">'
      for (let i in CCCEMButtons) {
        if (CCCEMButtons[i].category.complexityHideImmune || 
          CCCEMButtons[i].category.presetBypass || 
          CCCEMButtons[i].nonInteractive || 
          (presetCreationBufferObj.visibleButtons && presetCreationBufferObj.visibleButtons.includes(i))
        ) {
          continue;
        }

        str += CCCEMButtons[i].getLStrPure('switchVisibleSettingButtonLocation(this);');
      }
      str += '</div></div><div class="block" style=""><h4>'+loc('Visible')+'</h4><div class="line"></div><div id="buttonsVisible" style="max-height: 400px; overflow-y: scroll;">'
      if (presetCreationBufferObj.visibleButtons) {
        for (let i in presetCreationBufferObj.visibleButtons) {
          str += CCCEMButtons[presetCreationBufferObj.visibleButtons[i]].getLStrPure('switchVisibleSettingButtonLocation(this);');
        }
      }
      str += '</div></div>'
      return str + '</div>';
    },
    onExit: function() {
      const visible = l('buttonsVisible');
      let arr = [];
      for (let i in visible.childNodes) { 
        if (!(visible.childNodes[i] instanceof HTMLElement)) { continue; }
        arr.push(visible.childNodes[i].dataset.buttonkey);
      }
      presetCreationBufferObj.visibleButtons = arr;
      return arr;
    },
    afterPrompt: function() {
      l('prompt').classList.add('ultraWide');
    },
    options: [[loc('Go next'), 'createPreset(3);'], [loc('Go back'), 'createPreset(1);'], [loc('Abort'), 'Game.ClosePrompt();']]
  },
  3: {
    title: 'Select an icon',
    promptFunc: function() {
      return '<div id="cccem_icon_results" class="block">'+loc('Click an icon to select it. No selection yet.')+'</div>' +
        '<div class="block" style="text-align:center;">' +
        '<canvas id="cccem_icon_canvas" style="max-width:820px; max-height:520px; width:100%; height:auto; display:block; margin: 8px auto; border: 1px solid #555;"></canvas>' +
        '</div>';
    },
    afterPrompt: function() {
      const canvas = l('cccem_icon_canvas');
      const results = l('cccem_icon_results');
      if (!canvas || !results) { return; }

      l('prompt').classList.add('ultraWide');

      const image = Pic('img/icons.png');
      const ctx = canvas.getContext('2d');

      const defaultSelect = presetCreationBufferObj.icon ?? [16, 5];

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

        const handler = function(ev, x, y) {
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
    },
    onExit: function() {
      const canvas = l('cccem_icon_canvas');
      const results = l('cccem_icon_results');
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
      presetCreationBufferObj.icon = [x, y];
      PlaySound('snd/giftSend.mp3');
      return [x, y];
    },
    options: [[loc('Go next'), 'createPreset(4);'], [loc('Go back'), 'createPreset(2);'], [loc('Abort'), 'Game.ClosePrompt();']]
  },
  4: {
    title: 'Submit to the form',
    promptFunc: function() {
      presetCreationCurrentStep = -1;
      CCCEMButtons['revertPresetContainer'].type.willSave = false;
      const saveSaveStatus = CCCEMButtons['saveSave'].state;
      CCCEMButtons['saveSave'].changeState(true);
      presetCreationBufferObj.settings = escape(utf8_to_b64(getSettingsCode()));
      CCCEMButtons['saveSave'].changeState(saveSaveStatus);
      CCCEMButtons['revertPresetContainer'].type.willSave = true;
      const str = JSON.stringify(presetCreationBufferObj);
      str = str.replaceAll('\\n', '$$BR$$');
      presetCreationBufferObj = {};

      return '<div class="block">'+loc('Now, go to <a href=\"%1\" target=\"_blank\">this form</a> and input the below code!', 'https://forms.gle/HWgKFhrct7CZhXJp6')+'</div><textarea id="textareaPrompt" style="width: 100%; height: 400px; font-size: 8px;" readonly>' + str + '</textarea>'
    },
    afterPrompt: function() {
      l('textareaPrompt').focus();
      l('textareaPrompt').select();
    },
    options: [loc('Done!')]
  },

  100: {
    title: 'Done!',
    promptFunc: function() {
      return '<div class="block">'+loc('The preset was successfully submitted.')+'</div>';
    },
    options: []
  }
}
let presetCreationBufferObj = {};
let presetCreationCurrentStep = -1;
function createPreset(stage) {
  const st = presetCreationStages[stage];
  let data = null;
  presetCreationCurrentStep = Math.max(presetCreationCurrentStep, stage);
  if (presetCreationStages[stage - 1] && presetCreationStages[stage - 1].onExit) {
    data = presetCreationStages[stage - 1].onExit();
  }
  Game.Prompt('<id presetCreation><noClose><h3>'+st.title+'</h3><div class="line"></div>' + st.promptFunc(data), st.options, st.updateFunc ?? 0, 'widePrompt');
  if (st.afterPrompt) {
    st.afterPrompt();
  }
}

injectCSS(`
  .cccem-preset-expanded-display { cursor: normal !important;  }
  .cccem-preset-expanded-display:hover { border: 0px !important; }
  .cccem-preset-display { border-radius: 8px; padding: 10px; cursor: pointer; }
  .cccem-preset-display:hover { border: 1px solid white; }
  .cccem-preset-display .row { display:flex; gap:12px; align-items:flex-start; padding-bottom: 0px; }
  .cccem-preset-display .cccem-preset-icon { width:48px; height:48px; background-image: url('img/icons.png'); background-repeat:no-repeat; border-radius:6px; flex:0 0 48px; box-shadow: 0 1px 0 rgba(0,0,0,0.2) inset; }
  .cccem-preset-display .title { font-size: 14px; margin:0 0 4px 0; text-align: left; font-weight: bold; text-shadow:0px 1px 3px #d2faff82; }
  .cccem-preset-display .creator { font-size: 12px; color: #ccc; margin-bottom: 2px; text-align: left; font-variant: small-caps; font-family: 'Merriweather', Georgia,serif; }
  .cccem-preset-display .desc { font-size: 13px; white-space: pre-wrap; margin-top: 8px; color: #eee; text-align: left; }
  .option .cccem-preset-load-button { font-size: 18px; padding: 8px; }
`);
var presetsIndex = null;
var presetsData = null;
function produceWaitingPrompt() {
  Game.Prompt('<id waitingPrompt><div class="block" style="font-family: \'Merriweather\', Georgia,serif; font-size: 18px; font-weight: bold;">'+loc('Please wait...')+'</div>', [])
}
function esc(s) { return (s === undefined || s === null) ? '' : String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function browsePreset() { 
  if (!window.presetsIndex) { 
    fetchPresetsIndex();
    produceWaitingPrompt();
    return;
  }

  let str = '';
  for (let i in presetsIndex) {
    str += getDisplayFromPreset(presetsIndex[i], i);
  }

  Game.Prompt('<id presetsBrowser><h3>'+loc('Browse presets')+'</h3><div class="line"></div><div id="browserMain" class="block" style="overflow-y: scroll; height: 320px;">'+str+'</div><div id="itemDetails" class="block"  style="overflow-y: scroll; height: 320px; display: none;"></div>', 
    [[loc('Go back'), "PlaySound(\'snd/tickOff.mp3\');l('itemDetails').style.display = 'none';l('browserMain').style.display = '';l('promptOption0').style.display = 'none';"], [loc('Close'), 'PlaySound(\'snd/tick.mp3\');']], 0, 'widePrompt');
  l('promptOption0').style.display = 'none';
}
function openPresetDetails(uuid) {
  l('itemDetails').style.display = '';
  l('browserMain').style.display = 'none';
  l('promptOption0').style.display = '';

  const obj = presetsIndex[uuid];
  const icon = Array.isArray(obj.icon) && obj.icon.length >= 2 ? obj.icon : [16, 5];
  const px = - (parseInt(icon[0], 10) || 0) * 48;
  const py = - (parseInt(icon[1], 10) || 0) * 48;
  const title = esc(obj.extendedName || obj.name || obj.ingame || loc('Unnamed preset'));
  const creator = esc(obj.creator || '');
  const desc = esc(obj.description || obj.ingame || '').replaceAll('$$BR$$', '<br>');

  let str = '<div class="cccem-preset-display cccem-preset-expanded-display">' +
    '<div class="row">' +
    '<div class="cccem-preset-icon" style="background-position: ' + px + 'px ' + py + 'px;"></div>' +
    '<div style="flex:1;">' +
    '<div class="title">' + title + '</div>' +
    (creator ? '<div class="creator">'+loc('By: %1', creator) + '</div>' : '') +
    '</div>' +
    '</div>' +
    '<div class="line"></div>' +
    '<div class="desc" style="overflow-y: min-height: 100px;">' + desc + '</div>' +
    '<div style="margin-top: 10px;">' +
    '<a class="option cccem-preset-load-button" '+Game.clickStr+'="applyExternalPreset('+uuid+')">' + loc('Try it out') + '</a>' + 
    '</div></div>';
  l('itemDetails').innerHTML = str;
}
function getDisplayFromPreset(obj, uuid) {
  const icon = Array.isArray(obj.icon) && obj.icon.length >= 2 ? obj.icon : [16, 5];
  const px = - (parseInt(icon[0], 10) || 0) * 48;
  const py = - (parseInt(icon[1], 10) || 0) * 48;
  const title = esc(obj.extendedName || obj.name || obj.ingame || 'Unnamed preset');
  const creator = esc(obj.creator || '');
  let desc = esc(obj.description || obj.ingame || '').replaceAll('$$BR$$', '<br>');
  if (desc.length > 300) {
    desc = desc.slice(0, 300) + '...<div style="color: #ffffff; font-size: 85%;">'+loc('(Open to see more)')+'</div>';
  }

  return '<div class="block cccem-preset-display" '+Game.clickStr+'="PlaySound(\'snd/tick.mp3\');openPresetDetails('+uuid+');">' +
    '<div class="row">' +
    '<div class="cccem-preset-icon" style="background-position: ' + px + 'px ' + py + 'px;"></div>' +
    '<div style="flex:1;">' +
    '<div class="title">' + title + '</div>' +
    (creator ? '<div class="creator">By: ' + creator + '</div>' : '') +
    '</div>' +
    '</div>' +
    '<div class="line"></div>' +
    '<div class="desc">' + desc + '</div>' +
    '</div>';
}
var isFetchingIndex = false;
var isFetchingData = false;
async function fetchPresetsIndex() {
  if (isFetchingIndex) { return; }
  isFetchingIndex = true;
  try {
    const res = await fetch(cccemDir+'presetsStorage/presetsIndex.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('Failed to fetch presets index: ' + res.status);
    const json = await res.json();
    window.presetsIndex = json;
    browsePreset();
    return json;
  } catch (err) {
    console.warn('fetchPresetIndex error:', err);
    return null;
  }
}
async function fetchPresetsData(toLoad) {
  if (isFetchingData) { return; }
  isFetchingData = true;
  try {
    const res = await fetch(cccemDir+'presetsStorage/presetsData.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('Failed to fetch presets data: ' + res.status);
    const json = await res.json();
    window.presetsData = json;
    if (toLoad) { applyExternalPreset(toLoad); }
    return json;
  } catch (err) {
    console.warn('fetchPresetIndex error:', err);
    return null;
  }
}
function applyExternalPreset(uuid) {
  if (!presetsData) { 
    fetchPresetsData(uuid);
    produceWaitingPrompt();
    return;
  }

  const data = presetsData[uuid];
  const iData = presetsIndex[uuid];
  if (!data) { return; }
  const preset = new externalPreset(String(uuid), b64_to_utf8(unescape(data.settings)), () => { }, data.visibleButtons, iData.ingame, iData.icon, iData.reminder);
  Game.ClosePrompt();
  preset.openConfirmationMenu();
  CCCEMCategories.presetSettings.insert(new CCCEMButton('extPreset'+uuid, iData.name, 
    new presetButton(String(uuid)),
    new buttonInfo(iData.name, iData.ingame, iData.icon)  
  ), CCCEMCategories.presetSettings.buttons.indexOf(CCCEMButtons['createPreset']) + 1);
  RedrawCCCEM();
  PlaySound('snd/giftGet.mp3');
}

function parseSubmission(json) {
  const result = JSON.parse(json);

  let index = {};
  let data = {};
  const uuid = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);

  index.extendedName = result.extendedName;
  index.description = result.description;
  index.icon = result.icon;
  index.creator = result.creator;
  index.reminder = result.reminder

  index.ingame = result.ingame;
  index.name = result.name;

  data.settings = result.settings;
  data.visibleButtons = result.visibleButtons;

  console.log('"' + uuid + '": ' + JSON.stringify(index));
  console.log('"' + uuid + '": ' + JSON.stringify(data));
}