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

var cccemSpritesheet=App?this.dir+"/cccemAsset.png":"https://raw.githack.com/CursedSliver/asdoindwalk/main/cccemAsset.png"

Game.sesame=0 //this prevents a crash if opensesame is open, but doesn't get rid of the fps counter. Not sure what to do about that
var FtHoFOutcomes=['random','blood frenzy','click frenzy','building special','frenzy','cursed finger','multiply cookies','cookie storm','free sugar lump','cookie storm drop','blab']
var promptN=0
var maxComboPow=1
var relComboPow=1
var maxBSCount=0
var maxGodz=1
var iniRaw=1
var tickerCount=0
var buildingSelected=0;
var isClickedGC=false;
var autoSaveCCCEM=false;
var hasSetSettings=false;
var pForPausePath = cccemDir+'PForPause.js';
var castFinderPath = cccemDir+'castFinder.js';
var testButton='<a class="option neato" '+Game.clickStr+'="for (var i in moreButtons) {moreButtons[i].splice(moreButtons[i].indexOf(testButton),1)}; RedrawCCCEM();">Remove test buttons?</a>'
var iniTimerButton='<a class="option neatocyan" '+Game.clickStr+'="promptN=12; isShifting()?info(58):GetPrompt();">Nat Spawn Timer '+iniTimer+' frames</a><br>'
if (typeof pForPauseButtons === 'undefined') {var pForPauseButtons=['<a class="option neato" '+Game.clickStr+'="isShifting()?info(5):(Game.LoadMod(`'+pForPausePath+'`)); if (hasHarbor && !isShifting()) { MacadamiaModList.cccem.mod.loadModRPC.send({ path: `'+pForPausePath+'` }); }">Load P for Pause</a>']}
if (typeof castFinderButtons === 'undefined') {var castFinderButtons=['<a class="option neato" '+Game.clickStr+'="isShifting()?info(55):setupFinderIntegration(); if (hasHarbor && !isShifting()) { MacadamiaModList.cccem.mod.loadCastFinderRPC.send(); }">Load Cast Finder</a><br>']}
if (typeof moreButtons === 'undefined') {var moreButtons=[[],[],[]]}
if (typeof moreButtonsPlus === 'undefined') {var moreButtonsPlus=[[],[]]}
var hiding = [true,true,true,true,false,false]
var invalidateScore=0

