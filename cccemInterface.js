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

var cccemSpritesheet=App?this.dir+"/cccemAsset.png":"https://raw.githack.com/CursedSliver/asdoindwalk/main/cccemAsset.png"

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

if (typeof CCCEMUILoaded === 'undefined') {
  var CCCEMUILoaded=1
  Game.registerHook('click', () => {Devastate();}); //calculates devastatedness when you click
  Game.registerHook('logic', () => {if (Game.recalculateGains) Game.CalculateGains();}); //moves the recalculation check to later in the logic function

  //prevents you from using OpenSesame as this mod removes the debugLog to make it look nice, which breaks the game if you run OpenSesame.
  eval("Game.OpenSesame="+Game.OpenSesame.toString().replace("var str='';","return")) 
  if (l('debugLog')) {l('debugLog').remove();};
  
  //diasbles the first CpS recalculation
  eval("Game.Logic="+Game.Logic.toString().replace("if (Game.recalculateGains) Game.CalculateGains();",""))
  
  //disable saving
  eval("Game.Logic="+Game.Logic.toString().replace("if (canSave) Game.WriteSave();","if (canSave) customSave();"))
  eval("Game.Logic="+Game.Logic.toString().replace("if ((Game.toSave || (Game.T%(Game.fps*60)==0 && Game.T>Game.fps*10 && Game.prefs.autosave)) && !Game.OnAscend)","if ((Game.toSave || (Game.T%(Game.fps*60)==0 && Game.T>Game.fps*10 && autoSaveCCCEM)) && !Game.OnAscend)"))
  eval("Game.Timeout="+Game.Timeout.toString().replace("Game.WriteSave();","")) 
  eval("Game.Resume="+Game.Resume.toString().replace("Game.LoadSave();",""))
  
  //seed spawn fortunes, GC effects, GC timer, and DEoRL, plus find multipliers when a GC is clicked
  eval("Game.getNewTicker="+Game.getNewTicker.toString().replace("!manual && Game.T>Game.fps*10 && Game.Has('Fortune cookies') && Math.random()<(Game.HasAchiev('O Fortuna')?0.04:0.02)","!manual && Game.T>Game.fps*10 && Game.Has('Fortune cookies') && FortuneTicker(manual)"))
  eval("Game.shimmerTypes.golden.popFunc="+Game.shimmerTypes.golden.popFunc.toString().replace("var list=[];","var list=[]; isClickedGC=true; FindMaxComboPow(); if (seedNats) {Math.seedrandom(Game.seed+'/'+Game.goldenClicks);};"))
  eval("Game.updateShimmers="+Game.updateShimmers.toString().replace("me.time++;","me.time++; if (seedNats) {Math.seedrandom(Game.seed+'/'+(i=='golden'?Game.goldenClicks:Game.reindeerClicked)+'/'+me.time);};")) 
  
  //find combo multipliers when a buff or golden cookie dies
  eval("Game.shimmer.prototype.die="+Game.shimmer.prototype.die.toString().replace("Game.shimmersL.removeChild(this.l);","if (!isClickedGC) {FindMaxComboPow()}; isClickedGC=false; Game.shimmersL.removeChild(this.l);"))
  eval("Game.updateBuffs="+Game.updateBuffs.toString().replace("if (buff.onDie) buff.onDie();","if (buff.onDie) buff.onDie(); FindMaxComboPow();"))
  };

function FortuneTicker(manual) {
  if (!seedTicker) {return (Math.random()<forceFortune)}
  Math.seedrandom(Game.seed+'/'+tickerCount);
  if (!manual) tickerCount++;
  return (Math.random()<forceFortune)
  };

function FindAuraP(a1, a2) { //finds the strength of the a1 aura in the case that a2 is also slotted
  if (a1 == 15 && a2 != 18) {return 2}
  if (!a2) {a2=0};
  var auraSlot1=Game.dragonAura
  var auraSlot2=Game.dragonAura2
  Game.dragonAura=0
  Game.dragonAura2=a2
  Game.CalculateGains();
  var noA1=Game.cookiesPs
  Game.dragonAura=a1
  Game.CalculateGains();
  var yesA1=Game.cookiesPs
  Game.dragonAura=auraSlot1
  Game.dragonAura2=auraSlot2
  Game.recalculateGains=1
  return yesA1/noA1
  };

function FindBuildingDiff() {
  Game.CalculateGains();
  var cur = Game.computedMouseCps 
  var curList = []
  for (var obj in Game.Objects) {
    curList.push(Game.Objects[obj].amount)
    };
  var buildCount=iniBC;
  var rebuy=0
  buildCount+=buildingRelList[rebuy+1]
  for (var i = 0; i < Object.keys(Game.Objects).length; i++)
    {
      if (buildCount<0) buildCount=0;
      Game.ObjectsById[i].amount=buildCount; 
      buildCount+=buildingRelList[rebuy][i]
    }
  Game.ObjectsById[7].amount=wizCount
  Game.CalculateGains();
  var def = Game.computedMouseCps 
  for (var i = 0; i < Object.keys(Game.Objects).length; i++) 
    {
      Game.ObjectsById[i].amount=curList[i]
    };
  Game.recalculateGains=1
  return cur/def
  };

function Devastate() {
  var devastation = Game.buffs.Devastation?Game.buffs.Devastation.multClick:1
  //var cookiesFromClick = Game.computedMouseCps
  var diff = FindBuildingDiff()
  var undevastated = FindUndevastated()
  Game.CalculateGains()
  devastatedness+=undevastated*devastation
  rebuyedness+=undevastated*devastation*diff
  var EB = (Game.auraMult("Elder Battalion")>=1)?1:0
  if (EB && !useEB) {incorrectEBwarn++}
  if (EB && useEB) {incorrectEBwarn--}
  //console.log(cookiesFromClick, undevastated, devastation, diff)
  };

function NormalizeDevastatedness(value) {
  return value/(maxUndevastated?maxUndevastated:1)
  };

function FindUndevastated() { //calculates combo power based on non-devastation factors
  var cComboPow=1; 
  for (var i in Game.buffs) {
    var buff=Game.buffs[i]; 
    if (buff.multCpS) {
      cComboPow*=buff.multCpS; 
      };
    if (buff.multClick) {
      if (buff.name=='Devastation') {continue};
      cComboPow*=buff.multClick
      };
    };
  if (Game.dragonAura == 16 || Game.dragonAura2 == 16) {
    if (Game.shimmerTypes['golden'].n>0) {
      cComboPow*=Math.pow(2.23, Game.shimmerTypes['golden'].n); 
      };
    var corAura = useEB?15:1;
    cComboPow/=FindAuraP(corAura);
    };
  if (maxUndevastated<cComboPow) {maxUndevastated=cComboPow}
  return cComboPow
  };

