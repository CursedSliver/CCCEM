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

var cccemSpritesheet=App?this.dir+"/cccemAsset.png":"https://raw.githack.com/CursedSliver/asdoindwalk/main/cccemAsset.png"

Game.sesame=0 //this prevents a crash if opensesame is open, but doesn't get rid of the fps counter. Not sure what to do about that
var FtHoFOutcomes=['random','blood frenzy','click frenzy','building special','frenzy','cursed finger','multiply cookies','cookie storm','free sugar lump','cookie storm drop','blab']
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
var buildingSelected=0;
var isClickedGC=false;
var autoSaveCCCEM=false;
var hasSetSettings=false;
var pForPausePath = cccemDir+'PForPause.js';
var castFinderPath = cccemDir+'castFinder.js';
var testButton='<a class="option neato" '+Game.clickStr+'="for (var i in moreButtons) {if (moreButtons[i].indexOf(testButton)!=-1) {moreButtons[i].splice(moreButtons[i].indexOf(testButton),1)}}; RedrawCCCEM();">Remove test buttons?</a>'
var iniTimerButton='<a class="option neatocyan" '+Game.clickStr+'="promptN=12; isShifting()?info(58):GetPrompt();">Nat Spawn Timer '+iniTimer+' frames</a><br>'
if (typeof pForPauseButtons === 'undefined') {var pForPauseButtons=['<a class="option neato" '+Game.clickStr+'="isShifting()?info(5):(Game.LoadMod(`'+pForPausePath+'`)); if (hasHarbor && !isShifting()) { MacadamiaModList.cccem.mod.loadModRPC.send({ path: `'+pForPausePath+'` }); }">Load P for Pause</a>']}
if (typeof castFinderButtons === 'undefined') {var castFinderButtons=['<a class="option neato" '+Game.clickStr+'="isShifting()?info(55):setupFinderIntegration(); if (hasHarbor && !isShifting()) { MacadamiaModList.cccem.mod.loadCastFinderRPC.send(); }">Load Cast Finder</a><br>']}
if (typeof moreButtons === 'undefined') {var moreButtons=[[],[],[]]}
if (typeof moreButtonsPlus === 'undefined') {var moreButtonsPlus=[[],[]]}
var hiding = [true,true,true,true,false,false]
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
  var icBuffs=['dragonflight','blood frenzy','click frenzy','frenzy','dragon harvest']
  for (var i=0; i<bsCount; i++) {icBuffs.push('building special')}
  index=icBuffs.indexOf(forceFtHoF); if (forceFtHoF && index!=-1) icBuffs.splice(index, 1);
  index=icBuffs.indexOf('frenzy'); if (iniF && index!=-1) icBuffs.splice(index, 1);
  index=icBuffs.indexOf('dragon harvest'); if (iniDH && index!=-1) icBuffs.splice(index, 1);
  for (var i=0; i<iniBSCount; i++) {index=icBuffs.indexOf('building special'); if (index!=-1) icBuffs.splice(index, 1)};
  if (iniSpawn && iniGC!='R') {index=icBuffs.indexOf(Game.goldenCookieChoices[iniGC].toLowerCase()); if (index!=-1) icBuffs.splice(index, 1)};
  if (iniDO && iniGC2!='R') {index=icBuffs.indexOf(Game.goldenCookieChoices[iniGC2].toLowerCase()); if (index!=-1) icBuffs.splice(index, 1)};
  if (iniDEoRL && iniGC3!='R') {index=icBuffs.indexOf(Game.goldenCookieChoices[iniGC3].toLowerCase()); if (index!=-1) icBuffs.splice(index, 1)};
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
  var clickGain=Game.handmadeCookies-iniHM
  var consistentPow = AllConsistentBuffsPow();
  var scoreRed=(maxComboPow*iniRaw*consistentPow/relComboPow);
  var score=(cookieGain/scoreRed)*scoreCorVal*autoScoreCor;
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
  
  var z ='​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ '
  devastatedness = NormalizeDevastatedness(devastatedness);
  rebuyedness = NormalizeDevastatedness(rebuyedness)/devastatedness;
  var clicks = Math.trunc(0.000000001+(devastatedness/maxGodz));

  var logArr = []
  logArr.push('Score: ' + originalScore.toPrecision(3) + ' (' + (score*100).toFixed(1) + '%)<br>')
  logArr.push('Years of CpS: ' + Beautify(cookieGain/iniRaw/31536000) +'<br>')
  logArr.push('Strength of Godzamok: ' + maxGodz.toPrecision(3) +'<br>')
  logArr.push(z+'Clicks: ' + Beautify(clicks) +'<br>')
  logArr.push(z+'Devastatedness: ' + Beautify(devastatedness) +'<br>')
  logArr.push(z+'Click multiplier from rebuys: ' + rebuyedness.toFixed(3) +'<br>')
  logArr.push('<br>')
  logArr.push('Combo Strength: ' + Beautify(maxComboPow) +'<br>')
  logArr.push('Strength of non-divided buffs: ' + Beautify(relComboPow) +'<br>')
  logArr.push('All Consistent Buffs power: ' + Beautify(consistentPow) +'<br>')
  logArr.push('Number of BSs: ' + maxBSCount +'<br>')
  logArr.push('<br>')
  logArr.push('Cookie gained: ' + Beautify(cookieGain) +'<br>')
  logArr.push('Handmade gain: ' + Beautify(clickGain) +'<br>')
  logArr.push('Initial Raw CpS: ' + Beautify(iniRaw) +'<br>')


  var clickScore=score*(clickGain/cookieGain)*1.05
  if (clickScore) {
    var clickDiffCor = (devastatedness/maxGodz)/clicks
    var godzScore = clickScore/clickDiffCor
    var trueDevastated = rebuyedness*clicks*maxGodz
    var scorePerClick = (godzScore/trueDevastated)*1333000
    var scoreCorrection = ((trueDevastated / 4250) / (godzScore))
    var manualCor = scoreCorrection*scoreCorVal
    logArr.push('<br>')
    logArr.push('Score per Click: '+(scorePerClick).toPrecision(4) +'<br>')
    logArr.push('Score correction value: '+scoreCorrection.toPrecision(4) +'<br>')
    logArr.push(z+'Automatic score correction: '+autoScoreCor.toPrecision(4) +'<br>')
    logArr.push(z+'Set score mult to: '+(manualCor).toPrecision(4) +'<br>')
    };

  logStr=''
  for (i in logArr) logStr+=logArr[i].replace("<br>","\n").replace(z,"");
  console.log(logStr, invalidateScore)
  if (invalidateScore==0) {Game.Notify(logArr[0],logArr[1]+logArr[2]+logArr[3]+logArr[4]+logArr[5].replace('<br>','')+(hasSetSettings?'.':''),icon)} else {Game.Notify('Score invalid', 'Settings changed since reset',[10,6],16,0,1); invalidateScore=0};
  if (scoreCorNotify && clickScore && (scoreCorrection<0.99 || scoreCorrection>1.01)) {
    Game.Notify('Large score fault',logArr[logArr.length-4]+logArr[logArr.length-3]+logArr[logArr.length-2]+logArr[logArr.length-1],[1,7]);
    };
  if (scoreCorNotify && clickScore && incorrectEBwarn>0) {Game.Notify('EB setting fault','EB setting not matching usage of Elder Battalion',[1,7]);}
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
  Game.Prompt('<id ImportSave><h3>'+"Input to variable"+'</h3><div class="block">'+loc("Please paste what you want the variable to be equal to.")+'<div id="importError" class="warning" style="font-weight:bold;font-size:11px;"></div></div><div class="block"><textarea id="textareaPrompt" style="width:100%;height:128px;">'+'</textarea></div>',[[loc("Load"),`;Game.ClosePrompt(); 
    switch (promptN) {
    case 0: iniLoadSave=(l(\'textareaPrompt\').value); if (iniLoadSave.length<100) {iniLoadSave=false};break;
    case 1: iniSeed=(l(\'textareaPrompt\').value.trim()); if (iniSeed.length!=5) {iniSeed=\'R\'};break;
    case 2: iniC=Number(l(\'textareaPrompt\').value);break;
    case 3: iniCE=Number(l(\'textareaPrompt\').value);break;
    case 4: iniP=Number(l(\'textareaPrompt\').value);break;
    case 5: iniLumps=Number(l(\'textareaPrompt\').value);break;
    case 6: iniBC=Number(l(\'textareaPrompt\').value);break;
    case 7: wizCount=Number(l(\'textareaPrompt\').value);break;
    case 8: wizLevel=Number(l(\'textareaPrompt\').value);break;
    case 9: iniDHdur=Number(l(\'textareaPrompt\').value.replace("s",""));break;
    case 10: iniBSdur=Number(l(\'textareaPrompt\').value.replace("s",""));break;
    case 11: toNextTick=Number(l(\'textareaPrompt\').value.replace("s",""));break;
    case 12: var prev=iniTimer; iniTimer=Number(l(\'textareaPrompt\').value.replace("s",""));UpdateMoreButtons(prev);break;
    case 13:manualBuildings[buildingSelected]=Number(l(\'textareaPrompt\').value);break;
    case 14:forcedCastCount[0]=Number(l(\'textareaPrompt\').value);break;
    case 15:iniFdur=Number(l(\'textareaPrompt\').value);break;
    case 16:break;
    case 17:setSettings(l(\'textareaPrompt\').value);hasSetSettings=true;break;
    case 18:DFChanceMult=Number(l(\'textareaPrompt\').value);break;
    case 19:gcRateMult=Number(l(\'textareaPrompt\').value);break;
    case 20:clickWait=Number(l(\'textareaPrompt\').value);break;
    case 21:gardenLevel=Number(l(\'textareaPrompt\').value);break;
    case 22:scoreCorVal=Number(l(\'textareaPrompt\').value);break;
    };
    RedrawCCCEM();`],loc("Nevermind")]);
	l('textareaPrompt').focus();
  };

