var hasCCCEM = false;
var hasFinder = true;
var codes = [];
//first one is for global scope, second one is for sequence scope, third one is for local scope (not available to all)
var limit = 9999;
var pool = 1;
var defaultBackfire = [0.15, 0.15, 0.15];
var casts = [];
var autoExecute = true;
//each item represents a sequence. Goes like so: [[poolchance,defaultbackfire,[seed,cast],[seed,cast],[...]...],[...]]
var preLoadedSeeds = [];
var preLoadAmountPerSequence = 1;
var usingPreload = false;
var exceptions = null;

//for any imports to be processed
//api: every item must be an array of two items. The first one contains the code. The second contains the url
var instructions = [];

//Time to rip off CCCEM code
function GetPromptN(input) {
    if (input==0) {
    	Game.Prompt('<id ImportSave><noClose><h3>'+"Input code"+'</h3><div class="block">'+loc("Input or modify instructions for the Cast Finder to execute.")+'<div id="importError" class="warning" style="font-weight:bold;font-size:11px;"></div></div><div class="block"><textarea id="textareaPrompt" style="width:100%;height:256px;">'+'</textarea></div>',[['', '', 'display: none;'], [loc("Save"),';Game.ClosePrompt();code=(l(\'textareaPrompt\').value); codes = compile(code);'],loc("Cancel"),[loc("Info"),'; linking();']]);
    	l('textareaPrompt').focus();
    	l('textareaPrompt').value = code;
        Game.promptOptionFocus = 0;
    }
    if (input==1) {
    	Game.Prompt('<id ImportSave><noClose><h3>'+"Input code"+'</h3><div class="block">'+loc("Modify the amount of backup seeds to preload. (whole numbers only!)")+'<div id="importError" class="warning" style="font-weight:bold;font-size:11px;"></div></div><div class="block"><textarea id="textareaPrompt" style="width:100%;height:64px;">'+'</textarea></div>',[['', '', 'display: none;'], [loc("Save"),';Game.ClosePrompt(); preLoadAmountPerSequence=parseInt(l(\'textareaPrompt\').value); updateFinder();'],loc("Cancel"),[loc("Info"),'; linking();']]);
    	l('textareaPrompt').focus();
        l('textareaPrompt').value = preLoadAmountPerSequence;
        Game.promptOptionFocus = 0;
    }
    if (input==2) {
    	Game.Prompt('<id ImportSave><noClose><h3>'+"Import preload"+'</h3><div class="block">'+loc("Import preloaded save here.")+'<div id="importError" class="warning" style="font-weight:bold;font-size:11px;"></div></div><div class="block"><textarea id="textareaPrompt" style="width:100%;height:128px;">'+'</textarea></div>',[['', '', 'display: none;'], [loc("Save"),';Game.ClosePrompt(); preLoadedSeeds=stringToArray(l(\'textareaPrompt\').value); usingPreload=true;updateFinder();'],loc("Cancel"),[loc("Info"),'; linking();']]);
    	l('textareaPrompt').focus();
        Game.promptOptionFocus = 0;
    }
    if (input==3) {
        let temp = arrayToString(preLoadedSeeds);
    	Game.Prompt('<id ExportSave><h3>'+loc("Export preload")+'</h3><div class="block">'+loc("This is your current preload code.<br>Input it with import preload to load.")+'</div><div class="block"><textarea id="textareaPrompt" style="width:100%;height:128px;" readonly>'+temp.slice(0,temp.length-1)+'</textarea></div>',[loc("All done!")])
    }
};

function linking(link) {
    window.open('https://pastebin.com/Ej1QSF1S', '_blank');
}

Game.registerMod('CastFinder', {
	init:function() {
        function createUpgrades() {
  	  		eval("Game.Upgrade.prototype.buy="+Game.Upgrade.prototype.buy.toString().replace('var choices=this.choicesFunction();', 'var choices=this.choicesFunction(); if (choices[0] == \"shutup\") { Game.choiceSelectorOn=-1; return 1; }'));
        	this.upgrades = [];
        	this.upgrades.push(new Game.Upgrade('Open Cast Finder', loc('Opens the Grimoire Cast Finder.<br>Will not change cast count or seed unless accessed from CCCEMUI.'),0,[20, 6]));
        	this.upgrades[0].pool = 'toggle'; this.upgrades[0].order = 999999; this.upgrades[0].unlocked = 1; Game.UpgradesByPool["toggle"].push(this.upgrades[0]);
            this.upgrades[0].choicesFunction = function() { 
            	var choices = ["shutup"] //get the game to shut up about using the cohice function in unintended ways
                CCCEMButtons['cfCode'].triggerSetVar();
                return choices;
            }
        	LocalizeUpgradesAndAchievs();
            Game.upgradesToRebuild = 1;
        }
        if(Game.ready) createUpgrades()
        else Game.registerHook("create", createUpgrades)
    }
});

