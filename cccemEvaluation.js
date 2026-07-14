if (typeof CCCEMEvaluationLoaded === 'undefined') {
  var CCCEMEvaluationLoaded=1
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

  //promptinprompt support
  eval('Game.ClosePrompt='+Game.ClosePrompt.toString().replace('Game.promptNoClose=false;', 'Game.promptNoClose=false; resetPromptNesting();'));
  eval('Game.Prompt='+Game.Prompt.toString().replace('{', '{ resetPromptNesting();'));
};

l('promptAnchor').dataset.layers = 1;
if (l('prompt')) { l('prompt').dataset.layer = 0; }
{
  let div = document.createElement('div');

  div.id = 'practiceModeIndicator';
  div.innerHTML = loc('PRACTICE MODE');
  div.style.position = 'absolute';
  div.style.top = App?'10px':'40px';
  div.style.right = '30px';
  div.style.textAlign = 'right';
  div.style.fontSize = '30px';
  div.style.fontFamily = "'Merriweather', Georgia,serif";
  div.style.zIndex = 1000000;
  div.style.textShadow = '0px -1px 6px #1ef7ffff, 0px 1px 6px #1e87ffff';
  div.style.pointerEvents = 'none';

  l('wrapper').appendChild(div); 
  if (!App) { div.style.display = 'none'; }
}
function transientPromptInPrompt(promptStr, options, classes) {
  //"overwrites" the current prompt with a new one, 
  //allows the old one to be restored by a "go back" button, 
  //if old one is restored the new prompt is discarded hence transient
  //can be chained together for multiple layers, but if fronttracking is needed 
  //youd need to implement that yourself

  const anchorDiv = l('promptAnchor');
  const contentDiv = l('promptContent');
  const optionsDiv = contentDiv.querySelector('.optionBox');
  l('prompt').dataset.layer = 0; //just in case
  if (!l('promptAnchor').dataset.layers) { l('promptAnchor').dataset.layers = 1; }
  if (l('prompt' + anchorDiv.dataset.layers)) { l('prompt' + anchorDiv.dataset.layers).remove(); }
  options = promptParseOptions((options));

  const newLayerDiv = document.createElement('div');
  const curLayer = parseInt(anchorDiv.dataset.layers);
  newLayerDiv.id = 'prompt' + anchorDiv.dataset.layers;
  newLayerDiv.className = 'framed promptBox' + (classes ? (' ' + classes) : '');
  newLayerDiv.dataset.layer = anchorDiv.dataset.layers;
  anchorDiv.dataset.layers = parseInt(anchorDiv.dataset.layers) + 1;
  newLayerDiv.innerHTML = '<div id="promptContent'+curLayer+'" class="promptContentBox">' + 
    promptParseString(promptStr) + 
    '<div class="optionBox">' + ('<a id="promptOptionI" class="option" onclick="PlaySound(&#39;snd/tick.mp3&#39;);restorePromptLayer();">Go back</a>') + options + '</div></div>' + 
    '<div id="promptClose" class="close" style="display: block;" onclick="PlaySound(\'snd/tickOff.mp3\');Game.ClosePrompt();">x</div>';
  anchorDiv.querySelectorAll('[data-layer="'+(anchorDiv.dataset.layers - 2)+'"]')[0].style.display = 'none';
  anchorDiv.appendChild(newLayerDiv);

  Game.promptWrapL = newLayerDiv;
}
function dynamicPrompt(promptStr, options, classes) {
  if (!l('promptAnchor').dataset.layers || !Game.promptOn) { 
    Game.Prompt(promptStr, options, 0, classes);
  } else {
    transientPromptInPrompt(promptStr, options, classes);
  }
}
function restorePromptLayer() {
  if (!l('promptAnchor').dataset.layers || l('promptAnchor').dataset.layers <= 1) { Game.ClosePrompt(); return; }
  const contentDiv = l('promptContent');
  const anchorDiv = l('promptAnchor');
  const layer = anchorDiv.dataset.layers - 2;
  anchorDiv.querySelector('[data-layer="'+(layer + 1)+'"]').remove();
  anchorDiv.dataset.layers = layer + 1;
  anchorDiv.querySelector('[data-layer="'+(layer)+'"]').style.display = '';
  Game.promptWrapL = anchorDiv.querySelector('[data-layer="'+(layer)+'"]');
}
function resetPromptNesting() {
  l('prompt').style.display = ''; 
  if (l('prompt'+(l('promptAnchor').dataset.layers-1))) { l('prompt'+(l('promptAnchor').dataset.layers-1)).remove(); } 
  l('promptAnchor').dataset.layers = 1;
  Game.promptWrapL = l('prompt');
}
function getLatestPrompt() {
  return Game.promptWrapL;
  return l('promptAnchor').querySelector('[data-layer="'+(l('promptAnchor').dataset.layers - 1)+'"]');
}
function promptParseString(content) {
  //taken from main.js
  var str='';
			str+=content;
			if (str.indexOf('<id ')==0)
			{
				var id=str.substring(4,str.indexOf('>'));
				str=str.substring(str.indexOf('>')+1);
				str='<div id="promptContent'+id+'">'+str+'</div>';
			}
			if (str.indexOf('<noClose>')!=-1)
			{
				str=str.replace('<noClose>','');
				Game.promptNoClose=true;
			}
  return str;
}
function promptParseOptions(options) {
  //taken from main.js
  var opts='';
			Game.promptOptionsN=0;
			for (var i=0;i<options.length;i++)
			{
				if (options[i]=='br')//just a linebreak
				{opts+='<br>';}
				else
				{
					if (typeof options[i]=='string') options[i]=[options[i],'PlaySound(\'snd/tickOff.mp3\');Game.ClosePrompt();'];
					else if (!options[i][1]) options[i]=[options[i][0],'PlaySound(\'snd/tickOff.mp3\');Game.ClosePrompt();',options[i][2]];
					else options[i][1]='PlaySound(\'snd/tick.mp3\');'+options[i][1];
					options[i][1]=options[i][1].replace(/'/g,'&#39;').replace(/"/g,'&#34;');
					opts+='<a id="promptOption'+i+'" class="option" '+(options[i][2]?'style="'+options[i][2]+'" ':'')+''+Game.clickStr+'="'+options[i][1]+'">'+options[i][0]+'</a>';
					Game.promptOptionsN++;
				}
			}
  return opts;
}

function FortuneTicker(manual) {
  if (!seedTicker) {return (Math.random()<forceFortune)}
  Math.seedrandom(Game.seed+'/'+tickerCount);
  if (!manual) tickerCount++;
  return (Math.random()<forceFortune)
  };

function FindAuraP(a1, a2) { //finds the strength of the a1 aura in the case that a2 is also slotted
  //return 2;
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
  Game.CalculateGains();      
  return yesA1/noA1    
  };

function FindBuildingDiff() {
  //for rebuying specifically, gets cps from new building count / cps from old building count
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
  var def = Game.computedMouseCps;
  for (var i = 0; i < Object.keys(Game.Objects).length; i++) 
    {
      Game.ObjectsById[i].amount=curList[i]
    };
  Game.CalculateGains();
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
  return {maxComboPow: mComboPow, relComboPow: rComboPow, bsCount: bsCount, godzPow: godzPow};
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

let watchers = {};
let watchersById = [];
class Watcher {
  constructor(key, func, description, argumentsRequiredCount) {
    this.key = key;
    this.func = func;
    this.id = watchersById.length;
    this.description = description ?? loc('No description available.');
    this.argumentsRequired = argumentsRequiredCount ?? 0;
    
    watchers[key] = this;
    watchersById.push(this);
  }

  getValue() {
    try { 
      // Use of var here to bypass the try scope
      var out = this.func(...arguments);
    } catch(e) {
      if (e instanceof Scorecode.error) {
        throw e;
      } else {
        throw new Scorecode.error('Invalid watcher arguments for watcher ' + this.key + '!', arguments);
      }
    }
    if (out == null) {
      throw new Scorecode.error('Invalid watcher arguments for watcher ' + this.key + '!', arguments);
    }
    if (out === true || out === false) {
      return out?1:0;
    }
    return out;
  }
}
function watchKey(key, ...args) {
  return (watchers[key] && watchers[key].getValue(...args)) || 0;
}
function getKeyArgumentsCount(key) {
  return (watchers[key] && watchers[key].argumentsRequired) || 0;
}
new Watcher('str', e => e.toString(), 'Creates a string from input text, or converts the value to a string.', 1);
new Watcher('str empty', e => '', 'Returns an empty string.');
new Watcher('str concat', (e1, e2) => { 
  if (typeof e1 !== 'string' || typeof e2 !== 'string') { throw new Scorecode.error('str concat requires two strings as arguments'); } 
  return e1 + e2 }, 'Concatenates two strings.', 2);
new Watcher('str slice', (e1, e2, e3) => { 
  if (typeof e1 !== 'string') {
    throw new Scorecode.error('str slice requires a string as the first argument');
  }
  if (typeof e2 !== 'number' || typeof e3 !== 'number') {
    throw new Scorecode.error('str slice requires two numbers as the second and third arguments');
  }
  return e1.slice(e2, e3);
}, 'Slices the string input. Argument 1: string to slice, Argument 2: start index, Argument 3: end index', 3);
new Watcher('str length', e => { if (typeof e !== 'string') { 
  throw new Scorecode.error('str length requires a string as argument');
} return e.length; }, 'Returns the length of the string. Argument 1: the string input.', 1);
new Watcher('str uppercase', e => { if (typeof e !== 'string') { 
  throw new Scorecode.error('str uppercase requires a string as argument');
} return e.toUpperCase(); }, 'Converts the string to uppercase. Argument 1: the string input.', 1);
new Watcher('str lowercase', e => { if (typeof e !== 'string') { 
  throw new Scorecode.error('str lowercase requires a string as argument');
} return e.toLowerCase(); }, 'Converts the string to lowercase. Argument 1: the string input.', 1);
new Watcher('str replace', (e1, e2, e3) => { 
  if (typeof e1 !== 'string' || typeof e2 !== 'string' || typeof e3 !== 'string') {
    throw new Scorecode.error('str replace requires three strings as arguments');
  }
  return e1.replace(e2, e3);
}, 'Replaces all occurrences of the second string with the third string. Argument 1: the string to replace in, Argument 2: the string to replace, Argument 3: the string to replace with', 3);
new Watcher('str split access', (e1, e2, e3) => {
  if (typeof e1 !== 'string') { 
    throw new Scorecode.error('str split access: target string is not a string');
  }
  if (typeof e2 === 'string') {
    const output = e1.split(e2);
    if (e3 >= output.length) {
      throw new Scorecode.error('str split access: index out of bound');
    }
    return output;
  } else {
    // Split every e2 characters and return at index e3
    const output = [];
    for (let i = 0; i < e1.length; i += e2) {
      output.push(e1.substring(i, i + e2));
    }
    if (e3 >= output.length) {
      throw new Scorecode.error('str split access: index out of bound');
    }
    return output[e3];
  }
  return '';
}, 'Splits the string input by the second argument, and returns the element at the third argument. Argument 1: the string to split, Argument 2: the string to split by or the amount of characters before splitting, Argument 3: the index of the element to return', 3);
new Watcher('str keycode', e => {
  if (typeof e !== 'string') {
    throw new Scorecode.error('str keycode requires a string as argument');
  }
  if (e.length !== 1) {
    throw new Scorecode.error('str keycode requires a single character string as argument');
  }
  return e.charCodeAt(0);
}, 'Returns the keycode of the first character of the string. Argument 1: the string input.', 1);
new Watcher('str from keycode', e => {
  if (typeof e !== 'number') { 
    throw new Scorecode.error('str from keycode requires a number as argument');
  }
  return String.fromCharCode(e);
}, 'Returns the string corresponding to the keycode. Argument 1: input keycode (number).', 1);
new Watcher('fps', () => Game.fps, 'Gets the target frames per second that the game is set to.');
new Watcher('cookies this ascend', () => Game.cookiesEarned, 'Amount of cookies earned this ascension.');
new Watcher('cookies all time', () => Game.cookiesEarned + Game.cookiesReset, 'Amount of cookies earned all time.');
new Watcher('cookies in bank', () => Game.cookies, 'Amount of cookies currently in the bank.');
new Watcher('handmade cookies', () => Game.handmadeCookies, 'Amount of cookies generated by clicking.');
new Watcher('gc onscreen count', () => Game.shimmerTypes.golden.n, 'Number of golden cookies currently on screen.');
new Watcher('reindeers onscreen count', () => Game.shimmerTypes.reindeer.n, 'Number of reindeer currently on screen.');
new Watcher('cps', () => Game.cookiesPs, 'Current cookies per second, including all buffs and effects.');
new Watcher('cpc', () => Game.computedMouseCps, 'Current cookies per click, including all buffs and effects.');
new Watcher('raw cps', () => Game.cookiesPsRaw, 'Current cookies per second without buffs.');
new Watcher('is consistent buff', e => {
  let bsCount = 0;
  for (let i in Game.buffs) {
    if (parseInt(i) >= e) {
      break;
    }
    if (Game.buffs[i].type.name == 'building buff') { bsCount++; }
  }
  return ConsistentBuffs(Object.values(Game.Objects)[e], bsCount);
}, 'whether or not the buff can be considered consistent. Argument 1: buff index');
new Watcher('consistent buffs pow', () => AllConsistentBuffsPow(), '????');
new Watcher('consistent exec pow', () => {
  let pow = 1;
  let bsCount = 0;
  for (let i in Game.buffs) {
    if (Game.buffs[i].type.name == 'building buff') { 
      bsCount++;
    }
    let buff = Game.buffs[i];
    if (ConsistentBuffs(buff.type.name, bsCount)) {
      if (buff.multCpS) {
        if (buff.type.name == 'building buff') {
          pow *= (1 + (0.1 * get('buildingCountAnchor')));
        } else {
          pow *= buff.multCpS;
        }
      };
      if (buff.multClick) {
        pow *= buff.multClick;
      };
    }
  }
  return pow;
}, 'ignore this (deprecated)');
const allGCAndBuffsMap = {
  'Elder frenzy': ['ef', 'blood frenzy'],
  'Click frenzy': 'cf',
  'Building special': ['bs', 'building buff'].concat(Object.keys(Game.goldenCookieBuildingBuffs).map(e => loc(e))).concat(Object.values(Game.goldenCookieBuildingBuffs).map(e => loc(e[0]))),
  'Frenzy': 'f',
  'Cursed finger': 'cuf',
  'Cookie storm': ['storm', 'cs'],
  'Dragon Harvest': ['dh', 'reaper of fields', 'rof'],
  'Dragonflight': ['df'],
  'Building rust': ['br', 'building debuff'].concat(Object.keys(Game.goldenCookieBuildingBuffs).map(e => loc(e))).concat(Object.values(Game.goldenCookieBuildingBuffs).map(e => loc(e[1]))),
  'Devastation': 'godzamok',
  'Sweet': ['free sugar lump', 'lump', 'wweet!'],
  'Cookie storm drop': ['drop', 'csd'],
  'Lucky': 'l',
  'Clot': [],
  'Ruin': [],
  'Blab': [],
};
const allGCAndBuffsMapReversed = (obj => Object.fromEntries(Object.entries(obj).flatMap(([k, v]) => ([].concat(v)).map(val => [val, k]))))(allGCAndBuffsMap); //lazy so I just grabbed it from ai
const goldenCookieChoicesLowercase = Game.goldenCookieChoices.map(e => e.toLowerCase());
const otherBuffs = [
  'devastation', 'everything must go', 'sugar blessing', 'haggler\'s luck', 'haggler\'s misery',
  'crafty pixies', 'nasty goblins', 'magic adept', 'magic inept', 'sugar frenzy', 'loan 1', 'loan 1 (interest)',
  'loan 2', 'loan 2 (interest)', 'loan 3', 'loan 3 (interest)', 'gifted out'
];
function getBuffAccessName(e) {
  const buffName = (allGCAndBuffsMapReversed[e.toLowerCase()] ?? e).toLowerCase();
  let buff = null;
  if (goldenCookieChoicesLowercase.includes(buffName)) {
    if (goldenCookieChoicesLowercase.indexOf(buffName) % 2 == 0) { 
      //is the "proper name"
      buff = Game.goldenCookieChoices[goldenCookieChoicesLowercase.indexOf(buffName)];
    } else {
      //is the "key"
      buff = Game.goldenCookieChoices[goldenCookieChoicesLowercase.indexOf(buffName) - 1];
    }
  } else if (!otherBuffs.includes(buffName)) { 
    throw new Error('Buff type not found! ("' + e + '")');
  } else { 
    buff = cap(buffName);
  }
  return buff;
}
function buildingSpecialsCount(debuff) {
  let n = 0;
  for (let i in Game.buffs) {
    if (Game.buffs[i].type.name == (debuff?'building debuff':'building buff')) { 
      n++;
    }
  }
  return n;
}
new Watcher('check buff', e => { 
  const name = getBuffAccessName(e);
  if (name == 'Building special') {
    return buildingSpecialsCount();
  }
  return !!(Game.buffs[e] || Game.buffs[name] || (name == 'Building rust' && buildingSpecialsCount(true))); 
}, 'Checks if a given buff exists. Argument 1: buff name in English (accepts common abbreviations, case-insensitive except for building specials)', 1);
new Watcher('buff count', () => Object.keys(Game.buffs).length, 'Returns the amount of buffs currently active.');
new Watcher('bs count', e => buildingSpecialsCount(), 'Returns the amount of building specials currently active.');
new Watcher('buff CpS mult', e => {
  let buff = null;
  if (typeof e === 'number') {
    buff = Object.values(Game.buffs)[e];
  } else {
    const name = getBuffAccessName(e);
    if (!Game.buffs[name]) { return 0; }
    buff = Game.buffs[name];
  }
  return buff.multCpS ?? 1;
}, 'Gets the multCpS of the non-BS buff specified if it currently exists. If not, returns 0. Argument 1: buff index, or buff name in English (accepts common abbreviations, case-insensitive except for building specials)', 1);
new Watcher('buff click mult', e => {
  if (typeof e === 'number') {
    return Object.values(Game.buffs)[e].multClick ?? 1;
  }
  const name = getBuffAccessName(e);
  if (!Game.buffs[name]) { return 0; }
  return (Game.buffs[name].multClick ?? 1);
}, 'Gets the multCpS of the non-BS buff specified if it currently exists. If not, returns 0. Argument 1: buff index, or buff name in English (accepts common abbreviations, case-insensitive except for building specials)', 1);
new Watcher('buff name', e => Game.buffs[Object.keys(Game.buffs)[e]].name, 'Gets the name of the buff at the given index. Argument 1: buff index', 1);
new Watcher('buff type', e => Game.buffs[Object.keys(Game.buffs)[e]].type.name, 'Gets the name of the buff type of the buff at the given index. Argument 1: buff index', 1);
new Watcher('buff is', (index, name) => (Object.keys(Game.buffs)[index] === getBuffAccessName(name)), 
'Compares an existing buff index to a buff name, returns true if the index and the name matches', 2);
new Watcher('buff index', e => Object.keys(Game.buffs).indexOf(getBuffAccessName(e)), 'Gets the index of a buff name.', 1);
new Watcher('buff type index', e => Game.buffTypes.indexOf(Game.buffTypesByName[e]), 'Gets the index of a buff type in Game.buffTypes. Argument 1: the name of the buff type.', 1);
new Watcher('bs power', e => { 
  let mComboPow = 1;
  for (let i in Game.buffs) {
    for (let i in Game.buffs) {
      if (Game.buffs[i].type.name == 'building buff') { 
        mComboPow *= Game.buffs[i].multCpS;
      }
    }
  }
  return mComboPow;
}, 'Returns the multiplier from building specials. If you want the multiplier from building debuffs, use "rust power" instead.');
new Watcher('rust power', e => { 
  let mComboPow = 1;
  for (let i in Game.buffs) {
    for (let i in Game.buffs) {
      if (Game.buffs[i].type.name == 'building debuff') { 
        mComboPow *= Game.buffs[i].multCpS;
      }
    }
  }
  return mComboPow;
}, 'Returns the multiplier from building debuffs. If you want the multiplier from building specials, use "bs power" instead.');
new Watcher('auraP', e => FindAuraP(e), 'It\'s not super clear what this does, but it\'s absolutely ancient so I can\'t really remove it', 1);
new Watcher('building count', e => { if (typeof e === 'number') { return Game.ObjectsById[e].amount; } return Game.Objects[cap(e.toLowerCase())].amount; },
'Returns the amount of a certain building. Argument 1: building name or building id (0-indexed)');
new Watcher('has upgrade', e => Game.Has(e), 'Checks if the player has a certain upgrade. Argument 1: upgrade name', 1);
new Watcher('golden cookie choices', e => Game.goldenCookieChoices[e], 'Returns the name of the golden cookie choice at the given index. Argument 1: index (0-indexed)', 1);
new Watcher('gc choices index from name', e => {
  if (typeof e !== 'string') {
    throw new Scorecode.error('gc choices index from name requires a string as argument');
  }
  return Game.goldenCookieChoices.indexOf(e);
}, 'Returns the index of the string in Game.goldenCookieChoices. Argument 1: golden cookie choice name', 1);
new Watcher('fthof choices', e => FtHoFOutcomes[e], 'Returns the name of the FtHoF choice at the given index. Argument 1: index (0-indexed)', 1);
new Watcher('start buff count', e => { 
  const a = StartBuffCount(e);
  const b = StartBuffCount(Game.buffTypesByName[e] ? Game.buffTypesByName[e].id:-1);
  return Math.max(a, b);
}, 'Returns whether the buff TYPE is in the list of starting buffs. Argument 1: buff name OR index in Game.buffTypes.');

new Watcher('console', (...e) => {
  console.log(...e);
  return 0;
}, 'Logs a message to the console. Accepts an arbitrary amount of arguments. Always returns 0; use the + operator.');

let cccemModHooks = {};
let cccemModHooksById = [];
class cccemModHook {
  constructor(key, properName, description, immediate) {
    this.key = key;
    this.name = loc(properName);
    this.description = description;
    cccemModHooks[key] = this;
    if (immediate) { immediate(this); }
    this.id = cccemModHooksById.length;
    cccemModHooksById.push(this);
  }
  hooks = [];

  run() {
    const unsolved = new Set(this.hooks);
    while(unsolved.size > 0) {
      let progress = false;
      for (let hook of unsolved) {
        if (typeof hook === 'function') { 
          hook();
          unsolved.delete(hook);
          progress = true;
        } else if (typeof hook === 'string') {
          const tracker = trackers[hook];
          if (!tracker) {
            console.warn('Hook "' + this.key + '" has a tracker "' + hook + '" that does not exist.');
            unsolved.delete(hook);
            progress = true;
            continue;
          }
          if (tracker.dependencies.size === 0 
            || Array.from(tracker.dependencies).every(dep => !unsolved.has(dep))) {
            tracker.update();
            unsolved.delete(hook);
            progress = true;
          }
        }
      }
      if (!progress) {
        console.warn('Hook "' + this.key + '" has unsolved dependencies that cannot be resolved. Remaining hooks: ', Array.from(unsolved));
        Game.Notify(loc('Tracker error'), loc('Cannot resolve all trackers due to circular dependencies. (%1 unresolved)', unsolved.size), [1,7]);
        break;
      }
    }
  }

  register(thing) { 
    //if (this.hooks.includes(thing)) { console.warn('Hook "' + this.key + '" already has "' + thing + '" registered.'); }
    this.hooks.push(thing);
    return thing;
  }
  remove(thing) {
    if (this.hooks.includes(thing)) {
      this.hooks.splice(this.hooks.indexOf(thing), 1);
    }
  }
}
new cccemModHook('relay', 'When referenced by another tracker', '', e => {});
new cccemModHook('logic', 'Each frame', '', e => Game.registerHook('logic', () => e.run()));
new cccemModHook('check', 'Every 5 seconds', '', e => Game.registerHook('check', () => e.run()));
new cccemModHook('tryAgain', 'On resetting attempt', '');
new cccemModHook('click', 'On big cookie click', '', e => Game.registerHook('click', () => e.run()));
let trackers = {};
let trackersById = [];
class Tracker {
  constructor(key, update, triggerConditions, defaultV) {
    this.key = key;
    trackers[key] = this;
    this.id = trackersById.length;
    trackersById.push(this);
    this.dependencies = new Set();
    this.setFormula(update);
    /**
     * triggerConditions are all names for custom cccem modhooks
     */
    this.setTriggerConditions(triggerConditions);
    this.defaultV = defaultV ?? 0;
    this.reset();
  }
  static type = 'unset';
  state;
  dependencies;
  originalFormula;
  updateFormula;
  description;
  triggerConditions = [];

  setDescription(desc) {
    this.description = desc;
    return this;
  }

  setTriggerConditions(list) {
    if (!list) { list = [].concat(this.triggerConditions); }
    list = [].concat(list);

    for (let i in this.triggerConditions) { 
      cccemModHooks[this.triggerConditions[i]].remove(this.key);
    }

    this.triggerConditions = list;
    for (let i in this.triggerConditions) { 
      cccemModHooks[this.triggerConditions[i]].register(this.key);
    }
  }
  addTriggerCondition(hookName) {
    this.triggerConditions.push(hookName);
    cccemModHooks[hookName].register(this.key);
  }
  hasTriggerCondition(hookName) {
    return this.triggerConditions.includes(hookName);
  }

  preDelete() {
    for (let i in this.triggerConditions) { 
      cccemModHooks[this.triggerConditions[i]].remove(this.key);
    }
  }

  setFormula(formula) {
    this.originalFormula = formula;
    try {
      const tokenized = Scorecode.tokenize(formula);
      this.setDependencies(tokenized);
      this.updateFormula = Scorecode.parse(tokenized);
    } catch(e) {
      const tokenized = Scorecode.tokenize('');
      this.setDependencies(tokenized);
      this.updateFormula = Scorecode.parse(tokenized);
      Game.Notify(loc('Tracker error'), e.message, 0);
      console.error(e, this.key);
    }
  }
  save() {
    const prompt = getLatestPrompt();
    if (!prompt) return null;

    const keyEl = prompt.querySelector('#trackerKey');
    const descEl = prompt.querySelector('#trackerDesc');
    const formulaEl = prompt.querySelector('#trackerFormula');
    const defaultEl = prompt.querySelector('#trackerDefault');

    if (!keyEl || !formulaEl) { Game.Notify(loc('Save failed'), loc('Missing fields.'), [7,7]); return null; }

    const newKey = keyEl.value.trim();
    if (!newKey) { Game.Notify(loc('Save failed'), loc('Key cannot be empty.'), [7,7]); return null; }

    // ensure unique key (unless it's this tracker)
    if (newKey !== this.key && trackers[newKey] && trackers[newKey] !== this) {
      Game.Notify(loc('Save failed'), loc('Key already in use.'), [7,7]);
      return null;
    }

    // reassign mapping if key changed
    if (newKey !== this.key) {
      delete trackers[this.key];
      this.key = newKey;
      trackers[this.key] = this;
    }

    // description
    if (descEl) this.description = descEl.value;

    // formula (use setFormula to validate/tokenize)
    try {
      this.setFormula(formulaEl.value);
    } catch (e) {
      Game.Notify(loc('Save failed'), loc('Invalid formula: %1', e.message), [7,7]);
      return null;
    }

    // default value validation
    if (typeof defaultEl !== 'undefined' && defaultEl !== null) {
      const raw = defaultEl.value.trim();
      if (this.constructor.type === 'hook') {
        // hooks expect a concrete default value; require numeric if possible
        if (raw === '') {
          this.defaultV = 0;
        } else if (!isNaN(Number(raw))) {
          this.defaultV = Number(raw);
        } else {
          Game.Notify(loc('Save failed'), loc('Hook default must be numeric.'), [7,7]);
          return null;
        }
      } else {
        // helpers/relays: accept number or string
        if (raw === '') this.defaultV = 0;
        else if (!isNaN(Number(raw))) this.defaultV = Number(raw);
        else this.defaultV = raw;
      }
    }

    // apply reset with new default
    this.reset();

    // return a plain preset object (does not include triggerConditions)
    return {
      key: this.key,
      description: this.description,
      update: this.originalFormula,
      defaultV: (typeof this.defaultV === 'function') ? this.defaultV() : this.defaultV
    };
  }
  stringify() {
    //save as string in cccem settings
    let str = '';
    const esc = v => encodeURIComponent(String(v ?? ''));
    const desc = (this.description || '')
      .replace(/[^ -~]/g, '')
      .replace(/\s+/g, ' ')
      .replace(',', '#COMMA#')
      .trim()
      .toLowerCase()
      .slice(0, 60);
    const defVal = (typeof this.defaultV === 'function') ? this.defaultV() : this.defaultV;
    const triggers = (this.triggerConditions || []).join('|');
    const t = [
      this.key,
      desc,
      this.originalFormula || '',
      defVal ?? '',
      this.constructor.type || 'unset',
      triggers
    ].map(esc).join('|');
    return t;
  }
  reset() {
    //console.log(this.key + ': ' + this.state);
    this.state = (typeof this.defaultV === 'function')?this.defaultV():this.defaultV;
  }
  setDependencies(tokenizedFormula) {
    this.dependencies = new Set();
    for (let i in tokenizedFormula) {
      const token = tokenizedFormula[i];
      if (token.type === 'TRACK') {
        this.dependencies.add(token.value);
      }
    }
    this.dependencies.delete(this.key); // prevent self-dependency
  }
  update() {
    //console.log(this.key);
    let val = null;
    try {
      val = Scorecode(this.updateFormula, { value: this.state });
    } catch(err) {
      Game.Notify(loc('Tracker formula error'), err.message + '<div class="line"></div>' + loc('From: %1', this.key), [7,7]);
      return;
    }
    if (val != null) {
      this.state = val;
    }
  }
  getVal() {
    return this.state;
  }
}
function resetAllTrackers() {
  for (let key in trackers) {
    trackers[key].reset();
  }
}
class HookTracker extends Tracker {
  constructor(key, update, hookName, defaultV) {
    super(key, update, hookName, defaultV);
  }
  static type = 'hook';
}
class HelperTracker extends Tracker {
  constructor(key, update, defaultV) {
    super(key, update, [], defaultV);
    this.update();
  }
  getVal() {
    return this.updateFormula;
  }
  static type = 'helper';
}
class FakeTracker extends Tracker {
  constructor(key, update) {
    super(key, update, []);
  }
  // REMOVED
  /*getVal() {
    return Scorecode(this.updateFormula);
  }*/
  static type = 'relay';
}


function trackGet(key) {
  if (trackers[key]) {
    if (trackers[key].hasTriggerCondition('relay')) {
      trackers[key].update();
    }
    return trackers[key].getVal();
  }
}
new HelperTracker('recurse', `('f', ...)#('f'@('f', ...))`);
new HelperTracker('multiply', `(('a', 'b')#('a' * 'b'))`);
new HelperTracker('add', `(('a', 'b')#('a' + 'b'))`);
new HelperTracker('buffPower', `('i')#([buff click mult;$'i']*[buff CpS mult;$'i'])`);
new HelperTracker('staticBuffPower', `('name')#(
    ('name' = [str;click frenzy]) ? 777 : 
    ('name' = [str;frenzy]) ? 7 : 
    ('name' = [str;building buff] | 'name' = [str;building special]) ? (1 + 0.1 * [[buildingCountAnchor]]) : 
    ('name' = [str;blood frenzy]) ? 666 : 
    ('name' = [str;dragonflight]) ? ([has upgrade;Dragon fang]?1223:1111) : 
    ('name' = [str;dragon harvest]) ? ([has upgrade;Dragon fang]?17:15) : 1
)`);
new HookTracker('initialRawCps', `[raw cps]`, 'tryAgain');
new HookTracker('initialCbta', `[cookies this ascend]`, 'tryAgain');
new HookTracker('initialHandmade', `[handmade cookies]`, 'tryAgain');
new HookTracker('clickCount', '\'value\' + 1', 'click');
new HookTracker('maxCps', '\'value\' max [cps]', 'logic', 1);
new HookTracker('maxCpc', '\'value\' max [cpc]', 'logic', 1);
new HookTracker('cookiesGained', '[cookies this ascend] - "initialCbta"', 'relay');
new HookTracker('handmadeGains', '[handmade cookies] - "initialHandmade"', 'relay');
new HookTracker('initialRaw', '"initialRawCps"', 'relay');
new HookTracker('clickCoefficient', `[cpc] / [cps] / (([buff count]){('i')#([buff click mult;$'i'])}("multiply"))`, 'logic');
new HookTracker('effectiveClicks', '("handmadeGains" / "maxCpc") min "clickCount"', 'relay');
new HelperTracker('buffConsistency', `('typeName', 'gcChoicesId')#(
  // how many instances of this buff exists
  [start buff count;$'typeName'] + 
  ([fthof choices;$[[forceFtHoF]]] = 'typeName') +
  ([[iniSpawn]] & [[iniGC]] = 'gcChoicesId') +
  ([[iniDO]] & [[iniGC2]] = 'gcChoicesId') +
  ([[iniDEoRL]] & [[iniGC3]] = 'gcChoicesId')
)`);
new HookTracker('consistentBuffsPow', `
  (28){('i')#( // there are 28 entries in Game.goldenCookieChoices
    ('i' % 2 = 0) ? 1 : ( // skip even-indexed entries, only contains the display name which is useless to us
      ('id', 'index', 'bsStrength', 'buffExists')#(
        ('id' = [str;frenzy]) ? (
          (('buffExists')@('id', 'index')) ? 7 : 1
        ) : ('id' = [str;click frenzy]) ? (
          (('buffExists')@('id', 'index')) ? 777 : 1
        ) : ('id' = [str;building special]) ? (
          'bsStrength' ^ (('buffExists')@('id', 'index'))
        ) : ('id' = [str;blood frenzy]) ? (
          (('buffExists')@('id', 'index')) ? 666 : 1
        ) : ('id' = [str;dragonflight]) ? (
          (('buffExists')@('id', 'index')) ? ([has upgrade;Dragon fang]?1223:1111) : 1
        ) : ('id' = [str;dragon harvest]) ? (
          (('buffExists')@('id', 'index')) ? ([has upgrade;Dragon fang]?17:15) : 1
        ) : 1
      )@([golden cookie choices;$'i'], 'i', (1 + 0.1 * [[buildingCountAnchor]]), "buffConsistency")
    )
  )}("multiply")
`, 'relay')
new HookTracker('consistentExecPow', `(
  "recurse"@(('self', 'buffIndex', 'maxBuffs', 'power', 'bsCounted', 'powerParser')#(
    ('buffIndex' = 'maxBuffs' | 'buffIndex' > 'maxBuffs') ? 'power' : (
      'self'@('self', 'buffIndex' + 1, 'maxBuffs', 
        'power' * ('powerParser'@('buffIndex', 'bsCounted' + 1)), 
        'bsCounted' + ([buff type;$'buffIndex'] = [str;building buff] ? 1 : 0), 'powerParser')
    )
  ), 0, [buff count], 1, 0, ('index', 'existingBSCount')#(
    // Building specials need to be handled differently due to the various bad quirks
    [buff type;$'index'] = [str;building buff] ? (
      ('existingBSCount' > ("buffConsistency"@([str;building special], [gc choices index from name;building special]))) ?
        1 : (1 + 0.1 * [[buildingCountAnchor]])
    ) : ([gc choices index from name;$[buff type;$'index']] = -1) ? (
     // Not a gc buff, assume always consistent
     "buffPower"@('index')
    ) : (
      ("buffConsistency"@([buff type;$'index'], [gc choices index from name;$[buff type;$'index']])) ? 
        ("buffPower"@('index')) : 1
    )
  ))
) max 'value'`, 'logic');
new HookTracker('totalBuffPower', `(([buff count]){('i')#("buffPower"@('i'))}("multiply"))`, 'relay');
new HookTracker('maxBuffPow', '"totalBuffPower" max \'value\'', 'logic', 1);
new HookTracker('maxGCOnscreens', '[gc onscreen count] max \'value\'', 'logic');
new HookTracker('maxComboPow', '("totalBuffPower" * (2.23 ^ [gc onscreen count]) / [auraP;$([[useEB]]?15:1)]) max \'value\'', 'logic');
new HookTracker('maxUndevastation', '("totalBuffPower" * (2.23 ^ [gc onscreen count]) / ([check buff;Devastation]?("buffPower"@([buff index;Devastation])):1) / [auraP;$([[useEB]]?15:1)]) max \'value\'', 'logic', 1);
new HookTracker('devastatedness', '"effectiveClicks" * "godzPower"', 'relay'); 
new HookTracker('godzPower', '"maxComboPow" / "maxUndevastation"', 'relay');
new HookTracker('bsCount', '[bs count] max \'value\'', 'logic');
function createTrackersFromData(data, clearExisting = true) {
  if (!data || get('immunizeTrackerImports')) { return; }
  if (clearExisting) {
    for (let i in trackers) {
      trackers[i].preDelete();
    }
    trackers = {};
    trackersById = [];
  }

  const entries = data.split(',').filter(s => s.trim() !== '');
  let created = 0;

  for (const entry of entries) {
    const parts = entry.split('|').map(p => decodeURIComponent(p ?? ''));
    // fields: key, desc, originalFormula, defaultV, constructorType, triggers
    const [key = '', rawDesc = '', rawFormula = '', rawDefault = '', constructorType = '', rawTriggers = ''] = parts;
    if (!key) continue;

    const desc = rawDesc.replace(/#COMMA#/g, ',');
    const triggers = (rawTriggers === '' ? [] : rawTriggers.split('|').filter(Boolean))
      .concat(constructorType === 'relay'?['relay']:[]);

    let defaultV;
    if (rawDefault === '') defaultV = 0;
    else if (!isNaN(Number(rawDefault))) defaultV = Number(rawDefault);
    else defaultV = rawDefault;

    let trackerInstance;
    try {
      if (constructorType === 'hook') {
        trackerInstance = new HookTracker(key, rawFormula || '\'value\'', triggers, defaultV);
      } else if (constructorType === 'helper') {
        trackerInstance = new HelperTracker(key, rawFormula || '()#(0)', defaultV);
      } else {
        // fallback to hook
        trackerInstance = new HookTracker(key, rawFormula || '\'value\'', triggers, defaultV);
      }
    } catch (e) {
      // If constructor failed (duplicate key etc.), skip
      console.error('Failed to create tracker', key, e);
      continue;
    }

    // restore description
    try { trackerInstance.description = desc; } catch (e) { }

    // restore formula/tokenization safely
    try {
      if (rawFormula) trackerInstance.setFormula(rawFormula);
    } catch (e) {
      /* ignore bad formula */
    }

    // restore triggers (for hooks)
    try { trackerInstance.setTriggerConditions(triggers); } catch (e) { }

    // restore default value
    try {
      trackerInstance.defaultV = defaultV;
      trackerInstance.reset();
    } catch (e) { }

    created++;
  }

  return created;
}
function stringifyAllTrackers() {
  const data = Object.values(trackers).map(tracker => tracker.stringify()).join(',');
  return data;
}
//custom language
let scoringFormula = `
  "cookiesGained" / ("maxComboPow" * "initialRaw" * "consistentBuffsPow" / "consistentExecPow")
`;
function evaluateScore() {
  try {
    return Scorecode(scoringFormula.trim());
  } catch (e) {

  }
}

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
  var score=(cookieGain/scoreRed)*autoScoreCor;
  var originalScore = score;
  score/=1.333e6;

  var z ='​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ '
  devastatedness = NormalizeDevastatedness(devastatedness);
  rebuyedness = NormalizeDevastatedness(rebuyedness)/devastatedness;
  var clicks = Math.trunc(0.000000001+(devastatedness/maxGodz));

  //console.log(maxUndevastated);

  // Build history stats and push a new historyEntry
  const scoreI = evaluateScore();
  const scoreStatO = new statTypesList.score(scoreI, scoreI / 1.333e6 * 100);
  let stats = [
    scoreStatO
  ];
  for (let i in statTypesById) {
    if (statTypesById[i].formula && !(statTypesById[i] === statTypesList.score)) {
      stats.push(new statTypesById[i]());
    }
  }

  /*const scoreStatO2 = new statTypesList.score(originalScore, score * 100);
  const statsA = [
    scoreStatO2,
    new statTypesList.cps(cookieGain / iniRaw),
    new statTypesList.godz(maxGodz),
    new statTypesList.clicks(clicks),
    new statTypesList.devastatedness(devastatedness),
    new statTypesList.rebuyMult(rebuyedness),
    new statTypesList.comboStrength(maxComboPow),
    new statTypesList.relComboStrength(consistentPow),
    new statTypesList.bsCount(maxBSCount),
    new statTypesList.cookiesGained(cookieGain),
    new statTypesList.handmadeGain(clickGain),
    new statTypesList.initialRaw(iniRaw)
  ];

  // compute click-based derived stats if possible (mirror later calculations)
  let clickScore = (cookieGain > 0) ? score * (clickGain / cookieGain) * 1.05 : 0;
  if (clickScore) {
    const clickDiffCor = (devastatedness / maxGodz) / (clicks || 1);
    const godzScore = clickScore / (clickDiffCor || 1);
    const trueDevastated = rebuyedness * (clicks || 1) * maxGodz;
    const scorePerClick = (godzScore && trueDevastated) ? (godzScore / trueDevastated) * 1333000 : 0;
    const scoreCorrection = (godzScore) ? ((trueDevastated / 4250) / (godzScore)) : 0;

    statsA.push(new statTypesList.scorePerClick(scorePerClick));
    statsA.push(new statTypesList.scoreCorrection(scoreCorrection));
  } else {
    statsA.push(new statTypesList.scorePerClick(0));
    statsA.push(new statTypesList.scoreCorrection(0));
  }*/

  if (originalScore > historySettings.scoreRegisterThreshold) { new historyEntry(stats, {
    startTimestamp: currentStartTimestamp,
    timestamp: Date.now(),
    presetUsed: activePreset
  }); }
  attemptsDone++;
  currentStartTimestamp = Date.now();

  logStr='';
  for (let i in stats) {
    if (stats[i] instanceof statTypesList.score) { continue; }
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
var statTypesById = [];
var currentStartTimestamp = Date.now();
class historyEntry {
  constructor(stats, configs) {
    this.stats = [].concat(stats);

    configs = configs ?? {};
    this.name = configs.name ?? 'Attempt #' + Beautify(attemptsDone + 1);
    this.startTimestamp = configs.startTimestamp ?? (0); //finish later
    this.timestamp = configs.timestamp ?? Date.now();
    this.presetUsed = configs.presetUsed ?? activePreset;
    this.notes = configs.notes ?? '';

    this.index = historyEntries.length;
    historyEntries.push(this);
  }
  favorited = false
  inStorage = false;

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
    str += '<div class="title" style="font-size: 20px; display: inline-block;">' + this.name + '<div class="listing" style="display: inline-block;">' + (this.presetUsed ? 'Preset: ' + this.presetUsed.name : 'No preset') + (this.notes?(' - ' + this.notes):'') + '</div></div>' +
      '<span style="float: right;">'+loc('Duration: %1', Game.sayTime((this.timestamp - this.startTimestamp) / 1000 * Game.fps, -1)) + '</span>';
    str += '</div><div class="line"></div>';

    str += '<div class="statsGrid" style="' + gridStyle + '">' + cells + '</div>';
    return str + '</div>';
  }

  favorite() {
    this.favorited = true;
    favoritedEntries.add(this);
  }
  storeStats() {
    if (this.inStorage) { return; }
    for (let i in this.stats) {
      this.stats[i] = this.stats[i].convertToStorage();
    }
    this.inStorage = true;
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
    if (detail === undefined) { detail = Scorecode(this.constructor.formula) }
    this.detail = detail;
  }
  static key = 'base';
  static name = 'Stat';
  static description = 'Stat description';
  static cellsOccupying = 1;
  static noteworthy = false; //displayed in notif
  static summaryworthy = false; //displayed in history without opening details
  static formula = '0';
  static noDelete = true;
  static id = -1;
  static iconsList = null;
  static iconsListSorted = null;
  static detailDisplayConfigs = null;
  detail = null;

  getIcon() {
    return [0, 7];
  }
  getLStr(extended) {
    return '<div class="block stat">'
      + '<div class="statIcon">'
        + '<div class="statIconActual" style="'+writeIcon(this.getIcon().map(val => { if (val[2] === 'cccemSpritesheet') { return [val[0], val[1], cccemSpritesheet]; } return val; }))+'"></div>'
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
    if (this.constructor.key == 'score' && property == 'noteworthy') { return ''; }
    return `
    <a class="option prefButton option${this.constructor[property]?'':' off'}" ${Game.clickStr}="statTypesList['${this.constructor.key}']['${property}'] = !statTypesList['${this.constructor.key}']['${property}']; openSettings(); toReloadHistory = true;">${loc(this.constructor.name)}</a>
    `;
  }
  getNotifStr() {
    return loc('<b>%1:</b> %2', [this.constructor.name, this.getDetailDisplay()]);
  }
  convertToStorage() {
    return new statStorage(this.constructor.name, this.detail, this.getIcon(), this.constructor.summaryworthy, this.constructor.cellsOccupying);
  }

  register(cl) {
    statTypesList[cl.key] = cl;
    cl.id = statTypesById.length;
    statTypesById.push(cl);
    return cl;
  }
  static save() {
    //deprecated
    return '';
    return '' + (Number(this.noteworthy) * 2 + Number(this.summaryworthy));
  }
  static stringify() {
    //save everything
    const obj = {
      key: this.key,
      name: this.name,
      description: this.description,
      formula: this.formula,
      cellsOccupying: this.cellsOccupying,
      noteworthy: this.noteworthy,
      summaryworthy: this.summaryworthy,
      noDelete: this.noDelete,
      iconsList: this.iconsList,
      detailDisplayConfigs: this.detailDisplayConfigs.type.type,
      detailDisplayArgs: this.detailDisplayConfigs.args ?? {},
      detailDisplayClauses: (this.detailDisplayConfigs.clauses ?? []).map(e => e.save())
    };
    return escape(utf8_to_b64(JSON.stringify(obj)));
  }
}
class statStorage {
  constructor(name, value, icon, summaryworthy, cellsOccupying) {
    this.name = name;
    this.value = value;
    this.icon = icon;
    this.summaryworthy = summaryworthy;
    this.cellsOccupying = cellsOccupying;
  }

  getIcon() {
    return this.icon;
  }
  getLStr(extended) {
    return '<div class="block stat">'
      + '<div class="statIcon">'
        + '<div class="statIconActual" style="'+writeIcon(this.getIcon())+'"></div>'
      + '</div>'
      + '<div style="flex:1;text-align:left;">'
        + '<div class="title stat">'
          + loc(this.name)
        + '</div>'
        + '<div class="statDetails">'
          + this.value
        + '</div>'
      + '</div>'
    + '</div>';
  }
  convertToStorage() { 
    return this; //already in storage format
  }
}
let statDisplayTypes = {};
let statDisplayTypesById = [];
class statDisplayType {
  constructor(type, name, parser, defaultArgs) {
    this.type = type;
    this.name = loc(name);
    this.parser = parser;
    this.defaults = defaultArgs ?? {};
    this.requiredArgs = Object.keys(this.defaults);

    statDisplayTypes[type] = this;
    this.id = statDisplayTypesById.length;
    statDisplayTypesById.push(this);
  }

  parse(value, extended, args) {
    if (!args) { args = {}; }
    if (this.parser) {
      return this.parser(value, extended, args, this.defaults);
    }
  }
}
new statDisplayType('time', 'Time', (value, extended) => {
  return convertSeconds(value).split(', ').slice(0, extended?Infinity:1).join(', ');
});
new statDisplayType('number', 'Large number', (value, extended, args, defaults) => {
  return Beautify(value, args.precision ?? defaults.precision);
}, { 
  precision: 2
});
new statDisplayType('simpleNumber', 'Small number', (value) => {
  return SimpleBeautify(value);
});
new statDisplayType('raw', 'None', (value) => {
  return value;
});
new statDisplayType('percentage', 'Percentage', (value, extended, args, defaults) => {
  return Beautify(value / (args.factor ?? defaults.factor) * 100, args.precision ?? defaults.precision) + '%';
}, { 
  factor: 1,
  precision: 2
});
new statDisplayType('exponential', 'Scientific notation', (value, extended, args, defaults) => {
  return value.toExponential(args.precision ?? defaults.precision);
}, { 
  precision: 2
});
new statDisplayType('ratio', 'Ratio', (value, extended, args, defaults) => {
  const factor = args.factor ?? defaults.factor;
  return Beautify(value, args.precision ?? defaults.precision) + ':' + Beautify(factor, args.precision ?? defaults.precision);
}, { 
  factor: 1,
  precision: 2
});
new statDisplayType('multiplier', 'Multiplier', (value, extended, args, defaults) => {
  return 'x' + Beautify(value, args.precision ?? defaults.precision);
}, { 
  precision: 2
});
new statDisplayType('score', 'Score', (value, extended, args, defaults) => {
  let scoreDisplay = '';
  if (value > 1e10) { 
    scoreDisplay += Beautify(value, args.precision ?? defaults.precision);
  } else { 
    scoreDisplay += SimpleBeautify(Math.floor(value));
  }
  const percent = value / (args.percentFactor ?? defaults.percentFactor)
  if (percent < 1e6) { scoreDisplay += ' (' + SimpleBeautify(Math.floor(percent)) + '%)'; }
  return scoreDisplay;
}, {
  precision: 0,
  percentFactor: 1.333e4
})
class statDisplayClause {
  constructor(condition, display) {
    this.condition = condition;
    this.displayText = display;
  }

  check(value, extended) {
    if (Scorecode(this.condition, { value: value, extended: Number(extended) })) { return true; }
    return false;
  }
  display() {
    return this.displayText;
  }
  save() {
    return escape(this.condition) + '|||' + escape(this.displayText);
  }
}
function createStatClass(key, name, description, detailDisplayConfigs, iconsList, formula, options = {}) {
  if (Array.isArray(iconsList)) { 
    iconsList = {
      0: iconsList
    };
  }
  if (detailDisplayConfigs.clauses) { detailDisplayConfigs.clauses = [].concat(detailDisplayConfigs.clauses); }
  else { detailDisplayConfigs.clauses = []; }
  if (!detailDisplayConfigs.args) {
    detailDisplayConfigs.args = {};
  }
  return class extends stat {
    constructor(detail) {
      super(detail);
    }
    static key = key;
    static name = name;
    static description = description;
    static formula = formula;
    static cellsOccupying = options.cellsOccupying || 1;
    static noteworthy = options.noteworthy || false;
    static summaryworthy = options.summaryworthy || false;
    static noDelete = false;
    static id = -1;
    static detailDisplayConfigs = detailDisplayConfigs;
    static iconsList = iconsList;
    static iconsListSorted = Object.keys(iconsList).map(Number).sort((a, b) => b - a);

    getDetailDisplay(extended) {
      if (this.constructor.detailDisplayConfigs.clauses) {
        for (let clause of this.constructor.detailDisplayConfigs.clauses) {
          if (clause.check(this.detail, extended)) {
            return clause.display();
          }
        }
      }
      return detailDisplayConfigs.type.parse(this.detail, extended, this.constructor.detailDisplayConfigs.args);
    }
    getIcon() {
      const iconThresholds = this.constructor.iconsListSorted;
      for (let threshold of iconThresholds) {
        if (this.detail >= threshold) {
          return this.constructor.iconsList[threshold];
        }
      }
      return [0, 7]; // question mark icon
    }
  }
}
function putAllStatsInStorage() {
  for (let i in historyEntries) {
    historyEntries[i].storeStats();
  } 
}
function exportStats() {
  let str = '';
  for (let i in statTypesById) {
    str += statTypesById[i].stringify() + ',';
  }
  str = str.slice(0, str.length - 1);
  return str;
}
function importStats(str) {
  if (!str) { return; }
  putAllStatsInStorage();
  statTypesList = {};
  statTypesById = [];
  console.log(str);
  const stats = str.split(',').map(item => JSON.parse(b64_to_utf8(unescape(item))));
  for (let i in stats) {
    const t = stats[i];
    const s = stat.prototype.register(createStatClass(t.key, t.name, t.description, 
      { type: statDisplayTypes[t.detailDisplayConfigs], args: t.detailDisplayArgs, clauses: t.detailDisplayClauses.map(e => {
        return new statDisplayClause(unescape(e.split('|||')[0]), unescape(e.split('|||')[1]));
      }) }, 
      t.iconsList, t.formula, { noteworthy: t.noteworthy, summaryworthy: t.summaryworthy }));
    s.noDelete = t.noDelete;
  }
}
stat.prototype.register(createStatClass('score', 
  'Score', 
  'An evaluation of your execution in terms of skill displayed. Luck (such as how many buffs) do not factor into the calculations.', 
  { type: statDisplayTypes.score, args: { percentFactor: 1.333e4 } }, {
    2.75e6: [1, 7],
    2.5e6: [3, 1, 'cccemSpritesheet'],
    2.25e6: [2, 1, 'cccemSpritesheet'],
    2e6: [1, 1, 'cccemSpritesheet'],
    1.75e6: [33, 4],
    1.5e6: [32, 4],
    1.25e6: [0, 1, 'cccemSpritesheet'],
    1e6: [14, 5],
    8.5e5: [13, 5],
    7e5: [12, 5],
    6e5: [3, 0, 'cccemSpritesheet'],
    5e5: [2, 0, 'cccemSpritesheet'],
    4e5: [1, 0, 'cccemSpritesheet'],
    3e5: [0, 0, 'cccemSpritesheet'],
    2e5: [2, 5],
    1e5: [1, 5],
    1e4: [0, 5],
    0: [12, 8]
  }, `"cookiesGained" / ("maxComboPow" * "initialRaw" * "consistentBuffsPow" / "consistentExecPow") * [[scoreMult]]`, { noteworthy: true, summaryworthy: true }
));
statTypesList.score.noDelete = true;
//some of below icons are suggested by hellranger
stat.prototype.register(createStatClass('cps', 
  'CpS gained', 
  'Amount of cookies in terms of CpS gained during the attempt.', 
  { type: statDisplayTypes.time }, {
    3e21: [22, 0],
    3e20: [21, 0],
    3e19: [31, 2],
    3e18: [30, 2],
    3e17: [31, 1],
    3e16: [30, 1],
    3e15: [29, 1],
    3e14: [28, 1],
    3e13: [27, 1],
    3e12: [26, 1],
    3e11: [25, 1],
    3e10: [24, 1],
    3e9: [23, 1],
    3e8: [22, 1],
    3e7: [21, 1],
    3e6: [20, 0],
    0: [24, 18],
  }, `"cookiesGained" / "initialRaw"`, { summaryworthy: true }
));
stat.prototype.register(createStatClass('godz', 
  'Strength of Godzamok', 
  'Maximum strength of the Devastation (Godzamok) buff.', 
  { type: statDisplayTypes.number }, [23, 18], `"godzPower"`, { summaryworthy: true }
));
stat.prototype.register(createStatClass('clicks', 
  'Effective clicks', 
  'Estimated number of clicks useful in the attempt.', 
  { type: statDisplayTypes.number }, {
    70: [0, 35],
    65: [0, 25],
    60: [0, 21],
    55: [0, 19],
    50: [0, 18],
    40: [0, 2],
    30: [0, 1],
    0: [0, 0]
  }, `"effectiveClicks"`
));
stat.prototype.register(createStatClass('devastatedness',
  'Devastatedness',
  'Maximum Godzamok power, multiplied by the amount of clicks during devastation.',
  { type: statDisplayTypes.number }, {
    8000: [11, 35],
    7500: [11, 30],
    7000: [11, 21],
    6500: [11, 24],
    6000: [11, 23],
    5000: [11, 22],
    3500: [11, 19],
    2500: [11, 13],
    1000: [11, 0],
    0: [11, 15]
  }, `"devastatedness"`, { noteworthy: true, summaryworthy: true }
));
stat.prototype.register(createStatClass('rebuyMult',
  'Rebuy multiplier',
  'Multiplier contribution from rebuying behavior (if enabled).',
  { type: statDisplayTypes.raw, clauses: new statDisplayClause(`'value' = 1`, loc('Not rebuying')) }, [2, 6], `0`
));
stat.prototype.register(createStatClass('comboStrength',
  'Combo strength',
  'Maximum observed combo multiplier during the attempt.',
  { type: statDisplayTypes.number }, [23, 6], `"maxComboPow"`
));
stat.prototype.register(createStatClass('relComboStrength',
  'Strength of constant buffs',
  'Cumulative strength of buffs that are generally considered guaranteed.',
  { type: statDisplayTypes.number }, [0, 14], `"consistentExecPow"`
));
stat.prototype.register(createStatClass('consistentPow',
  'Strength of constant buffs',
  'Cumulative strength of buffs that are generally considered guaranteed.',
  { type: statDisplayTypes.number }, [10, 14]
));
stat.prototype.register(createStatClass('bsCount',
  'Number of BSs',
  'Number of building-special buffs observed in the attempt.',
  { type: statDisplayTypes.simpleNumber }, [5, 6], `"bsCount"`
));
stat.prototype.register(createStatClass('cookiesGained',
  'Cookie gained',
  'Total cookies gained during the attempt.',
  { type: statDisplayTypes.number }, [26, 17], `"cookiesGained"`
));
stat.prototype.register(createStatClass('handmadeGain',
  'Handmade gain',
  'Cookies directly produced by clicks during the attempt.',
  { type: statDisplayTypes.number }, [11, 26], `"handmadeGains"`
));
stat.prototype.register(createStatClass('initialRaw',
  'Initial Raw CpS',
  'Baseline raw cookies-per-second at the start of the attempt.',
  { type: statDisplayTypes.number }, [3, 5], `"initialRaw"`
));
stat.prototype.register(createStatClass('scorePerClick',
  'Score per Click',
  'Estimated contribution to score per effective click.',
  { type: statDisplayTypes.simpleNumber }, {
    20000: [21, 32],
    18000: [21, 25],
    16000: [29, 6],
    14000: [11, 8],
    12000: [11, 7],
    10000: [11, 6],
    0: [10, 0]
  }
));
stat.prototype.register(createStatClass('scoreCorrection',
  'Score correction value',
  'Automatic correction factor computed for score normalization.',
  { type: statDisplayTypes.number, args: { precision: 4 } }, [16, 5]
));

function BuffsDesc(buffsStr) {//give a more readable description of the buff parameters in the prompt
    // Each buff: [id in Game.buffTypes], [max time in frames], [current time in frames], [power], [obj (bs only)], [arg3 (unused)]
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

function StartBuffCount(type) {
  if (type < 0) { return 0; }
  let buffsArr = get('buffs').split(";")
  let count = 0;
  for (let i in buffsArr) {
    if (!buffsArr[i]) {continue}
    let buffArr = buffsArr[i].split(",")
    let bType = buffArr[0]
    if (bType != type) {continue}
    count++;
    };
  return count;
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