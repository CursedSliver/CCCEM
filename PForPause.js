//version 1.0 made p for pause, the funny mod for pausing the game
//version 1.1 added a bit of functionality, such as to make it possible to set tick speed
//version 1.2 fixed most problems and added UI to CCCEM, and made keybinds easy to rebind
//version 2.0 added time manipulation
//version 2.1 fixed various bugs and overlooked elements, integrated time slow to all minigames, big cookie clicks no longer act silly at high gamespeeds 
//version 2.11 added multiplayer support (macadamia port)
//version 2.111 added try catch block
//version 2.12 fixed issue with the mod removing a button from CCCEMUI
//version 2.121 reverted changes and changed approach to prevent deletion of other elements
//version 2.2 fixed new integration with CCCEMUI buttons

var gamePause=0
var gardenStepDifference=Game.Objects.Farm.minigame?(Game.Objects.Farm.minigame.nextStep-Date.now()):0
var pantheonSwapDifference=0
var lumpTimeDifference=0
var gfdID=0
var gfdArr=[]
var tpsLoop=0
var tpsSpeed=30
var pForPause=[[80, "P"], [84, "T"], [82, "R"], [0, 'Never']] //keycodes for pause, step and reset, being p, t, r
var changeKeyBind=0
var gameSpeedMultTriggerKeybind=0; //never active
var timeFactorWhenEnabled=1;

function Clamp(val, min, max) {return Math.max(min, Math.min(val, max))}

function HoldVars() {
    var time=Date.now(); 
    if (Game.Objects.Farm.minigame) { gardenStepDifference=Game.Objects.Farm.minigame.nextStep-time; }
    if (Game.Objects.Temple.minigame?.swaps<3 && Game.Objects.Temple.minigame) {pantheonSwapDifference=time-Game.Objects.Temple.minigame.swapT} 
    lumpTimeDifference=time-Game.lumpT
    }

function PauseGame() {
    gamePause=!gamePause; 
    for (let anim of PForPause.allAnimations) {
        if (gamePause) { anim.pause(); }
        else { anim.play(); }
    }
    HoldVars();
}
function TickStep() {
    gardenStepDifference-=1000/PForPause.fFps; 
    pantheonSwapDifference+=1000/PForPause.fFps; 
    Game.lumpTimeDifference+=1000/PForPause.fFps; 
    Game.Logic(); 
    HoldVars();
    }

function TPSStep() {
    if (gamePause) {TickStep()}; 
    tpsLoop=setTimeout(TPSStep,Math.round(1000/tpsSpeed))
    }