//short for: Cast Finder Exceptions
//actually using classes (unreal)
class cfExcep {
    constructor(identifier,character,values,override) {
		this.id=identifier;
    	this.pos=character;
        if (Array.isArray(values)) { this.values=values; } else { this.values=[values]; }
    	this.message='';
        this.title='';
        if (typeof override === 'function') { override(); }
        
        this.init();
    }
    
    static msgs = {
    	'unrecognized':['Unknown entry','Unrecognized term in sequence: <b>"#1"</b>'],
        'empty':['Empty entry','Sequence entries cannot empty. '],
        'emptyCast':['Empty cast entry','Cast entries cannot be empty. Use an asterisk ("*") if you want to indicate any cast.'],
        'find':['Invalid find depth assignment','Your input: <b>"#1"</b><br>Search depth must be a positive, whole number.'],
        'pool':['Invalid pool chance assignment','Your input: <b>"#1"</b><br>Probability must be a non-negative number.'],
        'modifier':['Invalid local modifier','Your modifier: <b>"#1"</b>'],
        'backfireExp':['Invalid backfire expression','Your backfire expression: <b>"#1"</b>'],
        'backfireExpOutOfRange1':['Backfire expression out of range','Your backfire expression: <b>"#1"</b><br>Numbers on both sides of the equal sign must be between 0 and 1. (0<=n<1)'],
        'backfireExpOutOfRange2':['Backfire expression out of range','Your backfire expression: <b>"#1"</b><br>Number before the plus or minus sign must be between 0 and 1. (0<=n<1)'],
        'backfireExpOutOfRange3':['Backfire expression out of range','Your backfire expression: <b>"#1"</b><br>Number before "gc" must be a non-negative, whole number.']
    }
    
    init() {
        if (cfExcep.msgs.hasOwnProperty(this.id)) {
        	this.message=this.fill(cfExcep.msgs[this.id][1],this.values);
            this.title=cfExcep.msgs[this.id][0];
            Game.Notify('Error: '+this.title,this.message,[15,5],20,0,1);
        } else {
        	Game.Notify('Error: '+this.id,'',[15,5],20,0,1);
        }
    }
    
    fill(input, terms) {
    	let amount = this.count(input,'#');
        for (let i = 1; i <= amount; i++) {
        	input=input.replace('#'+i,terms[i-1]);
        }
        return input;
    }
    
    count(input, char) {
        let counter = 0;
    	for (let i in input) {
        	if (input[i]==char) { counter++; }
        }
        return counter;
    }
}

//return: 1 - frenzy, 2 - lucky, 3 - cf, 4 - storm, 5 - blab, 6 - bs, 7 - storm drop, 8 - sweet, 9 - clot, 10 - ruin, 11 - cuf, 12 - ef
var translator = {
    'frenzy':1, 'f': 1, 
    'lucky':2, 'l': 2, 
    'clickfrenzy':3, 'cf': 3, 
	'bloodfrenzy':12, 'elderfrenzy':12, 'ef':12, 
    'cookiestorm':4, 'storm':4, 'cs': 4, 
    'cookiestormdrop':7, 'stormdrop':7, 'drop':7, 'sd': 7, 
    'buildingspecial':6, 'bs':6, 
    'freesugarlump':8, 'sweet!':8, 'sweet':8, 
    'clot':9,
    'ruincookies':10, 'ruin':10, 
    'cursedfinger':11, 'cuf':11, 
    'blab': 5,
    '*':0,
}

var translatorReverse = Object.fromEntries(
    Object.entries(translator).map(([key, value]) => [value, key])
)

function generatePool() {
	let thePool = [];
	for (let c = 0; c < codes.length; c++) {
        if (parseStatus(codes[c])) { continue; } 
    	if (parseModifier(codes[c], 0)) { continue; }
        for (let temp = 0; temp < randomFloor(pool); temp++) { thePool.push(c); }
    }
    return thePool;
}

function chooseSequence() {
    let f = choose(generatePool());
    for (let c = 0; c <= f; c++) {
    	if (parseStatus(codes[c])) { continue; } 
    	if (parseModifier(codes[c], 0)) { continue; }
    }
    console.log(codes[f]);
    return codes[f];
}