function UpdateMoreButtons(prev) {
  iniTimerButton='<a class="option neatocyan" '+Game.clickStr+'="promptN=12; isShifting()?info(58):GetPrompt();">Nat Spawn Timer '+prev+' frames</a><br>'
  if (moreButtons[2].indexOf(iniTimerButton)!=-1) {moreButtons[2].splice(moreButtons[2].indexOf(iniTimerButton),1)}
  iniTimerButton='<a class="option neatocyan" '+Game.clickStr+'="promptN=12; isShifting()?info(58):GetPrompt();">Nat Spawn Timer '+iniTimer+' frames</a><br>'
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

var CCCEMButtonsList = [];
var CCCEMButtons = {};
var CCCEMCategories = {};
var uncategorizedButtons = [];

class CCCEMButton {
  constructor(key, name, type, info, updateVarFunc, newLine, watch) {
    this.key = key;
    this.namesList = [].concat(name);
    this.type = type; //class type
    this.type.parent = this;
    this.state = this.type.default.call(this.type); //can be anything really, is the actual variable in a way
    this.updateVarFunc = updateVarFunc; //sets the variable so no need to rewrite everything, but can also do anything else really
    this.info = info; //class info
    this.newLine = newLine?'<br>':'';
    this.hidden = false;
    this.watch = watch; //called every 5 frames with this keyword set to the button so state can be adjusted, mainly used in external categories, developing cccem itself shouldnt use it and it isnt functional in that context anyways

    this.id = CCCEMButtonsList.length;
    CCCEMButtonsList.push(this);
    CCCEMButtons[this.key] = this;
  }
  updateVarFunc = () => {}

  getLStr() {
    if (this.hidden) { return ''; }
    return '<a class="option '+this.type.getColorStr()+'" '+Game.clickStr+'="isShifting()?(CCCEMButtonsList['+this.id+'].info.getInfo()):(CCCEMButtonsList['+this.id+'].triggerSetVar());">'+this.type.parse(this.namesList, this.state)+'</a>'+this.newLine;
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
    this.type.onClick();
    this.type.triggerVarFunc();
    RedrawCCCEM();
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
  constructor(key, order, buttonsList) {
    this.key = key;
    this.order = order ?? Object.keys(CCCEMCategories).length;
    this.hidden = false;
    this.buttons = buttonsList;
    CCCEMCategories[key] = this;
    for (let i in this.buttons) {
      this.buttons[i].category = this;
    }
  }
  buttons = []
  external = false
  register(button) {
    this.buttons.push(button);
    button.category = this;
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


class buttonType {
  constructor() {
    //this.parent = button owning this type
  }
  getColorStr() {
    return 'neato';
  }
  parse(names, state) {
    //returns name of button based on namesList and whatever
    return names[0];
  }
  onClick() {
    invalidateScore = 1;
    //does things to change the variable idk
  }
  triggerVarFunc() {
    if (this.parent.updateVarFunc) {
      this.parent.updateVarFunc.call(this.parent, this.parent.state);
    }
    //makes it overridable
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
}
class limeButton extends buttonType {
  //alternate color signifying something important
  //will not invalidate score
  constructor() { super(); }
  getColorStr() {
    return 'neatolime';
  }
  onClick() {

  }
  willSave = false
}
class inputButton extends buttonType {
  //base class, should never be used in practice
  constructor() {
    super();
  }
  heading = 'Input variable'
  subHeading = 'Please input what you want the variable to be set to.'
  readonly = false
  getOptions() {
    return [[loc("Load"),`Game.ClosePrompt(); \nCCCEMButtonsList[${this.parent.id}].type.onInputConfirmation(l('textareaPrompt').value.trim());\nRedrawCCCEM();`],[loc("Nevermind")]]
  }
  afterCall() {
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
    return names[0].replace('[##]', state);
  }
  onClick() {
    invalidateScore = 1;
    Game.Prompt('<id NumImport><h3>'
      + loc(this.heading)
      + '</h3><div class="block">'
      + loc(this.subHeading)
      + '<div id="importError" class="warning" style="font-weight:bold;font-size:11px;"></div></div><div class="block"><textarea id="textareaPrompt" style="width:100%;height:128px;"'
      + (this.readonly?'readonly':'')
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
  constructor(precision) {
    super();
    if (precision) { this.precision = precision; }
  }
  precision = 3
  heading = 'Input number'
  subHeading = 'Please input a number the variable should be equal to.'
  parse(names, state) {
    return names[0].replace('[##]', Beautify(state, this.precision));
  }
  onInputConfirmation(content) {
    if (isNaN(Number(content))) { 
      Game.Notify('Setting value failed!', 'The value set was not a number!', [7, 7]);
      return; 
    }
    this.parent.state = Number(content);
    if (this.parent.updateVarFunc) {
      this.parent.updateVarFunc.call(this.parent, this.parent.state);
    }
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
  constructor(parseConvert) {
    super();
    if (parseConvert) { this.parseConvert = parseConvert; }
  }
  parseConvert = e => e;
  parse(names, state) {
    return names[0].replace('[##]', this.parseConvert(state));
  }
}
class readonlyDisplayButton extends inputButton {
  //cyan button (string input)
  constructor(autoSet) {
    super();
    if (autoSet) { this.autoSet = autoSet; }
  }
  autoSet = () => ''
  afterCall() {
    l('textareaPrompt').value = this.autoSet.call(this);
    l('textareaPrompt').focus();
    l('textareaPrompt').select();
  }
  heading = 'Export variable'
  subHeading = 'Copy the contents of the box below to export it.'
  readonly = true
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
  getColorStr() { 
    return 'neatoblue';
  }
  parse(names, state) {
    return names[0].replace('[##]', this.parseConvert(state));
  }
  onClick() {
    invalidateScore = 1;
    this.parent.state += (isCtrl()?-1:1);
    if (this.parent.state < this.min) { this.parent.state = this.max; }
    if (this.parent.state > this.max) { this.parent.state = this.min; }
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
  onClick() {
    invalidateScore = 1;
    this.parent.state += (isCtrl() ? -2 : 2);
    if (this.parent.state > this.max) this.parent.state = this.min;
    if (this.parent.state < this.min) this.parent.state = this.max;
  }
  parseConvert = e => (e <= -1 ? 'R' : Game.goldenCookieChoices[e]);
}
class seasonalCycleButton extends cycleButton {
  constructor() {
    super(-1, 210, e => (e ? Game.UpgradesById[e].season : 'none'));
  }
  onClick() {
    invalidateScore = 1;
    if (isCtrl()) {
      this.parent.state--;
      if (this.parent.state == -1) { this.parent.state = 209; }
      if (this.parent.state == 208) { this.parent.state = 185; }
      if (this.parent.state == 181) { this.parent.state = 0; }
    } else { 
      this.parent.state++; 
      if (this.parent.state == 186) { this.parent.state = 209; }
      if (this.parent.state == 210) { this.parent.state = 0; }
      if (this.parent.state == 1) { this.parent.state = 182; }
    }
  }
}
class boolButton extends buttonType {
  //yellow/orange button
  constructor(truthy, falsy) {
    super();
    if (truthy) { this.truthy = truthy; }
    if (falsy) { this.falsy = falsy; }
  }
  truthy = 'On'
  falsy = 'Off'
  getColorStr() {
    return this.parent.state?'neatoorange':'neatoyellow';
  }
  parse(names, state) {
    return names[0].replace('[##]', state?this.truthy:this.falsy);
  }
  onClick() {
    invalidateScore = 1;
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
  getColorStr() {
    return CCCEMCategories[this.categoryToToggle].hidden?'neatogray':'neatowhite';
  }
  parse(names, state) {
    return names[0].replace('[##]', CCCEMCategories[this.categoryToToggle].hidden?'hidden':'visible');
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
    return names[0].replace('[##]', this.parseConvert(state));
  }
  getColorStr() {
    return 'neatopurple';
  }
  onClick() {
    window.toChangeKeyBind = this.parent.key;
    Game.Notify('Press a key to set!', '', 0);
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
    Game.Notify('Key set: '+e.key.toUpperCase(), '', 0);
  }
}
AddEvent(window, 'keydown', function (e) {
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
    this.savingFunc = savingFunc;
    this.loadingFunc = loadingFunc;
  }
  getColorStr() {
    return 'nonexistent';
  }
  save() {
    return this.savingFunc();
  }
  load(str) {
    this.loadingFunc(str);
    if (this.parent.updateVarFunc) { this.parent.updateVarFunc.call(this.parent, this.parent.state); }
  }
}

class buttonInfo {
  constructor(header, content, icon) {
    this.header = header;
    this.content = content;
    this.icon = icon;
  }

  getInfo() {
    Game.Notify(this.header, this.content, this.icon);
  }
}

class CCCEMExternalCategory extends buttonCategory {
  constructor(modCategoryName, modName, buttonsList, categoryToggleInfo) {
    const modKey = modCategoryName;
    super(modKey, 1000 + Object.keys(CCCEMCategories).length, buttonsList);

    if (CCCEMCategories['categoryTogglePanel'].has('optionsBatch'+modKey)) {
      CCCEMCategories['categoryTogglePanel'].has('optionsBatch'+modKey).hidden = false;
    } else {
      CCCEMCategories['categoryTogglePanel'].register(new CCCEMButton('optionsBatch'+modKey, modName+' options [##]', 
        new categoryToggleButton(modKey),
        categoryToggleInfo
      ));
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
  loadDataSlot(obj) {
    for (let i in obj) {
      for (let ii in this.buttons) {
        if (this.buttons[ii].key == i) { 
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
  const gap = '<br><div class="line"></div>';
  for (const cat of cats) {
    str += cat.compileButtons();
    str += gap;
  }
  str = str.slice(0, str.length - gap.length);
  return str;
}

new buttonCategory('interfaceBegin', 0, [
  new CCCEMButton('tryAgain', 'Try again',
    new limeButton(),
    new buttonInfo('Try again', 'Resets everything and starts another attempt.', [21, 6]),
    () => {
      ResetAll(1); if (hasHarbor && netcodeSettingsExport.hosting) { MacadamiaModList.cccem.mod.tryAgainRPC.send(); }
    }
  ),
  new CCCEMButton('resetKey','([##])',
    new keySelectButton(82),
    new buttonInfo('Reset key select', 'Selects the key that restarts the current attempt on press.', [0, 8]),
    down => { if (!down) { return; } ResetAll(1); }
  ),
]);

new buttonCategory('categoryTogglePanel', 1, [
  new CCCEMButton('optionsBatch1', 'Batch settings options [##]',
    new categoryToggleButton('batchSettings'),
    new buttonInfo('Options group: Batch settings', 'Options related to widespread setting changes and preset settings. ', [27, 29])
  ),
  new CCCEMButton('optionsBatch2', 'Game settings options [##]',
    new categoryToggleButton('gameSettings'),
    new buttonInfo('Options group: Game settings', 'Options related to the game\'s core features, including adjusting cookies, buildings, and lumps. ', [28, 29]),
    null, true
  ),
  new CCCEMButton('optionsBatch3', 'Minigame options [##]',
    new categoryToggleButton('minigameSettings'),
    new buttonInfo('Options group: Minigames', 'Options related to the four minigames. ', [28, 29])
  ),
  new CCCEMButton('optionsBatch4', 'Buff & GC options [##]',
    new categoryToggleButton('buffSettings'),
    new buttonInfo('Options group: Buffs & GC options', 'Options related to buffs and Golden cookies. Also includes many randomness-related options.', [28, 29]),
    null, true
  ),
  new CCCEMButton('loadPForPause', 'Load P for Pause', 
    new triggerButton(),
    new buttonInfo('Load P for Pause', 'Loads the P for Pause mod, which enables you to speed up, slow down, and stop time.', [8, 35]),
    function() {
      Game.LoadMod(pForPausePath); if (hasHarbor) { MacadamiaModList.cccem.mod.loadModRPC.send({ path: pForPausePath }); } this.hidden = true;
    }
  ),
  new CCCEMButton('optionsBatchPForPause', 'P for Pause options [##]',
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
  new CCCEMButton('optionsBatchCastFinder', 'Cast Finder options [##]',
    new categoryToggleButton('CastFinder'),
    new buttonInfo('Extras: Cast Finder', 'Options related to the Cast Finder mod. ', [28, 26])
  ),
]);
CCCEMButtons['optionsBatchPForPause'].hidden = true;
CCCEMButtons['optionsBatchCastFinder'].hidden = true;

new buttonCategory('batchSettings', 2, [
  new CCCEMButton('defaultPreset', 'Default',
    new triggerButton(),
    new buttonInfo('Default', 'Resets settings to default.', [14, 6]),
    () => { PresetSettingsGrail(); }
  ),
  new CCCEMButton('consistPreset', '100% consistency',
    new triggerButton(),
    new buttonInfo('Default', 'Resets settings to default.', [14, 6]),
    () => { PresetSettingsConsist(); }, true
  ),
  new CCCEMButton('bsScryPreset', 'BS scry',
    new triggerButton(),
    new buttonInfo('BS scry', 'Resets settings to a preset setting for a combo with a scried Building Special.', [13, 6]),
    () => { PresetSettingsBSScry(); }
  ),
  new CCCEMButton('importSave', 'Import save',
    new stringInputButton(),
    new buttonInfo('Import Save', 'Import a save of your own. Some settings will be overridden by the save\'s contents.', [24, 7]),
    function(s) { iniLoadSave = s; this.state = ''; }, true
  ),
  new CCCEMButton('exportSettings', 'Export settings',
    new readonlyDisplayButton(() => {
      return getSettingsCode();
    }),
    new buttonInfo('Export settings', 'Opens a prompt that allows you to store and reuse a setting for later.', [0, 32])
  ),
  new CCCEMButton('importSettings', 'Import settings',
    new stringInputButton(),
    new buttonInfo('Import settings', 'Imports a setting.', [2, 32]),
    function(s) { if (s) { setSettings(s); hasSetSettings = true; } this.state = ''; }
  ),
]);
CCCEMButtons['exportSettings'].willSave = false;
CCCEMButtons['importSettings'].willSave = false;

new buttonCategory('gameSettings', 3, [
  new CCCEMButton('iniSeed', 'Initial seed [##]',
    new stringInputButton(),
    new buttonInfo('Initial seed', 'Seed to determine RNG outcomes, or leave as \'R\' for random. <br>Also requires either toggling on Force cast count or change FtHoF to \'random\'.', [25, 25]),
    s => iniSeed = s
  ),
  new CCCEMButton('cookies', 'Cookies [##]',
    new numberInputButton(),
    new buttonInfo('Cookies', 'The amount of cookies you start with each attempt.', [10, 0]),
    s => iniC = s, true
  ),
  new CCCEMButton('cookiesBTA', 'CookiesBTA [##]',
    new numberInputButton(),
    new buttonInfo('Cookies Baked All Time', 'The Cookies Baked All Time statistic. Tied to your prestige level.', [29, 4]),
    s => iniCE = s
  ),
  new CCCEMButton('prestige', 'Prestige [##]',
    new numberInputButton(),
    new buttonInfo('Prestige', 'idk what this is for tbh tbh', [0, 0]),
    s => iniP = s, true
  ),
  new CCCEMButton('scoreMult', 'Score mult x[##]',
    new numberInputButton(),
    new buttonInfo('Correction value', 'The value the score should be multiplied by to better match standard values.', [16, 5]),
    s => scoreCorVal = s
  ),
  new CCCEMButton('scoreMultVerify', 'Score info [##]',
    new boolButton(),
    new buttonInfo('Score correction notifications', 'Whether to notify when the score does not conform to the baseline. Will only be given if most of your cookies are made from clicking', [1, 7]),
    s => scoreCorNotify = s
  ),
  new CCCEMButton('lumps', 'Lumps [##]',
    new numberInputButton(),
    new buttonInfo('Lumps', 'The amount of Sugar lumps you start with each attempt.', [29, 14]),
    s => iniLumps = s, true
  ),
  new CCCEMButton('lumpType', 'Lump type [##]',
    new cycleButton(0, 4, e => ["Normal", "Bifurcated", "Golden", "Meaty", "Caramel"][e]),
    new buttonInfo('Lump type', 'The type of Sugar lump you start with each attempt.', [29, 27]),
    s => chooseLump = s
  ),
  new CCCEMButton('gcClickCount', '[##] GC clicks',
    new numberInputButton(),
    new buttonInfo('Golden cookie click count', 'The amount of all time golden cookie clicks.', [23, 6]),
    s => GCCount = s
  ),
  new CCCEMButton('clickCooldown', 'Click cooldown [##]ms',
    new numberInputButton(),
    new buttonInfo('Click cooldown', 'The minimum amount of milliseconds between each click.', [0, 15]),
    s => clickWait = s, true
  ),
  new CCCEMButton('buildingCountAnchor', 'Building count anchor [##]',
    new numberInputButton(),
    new buttonInfo('Building count anchor', 'The amount of Cursors you start with each attempt. Other buildings scale off this value.', [33, 6]),
    s => iniBC = s
  ),
  new CCCEMButton('useEB', '[##]',
    new boolButton('Use EB', 'No EB'),
    new buttonInfo('Elder Battalion strategy', 'Changes the building distribution to better fit an Elder Battalion strategy.', [1, 25]),
    s => useEB = s
  ),
  new CCCEMButton('useRebuy', '[##]',
    new boolButton('Rebuy', 'No Rebuy'),
    new buttonInfo('Elder Battalion rebuy', 'Changes the building distribution to better fit a strategy rebuying after godzamok.', [1, 27]),
    s => useRebuy = s, true
  ),
  new CCCEMButton('buildingSelect', '[##]:',
    new cycleButton(0, Object.keys(Game.ObjectsById).length - 1, e => Game.ObjectsById[e].name),
    new buttonInfo('Select building', 'The specific building to override or mute. Once overridden, the anchor will not affect this building.', [35, 33]),
    s => {
      buildingSelected = s;
      CCCEMButtons['overridingNumber'].changeState(manualBuildings[s]);
      CCCEMButtons['muteBuilding'].changeState(muteBuildings[s]);
    }
  ),
  new CCCEMButton('overridingNumber', 'Overriding number [##]',
    new numberInputButton(),
    new buttonInfo('Overriding count', 'The number of that building you start with each attempt. An assignment of 0 disables override.', [29, 21]),
    s => { manualBuildings[buildingSelected] = s; }
  ),
  new CCCEMButton('muteBuilding', '[##]',
    new boolButton('Muted', 'Unmuted'),
    new buttonInfo('Mute', 'Whether a building should start muted. Minigames will always unmute unless that option is disabled.', [28, 6]),
    s => { muteBuildings[buildingSelected] = s; }
  ),
  new CCCEMButton('unmuteMinigames', 'Minigame [##]',
    new boolButton('Unmuted', 'Muteable'),
    new buttonInfo('Unmute minigames', 'Forces minigames to be unmuted on reset. If disabled, minigames can be freely muted and unmuted with the mute option.', [23, 15]),
    s => unmuteMinigames = s, true
  ),
  new CCCEMButton('wizCount', 'Wizard towers [##]',
    new numberInputButton(),
    new buttonInfo('Wizard towers', 'The amount of Wizard towers you start with each attempt.', [17, 0]),
    s => { wizCount = s; }
  ),
  new CCCEMButton('wizLevel', 'Tower Level [##]',
    new numberInputButton(),
    new buttonInfo('Tower Level', 'The level of Wizard towers you start with each attempt.', [17, 26]),
    s => { wizLevel = s; }
  ),
  new CCCEMButton('buyOption1', '[##]',
    new cycleButton(0, 1, e => e ? 'Sell' : 'Buy'),
    new buttonInfo('Sell/Buy select', 'Selects whether you are selecting \'Sell\' or \'Buy\' on the building list with the start of each attempt.', [9, 9]),
    s => { buyOption1 = s; }
  ),
  new CCCEMButton('buyOption2', '[##]',
    new cycleButton(2, 5, e => (e > 4 ? 'All' : String(Math.pow(10, e - 2)))),
    new buttonInfo('Sell/Buy amount', 'Selects the bulk-buying amount you are selecting at the start of each attempt.', [1, 6]),
    s => { buyOption2 = s; }, true
  ),
  new CCCEMButton('heralds', 'Heralds [##]',
    new boolButton('100', '41'),
    new buttonInfo('Heralds', 'Changes the amount of Heralds you have.', [21, 29]),
    s => { Game.heralds = s ? 100 : 41; Game.externalDataLoaded = true; }
  ),
  new CCCEMButton('leftAura', 'Left Aura [##]',
    new cycleButton(0, 21, e => Game.dragonAuras[e].name),
    new buttonInfo('Left Aura', 'The Dragon Aura you start with for the slot on the left.', [2, 25]),
    s => { d2Aura = s; }
  ),
  new CCCEMButton('rightAura', 'Right Aura [##]',
    new cycleButton(0, 21, e => Game.dragonAuras[e].name),
    new buttonInfo('Right Aura', 'The Dragon Aura you start with for the slot on the right.', [8, 25]),
    s => { d1Aura = s; }, true
  ),
  new CCCEMButton('fortuneChance', 'Fortune chance: [##]%',
    new numberInputButton(0),
    new buttonInfo('Fortune chance', 'The chance for a natural News ticker scroll to be a Fortune. No O fortuna: 2%. Enter in terms of percentage.', [10, 32]),
    s => { forceFortune = s / 100; }
  ),
  new CCCEMButton('fortuneClaim', 'Fortune [##] claimed',
    new boolButton('already', 'not yet'),
    new buttonInfo('Fortune claim', 'Whether or not the GC fortune (Today is your lucky day!) has already been claimed (and thus won\'t appear again).', [10, 32]),
    s => { fortuneG = s; }
  ),
  new CCCEMButton('startingSeason', 'Starting season: [##]',
    new seasonalCycleButton(),
    new buttonInfo('Starting season', 'The season that you start with upon trying again.', [16, 6]),
    s => { setSeason = s; }, true
  ),
  new CCCEMButton('scriedSeason', 'Scried season: [##]',
    new seasonalCycleButton(),
    new buttonInfo('Scried season', 'The season that the starting effect is scried (or predicted) in.', [16, 6]),
    s => { initCastFindSeason = (s === 210 ? null : s); }
  ),
  new CCCEMButton('reindeerCount', 'Popped [##] reindeer',
    new numberInputButton(),
    new buttonInfo('Reindeers popped', 'The amount of reindeers popped.', [12, 9]),
    s => { iniRein = s; }
  ),
  new CCCEMButton('pledgeStatus', 'Elder Pledge [##]',
    new boolButton(),
    new buttonInfo('Elder Pledge activity', 'Whether of not Elder Pledge is active.', [9, 9]),
    s => { setPledge = s; }
  )
]);
CCCEMButtons['reindeerCount'].hidden = true;
CCCEMButtons['pledgeStatus'].hidden = true;
CCCEMButtons['fortuneClaim'].hidden = true;
CCCEMButtons['gcClickCount'].hidden = true;

new buttonCategory('minigameSettings', 4, [
  new CCCEMButton('forceFtHoF', 'FtHoF [##]',
    new cycleButton(0, FtHoFOutcomes.length - 1, e => FtHoFOutcomes[e]),
    new buttonInfo('FtHoF scry', 'The outcome of the first Force the Hand of Fate cast upon starting an attempt.', [27, 11]),
    s => { forceFtHoF = FtHoFOutcomes[s]; }
  ),
  new CCCEMButton('forceCastToggle', 'Force cast count [##]',
    new boolButton('On', 'Off'),
    new buttonInfo('Force cast count', 'Forces the Grimoire\'s Spells casted all time stat to be whatever you choose.', [22, 11]),
    s => { forcedCastCount[1] = s; }
  ),
  new CCCEMButton('forcedCastValue', 'Forced cast count [##]',
    new numberInputButton(),
    new buttonInfo('Forced cast count', 'The value to assign to the Grimoire\'s Spells casted all time.', [30, 5]),
    s => { forcedCastCount[0] = s; }, true
  ),
  new CCCEMButton('gardenLevel', 'Farm Level [##]',
    new numberInputButton(),
    new buttonInfo('Farm Level', 'The level of your Farm, which controls the size of your garden.', [2, 26]),
    s => { gardenLevel = s; }
  ),
  new CCCEMButton('gardenSeed', 'Holding [##]',
    new cycleButton(0, 33, e => {
      const mg = Game.Objects['Farm'].minigame;
      if (!mg) { return ''; }
      return mg.plantsById[e].name;
    }),
    new buttonInfo('Holding seed', 'The seed you are holding.', [0, 0]),
    s => { gardenSeed = s; }
  ),
  new CCCEMButton('gardenRotation', 'Rotation [##]',
    new cycleButton(0, 4, e => ['R', 'bottom', 'top', 'left', 'right'][e]),
    new buttonInfo('Rotation', 'The orientation of the garden upon starting an attempt.', [28, 18]),
    s => { setGardenR = s; }, true
  ),
  new CCCEMButton('toNextTick', 'Tick [##]',
    new numberInputButton(),
    new buttonInfo('Tick', 'Progress to next tick in seconds.', [24, 18]),
    s => { toNextTick = s; }
  ),
  new CCCEMButton('plant1', 'Plant 1 [##]',
    new cycleButton(1, 34, e => Game.Objects['Farm'].minigame.plantsById[e - 1].name),
    new buttonInfo('Plant 1', 'One of the plants in the garden at the start of each attempt.', [26, 20]),
    s => { gardenP1[0] = s; }
  ),
  new CCCEMButton('plant1Age', 'Plant 1 age [##]',
    new numberInputButton(),
    new buttonInfo('Plant 1 age', 'The age of the first plant (percentage to death).', [25, 20]),
    s => { gardenP1[1] = s; }, true
  ),
  new CCCEMButton('plant2', 'Plant 2 [##]',
    new cycleButton(1, 34, e => Game.Objects['Farm'].minigame.plantsById[e - 1].name),
    new buttonInfo('Plant 2', 'The other plant in the garden at the start of each attempt.', [26, 20]),
    s => { gardenP2[0] = s; }
  ),
  new CCCEMButton('plant2Age', 'Plant 2 age [##]',
    new numberInputButton(),
    new buttonInfo('Plant 2 age', 'The age of the second plant (in terms of a percentage of its way to death) at the start of each attempt.', [25, 20]),
    s => { gardenP2[1] = s; }, true
  ),
  new CCCEMButton('office', 'Office [##]',
    new cycleButton(0, 5, e => (e + 1)),
    new buttonInfo('Office', 'The Stock market Office level. The office level determines the amount of loans available.', [18, 33]),
    s => { officeL = s; }
  ),
  new CCCEMButton('diamondGod', 'Diamond [##]',
    new cycleButton(0, 10, e => ['Holobore', 'Vomitrax', 'Godzamok', 'Cyclius', 'Selebrak', 'Dotjeiess', 'Muridal', 'Jeremy', 'Mokalsium', 'Skruuia', 'Rigidel'][e]),
    new buttonInfo('Pantheon Diamond slot', 'The god slotted within the Diamond slot of the Pantheon at the start of each attempt.', [23, 15]),
    s => { spirit1 = s; }
  ),
  new CCCEMButton('rubyGod', 'Ruby [##]',
    new cycleButton(0, 10, e => ['Holobore', 'Vomitrax', 'Godzamok', 'Cyclius', 'Selebrak', 'Dotjeiess', 'Muridal', 'Jeremy', 'Mokalsium', 'Skruuia', 'Rigidel'][e]),
    new buttonInfo('Pantheon Ruby slot', 'The god slotted within the Ruby slot of the Pantheon at the start of each attempt.', [25, 18]),
    s => { spirit2 = s; }
  ),
  new CCCEMButton('jadeGod', 'Jade [##]',
    new cycleButton(0, 10, e => ['Holobore', 'Vomitrax', 'Godzamok', 'Cyclius', 'Selebrak', 'Dotjeiess', 'Muridal', 'Jeremy', 'Mokalsium', 'Skruuia', 'Rigidel'][e]),
    new buttonInfo('Pantheon Jade slot', 'The god slotted within the Jade slot of the Pantheon at the start of each attempt.', [27, 18]),
    s => { spirit3 = s; }
  )
]);

new buttonCategory('buffSettings', 5, [
  new CCCEMButton('iniF', 'Frenzy [##]',
    new boolButton('On', 'Off'),
    new buttonInfo('Frenzy toggle', 'Whether Frenzy will be active at the start of each attempt.', [10, 14]),
    s => { iniF = s; }
  ),
  new CCCEMButton('iniFdur', 'Frenzy dur [##]s',
    new numberInputButton(),
    new buttonInfo('Frenzy duration', 'The duration of the Frenzy (in seconds) at the start of each attempt.', [8, 14]),
    s => { iniFdur = s; }, true
  ),
  new CCCEMButton('iniDH', 'Dragon Harvest [##]',
    new boolButton('On', 'Off'),
    new buttonInfo('Dragon Harvest toggle', 'Whether Dragon Harvest will be active at the start of each attempt.', [10, 25]),
    s => { iniDH = s; }
  ),
  new CCCEMButton('iniDHdur', 'Dragon Harvest dur [##]s',
    new numberInputButton(),
    new buttonInfo('Dragon Harvest duration', 'The duration of the Dragon Harvest (in seconds) at the start of each attempt.', [8, 25]),
    s => { iniDHdur = s; }, true
  ),
  new CCCEMButton('iniBSCount', 'Extra Building Specials: [##]',
    new cycleButton(0, Object.keys(Game.Objects).length, e => e),
    new buttonInfo('Extra Building Specials', 'The amount of unique Building Specials at the start of each attempt.', [5, 6]),
    s => { iniBSCount = s; }
  ),
  new CCCEMButton('iniBSdur', 'Building Special dur [##]s',
    new numberInputButton(),
    new buttonInfo('Building Special duration', 'The duration of each individual Building Special (in seconds) at the start of each attempt.', [23, 11]),
    s => { iniBSdur = s; }, true
  ),
  new CCCEMButton('iniSB', 'Sugar Blessing [##]',
    new boolButton('On', 'Off'),
    new buttonInfo('Sugar Blessing toggle', 'Whether Sugar Blessing (Buff from Golden Sugar lumps) will be active at the start of each attempt.', [29, 16]),
    s => { iniSB = s; }
  ),
  new CCCEMButton('seedNats', 'Seeding GC [##]',
    new boolButton('On', 'Off'),
    new buttonInfo('Seeded natural Golden cookies toggle', 'Whether naturally spawned Golden cookies will have their effects be determined by the current game seed.', [22, 6]),
    s => { seedNats = s; }
  ),
  new CCCEMButton('seedTicker', 'Seeding News [##]',
    new boolButton('On', 'Off'),
    new buttonInfo('Seeded News ticker messages toggle', 'Whether Fortune appearances in the News ticker are seeded by the current game seed.', [29, 8]),
    s => { seedTicker = s; }, true
  ),
  new CCCEMButton('iniSpawn', 'Natural GC [##]',
    new boolButton('On', 'Off'),
    new buttonInfo('Initial natural Golden cookie spawn toggle', 'Whether a Golden Cookie will spawn at the start of each attempt.', [23, 6]),
    function (s) {
      iniSpawn = s;
      CCCEMButtons['iniSpawnTimer'].hidden = s;
    }
  ),
  new CCCEMButton('iniSpawnTimer', 'Nat spawn timer: [##]',
    new numberInputButton(),
    new buttonInfo('Natural spawn timer', 'The amount of time after each reset for the first Golden cookie to naturally spawn (in frames, this game is 30 fps).', [22, 6]),
    s => { iniTimer = s; }
  ),
  new CCCEMButton('iniDO', 'Dragon Orbs [##]',
    new boolButton('On', 'Off'),
    new buttonInfo('Initial Dragon Orbs spawn toggle', 'Whether a Golden cookie from Dragon Orbs usage will spawn at the start of each attempt.', [33, 25]),
    s => { iniDO = s; }
  ),
  new CCCEMButton('iniDEoRL', 'DEoRL [##]',
    new boolButton('On', 'Off'),
    new buttonInfo('Initial Distilled Essence of Redoubled Luck spawn toggle', 'Whether an invoke of DEoRL at the start of each attempt will be successful.', [27, 12]),
    s => { iniDEoRL = s; }, true
  ),
  new CCCEMButton('iniGC', 'GC1 [##]',
    new twoStepCycle(-2, 27, e => (e === -2 ? 'R' : Game.goldenCookieChoices[e])),
    new buttonInfo('First Golden cookie effect', 'The (guaranteed) effect of the Golden cookie from the initial natural Golden cookie spawn.', [0, 10]),
    s => { iniGC = (s === -2 ? 'R' : (s)); }
  ),
  new CCCEMButton('iniGC2', 'GC2 [##]',
    new twoStepCycle(-2, 27, e => (e === -2 ? 'R' : Game.goldenCookieChoices[e])),
    new buttonInfo('Second Golden cookie effect', 'The (guaranteed) effect of the Golden cookie from the initial Dragon Orbs Golden cookie spawn.', [1, 10]),
    s => { iniGC2 = (s === -2 ? 'R' : (s)); }
  ),
  new CCCEMButton('iniGC3', 'GC3 [##]',
    new twoStepCycle(-2, 27, e => (e === -2 ? 'R' : Game.goldenCookieChoices[e])),
    new buttonInfo('Third Golden cookie effect', 'The (guaranteed) effect of the Golden cookie from the initial, successful invoke of DEoRL.', [2, 10]),
    s => { iniGC3 = (s === -2 ? 'R' : (s)); }, true
  ),
  new CCCEMButton('boughtSF', 'Sugar frenzy [##]',
    new boolButton('used', 'unused'),
    new buttonInfo('Sugar frenzy state', 'Whether sugar frenzy has been used before, determining whether it is available to use.', [22, 17]),
    s => { boughtSF = s; }
  ),
  new CCCEMButton('boughtCE', 'Chocolate egg [##]',
    new boolButton('bought', 'available'),
    new buttonInfo('Chocolate egg purchasability', 'Whether chocolate egg has been purchased already, thus determining whether it can be purchased again.', [18, 12]),
    s => { boughtCE = s; }, true
  ),
  new CCCEMButton('DFChanceMult', 'Dragonflight chance x[##]',
    new numberInputButton(),
    new buttonInfo('Dragonflight chance', 'Sets a multiplier to Dragonflight (buff) chance.', [5, 25]),
    s => { DFChanceMult = s; }
  ),
  new CCCEMButton('gcRateMult', 'Golden cookie spawnrate x[##]',
    new numberInputButton(),
    new buttonInfo('Golden cookie spawnrate', 'Sets a multiplier to the spawn rate of golden cookies.', [10, 14]),
    s => { gcRateMult = s; }
  )
]);
CCCEMButtons['iniSpawnTimer'].hidden = true;
CCCEMButtons['boughtCE'].hidden = true;
CCCEMButtons['boughtSF'].hidden = true;

new buttonCategory('savingControls', 1e6, [
  new CCCEMButton('saveSettings', 'Save current settings',
    new limeButton(),
    new buttonInfo('Save current settings', 'Saves the settings in the CCCEM interface to the save before CCCEM was loaded, as mod data.<br>You can change the saved setting by saving again.<br>You can remove it by clearing mod data with the options menu while CCCEM is not loaded.', [25, 7]),
    () => { customSave(); }
  ),
  new CCCEMButton('autosave', 'Auto save [##]',
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
    }), new buttonInfo('Building related info save', 'Saves building override and mute related information (hidden button)', [0, 0])
  ),
  new CCCEMButton('gamePrefsSaveData', '',
    new savingModule(() => {
      return (Game.prefs.particles ? '1' : '0') +
        (Game.prefs.numbers ? '1' : '0') +
        (Game.prefs.autosave ? '1' : '0') +
        (Game.prefs.autoupdate ? '1' : '0') +
        (Game.prefs.milk ? '1' : '0') +
        (Game.prefs.fancy ? '1' : '0') +
        (Game.prefs.warn ? '1' : '0') +
        (Game.prefs.cursors ? '1' : '0') +
        (Game.prefs.focus ? '1' : '0') +
        (Game.prefs.format ? '1' : '0') +
        (Game.prefs.notifs ? '1' : '0') +
        (Game.prefs.wobbly ? '1' : '0') +
        (Game.prefs.monospace ? '1' : '0') +
        (Game.prefs.filters ? '1' : '0') +
        (Game.prefs.cookiesound ? '1' : '0') +
        (Game.prefs.crates ? '1' : '0') +
        (Game.prefs.showBackupWarning ? '1' : '0') +
        (Game.prefs.extraButtons ? '1' : '0') +
        (Game.prefs.askLumps ? '1' : '0') +
        (Game.prefs.customGrandmas ? '1' : '0') +
        (Game.prefs.timeout ? '1' : '0') +
        (Game.prefs.cloudSave ? '1' : '0') +
        (Game.prefs.bgMusic ? '1' : '0') +
        (Game.prefs.notScary ? '1' : '0') +
        (Game.prefs.fullscreen ? '1' : '0') +
        (Game.prefs.screenreader ? '1' : '0') +
        (Game.prefs.discordPresence ? '1' : '0'); //copy pasted from Game.WriteSave
    }, str => {
      const spl = str.split('');
      Game.prefs.particles = parseInt(spl[0]);
      Game.prefs.numbers = parseInt(spl[1]);
      Game.prefs.autosave = parseInt(spl[2]);
      Game.prefs.autoupdate = spl[3] ? parseInt(spl[3]) : 1;
      Game.prefs.milk = spl[4] ? parseInt(spl[4]) : 1;
      Game.prefs.fancy = parseInt(spl[5]); if (Game.prefs.fancy) Game.removeClass('noFancy'); else if (!Game.prefs.fancy) Game.addClass('noFancy');
      Game.prefs.warn = spl[6] ? parseInt(spl[6]) : 0;
      Game.prefs.cursors = spl[7] ? parseInt(spl[7]) : 0;
      Game.prefs.focus = spl[8] ? parseInt(spl[8]) : 0;
      Game.prefs.format = spl[9] ? parseInt(spl[9]) : 0;
      Game.prefs.notifs = spl[10] ? parseInt(spl[10]) : 0;
      Game.prefs.wobbly = spl[11] ? parseInt(spl[11]) : 0;
      Game.prefs.monospace = spl[12] ? parseInt(spl[12]) : 0;
      Game.prefs.filters = spl[13] ? parseInt(spl[13]) : 1; if (Game.prefs.filters) Game.removeClass('noFilters'); else if (!Game.prefs.filters) Game.addClass('noFilters');
      Game.prefs.cookiesound = spl[14] ? parseInt(spl[14]) : 1;
      Game.prefs.crates = spl[15] ? parseInt(spl[15]) : 0;
      Game.prefs.showBackupWarning = spl[16] ? parseInt(spl[16]) : 1;
      Game.prefs.extraButtons = spl[17] ? parseInt(spl[17]) : 1; if (!Game.prefs.extraButtons) Game.removeClass('extraButtons'); else if (Game.prefs.extraButtons) Game.addClass('extraButtons');
      Game.prefs.askLumps = spl[18] ? parseInt(spl[18]) : 0;
      Game.prefs.customGrandmas = spl[19] ? parseInt(spl[19]) : 1;
      Game.prefs.timeout = spl[20] ? parseInt(spl[20]) : 0;
      Game.prefs.cloudSave = spl[21] ? parseInt(spl[21]) : 1;
      Game.prefs.bgMusic = spl[22] ? parseInt(spl[22]) : 1;
      Game.prefs.notScary = spl[23] ? parseInt(spl[23]) : 0;
      Game.prefs.fullscreen = spl[24] ? parseInt(spl[24]) : 0; if (App) App.setFullscreen(Game.prefs.fullscreen);
      Game.prefs.screenreader = spl[25] ? parseInt(spl[25]) : 0;
      Game.prefs.discordPresence = spl[26] ? parseInt(spl[26]) : 1;
    }), new buttonInfo('Game prefs save', 'Saves game prefs (hidden button)', [0, 0])
  ),
  new CCCEMButton('miscSaveData', '',
    new savingModule(() => {
      return Game.volume + '_' + (App ? Game.volumeMusic : 'N');
    }, str => {
      const strs = str.split('_');
      if (strs[0] && !isNaN(parseFloat(strs[0]))) { Game.volume = parseFloat(strs[0]); }
      if (strs[1] && !isNaN(parseFloat(strs[1]))) { Game.volumeMusic = parseFloat(strs[1]); }
    }),
    new buttonInfo('Miscellaneous save', 'Saves other random stuff (hidden button)', [0, 0])
  )
]);

CCCEMCategories['batchSettings'].hidden = true;
CCCEMCategories['gameSettings'].hidden = true;
CCCEMCategories['minigameSettings'].hidden = true;
CCCEMCategories['buffSettings'].hidden = true;

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
    ['Override and mute', 'The specific building to override or mute. <br>Once overridden, the building count anchor will no longer be used to determine the amount of that specific building.<br>Override does not include Wizard tower count; that is managed by the Wizard towers option.', 35, 33],
    ['Overriding count', 'The number of that building you start with each attempt.<br>An assignment of 0 is equivalent to override disabled.<br>To override a value of 0, use any negative number.', 29, 21], 
    ['Elder Battalion strategy', 'Changes the building distribution to better fit an Elder Battalion strategy.', 1, 25],
    ['Elder Battalion rebuy', 'Changes the building distribution to better fit a strategy rebuying after godzamok.', 1, 27],
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
    ['Scried season', 'The season that the starting effect is scried (or predicted) in.', 16, 6],
    ['Correction value', 'The value the score should be multiplied by to better match standard values.', 16, 5],
    ['Score correction notifications', 'Whether to notify when the score does not conform to the baseline. Will only be given if most of your cookies are made from clicking', 1, 7],
    ['Save current settings', 'Saves the settings in the CCCEM interface to the save before CCCEM was loaded, as mod data.<br>You can change the saved setting by saving again.<br>You can remove it by clearing mod data with the options menu while CCCEM is not loaded.', 25, 7],
    ['Mute', 'Whether a building should start muted. Minigames will always unmute unless that option is disabled.', 28, 6],
    ['Unmute minigames', 'Forces minigames to be unmuted on reset. If disabled, minigames can be freely muted and unmuted with the mute option.', 23, 15]
           ];
var infogot = 0;
function info(num) {
  infogot = 1;
  Game.Notify(Messages[num][0], Messages[num][1], [Messages[num][2], Messages[num][3]])
}

function RedrawCCCEM(noinvalidate) {
  if (hasHarbor) { MacadamiaModList.cccem.mod.syncSettingsRPC.send({ code: getSettingsCode() }); }
  if (infogot) { infogot = false; return true; }
  var str='';
  str+='<div class="icon" style="position:absolute;left:-9px;top:-6px;background-position:'+(-28*48)+'px '+(-12*48)+'px;"></div>';
  
  str+='<div id="devConsoleContent">';
  str+='<div class="title" style="font-size:14px;margin:6px;">CCCEM interface</div>';
  //str+='<a class="option neatolime" '+Game.clickStr+'="isShifting()?info(0):ResetAll(1); if (!isShifting() && hasHarbor && netcodeSettingsExport.hosting) { MacadamiaModList.cccem.mod.tryAgainRPC.send(); }">Try again</a>';
  
  str+=compileAllButtons();
  /*  
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
  str+='<a class="option neatocyan" '+Game.clickStr+'="promptN=22; isShifting()?info(80):GetPrompt();">Score mult '+(scoreCorVal)+'</a>';
  str+='<a class="option neato'+(scoreCorNotify?'orange':'yellow')+'" '+Game.clickStr+'="isShifting()?info(81):scoreCorNotify=!scoreCorNotify;RedrawCCCEM();">Score info '+(scoreCorNotify)+'</a><br>';
  str+='<a class="option neatocyan" '+Game.clickStr+'="promptN=5; isShifting()?info(10):GetPrompt();">Lumps '+(iniLumps)+'</a>';
  let lumpTypes = ["Normal", "Bifurcated", "Golden", "Meaty", "Caramel"];
  str+='<a class="option neatoblue" '+Game.clickStr+'="isShifting()?info(11):(isCtrl()?chooseLump--:chooseLump++); if (chooseLump>4) chooseLump=0; else if (chooseLump<0) chooseLump=4; RedrawCCCEM();">Lump type '+lumpTypes[chooseLump]+'</a>';
  str+='<a class="option neatocyan" '+Game.clickStr+'="promptN=20; isShifting()?info(77):GetPrompt();">Click cooldown '+(clickWait)+'ms</a><br>';
  str+='<a class="option neatocyan" '+Game.clickStr+'="promptN=6; isShifting()?info(12):GetPrompt();">Building count anchor '+(iniBC)+'</a>';
  str+='<a class="option neato'+(useEB?'orange':'yellow')+'" '+Game.clickStr+'="isShifting()?info(15):(useEB=!useEB); RedrawCCCEM();">'+(useEB?'Use EB':'No EB')+'</a>';
  str+='<a class="option neato'+((useRebuy/2)?'orange':'yellow')+'" '+Game.clickStr+'="isShifting()?info(16):(useRebuy+=2); if (useRebuy>2) useRebuy=0; RedrawCCCEM();">'+(useRebuy?'Rebuy':'No Rebuy')+'</a><br>';
  str+='<a class="option neatoblue" '+Game.clickStr+'="isShifting()?info(13):(isCtrl()?buildingSelected--:buildingSelected++); if (buildingSelected > 19) { buildingSelected = 0; } else if (buildingSelected < 0) { buildingSelected = 19; } RedrawCCCEM();">'+(Game.ObjectsById[buildingSelected].name)+':</a>';
  if (buildingSelected!=7) {str+='<a class="option neatocyan" '+Game.clickStr+'="promptN=13; isShifting()?info(14):GetPrompt();">Overriding number '+(manualBuildings[buildingSelected])+'</a>'};
  str+='<a class="option neato'+((muteBuildings[buildingSelected])?'orange':'yellow')+'" '+Game.clickStr+'="isShifting()?info(83):muteBuildings[buildingSelected]=!muteBuildings[buildingSelected];RedrawCCCEM();">'+((muteBuildings[buildingSelected])?"Muted":"Unmuted")+'</a>';
  str+='<a class="option neato'+(unmuteMinigames?'orange':'yellow')+'" '+Game.clickStr+'="isShifting()?info(84):unmuteMinigames=!unmuteMinigames;RedrawCCCEM();">Minigames '+(unmuteMinigames?"Unmuted":"Muteable")+'</a><br>'
  str+='<a class="option neatocyan" '+Game.clickStr+'="promptN=7; isShifting()?info(19):GetPrompt();">Wizard towers '+(wizCount)+'</a>';
  str+='<a class="option neatocyan" '+Game.clickStr+'="promptN=8; isShifting()?info(20):GetPrompt();">Tower Level '+(wizLevel)+'</a>';
  str+='<a class="option neato'+((!buyOption1)?'orange':'yellow')+'" '+Game.clickStr+'="isShifting()?info(21):(buyOption1?buyOption1--:buyOption1++); RedrawCCCEM();">'+(buyOption1?'Sell':'Buy')+'</a>';
  str+='<a class="option neatoblue" '+Game.clickStr+'="isShifting()?info(22):(isCtrl()?buyOption2--:buyOption2++); if (buyOption2>5) {buyOption2=2} else if (buyOption2<2) { buyOption2=4; }; RedrawCCCEM();">'+(Math.max(0, buyOption2-4)?'All':(Math.pow(10,buyOption2-2)))+'</a><br>';
  str+='<a class="option neato'+((Game.heralds-41)?'orange':'yellow')+'" '+Game.clickStr+'="isShifting()?info(23):(Game.heralds=(Game.heralds==41)?100:41);if(!isShifting()) { Game.externalDataLoaded=true; }RedrawCCCEM();">'+(Game.heralds)+' heralds</a>';
  str+='<a class="option neatoblue" '+Game.clickStr+'="isShifting()?info(24):(isCtrl()?d2Aura--:d2Aura++); if (d2Aura>21) d2Aura=0; else if (d2Aura<0) d2Aura=21; RedrawCCCEM();">Left Aura '+Game.dragonAuras[d2Aura].name+'</a>';
  str+='<a class="option neatoblue" '+Game.clickStr+'="isShifting()?info(25):(isCtrl()?d1Aura--:d1Aura++); if (d1Aura>21) d1Aura=0; else if (d1Aura<0) d1Aura=21;RedrawCCCEM();">Right Aura '+Game.dragonAuras[d1Aura].name+'</a><br>';
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
    //BELOW HAS NOT BEEN CONVERTED
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
  str+='<a class="option neato'+(iniSpawn?'orange':'yellow')+'" '+Game.clickStr+'="if (!isShifting()) {iniSpawn=!iniSpawn; if (iniSpawn && moreButtons[2].indexOf(iniTimerButton)!=-1) {moreButtons[2].splice(moreButtons[2].indexOf(iniTimerButton),1)} else if (!iniSpawn) {moreButtons[2].unshift(iniTimerButton)}} else {info(48);} RedrawCCCEM();">Natural GC '+(iniSpawn?'On':'Off')+'</a>';
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
  str+='<a class="option neatolime" '+Game.clickStr+'="isShifting()?info(82):customSave();">Save current settings</a>';
  str+='<a class="option neato'+(autoSaveCCCEM?'orange':'yellow')+'" '+Game.clickStr+'="isShifting()?info(65):(autoSaveCCCEM=!autoSaveCCCEM);RedrawCCCEM();">Auto save '+(autoSaveCCCEM?'On':'Off')+'</a>';
  */
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