if (typeof CCCEMUILoaded === 'undefined') {
  var CCCEMUILoaded=1
  
  //prevents you from using OpenSesame as this mod removes the debugLog to make it look nice, which breaks the game if you run OpenSesame.
  eval("Game.OpenSesame="+Game.OpenSesame.toString().replace("var str='';","return")) 
  if (l('debugLog')) {l('debugLog').remove();};
  
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

function FindAuraP(a1, a2) {
  var auraSlot1=Game.dragonAura
  var auraSlot2=Game.dragonAura2
  if (!a2) {if (auraSlot1==3 || auraSlot2==3) {a2=3} else {a2=0};};
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
  if (Game.shimmerTypes['golden'].n>0) {mComboPow*=Math.pow(2.23, Game.shimmerTypes['golden'].n); mComboPow/=FindAuraP(1);};
  if (maxComboPow<mComboPow) {maxComboPow=mComboPow; relComboPow=rComboPow; maxBSCount=bsCount; maxGodz=godzPow}; 
  };

//Returns true if buffName are NOT newly gained from the combo (excludes scry too), otherwise return false
function ConsistentBuffs(buffName, bsCount) {
  var icBuffs=['dragonflight','blood frenzy','click frenzy','frenzy','dragon harvest']
  for (var i=0; i<bsCount; i++) {icBuffs.push('building special')}
  index=icBuffs.indexOf(forceFtHoF); if (forceFtHoF && index!=-1) icBuffs.splice(index, 1);
  index=icBuffs.indexOf('frenzy'); if (iniF && index!=-1) icBuffs.splice(index, 1);
  index=icBuffs.indexOf('dragon harvest'); if (iniDH && index!=-1) icBuffs.splice(index, 1);
  for (var i=0; i<iniBSCount; i++) {index=icBuffs.indexOf('building special'); if (index!=-1) icBuffs.splice(index, 1)};
  if (iniSpawn && iniGC!='R') {index=icBuffs.indexOf(Game.goldenCookieChoices[iniGC].toLowerCase()); if (index!=-1) icBuffs.splice(index, 1)};
  if (iniDO && iniGC2!='R') {index=icBuffs.indexOf(Game.goldenCookieChoices[iniGC2].toLowerCase()); if (index!=-1) icBuffs.splice(icBuffs.indexOf(index, 1))};
  if (iniDEoRL && iniGC3!='R') {index=icBuffs.indexOf(Game.goldenCookieChoices[iniGC3].toLowerCase()); if (index!=-1) icBuffs.splice(icBuffs.indexOf(index, 1))};
  for (var i in icBuffs) {if (icBuffs[i] == buffName) {return false}};
  return true
  };

//Power of all the consistent buffs (preset + scry)
function AllConsistentBuffsPow() {
  var cBuffs=[];
  var cBuffsPow=1
  if (forceFtHoF!='random') {cBuffs.push(forceFtHoF)};
  if (iniF && !(cBuffs.includes('frenzy'))) {cBuffs.push('frenzy')};
  if (iniDH && !(cBuffs.includes('dragon harvest'))) {cBuffs.push('dragon harvest')};
  if (iniSpawn && iniGC!='R' && (!(cBuffs.includes(Game.goldenCookieChoices[iniGC].toLowerCase())) || Game.goldenCookieChoices[iniGC].toLowerCase()=='building special')) {cBuffs.push(Game.goldenCookieChoices[iniGC].toLowerCase())}
  if (iniDO && iniGC2!='R' && (!(cBuffs.includes(Game.goldenCookieChoices[iniGC2].toLowerCase())) || Game.goldenCookieChoices[iniGC2].toLowerCase()=='building special')) {cBuffs.push(Game.goldenCookieChoices[iniGC2].toLowerCase())}
  if (iniDEoRL && iniGC3!='R' && (!(cBuffs.includes(Game.goldenCookieChoices[iniGC3].toLowerCase())) || Game.goldenCookieChoices[iniGC3].toLowerCase()=='building special')) {cBuffs.push(Game.goldenCookieChoices[iniGC3].toLowerCase())}
  for (var i=0; i<iniBSCount; i++) {cBuffs.push('building special')};
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
  var cookieGain=Game.cookiesEarned-iniCE
  var consistentPow = AllConsistentBuffsPow();
  var scoreRed=(maxComboPow*iniRaw*consistentPow/relComboPow);
  var score=cookieGain/scoreRed;
  var icon=[12,8]
  var originalScore = score;
  score/=1.333e6;
  if (score>3) {icon=[1,7]}
  else if (score>2.5) {icon=[1,1,cccemSpritesheet]}
  else if (score>2) {icon=[33,4]}
  else if (score>1.5) {icon=[32,4]}
  else if (score>1) {icon=[0,1,cccemSpritesheet]}
  else if (score>0.9) {icon=[14,5]}
  else if (score>0.8) {icon=[13,5]}
  else if (score>0.7) {icon=[12,5]}
  else if (score>0.6) {icon=[3,0,cccemSpritesheet]}
  else if (score>0.5) {icon=[2,0,cccemSpritesheet]}
  else if (score>0.4) {icon=[1,0,cccemSpritesheet]}
  else if (score>0.3) {icon=[0,0,cccemSpritesheet]}
  else if (score>0.2) {icon=[2,5]}
  else if (score>0.1) {icon=[1,5]}
  else if (score>0.01) {icon=[0,5]}
  else if (score>0) {icon=[12,8]}
    
  console.log('Score: '+originalScore.toPrecision(3)+' ('+(score*100).toFixed(1)+'%)','Combo Strength: '+maxComboPow,'Strength of non-divided buffs: '+relComboPow,'Number of BSs: '+maxBSCount,'Strength of Godzamok: '+maxGodz,'Initial Raw CpS: '+iniRaw,'Years of CpS: '+Beautify(cookieGain/iniRaw/31536000),'All Consistent Buffs power: ' + consistentPow,'Cookie gained: ' + cookieGain);
  if (invalidateScore==0) {Game.Notify('Score: '+(score*100).toFixed(1)+'%',Beautify(cookieGain/iniRaw/31536000)+' years of CpS, GZ: '+maxGodz.toPrecision(3)+(hasSetSettings?'.':''),icon)} else {Game.Notify('Score invalid', 'Settings changed since reset',[10,6],16,0,1); invalidateScore=0};
  };

function CycleFtHoF(reverse) {
  let index = FtHoFOutcomes.indexOf(forceFtHoF);
  if (index==-1) { return FtHoFOutcomes[0]; }
  if (reverse) { index--; } else { index++; }
  if (index >= FtHoFOutcomes.length) { index = 0; }
  else if (index < 0) { index = FtHoFOutcomes.length - 1; }
  return FtHoFOutcomes[index];
};

function GetPrompt() {
  Game.Prompt('<id ImportSave><h3>'+"Input to variable"+'</h3><div class="block">'+loc("Please paste what you want the variable to be equal to.")+'<div id="importError" class="warning" style="font-weight:bold;font-size:11px;"></div></div><div class="block"><textarea id="textareaPrompt" style="width:100%;height:128px;">'+'</textarea></div>',[[loc("Load"),';Game.ClosePrompt(); switch (promptN) {case 0: iniLoadSave=(l(\'textareaPrompt\').value); if (iniLoadSave.length<100) {iniLoadSave=false};break;case 1: iniSeed=(l(\'textareaPrompt\').value.trim()); if (iniSeed.length!=5) {iniSeed=\'R\'};break;case 2: iniC=Number(l(\'textareaPrompt\').value);break;case 3: iniCE=Number(l(\'textareaPrompt\').value);break;case 4: iniP=Number(l(\'textareaPrompt\').value);break;case 5: iniLumps=Number(l(\'textareaPrompt\').value);break;case 6: iniBC=Number(l(\'textareaPrompt\').value);break;case 7: wizCount=Number(l(\'textareaPrompt\').value);break;case 8: wizLevel=Number(l(\'textareaPrompt\').value);break;case 9: iniDHdur=Number(l(\'textareaPrompt\').value.replace("s",""));break;case 10: iniBSdur=Number(l(\'textareaPrompt\').value.replace("s",""));break;case 11: toNextTick=Number(l(\'textareaPrompt\').value.replace("s",""));break;case 12: iniTimer=Number(l(\'textareaPrompt\').value.replace("s",""));UpdateMoreButtons();break;case 13:manualBuildings[buildingSelected]=Number(l(\'textareaPrompt\').value);break;case 14:forcedCastCount[0]=Number(l(\'textareaPrompt\').value);break;case 15:iniFdur=Number(l(\'textareaPrompt\').value);break;case 16:break;case 17:setSettings(l(\'textareaPrompt\').value);hasSetSettings=true;break;case 18:DFChanceMult=Number(l(\'textareaPrompt\').value);break;case 19:gcRateMult=Number(l(\'textareaPrompt\').value);break;case 20:clickWait=Number(l(\'textareaPrompt\').value);break;case 21:gardenLevel=Number(l(\'textareaPrompt\').value);break;};RedrawCCCEM();'],loc("Nevermind")]);
	l('textareaPrompt').focus();
  };

function UpdateMoreButtons() {
  iniTimerButton='<a class="option neatocyan" '+Game.clickStr+'="promptN=12; isShifting()?info(58):GetPrompt();">Nat Spawn Timer '+iniTimer+' frames</a><br>'
  moreButtons[2].splice(moreButtons[2].indexOf(iniTimerButton),1); 
  moreButtons[2].push(iniTimerButton);
  };
  
function MoreTestButtons() {
  moreButtons[0].push(testButton)
  moreButtons[1].push(testButton)
  moreButtons[2].push(testButton)
  RedrawCCCEM();
  };

function cycleSeason(reverse) {
  //reverse cycle not implemented
  setSeason++;
  if (setSeason == 186) { setSeason = 209; }
  if (setSeason == 210) { setSeason = 0; }
  if (setSeason == 1) { setSeason = 182; }
  return setSeason;
}

function cycleCastInitSeason(reverse) {
  //reverse cycle not implemented
  initCastFindSeason++;
  if (initCastFindSeason == 186) { initCastFindSeason = 209; }
  if (initCastFindSeason == 210) { initCastFindSeason = null; }
  if (initCastFindSeason == null) { initCastFindSeason = 0; }
  if (initCastFindSeason == 1) { initCastFindSeason = 182; }
  return initCastFindSeason;
}

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

var Messages = [
    ['Try again', 'Resets everything and starts another attempt.', 21, 6],
    ['Default', 'Resets settings to default.', 14, 6],
    ['BS scry', 'Resets settings to a preset setting for a combo with a scried Building Special.', 13, 6],
    ['100% consistency', 'Resets settings to a preset setting for a combo with a scried Click Frenzy.', 12, 6],
    ['Import Save', 'Import a save of your own. Some settings will be overridden by the save\'s contents.', 24, 7],
    ['Load P for Pause', 'Loads the P for Pause mod, which enables you to stop time.', 8, 35],
    ['Initial seed', 'Seed to determine RNG outcomes, or leave as \'R\' for random. <br>Also requires either toggling on Force cast count or change FtHoF to \'random\'.', 25, 25],
    ['Cookies', 'The amount of cookies you start with each attempt.', 10, 0],
    ['Cookies Baked All Time', 'The Cookies Baked All Time statistic. Tied to your prestige level.', 29, 4],
    ['Prestige', 'idk what this is for tbh tbh', 0, 0],
    ['Lumps', 'The amount of Sugar lumps you start with each attempt.', 29, 14],
    ['Lump type', 'The type of Sugar lump you start with each attempt.', 29, 27],
    ['Building count anchor', 'The amount of Cursors you start with each attempt. Then, the amount of every other building is adjusted accordingly so that a roughly equal amount of cookies is spent on each building. <br>Can be partially overridden by other options.', 33, 6],
    ['Override', 'The specific building to override count. <br>Once overridden, the building count anchor will no longer be used to determine the amount of that specific building.<br>Does not include Wizard towers; that is managed by the Wizard towers option.', 35, 33],
    ['Overriding number', 'The value assigned to the building being overridden. The value will be the amount of that building you start with each attempt.<br>An assignment of 0 is equivalent to override disabled.<br>To override a value of 0, use any negative number.', 29, 21], 
    ['Elder Battalion strategy', 'Changes the building distribution to better fit an Elder Battalion strategy.', 1, 25],
    ['Elder Battalion rebuy', 'Changes the score evaluation to evaluate an EB rebuy strategy.', 1, 27],
    ['Force cast count', 'Forces the Grimoire\'s Spells casted all time stat to be whatever you choose. This option disables the FtHoF outcome finder if enabled.', 22, 11],
    ['Forced cast count', 'The value to assign to the Grimoire\'s Spells casted all time. Only functional if the Force cast count option is On.', 30, 5],
    ['Wizard towers', 'The amount of Wizard towers you start with each attempt.', 17, 0],
    ['Wizard tower Level', 'The level of Wizard towers you start with each attempt.', 17, 26], 
    ['Sell/Buy select', 'Selects whether you are selecting \'Sell\' or \'Buy\' on the building list with the start of each attempt.', 9, 9],
    ['Sell/Buy amount', 'Selects the bulk-buying amount you are selecting at the start of each attempt.', 1, 6],
    ['Heralds', 'Changes the amount of Heralds you have.<br>Possible numbers: 41 (the same as web players) and 100 (the same as steam players)', 21, 29],
    ['Left Aura', 'The Dragon Aura you start with for the slot on the left.', 2, 25],
    ['Right Aura', 'The Dragon Aura you start with for the slot on the right.', 8, 25],
    ['Fortune chance', 'The chance for a natural News ticker scroll to be a Fortune. <br>Default chance: 4% (2% without O fortuna)', 10, 32],
    ['FtHoF scry', 'The outcome of the first Force the Hand of Fate cast upon starting an attempt. <br>Typically predicted via scrying.', 27, 11],
    ['Seed held', 'The seed selected upon starting an attempt. <br>The selector is not present, but you will still be selecting the seed.', 27, 15],
    ['Garden rotation', 'The orientation of the garden upon starting an attempt. The direction defined is the edge entirely consisting of the second plant (Plant 2).<br>Select \'R\' for a random orientation.', 28, 18], 
    ['Progress to next tick', 'The amount of time passed (in seconds) since the start of a new garden tick.<br>Select \'R\' for a random amount of time.', 24, 18],
    ['Plant 1', 'One of the plants in the garden at the start of each attempt.', 26, 20], 
    ['Plant 1 age', 'The age of the first plant (in terms of a percentage of its way to death) at the start of each attempt.', 25, 20], 
    ['Plant 2', 'The other plant in the garden at the start of each attempt.', 26, 20], 
    ['Plant 2 age', 'The age of the second plant (in terms of a percentage of its way to death) at the start of each attempt.', 25, 20], 
    ['Office', 'The Stock market Office level. The office level determines the amount of loans available.', 18, 33], 
    ['Pantheon Diamond slot', 'The god slotted within the Diamond slot of the Pantheon at the start of each attempt.', 23, 15],
    ['Pantheon Ruby slot', 'The god slotted within the Ruby slot of the Pantheon at the start of each attempt.', 25, 18],
    ['Pantheon Jade slot', 'The god slotted within the Jade slot of the Pantheon at the start of each attempt.', 27, 18],
    ['Frenzy toggle', 'Whether Frenzy will be active at the start of each attempt.', 10, 14],
    ['Frenzy duration', 'The duration of the Frenzy (in seconds) at the start of each attempt.', 8, 14],
    ['Dragon Harvest toggle', 'Whether Dragon Harvest will be active at the start of each attempt.', 10, 25],
    ['Dragon Harvest duration', 'The duration of the Dragon Harvest (in seconds) at the start of each attempt.', 8, 25],
    ['Extra Building Specials', 'The amount of unique Building Specials at the start of each attempt.', 5, 6],
    ['Building Special duration', 'The duration of each individual Building Special (in seconds) at the start of each attempt.', 23, 11],
    ['Sugar Blessing toggle', 'Whether Sugar Blessing (Buff from Golden Sugar lumps) will be active at the start of each attempt.', 29, 16],
    ['Seeded natural Golden cookies toggle', 'Whether naturally spawned Golden cookies will have their effects be determined by the current game seed.<br>If on, the natural Golden cookie spawns will always be the same if the seed is the same.', 22, 6],
    ['Seeded News ticker messages toggle', 'Whether the appearance of Fortune messages in the News ticker will be determined by the current game seed.<br>If on, the scrolling of the News ticker will always yield Fortunes at the same moment(s) if the seed is the same.', 29, 8],
    ['Initial natural Golden cookie spawn toggle', 'Whether a Golden Cookie will spawn at the start of each attempt.', 23, 6],
    ['Initial Dragon Orbs spawn toggle', 'Whether a Golden cookie from Dragon Orbs usage will spawn at the start of each attempt.', 33, 25],
    ['Initial Distilled Essence of Redoubled Luck spawn toggle', 'Whether an invoke of the Distilled Essence of Redoubled Luck heavenly upgrade (1% for each natural Golden cookie spawn to be doubled) at the start of each attempt will be successful; functionally the same as the Dragon Orbs spawn toggle.<br>Only affects the initial Golden cookie, and never any of the subsquent ones.', 27, 12],
    ['First Golden cookie effect', 'The (guaranteed) effect of the Golden cookie from the <b>initial natural Golden cookie</b> spawn.<br>Only applicable if \'Natural GC\' is On.', 0, 10],
    ['Second Golden cookie effect', 'The (guaranteed) effect of the Golden cookie from the <b>initial Dragon Orbs Golden cookie</b> spawn.<br>Only applicable if \'Dragon Orbs\' is On.', 1, 10],
    ['Third Golden cookie effect', 'The (guaranteed) effect of the Golden cookie from the <b>initial, successful invoke of the Distilled Essence of Redoubled Luck</b>.<br>Only applicable if \'DEoRL\' is On.', 2, 10],
    ['Save current settings', 'Saves the settings in the CCCEM interface to the save before CCCEM was loaded, as mod data.<br>You can change the saved setting by saving again.<br>You can remove it by clearing mod data with the options menu while CCCEM is not loaded.', 25, 7]
    ['Load Cast Finder', 'Loads the Grimoire Cast Finder mod, which allows you to program specific strings of cast outcomes to find.<br>Disables the FtHoF button on load.', 17, 27],
    
    ['Open Cast Finder', 'Opens the Cast Finder. Inputs will be ran upon pressing Try Again, unless auto execute is off.', 17, 14],
    ['Open Documentation', 'Opens the documentation to the Cast Finder in a new tab.', 26, 7],
    ['Auto execute', 'Whether the Cast Finder is ran upon pressing Try Again. Disabling would cause the outcome to become randomized.', 17, 22],
    
    ['Natural Spawn Timer', 'The amount of time after each reset for the first Golden cookie to naturally spawn (in frames, this game is 30 fps).', 22, 6],
    
    ['Options group: Batch settings', 'Options related to widespread setting changes and preset settings. ', 27, 29],
    ['Options group: Game settings', 'Options related to the game\'s core features, including adjusting cookies, buildings, and lumps. ', 28, 29],
    ['Options group: Minigames', 'Options related to the four minigames. ', 28, 29],
    ['Options group: Buffs & GC options', 'Options related to buffs and Golden cookies. Also includes many randomness-related options.', 28, 29],
    ['Extras: P for Pause', 'Options related to the P for Pause mod. ', 28, 26],
    ['Extras: Cast Finder', 'Options related to the Cast Finder mod. ', 28, 26],
    ['Auto Save', 'If on, the game will save CCCEM settings (identical to pressing the Save current settings button) every minute.', 26, 7],
    ['Execute Cast Finder', 'Executes the code in the Cast Finder.', 11, 10],
    ['Pre-Load Casts', 'Computes a set of seeds and cast amounts that would correspond to code entered, then stores it for later use. <br>Useful for very complex sequences that may take a while to compute.', 22, 29],
    ['Use Preload', 'Whether or not to choose one of the precomputed seeds (from preloading) to use upon trying again.<br>If enabled, the cast count will be hidden.', 34, 12],
    ['Preload backups', 'Set the amount of seeds to compute for each sequence.<br>Useful for simulating the other elements of rng that cannot normally be replicated with preloading.', 17, 20],
    ['Import preload','Imports preload code.',17,1],
    ['Export preload','Exports preload code.',17,2],
    ['Starting season','The season that you start with upon trying again.', 16, 6],
    ['Export settings','Opens a prompt that allows you to store and reuse a setting for later.', 0, 32],
    ['Import settings','Imports a setting.', 2, 32],
    ['Dragonflight chance', 'Sets a multiplier to Dragonflight (buff) chance.', 5, 25],
    ['Golden cookie spawnrate', 'Sets a multiplier to the spawn rate of golden cookies.', 10, 14],
    ['Click cooldown', 'The minimum amount of milliseconds between each click.', 0, 15],
    ['Garden level', 'The level of your Farm, which controls the size of your garden.', 2, 26],
    ['Scried season', 'The season that the starting effect is scried (or predicted) in.', 16, 6]
           ]

var infogot = 0;
function info(num) {
  infogot = 1;
  Game.Notify(Messages[num][0], Messages[num][1], [Messages[num][2], Messages[num][3]])
}

function RedrawCCCEM(noinvalidate) {
  if (!(noinvalidate && invalidateScore==0) && !infogot) { invalidateScore=1; if (hasHarbor) { MacadamiaModList.cccem.mod.syncSettingsRPC.send({ code: getSettingsCode() }); } }
  if (infogot) { infogot = false; return true; }
  var str='';
  str+='<div class="icon" style="position:absolute;left:-9px;top:-6px;background-position:'+(-28*48)+'px '+(-12*48)+'px;"></div>';
  
  str+='<div id="devConsoleContent">';
  str+='<div class="title" style="font-size:14px;margin:6px;">CCCEM interface</div>';
  str+='<a class="option neatolime" '+Game.clickStr+'="isShifting()?info(0):ResetAll(1); if (!isShifting() && hasHarbor && netcodeSettingsExport.hosting) { MacadamiaModList.cccem.mod.tryAgainRPC.send(); }">Try again</a>';
  
    
  str+='<div class="line"></div>';
  str+='<a class="option neato'+(hiding[0]?'gray':'white')+'" '+Game.clickStr+'="isShifting()?info(59):(hiding[0]=!hiding[0]);RedrawCCCEM(1);">Batch settings options '+(hiding[0]?'hidden':'visible')+'</a>';
  str+='<a class="option neato'+(hiding[1]?'gray':'white')+'" '+Game.clickStr+'="isShifting()?info(60):(hiding[1]=!hiding[1]);RedrawCCCEM(1);">Game settings options '+(hiding[1]?'hidden':'visible')+'</a><br>';
  str+='<a class="option neato'+(hiding[2]?'gray':'white')+'" '+Game.clickStr+'="isShifting()?info(61):(hiding[2]=!hiding[2]);RedrawCCCEM(1);">Minigame options '+(hiding[2]?'hidden':'visible')+'</a>';
  str+='<a class="option neato'+(hiding[3]?'gray':'white')+'" '+Game.clickStr+'="isShifting()?info(62):(hiding[3]=!hiding[3]);RedrawCCCEM(1);">Buff & GC options '+(hiding[3]?'hidden':'visible')+'</a><br>';
  for (var i in moreButtons[0]) {str+=moreButtons[0][i]}
  if (typeof pForPause !== 'undefined') {str+='<a class="option neato'+(hiding[4]?'gray':'white')+'" '+Game.clickStr+'="isShifting()?info(63):(hiding[4]=!hiding[4]);RedrawCCCEM(1);">P for Pause interface '+(hiding[4]?'hidden':'visible')+'</a>'; }
  for (var i in moreButtonsPlus[0]) {str+=moreButtonsPlus[0][i]}
  if (typeof hasFinder !== 'undefined') { str+='<a class="option neato'+(hiding[5]?'gray':'white')+'" '+Game.clickStr+'="isShifting()?info(64):(hiding[5]=!hiding[5]);RedrawCCCEM(1);">Cast Finder interface '+(hiding[5]?'hidden':'visible')+'</a><br>'; }
    
  if (!hiding[0]) {
  str+='<div class="line"></div>';
  str+='<a class="option neato" '+Game.clickStr+'="isShifting()?info(1):PresetSettingsGrail();RedrawCCCEM();">Default</a>';
  str+='<a class="option neato" '+Game.clickStr+'="isShifting()?info(3):PresetSettingsConsist();RedrawCCCEM();">100% consistency</a><br>';
  str+='<a class="option neato" '+Game.clickStr+'="isShifting()?info(2):PresetSettingsBSScry();RedrawCCCEM();">BS scry</a>';
  str+='<a class="option neatocyan" '+Game.clickStr+'="promptN=0; isShifting()?info(4):GetPrompt();">Import Save</a><br>';
  str+='<a class="option neatocyan" '+Game.clickStr+'="promptN=16; if (isShifting()) { info(73); } else { GetPrompt(); l(\'textareaPrompt\').value=getSettingsCode(); }">Export Settings</a>';
  str+='<a class="option neatocyan" '+Game.clickStr+'="promptN=17; isShifting()?info(74):GetPrompt();">Import Settings</a><br>';
  }
  
  if (!hiding[1]) {
  str+='<div class="line"></div>';
  str+='<a class="option neatocyan" '+Game.clickStr+'="promptN=1; isShifting()?info(6):GetPrompt();">Initial seed '+iniSeed+'</a>';
  str+='<a class="option neatocyan" '+Game.clickStr+'="promptN=2; isShifting()?info(7):GetPrompt();">Cookies '+(iniC.toPrecision(1))+'</a><br>';
  str+='<a class="option neatocyan" '+Game.clickStr+'="promptN=3; isShifting()?info(8):GetPrompt();">CookiesBTA '+(iniCE.toPrecision(1))+'</a>';
  str+='<a class="option neatocyan" '+Game.clickStr+'="promptN=4; isShifting()?info(9):GetPrompt();">Prestige '+(iniP.toPrecision(1))+'</a><br>';
  str+='<a class="option neatocyan" '+Game.clickStr+'="promptN=5; isShifting()?info(10):GetPrompt();">Lumps '+(iniLumps)+'</a>';
  let lumpTypes = ["Normal", "Bifurcated", "Golden", "Meaty", "Caramel"];
  str+='<a class="option neatoblue" '+Game.clickStr+'="isShifting()?info(11):(isCtrl()?chooseLump--:chooseLump++); if (chooseLump>4) chooseLump=0; else if (chooseLump<0) chooseLump=4; RedrawCCCEM();">Lump type '+lumpTypes[chooseLump]+'</a>';
  str+='<a class="option neatocyan" '+Game.clickStr+'="promptN=20; isShifting()?info(77):GetPrompt();">Click cooldown '+(clickWait)+'ms</a><br>';
  str+='<a class="option neatocyan" '+Game.clickStr+'="promptN=6; isShifting()?info(12):GetPrompt();">Building count anchor '+(iniBC)+'</a>';
  str+='<a class="option neatoblue" '+Game.clickStr+'="isShifting()?info(13):(isCtrl()?buildingSelected--:buildingSelected++); if (buildingSelected > 19) { buildingSelected = 0; } else if (buildingSelected < 0) { buildingSelected = 19; } if (buildingSelected == 7) { isCtrl()?buildingSelected--:buildingSelected++; }RedrawCCCEM();">Override '+(Game.ObjectsById[buildingSelected].name)+'</a>';
  str+='<a class="option neatocyan" '+Game.clickStr+'="promptN=13; isShifting()?info(14):GetPrompt();">Overriding number '+(manualBuildings[buildingSelected])+'</a><br>';
  str+='<a class="option neato'+(useEB?'orange':'yellow')+'" '+Game.clickStr+'="isShifting()?info(15):(useEB=!useEB); RedrawCCCEM();">'+(useEB?'EB List':'No EB')+'</a>';
  str+='<a class="option neato'+((useRebuy/2)?'orange':'yellow')+'" '+Game.clickStr+'="isShifting()?info(16):(useRebuy+=2); if (useRebuy>2) useRebuy=0; RedrawCCCEM();">'+(useRebuy?'Rebuy':'No Rebuy')+'</a>';
  str+='<a class="option neatocyan" '+Game.clickStr+'="promptN=7; isShifting()?info(19):GetPrompt();">Wizard towers '+(wizCount)+'</a>';
  str+='<a class="option neatocyan" '+Game.clickStr+'="promptN=8; isShifting()?info(20):GetPrompt();">Tower Level '+(wizLevel)+'</a>';
  str+='<a class="option neato'+((!buyOption1)?'orange':'yellow')+'" '+Game.clickStr+'="isShifting()?info(21):(buyOption1?buyOption1--:buyOption1++); RedrawCCCEM();">'+(buyOption1?'Sell':'Buy')+'</a>';
  str+='<a class="option neatoblue" '+Game.clickStr+'="isShifting()?info(22):(isCtrl()?buyOption2--:buyOption2++); if (buyOption2>5) {buyOption2=2} else if (buyOption2<2) { buyOption2=4; }; RedrawCCCEM();">'+(Math.max(0, buyOption2-4)?'All':(Math.pow(10,buyOption2-2)))+'</a><br>';
  str+='<a class="option neato'+((Game.heralds-41)?'orange':'yellow')+'" '+Game.clickStr+'="isShifting()?info(23):(Game.heralds=(Game.heralds==41)?100:41);if(!isShifting()) { Game.externalDataLoaded=true; }RedrawCCCEM();">'+(Game.heralds)+' heralds</a>';
  str+='<a class="option neatoblue" '+Game.clickStr+'="isShifting()?info(24):(isCtrl()?d2Aura--:d2Aura++); if (d2Aura>21) d2Aura=0; else if (d2Aura<0) d2Aura=21; RedrawCCCEM();">Left Aura '+Game.dragonAuras[d2Aura].name+'</a>';
  str+='<a class="option neatoblue" '+Game.clickStr+'="isShifting()?info(25):(isCtrl?d1Aura--:d1Aura++); if (d1Aura>21) d1Aura=0; else if (d1Aura<0) d1Aura=21;RedrawCCCEM();">Right Aura '+Game.dragonAuras[d1Aura].name+'</a><br>';
  str+='<a class="option neatoblue" '+Game.clickStr+'="if (isShifting()) {info(26);} else if (isCtrl()) { if (forceFortune<=0.04) {forceFortune-=0.02;} else {forceFortune-=0.04;}; if (forceFortune<=-0.01) {forceFortune=1;} } else { if (forceFortune<0.04) {forceFortune+=0.02;} else {forceFortune+=0.04;}; if (forceFortune>1.004) forceFortune=0;} RedrawCCCEM();">Fortune chance: '+Math.round(forceFortune*100)+'%</a>';
  str+='<a class="option neatoblue" '+Game.clickStr+'="if (isShifting()) {info(70);} else { cycleSeason(isCtrl()); } RedrawCCCEM();">Starting season: '+(setSeason?Game.UpgradesById[setSeason].season:'none')+'</a><br>';
  str+='<a class="option neatoblue" '+Game.clickStr+'="if (isShifting()) {info(79);} else { cycleCastInitSeason(isCtrl()); } RedrawCCCEM();">Scried season: '+((initCastFindSeason != null)?((initCastFindSeason == 0)?'none':Game.UpgradesById[initCastFindSeason].season):'current season')+'</a><br>';
  }
    
  if (!hiding[2]) {
  str+='<div class="line"></div>'
  if (typeof hasFinder === 'undefined') {
  	str+='<a class="option neatoblue" '+Game.clickStr+'="isShifting()?info(27):(forceFtHoF=CycleFtHoF(isCtrl())); RedrawCCCEM();">FtHoF '+(forceFtHoF)+'</a>';
  }
  str+='<a class="option neato'+(forcedCastCount[1]?'orange':'yellow')+'" '+Game.clickStr+'="isShifting()?info(17):(forcedCastCount[1]=!forcedCastCount[1]); RedrawCCCEM();">'+(forcedCastCount[1]?'Force cast count On':'Force cast count Off')+'</a>';
  str+='<a class="option neatocyan" '+Game.clickStr+'="promptN=14; isShifting()?info(18):GetPrompt();">Forced cast count '+forcedCastCount[0]+'</a><br>';
  let garde = Game.Objects["Farm"].minigame;
  str+='<a class="option neatocyan" '+Game.clickStr+'="promptN=21; isShifting()?info(78):GetPrompt();RedrawCCCEM();">Farm Level '+gardenLevel+'</a>';
  str+='<a class="option neatoblue" '+Game.clickStr+'="isShifting()?info(28):(isCtrl()?gardenSeed--:gardenSeed++); if (gardenSeed>33) gardenSeed=0; else if (gardenSeed<0) gardenSeed=33;RedrawCCCEM();">Holding '+(garde.plantsById[gardenSeed].name)+' seed</a>';
  let rotate = ['bottom', 'top', 'left', 'right'];
  str+='<a class="option neatoblue" '+Game.clickStr+'="isShifting()?info(29):(isCtrl()?setGardenR--:setGardenR++); if (setGardenR>4) setGardenR=0; else if (setGardenR<0) setGardenR=4;RedrawCCCEM();">Rotation '+(setGardenR?rotate[setGardenR-1]:'R')+'</a><br>';
  str+='<a class="option neatocyan" '+Game.clickStr+'="promptN=11; isShifting()?info(30):GetPrompt();RedrawCCCEM();">Tick '+(toNextTick?toNextTick+'s':'R')+'</a>';
  str+='<a class="option neatoblue" '+Game.clickStr+'="isShifting()?info(31):(isCtrl()?gardenP1[0]--:gardenP1[0]++); if (gardenP1[0]>34) gardenP1[0]=1; else if (gardenP1[0]<0) gardenP1[0]=34;RedrawCCCEM();">Plant 1 '+(garde.plantsById[gardenP1[0]-1].name)+'</a>';
  str+='<a class="option neatoblue" '+Game.clickStr+'="isShifting()?info(32):(isCtrl()?gardenP1[1]-=5:gardenP1[1]+=5); if (gardenP1[1]>99) gardenP1[1]=1; else if (gardenP1[1]<0) gardenP1[1]=99;RedrawCCCEM();">Plant 1 age '+(gardenP1[1])+'</a><br>';
  str+='<a class="option neatoblue" '+Game.clickStr+'="isShifting()?info(33):(isCtrl()?gardenP2[0]--:gardenP2[0]++); if (gardenP2[0]>34) gardenP2[0]=1; else if (gardenP2[0]<0) gardenP1[0]=34;RedrawCCCEM();">Plant 2 '+(garde.plantsById[gardenP2[0]-1].name)+'</a>';
  str+='<a class="option neatoblue" '+Game.clickStr+'="isShifting()?info(34):(isCtrl()?gardenP2[1]-=5:gardenP2[1]+=5); if (gardenP2[1]>99) gardenP2[1]=1; else if (gardenP2[1]<0) gardenP2[1]=99;RedrawCCCEM();">Plant 2 age '+(gardenP2[1])+'</a><br>';
  str+='<a class="option neatoblue" '+Game.clickStr+'="isShifting()?info(35):(isCtrl()?officeL--:officeL++); if (officeL>5) officeL=0; else if (officeL<0) officeL=5;RedrawCCCEM();">Office '+(officeL + 1)+'</a>';
  let godNames = ['Holobore', 'Vomitrax', 'Godzamok', 'Cyclius', 'Selebrak', 'Dotjeiess', 'Muridal', 'Jeremy', 'Mokalsium', 'Skruuia', 'Rigidel'];
  str+='<a class="option neatoblue" '+Game.clickStr+'="isShifting()?info(36):(isCtrl()?spirit1--:spirit1++); if (spirit1>10) spirit1=0; else if (spirit1<0) spirit1=10;RedrawCCCEM();">Diamond '+(godNames[spirit1])+'</a>';
  str+='<a class="option neatoblue" '+Game.clickStr+'="isShifting()?info(37):(isCtrl()?spirit2--:spirit2++); if (spirit2>10) spirit2=0; else if (spirit2<0) spirit2=10;RedrawCCCEM();">Ruby '+(godNames[spirit2])+'</a>';
  str+='<a class="option neatoblue" '+Game.clickStr+'="isShifting()?info(38):(isCtrl()?spirit3--:spirit3++); if (spirit3>10) spirit3=0; else if (spirit3<0) spirit3=10;RedrawCCCEM();">Jade '+(godNames[spirit3])+'</a><br>';
  for (var i in moreButtons[1]) {str+=moreButtons[1][i]}
  }
    
  if (!hiding[3]) {
  str+='<div class="line"></div>';
  str+='<a class="option neato'+(iniF?'orange':'yellow')+'" '+Game.clickStr+'="isShifting()?info(39):(iniF=!iniF);RedrawCCCEM();">Frenzy '+(iniF?'On':'Off')+'</a>';
  str+='<a class="option neatocyan" '+Game.clickStr+'="promptN=15; isShifting()?info(40):GetPrompt();">Frenzy dur '+(iniFdur)+'s</a><br>';
  str+='<a class="option neato'+(iniDH?'orange':'yellow')+'" '+Game.clickStr+'="isShifting()?info(41):(iniDH=!iniDH);RedrawCCCEM();">Dragon Harvest '+(iniDH?'On':'Off')+'</a>';
  str+='<a class="option neatocyan" '+Game.clickStr+'="promptN=9; isShifting()?info(42):GetPrompt();">Dragon Harvest dur '+(iniDHdur)+'s</a><br>';
  str+='<a class="option neatoblue" '+Game.clickStr+'="isShifting()?info(43):(isCtrl()?iniBSCount--:iniBSCount++); if (iniBSCount>Object.keys(Game.Objects).length) iniBSCount=0; else if (iniBSCount<0) iniBSCount=Object.keys(Game.Objects).length-1; RedrawCCCEM();">Extra Building Specials: '+(iniBSCount)+'</a>';
  str+='<a class="option neatocyan" '+Game.clickStr+'="promptN=10; isShifting()?info(44):GetPrompt();">Building Special dur '+(iniBSdur)+'s</a><br>';
  str+='<a class="option neato'+(iniSB?'orange':'yellow')+'" '+Game.clickStr+'="isShifting()?info(45):(iniSB=!iniSB); RedrawCCCEM();">Sugar Blessing '+(iniSB?'On':'Off')+'</a>';
  str+='<a class="option neato'+(seedNats?'orange':'yellow')+'" '+Game.clickStr+'="isShifting()?info(46):(seedNats=!seedNats);RedrawCCCEM();">Seeding GC '+(seedNats?'On':'Off')+'</a>';
  str+='<a class="option neato'+(seedTicker?'orange':'yellow')+'" '+Game.clickStr+'="isShifting()?info(47):(seedTicker=!seedTicker);RedrawCCCEM();">Seeding News '+(seedTicker?'On':'Off')+'</a><br>';
  str+='<a class="option neato'+(iniSpawn?'orange':'yellow')+'" '+Game.clickStr+'="if (!isShifting()) {iniSpawn=!iniSpawn; moreButtons[2].splice(moreButtons[2].indexOf(iniTimerButton),1); if (!iniSpawn) {moreButtons[2].push(iniTimerButton)}} else {info(48);} RedrawCCCEM();">Natural GC '+(iniSpawn?'On':'Off')+'</a>';
  str+='<a class="option neato'+(iniDO?'orange':'yellow')+'" '+Game.clickStr+'="isShifting()?info(49):(iniDO=!iniDO);RedrawCCCEM();">Dragon Orbs '+(iniDO?'On':'Off')+'</a>';
  str+='<a class="option neato'+(iniDEoRL?'orange':'yellow')+'" '+Game.clickStr+'="isShifting()?info(50):(iniDEoRL=!iniDEoRL);RedrawCCCEM();">DEoRL '+(iniDEoRL?'On':'Off')+'</a><br>';
  str+='<a class="option neatoblue" '+Game.clickStr+'="if (isShifting()) {info(51);} else { if (iniGC==\'R\') {iniGC=-1}; iniGC+=isCtrl()?-2:2; if (iniGC>27) iniGC=\'R\'; else if (iniGC==-1) iniGC=\'R\'; else if (iniGC<=-1) iniGC=27; } RedrawCCCEM();">GC1 '+(Game.goldenCookieChoices[iniGC])+'</a>';
  str+='<a class="option neatoblue" '+Game.clickStr+'="if (isShifting()) {info(52);} else { if (iniGC2==\'R\') {iniGC2=-1}; iniGC2+=isCtrl()?-2:2; if (iniGC2>27) iniGC2=\'R\'; else if (iniGC2==-1) iniGC2=\'R\'; else if (iniGC2<=-1) iniGC2=27;} RedrawCCCEM();">GC2 '+(Game.goldenCookieChoices[iniGC2])+'</a>';
  str+='<a class="option neatoblue" '+Game.clickStr+'="if (isShifting()) {info(53);} else { if (iniGC3==\'R\') {iniGC3=-1}; iniGC3+=isCtrl()?-2:2; if (iniGC3>27) iniGC3=\'R\'; else if (iniGC3==-1) iniGC3=\'R\'; else if (iniGC3<=-1) iniGC3=27;} RedrawCCCEM();">GC3 '+(Game.goldenCookieChoices[iniGC3])+'</a><br>';
  str+='<a class="option neatocyan" '+Game.clickStr+'="promptN=18; isShifting()?info(75):GetPrompt(); RedrawCCCEM();">Dragonflight chance x'+DFChanceMult+'</a>';
  str+='<a class="option neatocyan" '+Game.clickStr+'="promptN=19; isShifting()?info(76):GetPrompt(); RedrawCCCEM();">Golden cookie spawnrate x'+gcRateMult+'</a>';
  }
  
  if (!hiding[4]) { for (var i in moreButtons[2]) {str+=moreButtons[2][i]} }
    
   
  if (!hiding[5]) { for (var i in moreButtonsPlus[1]) {str+=moreButtonsPlus[1][i]} }
    
    
  str+='<div class="line"></div>';
  str+='<a class="option neatolime" '+Game.clickStr+'="isShifting()?info(54):customSave();">Save current settings</a>';
  str+='<a class="option neato'+(autoSaveCCCEM?'orange':'yellow')+'" '+Game.clickStr+'="isShifting()?info(65):(autoSaveCCCEM=!autoSaveCCCEM);RedrawCCCEM();">Auto save '+(autoSaveCCCEM?'On':'Off')+'</a>';
  str+='</div>';
  l('devConsole').innerHTML=str;
  l('devConsole').style.minWidth='24px'
  l('devConsole').style.width='auto'
  l('debug').style.display='block';
  };
moreButtons[0].push(pForPauseButtons[0])
moreButtonsPlus[0].push(castFinderButtons[0])
RedrawCCCEM();
invalidateScore=0;

//colored buttons
var customStyles = [];
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
  }`)
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
let styleObj = document.createElement('style');
let stylesStr = '';
for (let i of customStyles) { stylesStr += i + '\n'; }
styleObj.textContent = stylesStr;
l('game').appendChild(styleObj);