function interpret(minimumCastCount,f,findMult,tolog) {
    if (exceptions !== null) { Game.Notify('Execution halted!','Cannot execute due the presence of compile-time errors.'); exceptions.init(); return exceptions; }
    if (!Array.isArray(f)) { Game.Notify('something has gone wrong','',0); }
    if (typeof findMult === 'undefined') { var findMult = 1; }
    if (f.length == 0) { return 0; }
    let searchHead = minimumCastCount;
    let anchor = searchHead;
    if (tolog) { console.log('Cast find started with depth: '+limit); }
    while (searchHead < limit*findMult+minimumCastCount) {
        //if (tolog) { console.log('Progress: '+(100*(searchHead/(limit*findMult+minimumCastCount))).toFixed(3)+'% ('+searchHead+')');}
        //if 
        let found = 0;
        let attempted = 0;
        searchHead = anchor;
        defaultBackfire[1] = defaultBackfire[0]; defaultBackfire[2] = defaultBackfire[0];
    	for (let c = 0; c < f.length; c++) {
            //loop for attempting to find the sequence starting with finding the first cast and checking if the casts afterward satisfy the conditions
            defaultBackfire[2] = defaultBackfire[1];
        	if (parseModifier(f[c], 1)) { continue; }
            if (!found) {
        		searchHead = scoutOutcomes(f[c][f[c].length - 1], searchHead+1, minimumCastCount, findMult);
            	if (!searchHead) { if (!tolog) { Game.Notify('Unable to find cast! Try increasing limit.', '', 0, 0); } return false; }
                attempted = 1;
                if (!Array.isArray(f[c][0])) {
                    parseModifier(['mod',f[c][0]], 2);
                	if (backfireExp(1-findBackfire(searchHead), f[c][1], defaultBackfire[2])) { found = 1; anchor = searchHead; continue; }
                } else {
                	if (f[c].length == 1) { found = 1; anchor = searchHead; continue; } else {
                    	if (backfireExp(1-findBackfire(searchHead), f[c][0], defaultBackfire[2])) { found = 1; anchor = searchHead; continue; }
                    }
                }
                anchor = searchHead; found = 0; break;
            } else {
                searchHead++;
                if (!outcomeEquals(findOutcome(searchHead), f[c][f[c].length-1])) { found = 0; break; }
            	if (!Array.isArray(f[c][0])) { 
                    parseModifier(['mod',f[c][0]], 2);
                	if (backfireExp(1-findBackfire(searchHead), f[c][1], defaultBackfire[2])) { continue; }
                } else {
                	if (f[c].length == 1) { continue; } else {
                    	if (backfireExp(1-findBackfire(searchHead), f[c][0], defaultBackfire[2])) { continue; }
                    }
                }
                found = 0; break;
            }
    	} 
        if (found) { if (!tolog) { Game.Notify('Cast sequence found!', 'At: ' + anchor, 0, 0); } return anchor; }
        if (!attempted) { Game.Notify('No casts present!', '', 0, 0); return false; }
    }
    return false;
}

function outcomeEquals(outcome, list) {
    if (!Array.isArray(list)) { list = [list]; }
    if (list[0] == 0) { return true; }
    if (list.includes(outcome[0])) { return true; }
    if (list.includes(outcome[1])) { return true; }
    return false; 
}

//does not parse modifiers
function parseStatus(input) {
    if (input[0] == 'fi') { limit = input[1]; return true; }
    if (input[0] == 'ch') { pool = input[1]; return true; }
    return false;
}

function parseModifier(input, scope) {
    //scope 2 = local
    if (!Array.isArray(input)) { return false; }
	if (input[0] == 'mod') { defaultBackfire[scope] = input[1]; return true; }
    return false;
}