function FindMaxComboPow() {
  var mComboPow=1;
  var rComboPow=1; 
  var bsCount=0; 
  var isBS=false; 
  var godzPow=1; 
  for (var i in Game.buffs) {
    var buff=Game.buffs[i]; 
    for (var obj in Game.Objects) {
      if (Game.goldenCookieBuildingBuffs[obj][0]==buff.name) {
        isBS=true; 
        bsCount++;
        };
      };
    if (buff.multCpS) {
      mComboPow*=buff.multCpS; 
      //if consistent building special, instead store the difference between the buff gotten and the maximum (cursor), functionally negating the extra (or less) of the building special effect
      if (ConsistentBuffs(isBS?'building special':buff.type.name, bsCount)) {rComboPow*=buff.multCpS; if (isBS) {rComboPow*=(1+iniBC/10)/buff.multCpS};};
      isBS=false
      }; 
    if (buff.multClick) {
      mComboPow*=buff.multClick
      if (buff.name=='Devastation') {godzPow*=buff.multClick};
      if (ConsistentBuffs(buff.type.name)) {rComboPow*=buff.multClick;};
      };
    };
  if (Game.shimmerTypes['golden'].n>0) {
    mComboPow*=Math.pow(2.23, Game.shimmerTypes['golden'].n); 
    var corAura = useEB?15:1; 
    mComboPow/=FindAuraP(corAura);
    };
  if (maxComboPow<mComboPow) {maxComboPow=mComboPow; relComboPow=rComboPow; maxBSCount=bsCount; maxGodz=godzPow}; 
  };

//Returns true if buffName can be gotten consistently, otherwise return false
function ConsistentBuffs(buffName, bsCount) {
  let icBuffs=['dragonflight','blood frenzy','click frenzy','frenzy','dragon harvest']
  for (let i=0; i<bsCount; i++) {icBuffs.push('building special')}
  index=icBuffs.indexOf(forceFtHoF); if (forceFtHoF && index!=-1) icBuffs.splice(index, 1);
  index=icBuffs.indexOf('frenzy'); if (HasStartBuff(0) && index!=-1) icBuffs.splice(index, 1);
  index=icBuffs.indexOf('dragon harvest'); if (HasStartBuff(3) && index!=-1) icBuffs.splice(index, 1);
  for (var i=0; i<BuffCount(9); i++) {index=icBuffs.indexOf('building special'); if (index!=-1) icBuffs.splice(index, 1)};
  if (iniSpawn && get('iniGC')>=0) {index=icBuffs.indexOf(Game.goldenCookieChoices[get('iniGC')]); if (index!=-1) icBuffs.splice(index, 1)};
  if (iniDO && get('iniGC2')>=0) {index=icBuffs.indexOf(Game.goldenCookieChoices[get('iniGC2')]); if (index!=-1) icBuffs.splice(index, 1)};
  if (iniDEoRL && get('iniGC3')>=0) {index=icBuffs.indexOf(Game.goldenCookieChoices[get('iniGC3')]); if (index!=-1) icBuffs.splice(index, 1)};
  for (let i in icBuffs) {if (icBuffs[i] == buffName) {return false}};
  return true
  };

//Power of all the consistent buffs (preset + scry)
function AllConsistentBuffsPow() {
  var cBuffs=[];
  var cBuffsPow=1
  if (forceFtHoF!='random') {cBuffs.push(forceFtHoF)};
  if (HasStartBuff(0) && !(cBuffs.includes('frenzy'))) {cBuffs.push('frenzy')};
  if (HasStartBuff(3) && !(cBuffs.includes('dragon harvest'))) {cBuffs.push('dragon harvest')};
  if (iniSpawn && get('iniGC')>=0 && (!(cBuffs.includes(Game.goldenCookieChoices[get('iniGC')])) || Game.goldenCookieChoices[get('iniGC')]=='building special')) {cBuffs.push(Game.goldenCookieChoices[get('iniGC')])}
  if (iniDO && get('iniGC2')>=0 && (!(cBuffs.includes(Game.goldenCookieChoices[get('iniGC2')])) || Game.goldenCookieChoices[get('iniGC2')]=='building special')) {cBuffs.push(Game.goldenCookieChoices[get('iniGC2')])}
  if (iniDEoRL && get('iniGC3')>=0 && (!(cBuffs.includes(Game.goldenCookieChoices[get('iniGC3')])) || Game.goldenCookieChoices[get('iniGC3')]=='building special')) {cBuffs.push(Game.goldenCookieChoices[get('iniGC3')])}
  for (var i=0; i<BuffCount(9); i++) {cBuffs.push('building special')};
  for (var i in cBuffs) {
    buff=cBuffs[i]
    if (buff=='frenzy') {cBuffsPow*=7}
    else if (buff=='dragon harvest') {cBuffsPow*=Game.Has('Dragon fang')?17:15}
    else if (buff=='dragonflight') {cBuffsPow*=Game.Has('Dragon fang')?1223:1111}
    else if (buff=='building special') {cBuffsPow*=1+(iniBC/10)}
    else if (buff=='click frenzy') {cBuffsPow*=777}
    else if (buff=='blood frenzy') {cBuffsPow*=666}
    else {console.log('score may be inaccurate: consistent golden cookie outcome unregistered (may be due to having some setting as storm or lucky or something like that)')}
    };
  return cBuffsPow
  };

function PrintScore() {
  if (!produceGrades) { return; }
  if (invalidateScore) {
    invalidateScore = 0;
    return function() { Game.Notify('Score invalid', 'Settings changed since reset!',[10,6]); invalidateScore=0; };
  }
  var cookieGain=Game.cookiesEarned-iniCE
  var clickGain=Game.handmadeCookies-iniHM
  var consistentPow = AllConsistentBuffsPow();
  var scoreRed=(maxComboPow*iniRaw*consistentPow/relComboPow);
  var score=(cookieGain/scoreRed)*scoreCorVal*autoScoreCor;
  var originalScore = score;
  score/=1.333e6;

  var z ='​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ '
  devastatedness = NormalizeDevastatedness(devastatedness);
  rebuyedness = NormalizeDevastatedness(rebuyedness)/devastatedness;
  var clicks = Math.trunc(0.000000001+(devastatedness/maxGodz));

  // Build history stats and push a new historyEntry
  const scoreStatO = new scoreStat(originalScore, score * 100);
  const stats = [
    scoreStatO,
    new cpsStat(cookieGain / iniRaw),
    new godzStat(maxGodz),
    new clicksStat(clicks),
    new devastatednessStat(devastatedness),
    new rebuyStat(rebuyedness),
    new comboStat(maxComboPow),
    new relComboStat(relComboPow),
    new consistentPowStat(consistentPow),
    new bsCountStat(maxBSCount),
    new cookieGainStat(cookieGain),
    new handmadeGainStat(clickGain),
    new iniRawStat(iniRaw)
  ];

  // compute click-based derived stats if possible (mirror later calculations)
  let clickScore = (cookieGain > 0) ? score * (clickGain / cookieGain) * 1.05 : 0;
  if (clickScore) {
    const clickDiffCor = (devastatedness / maxGodz) / (clicks || 1);
    const godzScore = clickScore / (clickDiffCor || 1);
    const trueDevastated = rebuyedness * (clicks || 1) * maxGodz;
    const scorePerClick = (godzScore && trueDevastated) ? (godzScore / trueDevastated) * 1333000 : 0;
    const scoreCorrection = (godzScore) ? ((trueDevastated / 4250) / (godzScore)) : 0;

    stats.push(new scorePerClickStat(scorePerClick));
    stats.push(new scoreCorrectionStat(scoreCorrection));
  } else {
    stats.push(new scorePerClickStat(0));
    stats.push(new scoreCorrectionStat(0));
  }

  if (originalScore > historySettings.scoreRegisterThreshold) { new historyEntry(stats, {
    startTimestamp: currentStartTimestamp,
    timestamp: Date.now(),
    presetUsed: activePreset
  }); }

  attemptsDone++;
  currentStartTimestamp = Date.now();

  logStr='';
  for (let i in stats) {
    if (stats[i] instanceof scoreStat) { continue; }
    if (stats[i].constructor.noteworthy) { 
      logStr += stats[i].getNotifStr();
      logStr += '<br>';
    }
  }
  return function() { 
    if (invalidateScore==0) {Game.Notify('Score: ' + SimpleBeautify(Math.floor(originalScore)) + ' (' + (score * 100).toFixed(1) + '%)', logStr + ((originalScore > historySettings.scoreRegisterThreshold)?'For more details, see history.':'Not enough score to register history. Gain at least '+SimpleBeautify(historySettings.scoreRegisterThreshold)+' score to register.'), scoreStatO.getIcon())}
    if (scoreCorNotify && clickScore && (scoreCorrection<0.99 || scoreCorrection>1.01)) {
      Game.Notify('Large score fault',
        'Score per click: ' + scorePerClick.toFixed(4) +
        'Score correction value: ' + scoreCorrection.toFixed(4) +
        z + 'Automatic score correction: ' + autoScoreCor.toFixed(4) +
        z + 'Set score mult to: ' + scoreCorrection*scoreCorVal
        ,[1,7]);
      };
    if (scoreCorNotify && clickScore && incorrectEBwarn>0) {Game.Notify('EB setting fault','EB setting not matching usage of Elder Battalion',[1,7]);}
  }
};