function notifyKeyBind(additional) {
    Game.Notify('Press a key to set!'+(additional?('<br>press esc to set as Never, and click button again to set as Always'):''), '', 0);
}
function changeGrimoire() {
    Game.ObjectsById[7].minigame.spellsById[6].win=function(){
        var spells=[];
        var selfCost=Game.ObjectsById[7].minigame.getSpellCost(Game.ObjectsById[7].minigame.spells['gambler\'s fever dream']);
        for (var i in Game.ObjectsById[7].minigame.spells)
        {if (i!='gambler\'s fever dream' && (Game.ObjectsById[7].minigame.magic-selfCost)>=Game.ObjectsById[7].minigame.getSpellCost(Game.ObjectsById[7].minigame.spells[i])*0.5) spells.push(Game.ObjectsById[7].minigame.spells[i]);}
        if (spells.length==0){Game.Popup('<div style="font-size:80%;">'+loc("No eligible spells!")+'</div>',Game.mouseX,Game.mouseY);return -1;}
        var spell=choose(spells);
        var cost=Game.ObjectsById[7].minigame.getSpellCost(spell)*0.5;
        gfdArr[gfdID]=[, 0]
        gfdArr[gfdID][0]=setInterval(function(spell,cost,seed,gfdID){return function(){
            if (gfdArr[gfdID][1] < 1000) { return; }
            if (Game.seed!=seed) return false;
            var out=Game.ObjectsById[7].minigame.castSpell(spell,{cost:cost,failChanceMax:0.5,passthrough:true});
            if (!out)
            {
                Game.ObjectsById[7].minigame.magic+=selfCost;
                setTimeout(function(){
                    Game.Popup('<div style="font-size:80%;">'+loc("That's too bad!<br>Magic refunded.")+'</div>',Game.mouseX,Game.mouseY);
                },1500);
            }
            clearInterval(gfdArr[gfdID][0]);
        }}(spell,cost,Game.seed,gfdID),1000/Game.fps);
        gfdID++
        Game.Popup('<div style="font-size:80%;">'+loc("Casting %1<br>for %2 magic...",[spell.name,Beautify(cost)])+'</div>',Game.mouseX,Game.mouseY);
    };
    const M = Game.ObjectsById[7].minigame;
    eval('Game.ObjectsById[7].minigame.logic='+Game.ObjectsById[7].minigame.logic.toString().replace('+=M.magicPS', '+=M.magicPS*PForPause.timeFactor').replaceAll('Game.T%5', 'PForPause.checkAnimTWasAMultipleOf(5)'));
}
setTimeout(function() { if (Game.ObjectsById[7].minigame && Game.ObjectsById[7].minigameLoaded) { changeGrimoire(); } })

eval("Game.Loop="+Game.Loop.toString().replace("Game.Logic();","if (!gamePause) {Game.Logic();} else {Game.Objects.Farm.minigame.nextStep=Math.floor(Date.now()+gardenStepDifference); Game.Objects.Temple.minigame.swapT=Math.floor(Date.now()-pantheonSwapDifference); Game.lumpT=Math.floor(Date.now()-lumpTimeDifference)}"));
eval("Game.Loop="+Game.Loop.toString().replace("Game.accumulatedDelay+=((time-Game.time)-1000/Game.fps);","if (!gamePause) Game.accumulatedDelay+=((time-Game.time)-1000/Game.fps);"))
eval("Game.Logic="+Game.Logic.toString().replace("//minigames","//minigames \nfor (var i in gfdArr) {gfdArr[i][1]+=1000/PForPause.fFps;}"))
eval("Game.harvestLumps="+Game.harvestLumps.toString().replace("Game.lumpT=Date.now();","Game.lumpT=Date.now(); lumpTimeDifference=0;"))