function compile(input) {
    exceptions = null;
    let codef = [];
    input = input.toString();
    let loads = input;
    loads = removeDuplicates(loads.match(/(import\[.*\])/));
    if (typeof loads !== 'undefined') {
    	for (let i in loads) {
            if (typeof loads[i] !== 'undefined' && loads[i] != 0) { 
                loads[i] = loads[i].replace('import[').replace(']')
    			LoadScript(loads[i]);
            }
    	}
    }
    for (let i in instructions) {
   		 for (let j in loads) {
         	if (loads[j]==instructions[i][1]) { input = input.replace('import['+instructions[i][1]+']',instructions[i][0]);break; }
         }
    }
    codef = 0;
    codef = deleteAllArr([' ', '\t', '(', ')'], input.toLowerCase());
    codef = '&'+codef;
    codef = treatStr(codef);
    codef = codef.replaceAll('\n', ''); codef = codef.slice(1, codef.length); 
    codef = codef.split('&');
    for (let i in codef) {
    	codef[i] = codef[i].split(',');
    }
    
    //c for counter
    for (let c in codef) {
        //console.log('processing sequence code: '+deepCopy(codef[c]));
    	if (codef[c].length == 1) {
            if (codef[c][0] == '') { exceptions = new cfExcep('empty',0); return exceptions; }
            if (hasStatuses(codef[c][0])) { codef[c] = statuses(codef[c][0]); if (codef[c][1] instanceof cfExcep) {return exceptions; } continue; }
            if (hasExpression(codef[c][0])) { codef[c].push('*'); } else {
            	exceptions = new cfExcep('unrecognized',0,[codef[c][0]]); return exceptions;
            }
        }
        if (codef[c].length > 1) {
            //cc for counter in counter (for the sequence-scoped code)
            for (let cc in codef[c]) {
                if (codef[c][cc] == '') { exceptions = new cfExcep('emptyCast',0); return exceptions; }
                let skipReplace = 0;
                if (typeof codef[c][cc] !== 'string') { continue; }
                let castL = []; //castL for cast local, temporary storage before pushing to cast storage
                //console.log('processing local code: '+deepCopy(codef[c][cc]));
            	if (!hasModifiers(codef[c][cc])) {
                	castL = codef[c][cc].split('^'); 
                    if (castL.length > 1) {
                    	castL[1] = compoundEffects(castL[1]);
                        if (castL[1] instanceof cfExcep) { return exceptions; }
                    	
                    	if (castL[0].includes(':')) {
                    		let poo = castL[0].split(':');
                            if (!hasModifiers(poo[1])) { exceptions = new cfExcep('modifier',0,[poo[1]]); return exceptions; }
                    	    castL.splice(0, 1);
                    	    castL.splice(0, 0, poo[0]);
                            castL.splice(0, 0, getDefaultBackfire(poo[1]));
                    	}
                   		let back = castL[castL.length - 2].split(';');
                    	//ccc for counter in counter in counter
                    	for (let ccc in back) {
                    		if (gfdSub.hasOwnProperty(back[ccc])) { back[ccc] = gfdSub[back[ccc]]; }
                            let thingy = checkBackfire(back[ccc]); 
                            if (thingy instanceof cfExcep) { return thingy; }
                        }
                        castL[castL.length - 2] = back;
                    } else {
                        castL = [compoundEffects(codef[c][cc])];
                        if (castL[0] instanceof cfExcep) { return exceptions; }
                    }
                } else {
                    codef[c][cc] = ['mod', getDefaultBackfire(codef[c][cc])]; skipReplace = 1; 
                }
                
                if (!skipReplace) { codef[c][cc] = castL; }
            }
        }
    }
    if (checkUndefined(codef)) { Game.Notify('undefined found in compiled code','Something has gone wrong and the exception system did not catch it. <b>Please contact mod developers.</b>',[7,7]); }
    return codef;
}

function hasExpression(input){
	let k = Object.keys(translator);
    for (let i in k) {
    	if (input.includes(k[i])) { return true; }
    }
    return false;
}

function compoundEffects(input) {
    if (typeof input !== 'string') { return false; }
    if (input[0] == '*' && input !== '*') { 
    	input = input.slice(1, input.length);
        let k = removeDuplicates(Object.values(translator));
        k.splice(k.indexOf(0), 1);
        let sp = input.split(';');
        for (let h in sp) {
            if (!translator.hasOwnProperty(sp[h])) { exceptions = new cfExcep('unrecognized',0,[sp[h]]); return exceptions; }
        	sp[h] = translator[sp[h]];
        }
        for (let j in sp) {
        	if (k.includes(sp[j])) { k.splice(k.indexOf(sp[j]), 1); }
        }
    	return k;
    } else { let sp = input.split(';'); 
    	for (let h in sp) {
            if (!translator.hasOwnProperty(sp[h])) { exceptions = new cfExcep('unrecognized',0,[sp[h]]); return exceptions; }
        	sp[h] = translator[sp[h]];
        }
        return sp;
    }
    
}

//substitutes certain backfire notations for other
var gfdSub = {
	'cbg':'1=0.875','conjurebakedgoods':'1=0.875',
    'fthof':'0.875=0.75','forcethehandoffate':'0.875=0.75','handoffate':'0.875=0.75',
    'st':'0.75=0.625','stretchtime':'0.75=0.625',
    'se':'0.625=0.5','spontaneousedifice':'0.625=0.5','edifice':'0.625=0.5',
    'hc':'0.5=0.375','haggler\'scharm':'0.5=0.375','haggler\'s':'0.5=0.375','haggler':'0.5=0.375','hagglers':'0.5=0.375',
    'scp':'0.375=0.25','summoncraftypixies':'0.375=0.25','craftypixies':'0.375=0.25','pixies':'0.375=0.25',
    'ra':'0.25=0.125','resurrectabomination':'0.25=0.125',
    'di':'0.125=0','diminishineptitude':'0.125=0','diminish':'0.125=0',
}