var historyEntries = [];
var favoritedEntries = new Set();
var attemptsDone = 0;
var historySettings = {
  scoreRegisterThreshold: 1,
};
var statTypesList = {};
var currentStartTimestamp = Date.now();
class historyEntry {
  constructor(stats, configs) {
    this.stats = [].concat(stats);

    configs = configs ?? {};
    this.name = configs.name ?? 'Attempt #' + Beautify(attemptsDone + 1);
    this.startTimestamp = configs.startTimestamp ?? (0); //finish later
    this.timestamp = configs.timestamp ?? Date.now();
    this.presetUsed = configs.presetUsed ?? activePreset;

    this.index = historyEntries.length;
    historyEntries.push(this);
  }
  favorited = false

  getLStr(extended) {
    let statsList = [];
    for (let i in this.stats) {
      if (!extended && !this.stats[i].constructor.summaryworthy) { continue; }
      statsList.push(this.stats[i]);
    }

    const columns = 2;
    const gridStyle = 'grid-template-columns:repeat(' + columns + ',1fr);';

    let cells = '';
    let colPos = 0; 
    for (let i = 0; i < statsList.length; i++) {
      const wantSpan = Math.min(statsList[i].cellsOccupying, columns);
      const remaining = columns - colPos || columns;
      const span = Math.min(wantSpan, remaining);

      cells += '<div class="statsCell" style="grid-column:span ' + span + ';">' + statsList[i].getLStr(extended) + '</div>';

      colPos += span;
      if (colPos >= columns) { colPos = 0; }
    }

    let str = '<div class="block historyEntry" '+Game.clickStr+'="openSpecificAttempt('+this.index+');">';
    str += '<div id="topSection" style="width: 100%; height: 24px; text-align: left;">';
    str += '<div class="title" style="font-size: 20px; display: inline-block;">' + this.name + '<div class="listing" style="display: inline-block;">' + (this.presetUsed ? 'Preset: ' + this.presetUsed.name : 'No preset') + '</div></div>' +
      '<span style="float: right;">'+loc('Duration: %1', Game.sayTime((this.timestamp - this.startTimestamp) / 1000 * Game.fps, -1)) + '</span>';
    str += '</div><div class="line"></div>';

    str += '<div class="statsGrid" style="' + gridStyle + '">' + cells + '</div>';
    return str + '</div>';
  }

  favorite() {
    this.favorited = true;
    favoritedEntries.add(this);
  }
}
var toReloadHistory = false;
function openHistory() {
  let str = '<id history><h3>'+loc('Combo history')+'</h3><div id="historyMainSection"><div class="block">'+loc('This is a list of your past combo attempts this session.')+'</div><div class="block" style="height: 550px; overflow-y: scroll;">';

  for (let i in historyEntries) {
    str += historyEntries[i].getLStr();
  }
  if (!historyEntries.length) {
    str += loc('Get at least <b>%1</b> score from an attempt to be stored here. Press try again to end an attempt.', SimpleBeautify(Math.floor(historySettings.scoreRegisterThreshold)));
  }

  str += '</div></div>';
  str += '<div id="historyExtendedView" style="display: none;"></div>';
  str += '<div id="historySettings" style="display: none;"></div>'
  Game.Prompt(str, [[loc('Go back'), 'switchToMenu(\'historyMainSection\');'], [loc('Close'), 'Game.ClosePrompt();'], [loc('Open history settings'), 'openSettings();']], 0, 'widePrompt');
  l('prompt').classList.add('ultraWide');
  l('promptOption0').style.display = 'none';
}
function switchToMenu(id) {
  const list = [
    'historyMainSection',
    'historyExtendedView',
    'historySettings'
  ];
  for (let i in list) {
    l(list[i]).style.display = 'none';
  }
  l(id).style.display = '';
  if (id == 'historyMainSection') {
    l('promptOption0').style.display = 'none';
    l('promptOption2').style.display = '';
    if (toReloadHistory) {
      toReloadHistory = false;
      openHistory();
    }
  } else {
    l('promptOption0').style.display = '';
    l('promptOption2').style.display = 'none';
  }
}
function openSpecificAttempt(id) {
  switchToMenu('historyExtendedView');
  if (!historyEntries[id]) { 
    l('historyExtendedView').innerHTML = loc('Unknown error');
    return;
  }
  let str = '';
  str += '<div class="block">';
  str += historyEntries[id].getLStr(true);
  str = str.replace('historyEntry', 'historyEntry alwaysHighlighted');
  str += '</div>';
  l('historyExtendedView').innerHTML = str;
}
function openSettings() {
  switchToMenu('historySettings');
  
  let str = '';
  str += '<div class="block">';
  str += '<div class="title" style="height: 24px; font-size: 20px; margin-top: 5px;">'+loc('Stats displayed in reset notification')+'</div>';
  for (let i in statTypesList) {
    str += statTypesList[i].prototype.getSmallToggleButton('noteworthy');
  }
  str += '<div class="line"></div><div class="title" style="height: 24px; font-size: 20px; margin-top: 10px;">'+loc('Stats displayed in history viewer')+'</div>';
  for (let i in statTypesList) {
    str += statTypesList[i].prototype.getSmallToggleButton('summaryworthy');
  }
  str += '</div>';

  l('historySettings').innerHTML = str;
}
function saveHistorySettings() {
  let obj = {};
  obj.normalSettings = escape(JSON.stringify(historySettings));
  let str = '';
  for (let i in statTypesList) {
    str += statTypesList[i].save() + '_';
  }
  obj.statSettings = str;
  return utf8_to_b64(JSON.stringify(obj));
}
function loadHistorySettings(str) {
  if (!str) { return; }
  try {
    const obj = JSON.parse(b64_to_utf8(str));
    if (obj.normalSettings) {
      Object.assign(historySettings, JSON.parse(unescape(obj.normalSettings)));
    }
    if (obj.statSettings) {
      const parts = (obj.statSettings || '').split('_');
      let idx = 0;
      for (let i in statTypesList) {
        const part = parts[idx++] ?? '0';
        if (statTypesList[i].load) statTypesList[i].load(part);
      }
    }
  } catch (e) {
    Game.Notify(loc('History settings failed to load!'), e?.message, [0, 7]);
    console.error(e);
  }
}
class stat {
  //baseline class, to extend
  constructor(detail) {
    this.detail = detail;
  }
  static key = 'base';
  static name = 'Stat';
  static description = 'Stat description';
  static cellsOccupying = 1;
  static noteworthy = false; //displayed in notif
  static summaryworthy = false; //displayed in history without opening details
  detail = null;