var PForPause = null;
var timeFactorE = 1;
var originalFpsE = 30;
Game.registerMod('P for Pause', {
    init: function() {
        PForPause = this;
        originalFpsE = this.originalFps;
        eval('Game.Loop='+Game.Loop.toString().replaceAll('1000/Game.fps', '1000/PForPause.originalFps'));
        Game.realT = Game.T;
        Game.animT = Game.T;
        Game.isNewAnimTick = true; //utility for stuff that triggers per x ticks
        Game.lastAnimT = Math.floor(Game.animT);
        Game.lastAnimTExact = Game.animT;

        function inRect(x,y,rect)
        {
            //find out if the point x,y is in the rotated rectangle rect{w,h,r,o} (width,height,rotation in radians,y-origin) (needs to be normalized)
            //I found this somewhere online I guess
            var dx = x+Math.sin(-rect.r)*(-(rect.h/2-rect.o)),dy=y+Math.cos(-rect.r)*(-(rect.h/2-rect.o));
            var h1 = Math.sqrt(dx*dx + dy*dy);
            var currA = Math.atan2(dy,dx);
            var newA = currA - rect.r;
            var x2 = Math.cos(newA) * h1;
            var y2 = Math.sin(newA) * h1;
            if (x2 > -0.5 * rect.w && x2 < 0.5 * rect.w && y2 > -0.5 * rect.h && y2 < 0.5 * rect.h) return true;
            return false;
        }

        eval('Game.Logic='+Game.Logic.toString()
            .replace('Game.T++;', 'Game.T++; Game.realT++; Game.animT += PForPause.timeFactor; Game.isNewAnimTick = false; if (Math.floor(Game.animT) > Game.lastAnimT) { Game.isNewAnimTick = true; } Game.lastAnimTExact = Game.lastAnimT; Game.lastAnimT = Game.animT;')
            .replace('Game.researchT--;', 'Game.researchT -= PForPause.timeFactor;')
            .replace('Game.researchT==0', 'Game.researchT<=0')
            .replace('Game.T%Math.ceil(Game.fps/Math.min(10,Game.cookiesPs))==0', 'PForPause.checkAnimTWasAMultipleOf(Math.ceil(Game.fps/Math.min(10,Game.cookiesPs)))')
            .replace('Game.BigCookieSizeD+=(Game.BigCookieSizeT-Game.BigCookieSize)*0.75;', 'Game.BigCookieSizeD+=(Game.BigCookieSizeT-Game.BigCookieSize)*0.75 * PForPause.timeFactor;')
            .replace('Game.BigCookieSizeD*=0.75;', 'Game.BigCookieSizeD*=Math.pow(0.75, Math.pow(PForPause.timeFactor, 2));')
            .replace('Game.BigCookieSize+=Game.BigCookieSizeD;', 'Game.BigCookieSize+=Game.BigCookieSizeD * PForPause.timeFactor;')
            .replace('Game.sparklesT--;', 'Game.sparklesT -= PForPause.timeFactor;')
            .replace('Game.sparklesFrames-Game.sparklesT+1', 'Game.sparklesFrames-Math.floor(Game.sparklesT)+1')
            .replace('if (Game.sparklesT==1)', 'if (Game.sparklesT<=1)')
            .replace('-Game.T*', '-Game.animT*')
            .replace('Game.ascendMeterPercent+=(Game.ascendMeterPercentT-Game.ascendMeterPercent)*0.1;', 'Game.ascendMeterPercent+=(Game.ascendMeterPercentT-Game.ascendMeterPercent)*0.1*PForPause.timeFactor;')
            .replace('Game.T%15==0', 'PForPause.checkAnimTWasAMultipleOf(15)')
            .replace('Game.milkHd+=(Game.milkH-Game.milkHd)*0.02', 'Game.milkHd+=(Game.milkH-Game.milkHd)*0.02*PForPause.timeFactor')
            .replace('Game.toSave || (Game.T%(Game.fps*60)==0', 'Game.toSave || (PForPause.checkAnimTWasAMultipleOf(Game.fps*60)')
        );

        eval('PlaySound='+PlaySound.toString()
            .replace('sound.volume', 'sound.playbackRate = Clamp(PForPause.timeFactor, 0.07, 15); sound.volume')
        );

        //kc patched
        const funcsToPatch = ['Game.shimmerTypes.golden.updateFunc', (EN?'Game.Upgrades["Endless book of prose"].descFunc':''), 'Game.Achievements["Cookie Clicker"].descFunc', 'Game.UpdateWrinklers', 'Game.DrawWrinklers', 'Game.DrawSpecial', 'Game.DrawBackground'];
        for (let i in funcsToPatch) {
            /*const n = [].concat(Array.isArray(funcsToPatch[i]) ? funcsToPatch[i][1] : 'all');
            if (n[0] == 'all') { 
                n[0] = 1;
                for (let ii = 2; ii <= 20; ii++) {
                    n.push(ii);
                }
            }
            const f = eval(funcsToPatch[i]);
            if (!f) { continue; }
            let funcStr = f.toString();
            for (let ii = 0; ii < n.length; ii++) {
                funcStr = this.replaceNthInstanceOf(funcStr, n[ii] - ii, [/\bGame\.T\b(?!%)/g], ['Game.animT'])
            }
            eval(funcsToPatch[i]+'='+funcStr);*/
            if (!funcsToPatch[i]) { continue; }
            eval(funcsToPatch[i]+'='+eval(funcsToPatch[i]).toString().replaceAll(/\bGame\.T\b(?!%)/g, 'Game.animT'));
        }
        eval('Game.Achievements["Cookie Clicker"].descFunc='+Game.Achievements["Cookie Clicker"].descFunc.toString().replace('Game.T', 'Math.floor(Game.T)'));
        //kc patched
        const decrementsToPatch = ['Game.updateBuffs', 'Game.doLumps', 'Game.shimmerTypes.golden.updateFunc', 'Game.shimmerTypes.reindeer.updateFunc', 'Game.NotesLogic', 'Game.UpdateTicker', 'Game.UpdateGrandmapocalypse']
        for (let i in decrementsToPatch) {
            let decVar = (eval(decrementsToPatch[i]).toString().match(/((?:\w+\.)*\w+)\s*--;/) || [])[1];
            eval(decrementsToPatch[i]+'='+eval(decrementsToPatch[i]).toString()
                .replace('--;', ' -= PForPause.timeFactor; ' + (decVar?(decVar + '++; ' + decVar + '--;'):'')));
        }
        //probably kc patched
        const incrementsToPatch = ['Game.updateShimmers', 'Game.particlesUpdate', 'Game.textParticlesUpdate'];
        for (let i in incrementsToPatch) {
            const n = Array.isArray(incrementsToPatch[i]) ? incrementsToPatch[i][1] : 1;
            eval(incrementsToPatch[i] + '=' + this.replaceNthInstanceOf(eval(incrementsToPatch[i]).toString(), n, ['++;'], [' += PForPause.timeFactor;']));
        }
        eval('Game.particlesUpdate='+Game.particlesUpdate.toString().replace('0.2+Math.random()*0.1', '(0.2+Math.random()*0.1) * PForPause.timeFactor').replace('+=me.xd', '+=me.xd * PForPause.timeFactor').replace('+=me.yd', '+=me.yd * PForPause.timeFactor'));
        eval('Game.textParticlesUpdate='+Game.textParticlesUpdate.toString().replace('for', 'if (gamePause) { return; } for'));
        //kc patched
        eval('Game.buffType='+Game.buffType.toString().replace('obj.type=type;', 'obj.type=type; obj.time *= PForpause.timeFactor;'));
        const divisionsToPatch = ['Game.UpdateWrinklers', 'Game.Logic'];
        for (let i in divisionsToPatch) {
            const n = Array.isArray(divisionsToPatch[i]) ? divisionsToPatch[i][1] : 1;
            eval(divisionsToPatch[i] + '=' + eval(divisionsToPatch[i]).toString().replaceAll('/Game.fps', '/PForPause.fFps'));
        }

        //per-frame luck-based events patches
        eval('Game.updateShimmers='+Game.updateShimmers.toString()
            .replace('Math.pow(Math.max(0,(me.time-me.minTime)/(me.maxTime-me.minTime)),5)', 'PForPause.scaleProbabilitySingle(Math.pow(Math.max(0,(me.time-me.minTime)/(me.maxTime-me.minTime)),5))')
            .replace('Math.random()<0.5', 'Math.random()<PForPause.scaleProbabilityRate(0.5)')
        );
        eval('Game.UpdateWrinklers='+Game.UpdateWrinklers.toString().replace('Math.random()<chance', 'Math.random()<PForPause.scaleProbabilitySingle(chance)'));
        eval('Game.DrawWrinklers='+Game.DrawWrinklers.toString().replace('Math.random()<0.03', 'Math.random()<PForPause.scaleProbabilityRate(0.03)'));

        //catch all css animations and control them
        this.sweepAnim();
        const observer = new MutationObserver(muts => {
            try {
                for (const m of muts) {
                    if (m.type === "childList") {
                        m.addedNodes.forEach(n => PForPause.catchAnimationsInNode(n));
                    } else if (m.type === "attributes") {
                        PForPause.catchAnimationsInNode(m.target);
                    }
                }
            } catch (err) {

            }
        });
        observer.observe(document.documentElement, {
            childList: true,
            attributes: true,
            subtree: true,
            attributeFilter: ["class", "style"]
        });

        Game.registerHook('logic', function() {
            const now = Date.now();
            PForPause.cumulativeRealTime += (now - PForPause.lastFrame) * PForPause.timeFactor;
            PForPause.lastFrame = now;
        });

        this.changeMinigame('Farm', ['logic', 'draw', 'reset', 'soilTooltip', 'buildPanel']);
        this.changeMinigame('Bank', [], function(M) {
            eval('M.logic='+M.logic.toString().replace('M.tickT++;', 'M.tickT += PForPause.timeFactor;'));
        });
        this.changeMinigame('Temple', ['logic', 'draw', 'reset', 'useSwap']);
        this.changeMinigame('Wizard tower', [], function(M) {
            eval('M.logic='+M.logic.toString()
                .replace('M.magic+=M.magicPS', 'M.magic+=M.magicPS * PForPause.timeFactor')
            );
            eval('M.draw='+M.draw.toString().replace('-Game.T*', '-Game.animT*'));
        });
    },
    changeGameSpeed: function(mult, noCSSUpdates) {
        if (typeof mult != 'number' || mult < 0) { return; }
        this.timeFactor = mult;
        timeFactorE = this.timeFactor;
        //Game.fps still dont change, create new functional fps to hook to 
        //this is mostly to minimize mod compatibility, I would very much rather have stuff not be affected by time dilation rather than stuff intiializing with more time when time slowed
        //Game.fps = this.originalFps / this.timeFactor;
        this.fFps = this.originalFps / this.timeFactor;

        if (!noCSSUpdates) {
            for (let anim of this.allAnimations) {
                anim.playbackRate = this.timeFactor;
            }
        }

        for (let i in this.onChangeHooks) {
            this.onChangeHooks[i]();
        }
    },
    replaceNthInstanceOf: function(funcStr, n, searchPatterns, matchingPatterns) {
        if (searchPatterns.length != matchingPatterns.length) { throw 'Pattern lengths not matching!'; }
        let replaced = 0;
        let lastIndex = 0;
        while (replaced < n) {
            let minIndex = -1;
            let patternIdx = -1;
            for (let p = 0; p < searchPatterns.length; p++) {
                let idx = funcStr.indexOf(searchPatterns[p], lastIndex);
                if (idx !== -1 && (minIndex === -1 || idx < minIndex)) {
                    minIndex = idx;
                    patternIdx = p;
                }
            }
            if (minIndex === -1) { break; }
            funcStr = funcStr.substring(0, minIndex) + 
                matchingPatterns[patternIdx] + 
                funcStr.substring(minIndex + searchPatterns[patternIdx].length);
            lastIndex = minIndex + matchingPatterns[patternIdx].length;
            replaced++;
        }
        return funcStr;
    },
    scaleProbabilityRate: function(p) {
        //for random events that you want to keep the amount of successes constant per unit time
        //do note that this is not perfect, it has a tendency to asymptotically increase to the actual rate as fFps increases and vice versa, don't use if you are planning to speed the game up to extreme amounts
        return 1 - Math.exp(-p * this.timeFactor);
    },
    scaleProbabilitySingle: function(p) {
        //for random events that you want to keep the average amount of time to a success constant per unit time
        return 1 - Math.pow(1 - p, this.timeFactor);
    },
    originalFps: window.__PForPauseOriginalFpsPreset__ ?? 30,
    fFps: window.__PForPauseOriginalFpsPreset__ ?? 30, //functionalFps, basically fps / timeFactor used for seconds-based timers
    timeFactor: 1,
    onChangeHooks: [],
    allAnimations: new Set(),
    hookAnim: function(anim) {
        if (PForPause.allAnimations.has(anim)) { return; }
        PForPause.allAnimations.add(anim);
        if (gamePause) { anim.pause(); }
        anim.playbackRate = PForPause.timeFactor;
        const c = () => { PForPause.allAnimations.delete(anim); };
        anim.onfinish = c;
        anim.oncancel = c;
    },
    catchAnimationsInNode: function(node) {
        if (node.nodeType !== 1) { return; }
        node.getAnimations({ subtree: true }).forEach(PForPause.hookAnim);
    },
    sweepAnim: function() {
        const all = (document.getAnimations && document.getAnimations()) || [];
        for (let i of all) {
            this.hookAnim(i);
        }
    },
    addGameSpeedHook: function(func) {
        this.onChangeHooks.push(func);
    },
    lastFrame: Date.now(),
    cumulativeRealTime: Date.now(), //ms
    changeMinigame: function(building, additionalFunctions, func) {
        const change = function() {
            const M = Game.Objects[building].minigame;
            if (M.reset && M.reset.toString().includes('Date.now()')) {
                eval('M.reset='+M.reset.toString().replaceAll('Date.now()', 'PForPause.cumulativeRealTime'));
            }
            for (let i in additionalFunctions) {
                eval('M["'+additionalFunctions[i]+'"]='+M[additionalFunctions[i]].toString().replaceAll('Date.now()', 'PForPause.cumulativeRealTime'));
            }
            func && func(M);
        }
        if (Game.Objects[building].minigameLoaded) {
            change();
        } else {
            const interval = setInterval(function() {
                if (Game.Objects[building].minigameLoaded) {
                    change();
                    clearInterval(interval);
                }
            }, 10);
        }
    },
    checkAnimTWasAMultipleOf: function(int) {
        //utility for stuff that triggers every x ticks, but want to use animT
        return Math.floor(Math.floor(Game.animT) / int + 1e-13) - Math.floor(Game.lastAnimTExact / int + 1e-13);
    },
    save: function() {
        return '' + this.timeFactor;
    },
    loadTimeMult: false,
    load: function(str) {
        if (!this.loadTimeMult) {
            return;
        }

        this.changeGameSpeed(parseFloat(str));
    }
});