function hasStatuses(input) {
    if (Array.isArray(input)) {input = input[0]; }
	if (input.includes('find:') || input.includes('p:') || hasModifiers(input)) { return true; }
    return false;
}

function statuses(text) {
    if (typeof text !== 'string') { return 'ide'; }
    //local is 0 or 1 only pls
	if (text.includes('find:')) {
        let temp = parseInt(text.replace('find:', ''));
        if (isNaN(temp) || temp < 0) { exceptions = new cfExcep('find',0,[text.replace('find:', '')]); return exceptions; }
        return ['fi', temp]; 
    }
    else if (text.includes('p:')) { 
        let temp = parseP(text.replace('p:', ''));
        if (isNaN(temp) || temp < 0) { exceptions = new cfExcep('pool',0,[text.replace('p:', '')]); return exceptions; }
        return ['ch', temp];
    }
    else if (hasModifiers(text)) { 
        return ['mod', getDefaultBackfire(text)];
    }
    return 'ide';
}

//detects whether has only modifiers and nothing else
function hasModifiers(input) {
    if (Array.isArray(input)) { input = input[0]; }
    if (typeof input !== 'string') { return false; }
    if (input === '') { return false; }
    if (input.includes('si')) { input = input.replace('si', ''); }
    if (input.includes('rb')) { input = input.replace('rb', ''); }
    if (input.includes('di')) { input = input.replace('di', ''); }
    if (input.includes('im')) { input = input.replace('im', ''); }
    if (input.includes('x')) { input = input.replace('x', ''); }
    if (input != '') { return false; }
    return true;
}

function getDefaultBackfire(modifiers) {
    if (modifiers == 'x') { return 0.15; }
	var bc = 0.15;
    bc *= modifiers.includes('di')?0.1:1;
    bc *= modifiers.includes('im')?5:1;
    bc *= (1 + (modifiers.includes('si')?0.1:0) + (modifiers.includes('rb')?0.01:0))
    return bc;
}

function parseP(input) {
	if (input.match(/\d+%/)) { return 0.01 * parseFloat(input.replace('%', '')); } 
    else { return parseFloat(input); }
}

function scoutOutcomes(outcomes, startPoint, offset, findMult) {
    if (!Array.isArray(outcomes)) { outcomes = [outcomes]; }
    if (typeof findMult === 'undefined') { var findMult = 1; }
    if (outcomes == 0) { return startPoint; }
    for (let i = ((typeof startPoint !== 'undefined')?startPoint:0); i < limit*findMult+offset; i++) {
        let hh = findOutcome(i);
        if (outcomes.includes(hh[0]) || outcomes.includes(hh[1])) { return i; }
    }
    return false;
}

//return: 1 - frenzy, 2 - lucky, 3 - cf, 4 - storm, 5 - blab, 6 - bs, 7 - storm drop, 8 - sweet, 9 - clot, 10 - ruin, 11 - cuf, 12 - ef
function findOutcome(at) {
    let toReturn = [];
    //success
	Math.seedrandom(Game.seed + '/' + at);
    Math.random(); Math.random(); Math.random();
    let choices = [];
    choices.push(1,2);
    if (!Game.hasBuff('Dragonflight')) choices.push(3);
    if (Math.random()<0.1) choices.push(4,4,5);
    if (Game.BuildingsOwned>=10 && Math.random()<0.25) choices.push(6);
    if (Math.random()<0.15) choices=[7];
    if (Math.random()<0.0001) choices.push(8);
    toReturn.push(choose(choices));
        
    //backfire
    Math.seedrandom(Game.seed + '/' + at);
    Math.random(); Math.random(); Math.random();
    choices = [];
    choices.push(9,10);
    if (Math.random()<0.1) choices.push(11,12);
    if (Math.random()<0.003) choices.push(8);
    if (Math.random()<0.1) choices=[5];
    toReturn.push(choose(choices));
    return toReturn;
}    

function findBackfire(at) {
	Math.seedrandom(Game.seed + '/' + at);
    return Math.random();
}

function deepCopy(arr) {
    if (!Array.isArray(arr)) {
    	return arr;
    }
    const copiedArray = [];
    for (let i = 0; i < arr.length; i++) {
    copiedArray[i] = deepCopy(arr[i]);
    }
    return copiedArray;
}