  getIcon() {
    return [0, 0];
  }
  getLStr(extended) {
    return '<div class="block stat">'
      + '<div class="statIcon">'
        + '<div class="statIconActual" style="'+writeIcon(this.getIcon())+'"></div>'
      + '</div>'
      + '<div style="flex:1;text-align:left;">'
        + '<div class="title stat">'
          + loc(this.constructor.name)
          + '<span class="statDescription" title="' + loc(this.constructor.description || '') + '">?</span>'
        + '</div>'
        + '<div class="statDetails">'
          + this.getDetailDisplay(extended)
        + '</div>'
      + '</div>'
    + '</div>';
  }
  getSmallToggleButton(property) {
    //small button containing that just identifies this stat
    return `
    <a class="option prefButton option${this.constructor[property]?'':' off'}" ${Game.clickStr}="statTypesList['${this.constructor.key}']['${property}'] = !statTypesList['${this.constructor.key}']['${property}']; openSettings(); toReloadHistory = true;">${loc(this.constructor.name)}</a>
    `;
  }
  getNotifStr() {
    return loc('<b>%1:</b> %2', [this.constructor.name, this.getDetailDisplay()]);
  }
  static save() {
    //idk
    return '' + (Number(this.noteworthy) * 2 + Number(this.summaryworthy));
  }
  static load(str) {
    str = parseInt(str);
    if (Math.floor(str / 2) % 2) { 
      this.noteworthy = true;
    } else {
      this.noteworthy = false;
    }
    if (str % 2) {
      this.summaryworthy = true;
    } else {
      this.summaryworthy = false;
    }
  }

  register(cl) {
    statTypesList[cl.key] = cl;
  }
}
class scoreStat extends stat {
  constructor(detail, percent) {
    super(detail);
    this.percent = percent;
  }
  static key = 'score';
  static name = 'Score';
  static description = 'An evaluation of your execution in terms of skill displayed. Luck (such as how many buffs) do not factor into the calculations.';
  static noteworthy = true;
  static summaryworthy = true;

  getDetailDisplay() {
    let scoreDisplay = '';
    if (this.detail > 1e10) { 
      scoreDisplay += Beautify(this.detail, 0);
    } else { 
      scoreDisplay += SimpleBeautify(Math.floor(this.detail));
    }
    if (this.percent < 1e6) { scoreDisplay += ' (' + SimpleBeautify(Math.floor(this.percent)) + '%)'; }
    return scoreDisplay;
  }
  getIcon() {
    const score = this.detail / 1.333e6;
    let icon;
    if (score > 2.75) { icon = [1, 7] }
    else if (score > 2.5) { icon = [3, 1, cccemSpritesheet] }
    else if (score > 2.25) { icon = [2, 1, cccemSpritesheet] }
    else if (score > 2) { icon = [1, 1, cccemSpritesheet] }
    else if (score > 1.75) { icon = [33, 4] }
    else if (score > 1.5) { icon = [32, 4] }
    else if (score > 1.25) { icon = [0, 1, cccemSpritesheet] }
    else if (score > 1) { icon = [14, 5] }
    else if (score > 0.85) { icon = [13, 5] }
    else if (score > 0.7) { icon = [12, 5] }
    else if (score > 0.6) { icon = [3, 0, cccemSpritesheet] }
    else if (score > 0.5) { icon = [2, 0, cccemSpritesheet] }
    else if (score > 0.4) { icon = [1, 0, cccemSpritesheet] }
    else if (score > 0.3) { icon = [0, 0, cccemSpritesheet] }
    else if (score > 0.2) { icon = [2, 5] }
    else if (score > 0.1) { icon = [1, 5] }
    else if (score > 0.01) { icon = [0, 5] }
    else if (score > 0) { icon = [12, 8] }
    else { icon = [12, 8]; }
    return icon;
  }
  getSmallToggleButton(property) {
    //small button containing that just identifies this stat
    if (property == 'noteworthy') { return '';}
    return `
    <a class="option prefButton option${this.constructor[property]?'':' off'}" ${Game.clickStr}="statTypesList['${this.constructor.key}']['${property}'] = !statTypesList['${this.constructor.key}']['${property}']; openSettings(); toReloadHistory = true;">${this.constructor.name}</a>
    `;
  }
  static { stat.prototype.register(this); }
}
//below icons are suggested by hellranger
class cpsStat extends stat {
  static key = 'cps';
  static name = 'CpS gained';
  static description = 'Amount of cookies in terms of CpS gained during the attempt.';
  static summaryworthy = true;
  getIcon() {
    const years = this.detail / (365 * 24 * 60 * 60);
    const map = {
      1e15: [22, 0],
      1e14: [21, 0],
      1e13: [31, 2],
      1e12: [30, 2],
      1e11: [31, 1],
      1e10: [30, 1],
      1e9: [29, 1],
      1e8: [28, 1],
      1e7: [27, 1],
      1e6: [26, 1],
      1e5: [25, 1],
      1e4: [24, 1],
      1e3: [23, 1],
      1e2: [22, 1],
      10: [21, 1],
      1: [20, 0],
      0: [24, 18]
    };
    const mapM = [0, 1, 10, 100, 1000, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13, 1e14, 1e15].reverse();
    for (let i of mapM) {
      if (Number(i) <= years) {
        return map[i];
      }
    }
    return [0, 7];
  } 
  getDetailDisplay(extended) {
    return convertSeconds(this.detail).split(', ').slice(0, extended?Infinity:1).join(', ');
  }
  static { stat.prototype.register(this); }
}
class godzStat extends stat {
  static key = 'godz';
  static name = 'Strength of Godzamok';
  static description = 'Maximum strength of the Devastation (Godzamok) buff.';
  static summaryworthy = true;
  getIcon() { return [23, 18]; } 
  getDetailDisplay() {
    return Beautify(this.detail);
  }
  static { stat.prototype.register(this); }
}
class clicksStat extends stat {
  static key = 'clicks';
  static name = 'Clicks';
  static description = 'Estimated number of clicks useful in the attempt.';
  getIcon() {
    const map = {
      70: [0, 35],
      65: [0, 25],
      60: [0, 21],
      55: [0, 19],
      50: [0, 18],
      40: [0, 2],
      30: [0, 1],
      0: [0, 0]
    }
    const mMap = Object.keys(map).reverse();
    for (let i of mMap) {
      if (Number(i) <= this.detail) {
        return map[i];
      }
    }
    return [0, 7];
  } // placeholder
  getDetailDisplay() {
    return Beautify(this.detail);
  }
  static { stat.prototype.register(this); }
}
class devastatednessStat extends stat {
  static key = 'devastatedness';
  static name = 'Devastatedness';
  static description = 'Maximum Godzamok power, multiplied by the amount of clicks during devastation.';
  static noteworthy = true;
  static summaryworthy = true;
  getIcon() { 
    const map = {
      8000: [11, 15],
      7500: [11, 30],
      7000: [11, 21],
      6500: [11, 24],
      6000: [11, 23],
      5000: [11, 22],
      3500: [11, 19],
      2500: [11, 13],
      1000: [11, 0],
      0: [11, 15]
    }
    const mMap = Object.keys(map).reverse();
    for (let i of mMap) {
      if (Number(i) <= this.detail) {
        return map[i];
      }
    }
    return [0, 7];
  }
  getDetailDisplay() {
    return Beautify(this.detail);
  }
  static { stat.prototype.register(this); }
}
class rebuyStat extends stat {
  static key = 'rebuyMult';
  static name = 'Rebuy multiplier';
  static description = 'Multiplier contribution from rebuying behavior (if enabled).';
  getIcon() { return [2, 6]; }
  getDetailDisplay() {
    if (!this.detail) { return 'Not rebuying'; }
    return this.detail.toFixed(3);
  }
  static { stat.prototype.register(this); }
}
class comboStat extends stat {
  static key = 'comboStrength';
  static name = 'Combo strength';
  static description = 'Maximum observed combo multiplier during the attempt.';
  getIcon() { return [23, 6]; }
  getDetailDisplay() {
    return Beautify(this.detail);
  }
  static { stat.prototype.register(this); }
}
class relComboStat extends stat {
  static key = 'relComboStrength';
  static name = 'Strength of non-constant buffs';
  static description = 'Cumulative strength of buffs that are not generally considered guaranteed.';
  getIcon() { return [0, 14]; }
  getDetailDisplay() {
    return Beautify(this.detail);
  }
  static { stat.prototype.register(this); }
}
class consistentPowStat extends stat {
  static key = 'consistentPow';
  static name = 'Strength of constant buffs';
  static description = 'Cumulative strength of buffs that are generally considered guaranteed.';
  getIcon() { return [10, 14]; }
  getDetailDisplay() {
    return Beautify(this.detail);
  }
  static { stat.prototype.register(this); }
}
class bsCountStat extends stat {
  static key = 'bsCount';
  static name = 'Number of BSs';
  static description = 'Number of building-special buffs observed in the attempt.';
  getIcon() { return [5, 6]; } 
  getDetailDisplay() {
    return String(this.detail ?? '');
  }
  static { stat.prototype.register(this); }
}
class cookieGainStat extends stat {
  static key = 'cookiesGained';
  static name = 'Cookie gained';
  static description = 'Total cookies gained during the attempt.';
  getIcon() { return [26, 17]; }
  getDetailDisplay() {
    return Beautify(this.detail);
  }
  static { stat.prototype.register(this); }
}
class handmadeGainStat extends stat {
  static key = 'handmadeGain';
  static name = 'Handmade gain';
  static description = 'Cookies directly produced by clicks during the attempt.';
  getIcon() { return [11, 26]; } //placeholder?
  getDetailDisplay() {
    return Beautify(this.detail);
  }
  static { stat.prototype.register(this); }
}
class iniRawStat extends stat {
  static key = 'initialRaw';
  static name = 'Initial Raw CpS';
  static description = 'Baseline raw cookies-per-second at the start of the attempt.';
  getIcon() { return [3, 5]; } 
  getDetailDisplay() {
    return Beautify(this.detail);
  }
  static { stat.prototype.register(this); }
}
class scorePerClickStat extends stat {
  static key = 'scorePerClick';
  static name = 'Score per Click';
  static description = 'Estimated contribution to score per effective click.';
  getIcon() { 
    const map = {
      20000: [21, 32],
      18000: [21, 25],
      16000: [29, 6],
      14000: [11, 8],
      12000: [11, 7],
      10000: [11, 6],
      0: [10, 0]
    }
    const mMap = Object.keys(map).reverse();
    for (let i of mMap) {
      if (Number(i) <= this.detail) {
        return map[i];
      }
    }
    return [0, 7];
  }
  getDetailDisplay() {
    return SimpleBeautify(Math.floor(this.detail));
  }
  static { stat.prototype.register(this); }
}
class scoreCorrectionStat extends stat {
  static key = 'scoreCorrection';
  static name = 'Score correction value';
  static description = 'Automatic correction factor computed for score normalization.';
  getIcon() { return [16, 5]; }
  getDetailDisplay() {
    return this.detail.toFixed(4);
  }
  static { stat.prototype.register(this); }
}