if (typeof hasPForPausePort !== 'undefined') { var hasPForPausePort = false; }

if (typeof Macadamia != 'undefined' && Macadamia && !hasPForPausePort) {
    hasPForPausePort = true;
    class PForPausePort extends Macadamia.Mod {
        async HookBuilder() {
            this.syncGameSpeed();
        }
        syncGameSpeed() {
            PForPause.addGameSpeedHook(() => {
                this.gameSpeedChangeRPC.send({ value: PForPause.timeFactor });
            });
        }

        async rpcBuilder() {
            this.gameSpeedChangeRPC = this.createRPC('gameSpeedChange');
            this.gameSpeedChangeRPC.setCallback((mult) => {
                window.DO_NOT_RPC = true;
                PForPause.changeGameSpeed(parseFloat(mult.value));
                window.DO_NOT_RPC = false;
            });

            if (!Game.mods.CCCEMContainer) { return; }

            this.defaultGameSpeedChangeRPC = this.createRPC('defaultGameSpeedChange');
            this.defaultGameSpeedChangeRPC.setCallback((mult) => {
                timeFactorWhenEnabled = parseFloat(mult.value);
                window.DO_NOT_RPC = true;
                //UpdatePForPB();
                RedrawCCCEM();
                window.DO_NOT_RPC = false;
            });

            this.keybindChangeRPC = this.createRPC('keybindChange');
            this.keybindChangeRPC.setCallback((keybinds) => {
                pForPause[keybinds.key][0] = keybinds.value;
                window.DO_NOT_RPC = true;
                //if (keybinds.key == 3 && pForPause[keybinds.key][0] == -1 || Game.keys[pForPause[keybinds.key][0]]) { PForPause.changeGameSpeed(timeFactorWhenEnabled); }
                //UpdatePForPB();
                RedrawCCCEM();
                window.DO_NOT_RPC = false;
            });
        }
    }
    Macadamia.register(PForPausePort, {
		uuid: "pForPause",
		name: "P For Pause Integration",
		description: "Syncs all time-related behavior.",
		author: "CursedSliver",
		version: "1.0.0"
	});
}