//validates whether a backfire chance satisfies the given backfire expression(s)
function backfireExp(chance, expressions, defaultBackfire) {
	let exp = []; 
    if (Array.isArray(expressions)) { exp = expressions; } else { exp[0] = expressions; }
	for (let i in exp) {
    	if (exp[i] == 'b' && chance <= defaultBackfire) { return true; }
        if (exp[i] == 'n' && chance > defaultBackfire) { return true; }
        if (exp[i] == 'bb' && chance <= Math.max(defaultBackfire,0.5)) { return true; }
        if (exp[i] == 'nn' && chance > Math.max(defaultBackfire,0.5)) { return true; }
        if (exp[i].includes('=')) {
            //funny little hack
            let ind = exp[i].indexOf('=');
        	if ((chance - parseP(exp[i].slice(0, ind)))*(chance - parseP(exp[i].slice(ind+1, exp[i].length))) <= 0 && Math.max(parseP(exp[i].slice(0, ind)), parseP(exp[i].slice(ind+1, exp[i].length))) != chance) {
            	return true;
            }
        }
        if (exp[i].includes('gc')) { 
        	if (exp[i][exp[i].indexOf('gc')+2] == '+' && chance <= (parseInt(exp.slice(0, exp[i].indexOf('gc'))) * 0.15 + defaultBackfire)) { return true; }
            if (exp[i][exp[i].indexOf('gc')+2] == '-' && chance > (parseInt(exp.slice(0, exp[i].indexOf('gc'))) * 0.15 + defaultBackfire)) { return true; }
        } else if (exp[i].includes('+')) {
        	if (parseP(exp[i].slice(0, exp[i].length-1)) <= chance) { return true; }
        } else if (exp[i].includes('-')) {
        	if (parseP(exp[i].slice(0, exp[i].length-1)) > chance) { return true; }
        }
    }
    return false;
}

function checkBackfire(input) {
	if (input != 'b' && input != 'n' && input != 'bb' && input != 'nn' && !(input.includes('=')) && !(input.includes('gc')) && !(input.includes('+')) && !(input.includes('-'))) { exceptions = new cfExcep('backfireExp',0,input); return exceptions; }
    if (input.includes('=')) {
        let first = parseP(input.slice(0,input.indexOf('=')));
        let second = parseP(input.slice(input.indexOf('=')+1,input.length));
        if (isNaN(first) || isNaN(second) || !(first < 1 && first >= 0 && second < 1 && second >= 0)) {
        	exceptions = new cfExcep('backfireExpOutOfRange1',0,input); return exceptions;
        }
    }
    if (input.match(/[+-]$/) !== null) {
    	let thet = input.slice(0,input.length-1);
        let isGC = false;
        if (thet.includes('gc')) { thet = parseP(thet.slice(0,thet.length-2)); isGC = true; } 
        else { thet = parseP(thet); }
        if (isGC) {
            if (isNaN(thet) || thet != Math.floor(thet) || thet < 0) {
            	exceptions = new cfExcep('backfireExpOutOfRange3',0,input); return exceptions;
            }
        } else {
        	if (isNaN(thet) || !(thet < 1 && thet >= 0)) {
        		exceptions = new cfExcep('backfireExpOutOfRange2',0,input); return exceptions;
        	}
        }
    }
    return true;
}

function removeDuplicates(input) {
	let exist = [];
    for (let i in input) {
    	if (!exist.includes(input[i])) {
        	exist.push(input[i]);
        }
    }
    return exist;
}

function deleteAllArr(input, text) {
	for (let i in input) {
		text = text.replaceAll(input[i], '');
    }
    return text;
}

var boolConvert = {
	true:'On',
    false:'Off',
}

function checkUndefined(input) {
    if (typeof input === 'undefined') {return true;}
    if (!Array.isArray(input)) {return false; }
	for (let i in input) {
        if (Array.isArray(input[i])) { if (checkUndefined(input[i])) { return true; } }
    	if (typeof input[i] === 'undefined') { return true; }
    }
    return false;
}

function treatStr(codef) {
    //brute forcing lets go
    let jj = 0;
    while (jj < codef.length) {
    	if (codef[jj]==='\n'&&codef[jj+1]!==','&&codef[jj-1]!==','&&codef[jj+1]!=='&'&&codef[jj-1]!=='&'&&codef[jj+1]!=='\n') {
        	if (hasExpression(codef.slice(codef.lastIndexOf('&', jj) + 1, jj))) { codef = codef.slice(0, jj) + '&' + codef.slice(jj + 1, codef.length); }
            console.log('evolution: '+codef+' with '+jj);
        }
        jj++;
    }
    return codef;
}