function BuffsDesc(buffsStr) {//give a more readable description of the buff parameters in the prompt
  let str=''
  let buffsArr = buffsStr.split(";")
  for (let i in buffsArr) {
    if (!buffsArr[i]) {break}
    let buffArr = buffsArr[i].split(",")
    str += 'Name: ' + Game.buffTypes[parseInt(buffArr[0])].name + '\n'
    str += 'Max Time: ' + Number(buffArr[1]/Game.fps) + '\n'
    str += 'Time: ' + Number(buffArr[2]/Game.fps) + '\n'
    if (buffArr[3]) str+='Pow: '+Number(buffArr[3]) + '\n'
		if (typeof buffArr[4]!=='undefined') str+='Obj: '+parseInt(buffArr[4]) + '\n'
		if (typeof buffArr[5]!=='undefined') str+='Arg 3: '+Number(buffArr[5]) + '\n'
    str += '\n'
    };
  return str.slice(0, -2)
  };

function MakeBuffsStr(buffsStr) {//returns a buff string, takes buff description or buffsStr as input and returns buffsStr. If description, also multiply time by fps
  buffsStr = buffsStr.toLowerCase().replace(/\s/g,'')
  buffsStr = buffsStr.replaceAll('name:',';')
  buffsStr = buffsStr.replaceAll('maxtime:',',')
  buffsStr = buffsStr.replaceAll('time:',',')
  buffsStr = buffsStr.replaceAll('pow:',',')
  buffsStr = buffsStr.replaceAll('obj:',',')
  buffsStr = buffsStr.replaceAll('arg3:',',')
  for (let i=Game.buffTypes.length-1; i>=0; i--) {
    buffsStr = buffsStr.replaceAll(Game.buffTypes[i].name.replace(/\s/g,''), i)
    };
  if (!buffsStr) return ''
  if (buffsStr[0] == ';') {
    buffsStr = buffsStr.slice(1) + ';'
    buffsStr = ModifyBuffTimes(buffsStr)
    };
  return buffsStr
  };

function ModifyBuffTimes(buffsStr) {//multiplies buff times by Game.fps
  let buffsArr = buffsStr.split(';')
  buffsStr=''
  for (let i in buffsArr) {
    if (!buffsArr[i]) {continue}
    let buffArr = buffsArr[i].split(',')
    buffArr[1] *= Game.fps
    buffArr[2] *= Game.fps
    buffsStr+=buffArr.join()+';'
    };
  return buffsStr
}

function AddStartBuff(type, mTime, time, pow, obj, arg3) {//add a buff to the starting buffs. mTime, time, pow, obj will all use default values if not specified
  let buff=''
  let isBS = (type == 9 || type == 10)
  if (!mTime) {mTime = Math.ceil(Game.buffTypes[type].baseDur*GetEffectDurMod())}
  if (!time) {time = mTime} else {time = Math.min(time, mTime)}
  if (!pow) {pow = Game.buffTypes[type].basePow}
  if (!isBS) {obj=0}
  else if (typeof obj == 'undefined') {obj=-1}

  //remove buff if it already exists in the list. Exception is made for unspecified BSs, up to 20 BSs
  if (!isBS  ||  obj >= 0  ||  BuffCount(type) > Object.keys(Game.goldenCookieBuildingBuffs).length-1) {RemoveStartBuff(IndexBuff(type, obj))}
  
  buff+= type + ',' + mTime*Game.fps + ',' + time*Game.fps + ',' + pow
  if (isBS) buff+= ',' + obj
  if (typeof arg3!=='undefined') buff+= ',' + arg3
  CCCEMButtons['buffs'].changeState(get('buffs')+buff+';')
  };