if (!(typeof CCCEMUILoaded === 'undefined')) {
    class gameSpeedKeySelect extends keySelectButton {
        parseConvert = key => { 
            if (key == -1) {
                return 'Always';
            }
            if (key == 0) {
                return 'Never';
            }
            return String.fromCharCode((96 <= key && key <= 105) ? key - 48 : key).toUpperCase(); 
        }

        onClick() {
            if (this.parent.state == 0) { 
                this.parent.changeState(-1);
                return;
            } 

            window.toChangeKeyBind = this.parent.key;
            Game.Notify('Press a key to set!<br>press esc to set as Never, and click button again to set as Always', '', 0);
        }

        onKeyConfirmation(e) {
            if (e.keyCode == 27) {
                Game.Notify('Key cleared!', '', 0);
                this.parent.state = 0;
            } else {
                Game.Notify('Key set: '+e.key.toUpperCase(), '', 0);
                this.parent.state = e.keyCode;
            }
            window.toChangeKeyBind = null;
        }

        default() {
            window.keyBindEvents.push(this.parent);
            return 1;
        }
    }
    new CCCEMExternalCategory('PForPause', 'P for Pause', [
        new CCCEMButton('gamePause', '[##]', 
            new boolButton('Unpause', 'Pause'),
            new buttonInfo('Game pause', 'Stops the game from performing logic ticks until unpaused.', [8, 22]),
            function() { PauseGame(); this.state = gamePause; }, 
            false, function() { if (this.state != gamePause) { this.state = gamePause; RedrawCCCEM(); } }
        ),
        new CCCEMButton('tickStep','Tick step',
            new triggerButton(),
            new buttonInfo('Tick step', 'Perform a single logic tick while paused.', [8, 26]),
            () => { TickStep(); },
            true
        ),
        new CCCEMButton('pauseKey','Pause: [##]',
            new keySelectButton(80),
            new buttonInfo('Pause key select', 'Selects the key that pauses the game on press.', [0, 8]),
            down => { if (!down) { return; } PauseGame(); CCCEMButtons['gamePause'].state = gamePause; }
        ),
        new CCCEMButton('tickKey','Tick: [##]',
            new keySelectButton(84),
            new buttonInfo('Tick key select', 'Selects the key that performs a single logic tick on press.', [0, 8]),
            down => { if (!down) { return; } TickStep(); }, true
        ),
        new CCCEMButton('gamespeed','Gamespeed multiplier: [##]',
            new numberInputButton(2),
            new buttonInfo('Gamespeed multiplier', 'Sets the multiplier that will be applied when the gamespeed trigger is used.', [23, 11]),
            s => {
                console.log('a', s);
                console.trace();
                timeFactorWhenEnabled = s;
                if (Game.keys[CCCEMButtons['gamespeedKey'].state] || CCCEMButtons['gamespeedKey'].state == -1) {
                    PForPause.changeGameSpeed(timeFactorWhenEnabled);
                }
            }
        ),
        new CCCEMButton('gamespeedKey','Trigger method: [##]',
            new gameSpeedKeySelect(0),
            new buttonInfo('Gamespeed trigger method', 'Selects the key that changes the game speed to the specified game speed when held.', [0, 8]),
            down => { if (!down) { PForPause.changeGameSpeed(1); return; } PForPause.changeGameSpeed(timeFactorWhenEnabled); }
        )
    ]);
    CCCEMButtons['gamePause'].type.willSave = false;
    RedrawCCCEM();
};