/*async function asyncInterpret(minimumCastCount) {
	Game.Notify('Running code...','',0);
    let result = await interpret(minimumCastCount);
    return result;
}*/

function preLoad() {
    Game.Notify('Preloading casts...','This might take a while.',[17,19]);
    Game.NotesDraw();
    let thePool = [];
    for (let c in codes) {
        if (parseStatus(codes[c])) { continue; } 
    	if (parseModifier(codes[c], 0)) { continue; }
        thePool.push(c); 
    }
    preLoadedSeeds = [];
    let failed = 0;
    for (let i in thePool) {
        for (let j = 0; j < thePool[i]; j++) {
    		parseStatus(codes[j]);
            parseModifier(codes[j],0);
        }
        let toPush = [pool,defaultBackfire[0]];
    	for (let j = 0; j < preLoadAmountPerSequence; j++) {
			Game.seed=Game.makeSeed();
            console.log('processing: '+arrayToString(codes[thePool[i]]));
            let result = interpret(0,codes[thePool[i]],16,true);
            if (result instanceof cfExcep) { return false; }
    	    if (typeof result !== 'boolean' && result) { toPush.push([Game.seed, result]); } else { console.log(result); failed++; };
    	}
        preLoadedSeeds.push(toPush);
    }
    Game.Notify('Cast preloading complete!',failed+' sequence'+((failed-1)?'':'s')+' failed.',[17,18],10000,0,1); 
}

function loadPreLoadedSeeds() {
    if (preLoadedSeeds.length == 0) {return false;}
	let pooled = [];
    for (let i in preLoadedSeeds) {	
        if (preLoadedSeeds[i].length > 2) {
    		for (let temp = 0; temp < randomFloor(preLoadedSeeds[i][0]); temp++) { pooled.push(i); }
        }
    }
    if (pooled.length == 0) {return false;}
    let chosen = preLoadedSeeds[choose(pooled)];
    defaultBackfire[0] = chosen[1]; chosen = choose(chosen.slice(2,chosen.length));
    Game.seed=chosen[0];Game.Objects["Wizard tower"].minigame.spellsCastTotal=chosen[1];
}

function arrayToString(arr) {
    if (typeof arr === 'string') { return '\"'+arr+'\"'; }
	if (!Array.isArray(arr)) { return arr; }
    let str = '[';
    for (let i in arr) {
        str+=',';
    	str+=arrayToString(arr[i]);
    }
    return str.slice(0,1)+str.slice(2)+']';
}

function stringToArray(str) {
	let arr=''
    str = str.replace(/[\n\r\t]/gm, "")
    if (str) {eval('arr='+str)}
    return arr
}

eval('Game.Objects["Wizard tower"].minigame.draw='+Game.Objects["Wizard tower"].minigame.draw.toString().replace('Beautify(M.spellsCastTotal)','(usingPreload?"[hidden]":Beautify(M.spellsCastTotal))').replace('if (Game.drawT%5==0)','let M = Game.Objects["Wizard tower"].minigame; if (Game.drawT%5==0)'));

function CCCEMIntegratedExecute() {
    Math.seedrandom(Game.seed+'+execute');
    return interpret(Math.floor(Math.sqrt(Math.random())*limit),chooseSequence());
}

Game.registerHook('check', function() { Game.Unlock('Open Cast Finder');});