function BuffCount(type) {//counts the number of buffs of a type in the starting buffs, mainly for counting number of BSs
  let buffsArr = get('buffs').split(";")
  let c=0
  for (let i in buffsArr) {
    if (!buffsArr[i]) {continue}
    let buffArr = buffsArr[i].split(",")
    let bType = buffArr[0]
    if (bType == type) {c++}
    };
  return c
  };

function HasStartBuff(type, obj) {//check for matching buff type. type and obj are numbers. If Obj is used as a parameter, check for matching BS type. Return true/false
  if (typeof IndexBuff(type, obj) == 'number') return true
  return false
  };

function IndexBuff(type, obj) {//check for matching starting buff type. type and obj are numbers. If Obj is used as a parameter, check for matching BS type. Return index
  let buffsArr = get('buffs').split(";")
  for (let i in buffsArr) {
    if (!buffsArr[i]) {continue}
    let buffArr = buffsArr[i].split(",")
    let bType = buffArr[0]
    let bObj = buffArr[4]
    if (bType != type) {continue}
    if ((bType == 9 || bType == 10) && bObj != obj) {continue};
    return parseInt(i)
    };
  return false
  };

function RemoveStartBuff(index) {//removes the buff at the target index from the starting buff list
  if (index === false) {return}
  if (!index) index=0
  let str = ''
  let buffsArr = get('buffs').split(";")
  buffsArr.splice(index, 1)
  for (let i in buffsArr) {if (buffsArr[i]) str+=buffsArr[i]+';'}
  CCCEMButtons['buffs'].changeState(str)
  };