if (typeof CCCEMUILoaded !== 'undefined') { 
	function updateFinder() {
    	castFinderButtons = [];
        moreButtonsPlus[1] = [];
        castFinderButtons.push('<div class="line"></div>');
        castFinderButtons.push('<a class="option neatocyan" '+Game.clickStr+'="isShifting()?info(55):GetPromptN(0);RedrawCCCEM();">'+'Open Cast Finder'+'</a>');
        castFinderButtons.push('<a class="option neato" '+Game.clickStr+'="isShifting()?info(56):linking();">'+'Documentation'+'</a>');
        castFinderButtons.push('<a class="option neato" '+Game.clickStr+'="isShifting()?info(66):CCCEMIntegratedExecute()">'+'Execute'+'</a>');
        castFinderButtons.push('<a class="option neato'+(autoExecute?'orange':'yellow')+'" '+Game.clickStr+'="isShifting()?info(57):(autoExecute=!autoExecute);updateFinder();RedrawCCCEM();">'+'Auto execute '+(boolConvert[autoExecute])+'</a><br>');
        castFinderButtons.push('<a class="option neato" '+Game.clickStr+'="isShifting()?info(67):preLoad();usingPreload=true;updateFinder();RedrawCCCEM();">'+'Pre-Load</a>'); 
        castFinderButtons.push('<a class="option neato'+(usingPreload?'orange':'yellow')+'" '+Game.clickStr+'="isShifting()?info(68):(usingPreload=!usingPreload);updateFinder();RedrawCCCEM();">'+'Use Preload '+(boolConvert[usingPreload])+'</a>'); 
        castFinderButtons.push('<a class="option neatocyan" '+Game.clickStr+'="isShifting()?info(69):GetPromptN(1);RedrawCCCEM();">'+'Preload backups '+preLoadAmountPerSequence+'</a><br>');
        castFinderButtons.push('<a class="option neatocyan" '+Game.clickStr+'="isShifting()?info(70):GetPromptN(2);RedrawCCCEM();">'+'Import preload</a>');
        castFinderButtons.push('<a class="option neato" '+Game.clickStr+'="isShifting()?info(71):GetPromptN(3);RedrawCCCEM();">'+'Export current preload</a>');
        
        for (var i in castFinderButtons) {moreButtonsPlus[1].push(castFinderButtons[i])}; 
        moreButtonsPlus[0] = [];
        RedrawCCCEM();
    }
    new CCCEMExternalCategory('CastFinder', 'Cast Finder', [
        new CCCEMButton('cfCode', 'Open Cast Finder', 
            new stringInputButton(),
            new buttonInfo('Open Cast Finder', 'Opens the Cast Finder. Inputs will be ran upon pressing Try Again, unless auto execute is off.', [17, 14]),
            function(s) {codes = compile(s);}
        ),
        new CCCEMButton('cfDocs', 'Documentation',
            new triggerButton(),
            new buttonInfo('Open Documentation', 'Opens the documentation to the Cast Finder in a new tab.', [26, 7]),
            () => linking()
        ),
        new CCCEMButton('cfExecute', 'Execute',
            new triggerButton(),
            new buttonInfo('Execute Cast Finder', 'Executes the code in the Cast Finder.', [11, 10]),
            () => CCCEMIntegratedExecute()
        ),
        new CCCEMButton('cfAutoExec', 'Auto execute [##]',
            new boolButton("On", "Off"),
            new buttonInfo('Auto execute', 'Whether the Cast Finder is ran upon pressing Try Again. Disabling would cause the outcome to become randomized.', [17, 22]),
            s => { autoExecute = s; }, true
        ),
        new CCCEMButton('cfPreload', 'Pre-Load',
            new triggerButton(),
            new buttonInfo('Pre-Load Casts', 'Computes a set of seeds and cast amounts that would correspond to code entered, then stores it for later use. <br>Useful for very complex sequences that may take a while to compute.', [22, 29]),
            () => {
                preLoad();
                CCCEMButtons['cfUsePreload'].changeState(true);
                usingPreload=true;
            }
        ),
        new CCCEMButton('cfUsePreload','Use preload [##]',
            new boolButton("On", "Off"),
            new buttonInfo('Use Preload', 'Whether or not to choose one of the precomputed seeds (from preloading) to use upon trying again.<br>If enabled, the cast count will be hidden.', [34, 12]),
            s => usingPreload = s
        ),
        new CCCEMButton('cfPreloadNum','Preload backups [##]',
            new numberInputButton(),
            new buttonInfo('Preload backups', 'Set the amount of seeds to compute for each sequence.<br>Useful for simulating the other elements of rng that cannot normally be replicated with preloading.', [17, 20]),
            s => preLoadAmountPerSequence = s, true
        ),
        new CCCEMButton('cfExportPreload','Export current preload',
            new readonlyDisplayButton(() => {
                return arrayToString(preLoadedSeeds);
            }),
            new buttonInfo('Export preload','Exports preload code.',[17,2])
        ),
        new CCCEMButton('cfImportPreload','Import preload',
            new stringInputButton(),
            new buttonInfo('Import preload','Imports preload code.',[17,1]),
            s => {
                preLoadedSeeds = stringToArray(s);
                if (preLoadedSeeds) {
                    CCCEMButtons['cfUsePreload'].changeState(true);
                    usingPreload = true;
                }
            }
        )
    ]);
    CCCEMButtons['cfAutoExec'].changeState(true);
    CCCEMButtons['cfPreloadNum'].changeState(1);
    hasCCCEM = true;
    if (forceFtHoF == "blood frenzy") {
        CCCEMButtons["cfCode"].changeState("b^"+forceFtHoF) } else {
    	CCCEMButtons["cfCode"].changeState("nn^"+forceFtHoF)
    }
    codes = compile(get("cfCode"));
    RedrawCCCEM();
}