window.setupFinderIntegration = function() {
    Game.LoadMod(castFinderPath); 
	code = forceFtHoF;
    RedrawCCCEM();
}

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
  willSave = true
  save() {
    return this.parent.state;
  }
  load(str) {
    //fallback
    if (!str) { return; }
    if (!isNaN(parseFloat(str))) { str = parseFloat(str); }
    this.parent.state = str;
    if (this.parent.updateVarFunc) { this.parent.updateVarFunc.call(this.parent, this.parent.state); }
  }
  default() {
    return null; 
    //returns default value for the button/variable, but is actually changed later on by presets so it just prevents crashing and funny stuff
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
  getOptions() {
    return [[loc("Load"),`Game.ClosePrompt(); \nCCCEMButtonsList[${this.parent.id}].type.onInputConfirmation(l('textareaPrompt').value.trim());\nRedrawCCCEM();`],[loc("Nevermind")]]
  }
  getTip() {
    return loc('Click to input value.');
  }
  afterCall() {
    if (this.autoSet) { l('textareaPrompt').value = this.autoSet.call(this) }
    l('textareaPrompt').focus();
    l('textareaPrompt').select();
  }
  onInputConfirmation(content) {
    this.parent.state = content;
    if (this.parent.updateVarFunc) {
      this.parent.updateVarFunc.call(this.parent, this.parent.state);
    }
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
  onClick() {
    invalidateScoreS();
    Game.Prompt('<id NumImport><h3>'
      + loc(this.constructor.heading)
      + '</h3><div class="block">'
      + loc(this.constructor.subHeading)
      + '<div id="importError" class="warning" style="font-weight:bold;font-size:11px;"></div></div><div class="block"><textarea id="textareaPrompt" style="width:100%;height:128px;"'
      + (this.constructor.readonly?'readonly':'')
      + '>'
      + this.parent.state
      + '</textarea></div>',
      this.getOptions());
    this.afterCall();
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
    return loc(names[0], Beautify(state, this.precision));
  }
  onInputConfirmation(content) {
    if (isNaN(Number(content))) { 
      Game.Notify(loc('Setting value failed!'), loc('The value set was not a number!'), [7, 7]);
      return; 
    }
    this.parent.state = Number(content);
    if (this.parent.updateVarFunc) {
      this.parent.updateVarFunc.call(this.parent, this.parent.state);
    }
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
    this.parent.state = content;
    if (this.parent.updateVarFunc) {
      this.parent.updateVarFunc.call(this.parent, this.parent.state);
    }
  }
}
class cycleButton extends buttonType {
  //blue button
  constructor(min, max, parseConvert) {
    super();
    this.min = min;
    this.max = max;
    if (parseConvert) { this.parseConvert = parseConvert; }
  }
  parseConvert = e => e;
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
    Game.Prompt(`
      <id chooseOption><h3>${loc('Select value')}</h3><div class="line"></div>
      <div class="block">
      <div style="display:flex;gap:3px;align-items:center;">
        <input id="cccemSearch" type="search" placeholder="Type to search for the value..." class="framed" style="flex:1;box-sizing:border-box;padding:6px;margin-left: 5px;" />
        <button id="cccemClear" class="framed" style="padding:4px 8px;height:34px;cursor:pointer;" onclick="l('cccemSearch').value='';l('cccemSearch').dispatchEvent(new Event('input'));l('cccemSearch').focus();">X</button>
      </div>
      <div id="cccemSearchResults" style="margin-top:6px;height:200px;overflow:auto;">${this.getEntries()}</div>
      </div>
    `, [[loc('Confirm'), 'CCCEMButtons[\''+this.parent.key+'\'].type.onInputConfirmation(l(\'cccemSearchResults\').childNodes[0].dataset.selectId);Game.ClosePrompt();'], [loc('Nevermind')]], 0, 'widePrompt');
    AddEvent(l('cccemSearch'), 'input', e => {
      l('cccemSearchResults').innerHTML = this.getEntries(e.target.value);
    });
    l('cccemSearch').focus();
  }
  getEntries(searchString) {
    let str = '';
    if (!searchString) {
      for (let i = this.min; i <= this.max; i = this.next(i)) {
        str += this.getSearchButton(i);
      }
      return str;
    }
    const maxEntriesToDisplay = 5;
    const list = new Array(maxEntriesToDisplay);
    list.fill(null);
    for (let i = this.min; i <= this.max; i = this.next(i)) {
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
  onInputConfirmation(value) {
    this.parent.state = value;
    this.triggerVarFunc();
    RedrawCCCEM();
  }
  getSearchButton(value) {
    return '<div id="cccemSearchEntry'+value+'" data-select-id="'+value+'" class="block cccemSearchDisplay" '+Game.clickStr+'="CCCEMButtons[\''+this.parent.key+'\'].type.onInputConfirmation(this.dataset.selectId);Game.ClosePrompt();">'+this.parseConvert(value)+'</div>';
  }
  levenshtein(matcher, matchee) {
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
    return Math.min(Math.max(0, this.min), this.max); 
  }
}
class twoStepCycle extends cycleButton {
  constructor(min, max, parseConvert) { super(min, max, parseConvert); }
  next(from) { 
    return from + 2;
  }
  parseConvert = e => (e <= -1 ? loc('Random') : Game.goldenCookieChoices[e-1]);
}
class seasonalCycleButton extends cycleButton {
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
class multiSelectButton extends buttonType {
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
    this.parent.state = !this.parent.state;
  }
  save() {
    return (this.parent.state?1:0);
  }
  load(str) {
    this.parent.state = Boolean(parseInt(str));
    if (this.parent.updateVarFunc) { this.parent.updateVarFunc.call(this.parent, this.parent.state); }
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
    this.parent.state = e.keyCode;
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
  }
  getColorStr() {
    return 'nonexistent';
  }
  default() {
    this.parent.nonInteractive = true;
    return '';
  }
  save() {
    return this.savingFunc();
  }
  load(str) {
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
  new CCCEMButton('optionsBatch1', 'Save/Load %1',
    new categoryToggleButton('savingSettings'),
    new buttonInfo('Options group: Save/Load settings', 'Options related to saving and loading. ', [27, 29])
  ),
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
  new CCCEMButton('loadPForPause', 'Load P for Pause', 
    new triggerButton(),
    new buttonInfo('Load P for Pause', 'Loads the P for Pause mod, which enables you to speed up, slow down, and stop time.', [8, 35]),
    function() {
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
new buttonCategory('savingSettings', 2, [
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
  new CCCEMButton('importSettings', 'Import settings',
    new stringInputButton(null, ()=> {return ""}),
    new buttonInfo('Import settings', 'Imports a setting.', [2, 32]),
    s => setSettings(s), { newLine: true, advanced: false }
  ),
  new CCCEMButton('exportSettings', 'Export settings',
    new readonlyDisplayButton(() => {
      return getSettingsCode();
    }),
    new buttonInfo('Export settings', 'Opens a prompt that allows you to store and reuse a setting for later.', [0, 32]), null,
     { advanced: false }
  ),
  new CCCEMButton('saveSave','%1 save',
    new boolButton('Include', 'Exclude'),
    new buttonInfo('Export save', 'Whether the save currently used will be exported together with settings', [16, 5]),
    s => CCCEMButtons['importSave'].type.willSave = s, { advanced: false, ignorePreset: true }
  )
], 'optionsBatch1');
CCCEMCategories.savingSettings.complexityHideImmune = false;
CCCEMButtons['exportSettings'].type.willSave = false;
CCCEMButtons['importSettings'].type.willSave = false;
CCCEMButtons['clearImportedSave'].hidden = true;

new buttonCategory('presetSettings', 3, [
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

new buttonCategory('gameSettings', 4, [
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
  new CCCEMButton('scoreMult', 'Score mult x%1',
    new numberInputButton(),
    new buttonInfo('Correction value', 'The value the score should be multiplied by to better match standard values.', [16, 5]),
    s => scoreCorVal = s, { advanced: false }
  ),
  new CCCEMButton('scoreMultVerify', 'Score info %1',
    new boolButton(),
    new buttonInfo('Score correction notifications', 'Whether to notify when the score does not conform to the baseline.', [1, 7]),
    s => scoreCorNotify = s, { advanced: false }
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
    new buttonInfo('Elder Battalion strategy', 'Changes the building distribution to better fit an Elder Battalion strategy.', [1, 25]),
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
        if ((!s) && Game.realExternalDataLoaded) { Game.UpdateHeralds(); } else if (s) { CCCEMButtons['heraldsN'].type.triggerVarFunc(); } 
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
    new cycleButton(0, 21, e => Game.dragonAuras[e].name),
    new buttonInfo('Left Aura', 'The Dragon Aura you start with for the slot on the left.', [2, 25]),
    s => { d2Aura = s; }
  ),
  new CCCEMButton('rightAura', 'Right Aura %1',
    new cycleButton(0, 21, e => Game.dragonAuras[e].name),
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
eval('Game.UpdateHeralds='+Game.UpdateHeralds.toString().replaceAll('Game.externalDataLoaded=true;', 'Game.externalDataLoaded=true; Game.realExternalDataLoaded=true;'));
Game.externalDataLoaded = true;
Game.UpdateHeralds();

new buttonCategory('minigameSettings', 5, [
  new CCCEMButton('forceFtHoF', 'Force the Hand of Fate outcome: %1',
    new cycleButton(0, FtHoFOutcomes.length - 1, e => loc(FtHoFOutcomesMap[FtHoFOutcomes[e]])),
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
    }),
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
  new CCCEMButton('toNextTick', 'Tick %1',
    new numberInputButton(),
    new buttonInfo('Tick', 'Progress to next tick in seconds.', [24, 18]),
    s => { toNextTick = s; }
  ),
  new CCCEMButton('plant1', 'Plant 1 %1',
    new cycleButton(0, 34, e => loc(e?Game.Objects['Farm'].minigame.plantsById[e - 1].name:'Nothing')),
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
    new cycleButton(0, 34, e => loc(e?Game.Objects['Farm'].minigame.plantsById[e - 1].name:'Nothing')),
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
    new cycleButton(0, 10, e => loc(['Holobore', 'Vomitrax', 'Godzamok', 'Cyclius', 'Selebrak', 'Dotjeiess', 'Muridal', 'Jeremy', 'Mokalsium', 'Skruuia', 'Rigidel'][e])),
    new buttonInfo('Pantheon Diamond slot', 'The god slotted within the Diamond slot of the Pantheon at the start of each attempt.', [23, 15]),
    s => { spirit1 = s; }, { advanced: false }
  ),
  new CCCEMButton('rubyGod', 'Ruby %1',
    new cycleButton(0, 10, e => loc(['Holobore', 'Vomitrax', 'Godzamok', 'Cyclius', 'Selebrak', 'Dotjeiess', 'Muridal', 'Jeremy', 'Mokalsium', 'Skruuia', 'Rigidel'][e])),
    new buttonInfo('Pantheon Ruby slot', 'The god slotted within the Ruby slot of the Pantheon at the start of each attempt.', [25, 18]),
    s => { spirit2 = s; }, { advanced: false }
  ),
  new CCCEMButton('jadeGod', 'Jade %1',
    new cycleButton(0, 10, e => loc(['Holobore', 'Vomitrax', 'Godzamok', 'Cyclius', 'Selebrak', 'Dotjeiess', 'Muridal', 'Jeremy', 'Mokalsium', 'Skruuia', 'Rigidel'][e])),
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
  catch { return buff.name; }
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
    }),
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
    }),
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
    new twoStepCycle(-1, 27, e => (e === -1 ? 'R' : Game.goldenCookieChoices[e-1])),
    new buttonInfo('First Golden cookie effect', 'The (guaranteed) effect of the Golden cookie from the initial natural Golden cookie spawn.', [0, 10]),
    s => { s=(s%2 === 0)?s-1:s;
      CCCEMButtons['iniGC'].state=s}, { advanced: false }
  ),
  new CCCEMButton('iniGC2', 'GC2 %1',
    new twoStepCycle(-1, 27, e => (e === -1 ? 'R' : Game.goldenCookieChoices[e-1])),
    new buttonInfo('Second Golden cookie effect', 'The (guaranteed) effect of the Golden cookie from the initial Dragon Orbs Golden cookie spawn.', [1, 10]),
    s => { s=(s%2 === 0)?s-1:s;
      CCCEMButtons['iniGC2'].state=s}
  ),
  new CCCEMButton('iniGC3', 'GC3 %1',
    new twoStepCycle(-1, 27, e => (e === -1 ? 'R' : Game.goldenCookieChoices[e-1])),
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
  )
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
l('devConsole').addEventListener('mouseenter', () => { l('devConsoleContent').classList.remove('fadeOut'); l('devConsoleContent').classList.remove('initHidden'); l('devConsoleContent').classList.remove('widthCapped'); });
l('devConsole').addEventListener('mouseleave', () => { l('devConsoleContent').classList.add('fadeOut'); l('devConsoleContent').classList.add('widthCapped'); });
RedrawCCCEM();
l('devConsoleContent').classList.add('initHidden');
l('devConsoleContent').classList.add('fadeOut');
invalidateScore=0;

//colored buttons
var customStyles = [];
customStyles.push(`
  .CCCEMInterface {
    scrollbar-width: thin; overflow-y:auto;
    min-width: 24px;
    width: auto !important;
    max-height: calc(100vh - ${((App?0:l('topBar').getBoundingClientRect().height) + 18)}px);
    will-change: opacity, transform;
  }
  .CCCEMInterface::-webkit-scrollbar {
    width: 5px;
    background-color: #33333333;
    border: none;
    border-radius: 3px; 
  }
  .CCCEMInterface::-webkit-scrollbar-thumb {
    width: 5px;
    background-color: #282b2bff;
    outline: none;
    border: none;
    box-shadow: none;
    border-radius: 3px; 
  }
  .flexbreak { 
    flex-basis: 100%;
    height: 0;
  }
  .CCCEMInterface.cccem-fade-out {
    animation: cccem-fade-out 0.5s cubic-bezier(.22,.9,.33,1) forwards;
  }
  #devConsoleContent { 
    display: flex; 
    flex-wrap: wrap;
    justify-content: center;
    max-width: 450px;
  }
  #devConsoleContent.widthCapped { 
    width: 24px !important;
  }
  #devConsoleContent.fadeOut {
    animation: cccem-fade-out 0.5s cubic-bezier(.22,.9,.33,1) forwards;
  }
  #devConsoleContent.initHidden {
    pointer-events: none; visibility: hidden; display: none;
  }

  @keyframes cccem-fade-out {
    0%   { opacity: 1; transform: translateZ(0) scale(1); }
    70%  { opacity: 0.15; transform: translateZ(0) scale(0.995); }
    100% { opacity: 0; transform: translateZ(0) scale(0.99); pointer-events: none; visibility: hidden; }
  }

  .external:after {
    content: "↗";
    font-size: 0.8em;
    margin-left: 0.25em;
  }
  h4.cccemPresetCategoryTitle {
    text-decoration: underline;
    margin-bottom: 2px;
  }

  .cccemSearchDisplay { 
    border: 1px solid white;
    padding: 6px;
    cursor: pointer;
  }
  .cccemSearchDisplay:hover {
    background-color: #363535ff;
  }

  .statsGrid {
    display:grid;
    gap: 5px;
    align-items: start;
  }
  .statsCell {
    min-width: 0;
    line-height: 160%;
  }
  .block .historyEntry {
    border-width: 2px;
    cursor: pointer;
  }
  .block .historyEntry:hover { 
    border: 2px solid white;
  }
  .block .historyEntry.alwaysHighlighted {
    border: 2px solid white !important;
  }
  .block.stat {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }
  .statIcon {
    width: 48px;
    height: 48px;
    flex: 0 0 48px;
  }
  .statIconActual { 
    width: 48px;
    height: 48px;
    background-repeat: no-repeat;
    transform-origin: 0 0;
    background-image: url('img/icons.png');
  }
  .title.stat {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 16px;
  }
  .statDescription {
    text-decoration: underline;
    cursor: help;
    font-weight: 700;
    margin-left: 6px;
  }
  .statDetails {
    font-size: 24px;
    font-weight: 700;
    margin-top: 6px;
  }
  `)
customStyles.push(`
  .neatocyan, a.option.neatocyan {
    color: #00bcda;
	border-color: #00bcda;
  }`)
customStyles.push(`
  a.option.neatocyan:hover {
    color:#00dcff;
    border-color: #00dcff;
  }`)
customStyles.push(`
  a.option.neatocyan:active {
    background-color: #003140;
  }`)
customStyles.push(`
  .neatoyellow, a.option.neatoyellow {
    color: #b3b304;
	border-color: #b3b304;
  }`)
customStyles.push(`
  a.option.neatoyellow:hover {
    color: #e4e400;
	border-color: #e4e400;
  }`)
customStyles.push(`
  a.option.neatoyellow:active {
    background-color: #404000;
  }`)
customStyles.push(`
  .neatolime, a.option.neatolime {
    color: #00de35;
    border-color: #00de35;
  }
  .neatolime.massive { font-size: 140%; padding: 6px 11px; border-width: 2px; font-weight: bold; border-radius: 5px; }`)
customStyles.push(`
  a.option.neatolime:hover {
    color: #26ff5a;
    border-color: #26ff5a;
  }`)
customStyles.push(`
  a.option.neatolime:active {
    background-color: #031;
  }`)
customStyles.push(`
  .neatogray, a.option.neatogray {
    color: #9a949d;
    border-color: #9a949d;
  }`)
customStyles.push(`
  a.option.neatogray:hover {
    color: #b6b5b6;
    border-color: #b6b5b6;
  }`)
customStyles.push(`
  a.option.neatogray:active {
    background-color: #292329;
  }`)
customStyles.push(`
  .neatowhite, a.option.neatowhite {
    color: #d4d9db;
    border-color: #d4d9db;
  }`)
customStyles.push(`
  a.option.neatowhite:hover {
    color: #ffffff;
    border-color: #ffffff;
  }`)
customStyles.push(`
  a.option.neatowhite:active {
    background-color: #2e3538;
  }`)
customStyles.push(`
  .neatoorange, a.option.neatoorange {
    color: #e8a230;
    border-color: #e8a230;
  }`)
customStyles.push(`
  a.option.neatoorange:hover {
    color: #ffc76c;
    border-color: #ffc76c;
  }`)
customStyles.push(`
  a.option.neatoorange:active {
    background-color: #332300;
  }`)
customStyles.push(`
  .neatoblue, a.option.neatoblue {
    color: #7785f2;
    border-color: #7785f2;
  }`)
customStyles.push(`
  a.option.neatoblue:hover {
    color: #aab3ff;
    border-color: #aab3ff;
  }`)
customStyles.push(`
  a.option.neatoblue:active {
    background-color: #05002f;
  }`)
customStyles.push(`
  .neatofire, a.option.neatofire {
    color: rgba(255, 85, 55, 1);
    border-color: rgba(255, 85, 55, 1);
  }`)
customStyles.push(`
  a.option.neatofire:hover {
    color: rgba(255, 137, 104, 1);
    border-color: rgba(255, 137, 104, 1);
  }`)
customStyles.push(`
  a.option.neatofire:active {
    background-color: #2f0000;
  }`)
customStyles.push(`
  .neatopurple, a.option.neatopurple {
    color: #ba65ff;
    border-color: #ba65ff;
  }`)
customStyles.push(`
  a.option.neatopurple:hover {
    color: #daadff;
    border-color: #daadff;
  }`)
customStyles.push(`
  a.option.neatopurple:active {
    background-color: #250041;
  }`)
customStyles.push(`
  a.option.nonexistent { 
    display: none;
  }
  `)
let styleObj = document.createElement('style');
let stylesStr = '';
for (let i of customStyles) { stylesStr += i + '\n'; }
styleObj.textContent = stylesStr;
l('game').appendChild(styleObj);
