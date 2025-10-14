//author: @xxfillex and @cursedsliver over discord (fillex comes first)
//the mod will make any save, even a fresh save, get all achievements, upgrades, and many other values as suitable for a combo attempt. After initial launch, using ResetAll(); will reset the game and minigames according to the variables without resetting the variables, so you can change the variables after launch to change the conditions for the combo. To change the variables to suit your own needs, you can set the variables yourself using a script, which can be done by copying over the variables to your own pastebin or bookmark, changing the values of the variables, and running that script after this one. 
//version 1.1: Fixed some minor issues including swapping seasons and minigames not unmuting, as well as magic not properly resetting if wizard towers are sold.
//version 1.2: Fixed some larger things I was considering fixing as I had some spare time on my laptop, including choosing own pantheon spirits, a lot of customization for golden cookies, including being able to spawn up to 3 golden cookies at the start (DO, nat, DEoRL), as well as being able to load a save of your own to override mainly upgrades and achievements, but not minigames, among other things. Turning off grandmapocalypse for immersion is now possible, but will not pop wrinklers.
//version 1.21: Small fix, making you able to disable fortunes, as well as making the golden cookie spawning its own function in case you want to reset only some parts of the game for some reason
//version 2.0: Pretty big update including GUI for using presets under Options, allowing for changing the chance of fortunes, and more!
//version 2.1: Kinda huge update, adds a nice and cool UI replacing the debug menu, fixes some bugs, adds seeding to golden cookies, makes it impossible to save normally in order to protect the save the mod is loaded onto, and is now split into two separate scripts in order to make it easier to update the mod in the future. As I'm moving all eval to the other script, forcing fortunes and the like will be unavailable if that script becomes inaccessible.
//version 2.11: Hotfix for some issues, now with even more seeding
//version 2.12: Made running it on a fresh save more pleasant, changed a building count bug in stats, made presets slightly better
//version 2.2: Made EB building list better, making it actually usable. Randomized garden rotation, made the duration calculation better, fixed the presets to take new variables into account, fixed importing messing up krumblor, removed the GC spawning sound from misc golden cookies during reset, and a few other small fixes.
//version 2.21: hotfix for having some golden cookie related things off throwing errors (again), as well as having random FtHoF being laggy
//version 2.22: added rebuy option for both building lists, made time until garden tick random
//version 2.23: small fix because krumblor still messed up
//version 2.24: made bank minigame get reset since it's not supposed to show you RNG about the save you load onto CCCEM
//below are the works of @cursedsliver, also over discord
//version 2.3: colored interface, ability to select building to sell, ability to adjust spell count, default fortune chance to 4%, bunch of stuff becomes adjustable via text input, preferred settings save if on the same save
//version 2.31: Obtain information by shift clicking the buttons
//version 2.32: minor fixes overall, an extra button color, game prefs now save with that as well
//version 2.4: added Cast Finder, an independent mod that contains integration with CCCEM; the Cast Finder allows one to find arbitary strings of cast outcomes according to a set of syntaxes.
//version 2.41: fixed minor bugs and added description to Cast Finder buttons
//version 2.42: fixed an issue where overriding buildings could result in inflated score, fixed issue where loading cccem twice would brick your save
//version 2.43: made cast finder find casts async 
//version 2.44: reverted changes from v2.43
//version 2.45: added preloading to Cast finder, which is kinda a better solution to the problem that 2.43 attempted to solve; basically allows for precomputing of sequences so no more massive lag spikes when retrying with large sequences
//version 2.46: added an exception system to Cast finder, which should make developing much easier; also massively expanded upon the documentation in order to increase user friendliness
//version 2.47: added a system that automatically wipes cccem settings after an update that affected the saving system, so host save (hopefully) shouldnt become corrupted now
//version 2.48: added the ability to adjust the starting season
//version 2.49: added the ability to adjust a DF chance multiplier 
//version 2.5: added integration with multiplayer (red's Macadamia mod loader), as well as options to adjust gc spawn rates for the upcoming cookie clicker combo execution competitoi
//version 2.51: made news ticker automatically scroll upon trying again, and added the ability to scroll in the opposite direction using ctrl clicking scrollable options
//version 2.52: added option to change garden level (garden size)
//version 2.53: added ability to adjust starting season for the builtin cast getter 

if (typeof CCCEMLoaded === 'undefined') {

//The "non-real" cccemver is for detecting whether to wipe settings
var CCCEMVer = 'v2.53';
var CCCEMVerReal = 'v2.53';
var CCCEMLoaded = true;
var iniSeed='R'; //use 'R' to randomize seed, otherwise set as a specific seed
var iniLoadSave=false //paste a save to load initially into this variable as a string by using 'apostrophes' around the text. Loading a save in this way will override most cookie, upgrade, prestige, and buildning settings, but not minigame settings.
var iniC=4e69 //initial cookie count
var iniCE=1e78 //cookies earned count
var iniP=1e22 //prestige level
var iniLumps=105 //lump count
var iniBC=1095; //cursor amount, used to determine other building amounts; gets overridden by manual sets
var manualBuildings=[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; //building count for building id x; does not override if it is at 0. To set a building count to 0, use any negative number.
var wizCount=951; //specifically wizard towers
var wizLevel=10; //set wizard tower level
var buildingRelList=  [[-8, -33, -17, -17, -17, -26, -13, -20, -19, -19, -14, -23, -20, -12, -16, -32, -47, -39, -24],0,
                      [-18, -22, -17, -17, -17, -19, -21, -18, -24, -16, -13, -27, -12, -15, -17, -34, -46, -33, -31],0] //good non-EB count for 2.052
var buildingRelListEB=[[-4, -36, -17, -17, -18, -22, -17, -19, -19, -11, -25, -20, -20, -15, -16, -26, -51, -39, -28],-2,
                      [-18, -22, -18, -17, -17, -19, -20, -21, -22, -5, -28, -23, -14, -16, -17, -26, -53, -34, -33],1] //good EB count for 2.052. Numbers represent how many fewer to buy compared to the previous building, wizard tower count is overriden by wizCount afterwards
var forcedCastCount = [0, 0];
var useEB=false
var useRebuy=0
var chooseLump=0 //4 is caramelized
var d1Aura=13 //13 is Epoch Manipulator
var d2Aura=4 //4 is Dragon Harvest
var seedNats=true
var seedTicker=true
var GCCount=77777
var iniRein=0
var forceFtHoF='blood frenzy' //'blood frenzy' is elder frenzy, setting as something that isn't a buff will result in random outcome
var gardenSeed=14 //14 means currently holding whiskerbloom seed
var gardenP1=[6, 60] //defalut [6, 60] (being fairly grown golden clover), will be planted on half of the columns
var gardenP2=[17, 60] //default [17, 60] (being fairly grown nursetulip), will be planted on the other half of the columns
var setGardenR='' //set to 1, 2, 3 or 4
var gardenLevel=10 //level of farms
var toNextTick='' //between 0 and 900 for time until next tick
var officeL=5 //5 is palace of greed
var spirit1=1 //1 is vomitrax
var spirit2=4 //4 is selebrak
var spirit3=6 //6 is muridal
var iniSpawn=true //true to have a regular golden cookie spawn immediately
var iniGC=19 //what first GC gives, 'R' for random
var iniDO=false //true to treat get an extra golden cookie at the start as if from DO, functionally equivalent to DEoRL
var iniGC2=21 //what DO GC gives, 'R' for random
var iniDEoRL=false //set to true to get an extra golden cookie at the start as if from DEoRL
var iniGC3=1 //what DEoRL GC gives, 'R' for random
var iniTimer=0 //set to a number of frames indicate how long since the last Golden cookie was spawned
var iniF=true //true to start with Frenzy
var iniFdur=600 //number of seconds of duration
var iniDH=true //true to start with Dragon Harvest
var iniDHdur=600
var iniBSCount=0 // number of BSs to start with (not including other golden cookies)
var iniBSdur=600
var iniSB=false //if you start with sugar blessing
var fortuneG=0 //0 to make GC fortune unclicked
var forceFortune=1 //set to value between 0 and 1 for probability of getting a fortune
var boughtSF=0 //0 or 1, 0 to make SF available
var boughtCE=0 //make chocolate egg available
var setSeason=183 //183 makes it halloween, set to the id of the season switcher toggle
var setPledge=true //true to automatically pledge at the start, otherwise false
var muteBuildings=[1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1] //list of which buildings to mute, 1 mutes
var unmuteMinigames=true //unmutes all buildings with minigames, overrides muteBuildings
var buyOption1=1 //set to 0 to have buy selected and 1 to have sell selected at the start
var buyOption2=4 //set to 2 to have "1" selected, 3 for "10", 4 for "100", 5 for "all"
var DFChanceMult=1; //dragonflight buff chance multiplier (also multiplies dh chance but who cares about that)
var gcRateMult=1; //golden cookie spawn rate multiplier
var clickWait=20; //requires this amount of milliseconds after each click to have passed to click again
var initCastFindSeason=null //season for finding casts; if null, the same as setSeason
var hasSettingsSet=0; //whether there is a saved preferred settings
var pureWriteSave=true; //whether CCCEM saving will be invoked upon Game.WriteSave(); true is dont invoke

Game.WriteSave();
    
//overrides Game.Notify so can force long lasting notifs even under quick notifs
eval('Game.Notify='+Game.Notify.toString().replace('noLog','noLog,forceDur').replace('quick=Math.min(6,quick);',`if (typeof forceDur === 'undefined') { quick=Math.min(6,quick); }`));
    
eval('Game.shimmerTypes.golden.popFunc='+Game.shimmerTypes.golden.popFunc.toString().replace('if ((me.wrath==0 && Math.random()<0.15) || Math.random()<0.05)', 'for (let i = 0; i < randomFloor(0.05 * DFChanceMult + (me.wrath==0?(0.15*DFChanceMult):0)); i++)'));
    
eval('Game.shimmerTypes.golden.getTimeMod='+Game.shimmerTypes.golden.getTimeMod.toString().replace('m*=0.99;', 'm*=0.99; m *= (1 / gcRateMult)'));
    
l('bigCookie').removeEventListener('click', Game.ClickCookie);
eval('Game.ClickCookie='+Game.ClickCookie.toString().replace('now-Game.lastClick<1000/((e?e.detail:1)===0?3:50)', 'now-Game.lastClick<clickWait'));
AddEvent(l('bigCookie'), 'click', Game.ClickCookie);

//gets rid of language select
Game.ClosePrompt();

//literally just orteils code, idk man couldnt be bothered to dynamically copy the part of the code over, its not like anyone is using cccem with other mods anywyays
function retrieveSave(data, ignoreVersionIssues) {
    if (typeof data!=='undefined') str=unescape(data);
			else
			{
				if (App)
				{
					App.getMostRecentSave(function(data){Game.LoadSave(data,true);});
					return false;
				}
				if (Game.useLocalStorage)
				{
					var local=localStorageGet(Game.SaveTo);
					if (!local)//no localstorage save found? let's get the cookie one last time
					{
						if (document.cookie.indexOf(Game.SaveTo)>=0)
						{
							str=unescape(document.cookie.split(Game.SaveTo+'=')[1]);
							document.cookie=Game.SaveTo+'=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
						}
						else return false;
					}
					else
					{
						str=unescape(local);
					}
				}
				else//legacy system
				{
					if (document.cookie.indexOf(Game.SaveTo)>=0) str=unescape(document.cookie.split(Game.SaveTo+'=')[1]);//get cookie here
					else return false;
				}
			}
    str = str.replace('!END!', '');
    console.log(str);
    return b64_to_utf8(str);
}
var currentSave = retrieveSave();

//literally also just orteils code but in part
function customSave() {
    let str = currentSave.replace('!END!', '');
    str = str.replace(/\|\|(.*)/, str.match(/\|\|.*?\|\|/))
    str+=Game.saveModData();
    if (Game.useLocalStorage)
				{
					//so we used to save the game using browser cookies, which was just really neat considering the game's name
					//we're using localstorage now, which is more efficient but not as cool
					//a moment of silence for our fallen puns
					str=utf8_to_b64(str)+'!END!';
					if (str.length<10)
					{
						Game.Notify('Saving failed!','Purchasing an upgrade and saving again might fix this.<br>This really shouldn\'t happen; please notify Orteil on his tumblr.');
					}
					else
					{
						str=escape(str);
						localStorageSet(Game.SaveTo,str);//aaand save
						if (App) App.save(str);
						if (!localStorageGet(Game.SaveTo))
						{
							Game.Notify(loc("Error while saving"),loc("Export your save instead!"));
						}
						else if (document.hasFocus())
						{
							Game.Notify(loc("Game saved"),'','',1,1);
						}
					}
				}
				else//legacy system
				{
					//that's right
					//we're using cookies
					//yeah I went there
					var now=new Date();//we storin dis for 5 years, people
					now.setFullYear(now.getFullYear()+5);//mmh stale cookies
					str=utf8_to_b64(str)+'!END!';
					Game.saveData=escape(str);
					str=Game.SaveTo+'='+escape(str)+'; expires='+now.toUTCString()+';';
					document.cookie=str;//aaand save
					if (App) App.save(str);
					if (document.cookie.indexOf(Game.SaveTo)<0)
					{
						Game.Notify("Failed to save CCCEM settings","Force close the game (or reload on web) to return to your save.",'',0,1);
					}
					else if (document.hasFocus())
					{
						Game.Notify(loc("Game saved"),'','',1,1);
					}
				}
    console.log('CCCEM Settings saved!');
}

function IntegratedSettingsGrail() {
  Game.bakeryNameSet('grail moments')
  iniLoadSave=false 
  buildingRelList=  [[-8, -33, -17, -17, -17, -26, -13, -20, -19, -19, -14, -23, -20, -12, -16, -32, -47, -39, -24],0,
                    [-18, -22, -17, -17, -17, -19, -21, -18, -24, -16, -13, -27, -12, -15, -17, -34, -46, -33, -31],0]
  buildingRelListEB=[[-4, -36, -17, -17, -18, -22, -17, -19, -19, -11, -25, -20, -20, -15, -16, -26, -51, -39, -28],-2,
                    [-18, -22, -18, -17, -17, -19, -20, -21, -22, -5, -28, -23, -14, -16, -17, -26, -53, -34, -33],1]
  Game.specialTab="dragon";
}

function PresetSettingsGrail() {
  console.warn('preset settings grail triggered');
  Game.bakeryNameSet('grail moments')
  iniSeed='R';
  iniLoadSave=false 
  iniC=4e69
  iniCE=1e78 
  iniP=1e22
  iniLumps=105 
  iniBC=1095; 
  wizCount=951; 
  wizLevel=10; 
  buildingRelList=  [[-8, -33, -17, -17, -17, -26, -13, -20, -19, -19, -14, -23, -20, -12, -16, -32, -47, -39, -24],0,
                    [-18, -22, -17, -17, -17, -19, -21, -18, -24, -16, -13, -27, -12, -15, -17, -34, -46, -33, -31],0]
  buildingRelListEB=[[-4, -36, -17, -17, -18, -22, -17, -19, -19, -11, -25, -20, -20, -15, -16, -26, -51, -39, -28],-2,
                    [-18, -22, -18, -17, -17, -19, -20, -21, -22, -5, -28, -23, -14, -16, -17, -26, -53, -34, -33],1]
  useEB=false
  useRebuy=0
  seedNats=true
  seedTicker=true
  GCCount=77777
  iniRein=0
  chooseLump=0 
  d1Aura=13 
  d2Aura=4 
  forceFtHoF='blood frenzy'
  gardenSeed=14
  gardenLevel=10;
  gardenP1=[6, 60]
  gardenP2=[17, 60]
  setGardenR=''
  officeL=5 
  spirit1=1 
  spirit2=4 
  spirit3=6 
  iniSpawn=true
  iniGC=19
  iniDO=false 
  iniDEoRL=false 
  iniTimer=0 
  iniF=true 
  iniFdur=600
  iniDH=true 
  iniDHdur=600
  iniBSCount=0
  iniBSdur=600
  fortuneG=0 
  forceFortune=0.04
  boughtSF=0 
  boughtCE=0 
  setSeason=183
  initCastFindSeason=null
  setPledge=true 
  buyOption1=1
  buyOption2=4
  Game.specialTab="dragon";
  if (typeof hasFinder != 'undefined') { code = 'b^blood frenzy'; codes = compile(code); }
  };

function IntegratedSettingsConsist() {
 IntegratedSettingsGrail();
 Game.bakeryNameSet('preset consistency')
    iniLoadSave='Mi4wNTJ8fDE2ODY0NDE5MDA0MTg7MTYwMzQ2NjgwMjcyMDsxNjg2NjQ4OTQ5MjcxO3ByZXNldCBjb25zaXN0ZW5jeTttaG9mYjswLDEsMCwwLDAsMCwwfDAxMTEwMDEwMTAxMTAwMTEwMTAxMDExMTAxMXw2LjA0NDM0MTA5NTQxMTAwNGUrNjQ7MS4wMDEwNTE5ODEzMzI1MTA5ZSs2NTs1OTsyNzc3NzsxLjQzODUxNDE0NzAxMTYyMDllKzYwOzM2MTsyMzszMTsxLjEwMDAwMDU5MDQ2NTk3NDJlKzY2OzA7NDsxMDE1NjE7MDstMTsxMTY7Nzs2LjE0NDEzMDgxMTE2MjI5NGUrNTU7NTsxNDsyOy0xOzE7OzA7MDsxMDMyMjgwMzAwMTYxMjY2MzAwOzU0MjM3Nzc2NTc2MjUwNDIwMDsyNTk0Mjg3MzE4Nzk2NTI4MDswOzA7NTM7NTI7NjQxOzIyMjs2Mzk7Mjc7MDswOzQ7NjU7MDswOzcxOzE0NzsxNjg2NTk1MDEwNDk5OzA7MTsyMjc7NDE7MDsxOzIuMjU0MzA3Mzc0NzM2MzA0ZSs1NTs1MDswOzA7fDEwMTEsMTM2MSwzLjY2MDg3NDYyMjAxMzQxNWUrNTcsMTIsLDAsMTAxMTsxMDAzLDEzNTMsMi4yODQ1MDgxNTI4MjQ5MjY3ZSs1NiwwLCwxLDEwMDM7OTY2LDEzMTYsNC4xMzcxNjM4MDU2MDA2NDVlKzU2LDcsMTY4NjY0ODk5NjIyMzoxOjE2ODY0NDMxMzg4MjE6MDowOjA6MTowOjE2ODY0NDE5MDA0NDQ6IDEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAgMDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6LDAsOTY2Ozk0NiwxMjk2LDkuOTI3Mjk3ODc3NjY0MTQzZSs1NiwwLCwxLDk0Njs5MTksMTI2OSw2LjM2NDE3ODg3NjQ1NDUwOGUrNTUsMCwsMSw5MTk7ODkxLDEyNDEsNy41MDgyNjE1NjI1MjI2NGUrNTQsMSwwOjA6MTowOjE6IDM3ODI6MTo3OTo0OjA6MDowOjAhMjY0OjQ6LTg2OjQyODowOjA6MDowITMyMDA6MTotNDI6NTgwOjA6MDowOjAhNDMzODoxOjEzOjM5NjowOjA6MDowITI1NTI6NDotMTA1OjIyMTowOjA6MDowITQwODg6MjotMTI1OjE1MTowOjA6MDowITc5NzU6MTo0NzoyOTA6MDowOjA6MCE5MzQwOjE6NDI6MTk3OjA6MDowOjAhNzYyNTo1OjEyOjU0MTowOjA6MDowITMzNDY6NDotOTY6NjA4OjA6MDowOjAhMTA2MjE6MTo3OjQ1MTowOjA6MDowITEyNTEwOjE6LTM6MTgzOjA6MDowOjAhMTMxNjE6MToxOjQ2OTowOjA6MDowITEzMjY0OjA6LTI6NDA2OjA6MDowOjAhMTM4NjQ6NTotOToyMTU6MDowOjA6MCExNzkwODozOjQwOjU2NTowOjA6MDowITgzMzI6NDotODU6NTYxOjA6MDowOjAhMTY3Mzk6NDotMTAyOjU0NTowOjA6MDowISAxLDAsODkxOzg5MSwxMjQxLDYuODI0NzMwNTQ3ODY0MDczZSs1NiwxLC0xLy0xLy0xIDMgMTY4NjQ0MTkwMDQ0OSAxLDAsODkxOzg1NywxMjA3LDMuNDUzMzY1MTY1NTA0NjQyZSs1NCwyLDQzLjY2OTAwMTIyNTQyNDg5IDAgNzM0NiAxLDAsODU3Ozg0NywxMTk3LDUuNDYwODkwNjU1MzY3NjU4ZSs1MywwLCwxLDg0Nzs4MTksMTE2OSwxLjY4NzI4MDIxNDg2Njk4NWUrNTQsMCwsMSw4MTk7ODEwLDExNjAsMS45NDQ0NzQ3ODUzOTM2NDllKzU2LDAsLDEsODEwOzc5MiwxMTQyLDYuNTA3NDc1NzI4MDA4NjAzZSs1NiwwLCwxLDc5Mjs3NzMsMTEyMywxLjM3NjMzOTgyNTg4MDQxMDJlKzU2LDAsLDEsNzczOzc1NiwxMTA2LDQuMjIzMTQzNDUxODg3NTA2ZSs1NiwwLCwxLDc1Njs3MzcsMTA4Nyw0LjcxNjg4NDc5NTI5NjUzOGUrNTYsMCwsMSw3Mzc7NzIxLDEwNzEsMS43MTMxMTYxNDY2NTY5MTVlKzU3LDAsLDEsNzIxOzY4MSwxMDMxLDUuNTkyNTI2MTY2NzY0NDc2ZSs1NywwLCwxLDY4MTs2NDUsOTk1LDQuNzU4MzU2MzI4MzQyODgxZSs1NiwwLCwxLDY0NTs2MjAsOTcwLDEuMjE0NTc4MjIzNTIxNTllKzU3LDAsLDEsNjIwOzYwMCw5NTAsMi43ODcwNzgwNDg0NDU1ODg2ZSs1NywwLCwwLDYwMDt8MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDEwMTAxMDEwMTAxMDEwMTExMTExMTExMTEwMDExMTExMTAwMTAxMTExMDExMTExMTEwMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMDExMTExMTExMTExMTExMTExMTAxMDEwMTAxMDEwMTAxMTEwMDAxMDEwMTAxMDEwMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAwMTEwMTAxMDEwMTAxMDExMTExMTExMTExMTExMTEwMTAxMDEwMDAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMDEwMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMTEwMTAxMDEwMTAwMDAwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDAwMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAwMDAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTExMDAxMTExMTExMTExMTExMTExMTExMTAwMDAwMDAxMDEwMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAwMTExMTExMDEwMTAxMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAwMTExMTExMTExMTExMTEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDExMTExMTExMTExMTExMTExMDEwMTAxMDEwMTAxMTExMTAxMTExMTEwMTExMTExMTExMTExMTExMTExMTExMDExMTExMTEwMTAwMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTAxMTExMTEwMDExMTExMTExMDAwMDAwMDAwMDAwMTExMXwxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTExMTEwMDAwMDAwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMDExMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMDAwMDAwMDAwMDAxMTEwMTExMTExMTExMTEwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTExMTExMDAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTEwMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDAxMDEwMDAxMTEwMDAxMTExMTExMTExMTExMDExMTAxMTExMTExMTExMTExMTEwMDAwMDAxMTExfHw%3D%21END%21'
  Game.specialTab="dragon";
}
 
function PresetSettingsConsist() {
  PresetSettingsGrail();
  Game.bakeryNameSet('preset consistency')
  iniSeed='R';
  iniLoadSave='Mi4wNTJ8fDE2ODY0NDE5MDA0MTg7MTYwMzQ2NjgwMjcyMDsxNjg2NjQ4OTQ5MjcxO3ByZXNldCBjb25zaXN0ZW5jeTttaG9mYjswLDEsMCwwLDAsMCwwfDAxMTEwMDEwMTAxMTAwMTEwMTAxMDExMTAxMXw2LjA0NDM0MTA5NTQxMTAwNGUrNjQ7MS4wMDEwNTE5ODEzMzI1MTA5ZSs2NTs1OTsyNzc3NzsxLjQzODUxNDE0NzAxMTYyMDllKzYwOzM2MTsyMzszMTsxLjEwMDAwMDU5MDQ2NTk3NDJlKzY2OzA7NDsxMDE1NjE7MDstMTsxMTY7Nzs2LjE0NDEzMDgxMTE2MjI5NGUrNTU7NTsxNDsyOy0xOzE7OzA7MDsxMDMyMjgwMzAwMTYxMjY2MzAwOzU0MjM3Nzc2NTc2MjUwNDIwMDsyNTk0Mjg3MzE4Nzk2NTI4MDswOzA7NTM7NTI7NjQxOzIyMjs2Mzk7Mjc7MDswOzQ7NjU7MDswOzcxOzE0NzsxNjg2NTk1MDEwNDk5OzA7MTsyMjc7NDE7MDsxOzIuMjU0MzA3Mzc0NzM2MzA0ZSs1NTs1MDswOzA7fDEwMTEsMTM2MSwzLjY2MDg3NDYyMjAxMzQxNWUrNTcsMTIsLDAsMTAxMTsxMDAzLDEzNTMsMi4yODQ1MDgxNTI4MjQ5MjY3ZSs1NiwwLCwxLDEwMDM7OTY2LDEzMTYsNC4xMzcxNjM4MDU2MDA2NDVlKzU2LDcsMTY4NjY0ODk5NjIyMzoxOjE2ODY0NDMxMzg4MjE6MDowOjA6MTowOjE2ODY0NDE5MDA0NDQ6IDEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAgMDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6LDAsOTY2Ozk0NiwxMjk2LDkuOTI3Mjk3ODc3NjY0MTQzZSs1NiwwLCwxLDk0Njs5MTksMTI2OSw2LjM2NDE3ODg3NjQ1NDUwOGUrNTUsMCwsMSw5MTk7ODkxLDEyNDEsNy41MDgyNjE1NjI1MjI2NGUrNTQsMSwwOjA6MTowOjE6IDM3ODI6MTo3OTo0OjA6MDowOjAhMjY0OjQ6LTg2OjQyODowOjA6MDowITMyMDA6MTotNDI6NTgwOjA6MDowOjAhNDMzODoxOjEzOjM5NjowOjA6MDowITI1NTI6NDotMTA1OjIyMTowOjA6MDowITQwODg6MjotMTI1OjE1MTowOjA6MDowITc5NzU6MTo0NzoyOTA6MDowOjA6MCE5MzQwOjE6NDI6MTk3OjA6MDowOjAhNzYyNTo1OjEyOjU0MTowOjA6MDowITMzNDY6NDotOTY6NjA4OjA6MDowOjAhMTA2MjE6MTo3OjQ1MTowOjA6MDowITEyNTEwOjE6LTM6MTgzOjA6MDowOjAhMTMxNjE6MToxOjQ2OTowOjA6MDowITEzMjY0OjA6LTI6NDA2OjA6MDowOjAhMTM4NjQ6NTotOToyMTU6MDowOjA6MCExNzkwODozOjQwOjU2NTowOjA6MDowITgzMzI6NDotODU6NTYxOjA6MDowOjAhMTY3Mzk6NDotMTAyOjU0NTowOjA6MDowISAxLDAsODkxOzg5MSwxMjQxLDYuODI0NzMwNTQ3ODY0MDczZSs1NiwxLC0xLy0xLy0xIDMgMTY4NjQ0MTkwMDQ0OSAxLDAsODkxOzg1NywxMjA3LDMuNDUzMzY1MTY1NTA0NjQyZSs1NCwyLDQzLjY2OTAwMTIyNTQyNDg5IDAgNzM0NiAxLDAsODU3Ozg0NywxMTk3LDUuNDYwODkwNjU1MzY3NjU4ZSs1MywwLCwxLDg0Nzs4MTksMTE2OSwxLjY4NzI4MDIxNDg2Njk4NWUrNTQsMCwsMSw4MTk7ODEwLDExNjAsMS45NDQ0NzQ3ODUzOTM2NDllKzU2LDAsLDEsODEwOzc5MiwxMTQyLDYuNTA3NDc1NzI4MDA4NjAzZSs1NiwwLCwxLDc5Mjs3NzMsMTEyMywxLjM3NjMzOTgyNTg4MDQxMDJlKzU2LDAsLDEsNzczOzc1NiwxMTA2LDQuMjIzMTQzNDUxODg3NTA2ZSs1NiwwLCwxLDc1Njs3MzcsMTA4Nyw0LjcxNjg4NDc5NTI5NjUzOGUrNTYsMCwsMSw3Mzc7NzIxLDEwNzEsMS43MTMxMTYxNDY2NTY5MTVlKzU3LDAsLDEsNzIxOzY4MSwxMDMxLDUuNTkyNTI2MTY2NzY0NDc2ZSs1NywwLCwxLDY4MTs2NDUsOTk1LDQuNzU4MzU2MzI4MzQyODgxZSs1NiwwLCwxLDY0NTs2MjAsOTcwLDEuMjE0NTc4MjIzNTIxNTllKzU3LDAsLDEsNjIwOzYwMCw5NTAsMi43ODcwNzgwNDg0NDU1ODg2ZSs1NywwLCwwLDYwMDt8MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDEwMTAxMDEwMTAxMDEwMTExMTExMTExMTEwMDExMTExMTAwMTAxMTExMDExMTExMTEwMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMDExMTExMTExMTExMTExMTExMTAxMDEwMTAxMDEwMTAxMTEwMDAxMDEwMTAxMDEwMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAwMTEwMTAxMDEwMTAxMDExMTExMTExMTExMTExMTEwMTAxMDEwMDAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMDEwMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMTEwMTAxMDEwMTAwMDAwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDAwMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAwMDAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTExMDAxMTExMTExMTExMTExMTExMTExMTAwMDAwMDAxMDEwMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAwMTExMTExMDEwMTAxMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAwMTExMTExMTExMTExMTEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDExMTExMTExMTExMTExMTExMDEwMTAxMDEwMTAxMTExMTAxMTExMTEwMTExMTExMTExMTExMTExMTExMTExMDExMTExMTEwMTAwMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTAxMTExMTEwMDExMTExMTExMDAwMDAwMDAwMDAwMTExMXwxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTExMTEwMDAwMDAwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMDExMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMDAwMDAwMDAwMDAxMTEwMTExMTExMTExMTEwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTExMTExMDAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTEwMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDAxMDEwMDAxMTEwMDAxMTExMTExMTExMTExMDExMTAxMTExMTExMTExMTExMTEwMDAwMDAxMTExfHw%3D%21END%21'
  iniLumps=105 
  chooseLump=0 
  d1Aura=13 
  d2Aura=9
  forceFtHoF='click frenzy'
  gardenSeed=14
  gardenP1=[6, 60]
  gardenP2=[17, 60]
  gardenLevel=7
  officeL=5 
  spirit1=2
  spirit2=8
  spirit3=6
  iniSpawn=true
  iniGC=19
  iniDO=false 
  iniDEoRL=false 
  iniTimer=0 
  iniF=true 
  iniDH=true 
  fortuneG=0 
  forceFortune=0.04
  boughtSF=0 
  boughtCE=0 
  setSeason=183
  initCastFindSeason=null
  setPledge=true 
  Game.specialTab="dragon";
  };

function IntegratedSettingsBSScry() {
  IntegratedSettingsGrail();
  Game.bakeryNameSet('preset BS scry')
  iniLoadSave='Mi4wNTJ8fDE2ODY0NDE5MDA0MTg7MTYwMzQ2NjgwMjcyMDsxNjg2NjQ5MDYyMTM5O3ByZXNldCBCUyBzY3J5O21ob2ZiOzAsMSwwLDAsMCwwLDB8MDExMTAwMTAxMDExMDAxMTAxMDEwMTExMDExfDkuNTkyMzU0NDg3MzcwOTFlKzY2OzEuMDAwMDAwMDAwMTkwNjUwNWUrNzE7NTk7Mjc3Nzc7MS40Mzg1MTQxNDcwMTE2MjA5ZSs2MDszNjA7MjM7MzE7MS4xMDAwMDA1OTA0NjU5NzQyZSs2NjswOzU7MTA2Nzk1OzA7LTE7MTE2OzEwOzEuMDUxOTI0NTMzMjM3MDkxMWUrNTQ7NDsxNDs0Oy0xOzE7OzA7MDsxMDMyMjgwMzAwMTYxMjY2MzAwOzU0MjM3Nzc2NTc2MjUwNDIwMDsyNTk0Mjg3MzE4Nzk2NTI4MDswOzA7NTM7NTI7NjQxOzIyMjs2Mzk7Mjc7MDswOzQ7NjU7MDswOzg2OzE0NzsxNjg2NTk1MDEwNDk5OzA7MTsyMjc7NDE7MDsxOzIuNTU0OTA2NTg1ODQ1OTI4M2UrNTc7NTA7MDswO3wxMDQxLDI1NDEsMy45Mjc3MTQ2Mzc0MjE3MjdlKzU5LDEwLCwwLDEwNTE7MTAzMywxMzgzLDIuNTE1MTk1MjYyNzk1MDUxZSs1OCwwLCwxLDEwMzM7MTAxNiwxMzY2LDUuMzUyNDIxMTAzODYyMTU4ZSs1OCw4LDE2ODY2NDkxNTU1NDY6MToxNjg2NDQzMTM4ODIxOjA6MDowOjE6MDoxNjg2NDQxOTAwNDQ0OiAxMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwIDA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOiwwLDEwMTY7OTk2LDEzNDYsMS4yNzQ4OTI5NzE4NTcyMzIzZSs1OSwwLCwxLDk5Njs5NjksMTMxOSw4LjAwNzA3Mzk3NTQxNjM1OWUrNTcsMCwsMSw5Njk7OTQxLDEyOTEsOS4xOTgwNjY1MDIyNjQwMzJlKzU2LDEsNDowOjE6MDoxOiAzOTA3OjM6NjE6MzUwOjA6MDowOjAhMjQ4OjQ6LTkxOjQyMTowOjA6MDowITMxMTU6MTotMjQ6NTczOjA6MDowOjAhMzcxNjoxOjM2OjM4OTowOjA6MDowITE0MzM6NDotMTE1OjIxNDowOjA6MDowITQwMzg6MjotOTA6MTQ0OjA6MDowOjAhODM3MDoxOjY5OjI4MzowOjA6MDowITkyNzQ6MTo1NDoxOTA6MDowOjA6MCE2ODk4OjU6MTA6NTM0OjA6MDowOjAhMjQ0OjQ6LTEyNjo2MDE6MDowOjA6MCExMDg5OToxOjEyOjQ0NDowOjA6MDowITEyNjYxOjE6MjM6MTc2OjA6MDowOjAhMTM0ODc6MToxOjQ2MjowOjA6MDowITEyOTg0OjA6LTI6Mzk5OjA6MDowOjAhMTMyNzY6NTotODk6MjA4OjA6MDowOjAhMTk4ODU6Mzo1NTo1NTg6MDowOjA6MCE2OTU1OjQ6LTk0OjU1NDowOjA6MDowITE0MTQxOjQ6LTEyNTo1Mzg6MDowOjA6MCEgMSwwLDk0MTs5NDEsMTI5MSw4LjkwNzI5MTUzNDM3MDYzZSs1OCwxLC0xLy0xLy0xIDMgMTY4NjQ0MTkwMDQ0OSAxLDAsOTQxOzg1NywxMjA3LDMuOTY5NjIxNjc2MTcyNTkzZSs1NiwyLDYyLjY3MDc0ODQxNjk4NTc0IDAgNzM0NiAxLDAsODU3Ozg5NywxMjQ3LDYuMjgzMzIyMDEzMzkzMDIyZSs1NSwwLCwxLDg5Nzs4NjksMTIxOSwxLjk1MDAzMzU1ODU2MDM3NzdlKzU2LDAsLDEsODY5Ozg2MCwxMjEwLDIuNDMyODY1ODI4OTE2OTI0MmUrNTgsMCwsMSw4NjA7ODQyLDExOTIsOC4zODE5NDUzNDY4MjMyNTVlKzU4LDAsLDEsODQyOzgyMywxMTczLDEuNjM2NzgwMzQ5OTkwNTk5MmUrNTgsMCwsMSw4MjM7ODA2LDExNTYsNS4yOTYwOTg2MjM0MjkzMDdlKzU4LDAsLDEsODA2Ozc4NywxMTM3LDUuODM0MzI0MDQwODc2ODA4ZSs1OCwwLCwxLDc4Nzs3NzEsMTEyMSwyLjEzMDYwNjA1MDI5Mzk2NjZlKzU5LDAsLDEsNzcxOzczMSwxMDgxLDcuMzYyMDk5ODcyODQ5NDI3NWUrNTksMCwsMSw3MzE7Njk1LDEwNDUsNy4zOTQzNDc3MzM4OTM0MmUrNTgsMCwsMSw2OTU7NjYwLDEwMTAsMi41OTMwNzgwOTE0NjcxNjkzZSs1OSwwLCwxLDY2MDs2NTAsMTAwMCw0LjkxMTYzMzc3OTQ5NTA1NWUrNTksMCwsMCw2NTA7fDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMDEwMTAxMDEwMTAxMDExMTExMTExMTExMDAxMTExMTEwMDEwMTExMTAxMTExMTExMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDAxMTExMTExMTExMTExMTExMTEwMTAxMDEwMTAxMDEwMTExMDAwMTAxMDEwMTAxMDEwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMDExMDEwMTAxMDEwMTAxMTExMTExMTExMTExMTExMDEwMTAxMDAwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDAxMDAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTExMDEwMTAxMDEwMDAwMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAwMDEwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMDAwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTAwMTExMTExMTExMTExMTExMTExMTEwMDAwMDAwMTAxMDEwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMDExMTExMTAxMDEwMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMTExMTExMTExMTExMTExMTAxMDEwMTAxMDEwMTExMTEwMTExMTExMDExMTExMTExMTExMTExMTExMTExMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTExMTExMDExMDExMTExMTExMTExMDEwMTAxMDExMTF8MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTExMDAwMDAwMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMTExMTAxMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTAwMDAwMDAwMDAwMTExMDExMTExMTExMTExMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTExMTAwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTExMDEwMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTExMTExMTAwMTExMTExMXx8%21END%21'
  Game.specialTab="dragon";
}
 
function PresetSettingsBSScry() {
  PresetSettingsGrail();
  Game.bakeryNameSet('preset BS scry')
  iniSeed='R';
  iniLoadSave='Mi4wNTJ8fDE2ODY0NDE5MDA0MTg7MTYwMzQ2NjgwMjcyMDsxNjg2NjQ5MDYyMTM5O3ByZXNldCBCUyBzY3J5O21ob2ZiOzAsMSwwLDAsMCwwLDB8MDExMTAwMTAxMDExMDAxMTAxMDEwMTExMDExfDkuNTkyMzU0NDg3MzcwOTFlKzY2OzEuMDAwMDAwMDAwMTkwNjUwNWUrNzE7NTk7Mjc3Nzc7MS40Mzg1MTQxNDcwMTE2MjA5ZSs2MDszNjA7MjM7MzE7MS4xMDAwMDA1OTA0NjU5NzQyZSs2NjswOzU7MTA2Nzk1OzA7LTE7MTE2OzEwOzEuMDUxOTI0NTMzMjM3MDkxMWUrNTQ7NDsxNDs0Oy0xOzE7OzA7MDsxMDMyMjgwMzAwMTYxMjY2MzAwOzU0MjM3Nzc2NTc2MjUwNDIwMDsyNTk0Mjg3MzE4Nzk2NTI4MDswOzA7NTM7NTI7NjQxOzIyMjs2Mzk7Mjc7MDswOzQ7NjU7MDswOzg2OzE0NzsxNjg2NTk1MDEwNDk5OzA7MTsyMjc7NDE7MDsxOzIuNTU0OTA2NTg1ODQ1OTI4M2UrNTc7NTA7MDswO3wxMDQxLDI1NDEsMy45Mjc3MTQ2Mzc0MjE3MjdlKzU5LDEwLCwwLDEwNTE7MTAzMywxMzgzLDIuNTE1MTk1MjYyNzk1MDUxZSs1OCwwLCwxLDEwMzM7MTAxNiwxMzY2LDUuMzUyNDIxMTAzODYyMTU4ZSs1OCw4LDE2ODY2NDkxNTU1NDY6MToxNjg2NDQzMTM4ODIxOjA6MDowOjE6MDoxNjg2NDQxOTAwNDQ0OiAxMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwIDA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOiwwLDEwMTY7OTk2LDEzNDYsMS4yNzQ4OTI5NzE4NTcyMzIzZSs1OSwwLCwxLDk5Njs5NjksMTMxOSw4LjAwNzA3Mzk3NTQxNjM1OWUrNTcsMCwsMSw5Njk7OTQxLDEyOTEsOS4xOTgwNjY1MDIyNjQwMzJlKzU2LDEsNDowOjE6MDoxOiAzOTA3OjM6NjE6MzUwOjA6MDowOjAhMjQ4OjQ6LTkxOjQyMTowOjA6MDowITMxMTU6MTotMjQ6NTczOjA6MDowOjAhMzcxNjoxOjM2OjM4OTowOjA6MDowITE0MzM6NDotMTE1OjIxNDowOjA6MDowITQwMzg6MjotOTA6MTQ0OjA6MDowOjAhODM3MDoxOjY5OjI4MzowOjA6MDowITkyNzQ6MTo1NDoxOTA6MDowOjA6MCE2ODk4OjU6MTA6NTM0OjA6MDowOjAhMjQ0OjQ6LTEyNjo2MDE6MDowOjA6MCExMDg5OToxOjEyOjQ0NDowOjA6MDowITEyNjYxOjE6MjM6MTc2OjA6MDowOjAhMTM0ODc6MToxOjQ2MjowOjA6MDowITEyOTg0OjA6LTI6Mzk5OjA6MDowOjAhMTMyNzY6NTotODk6MjA4OjA6MDowOjAhMTk4ODU6Mzo1NTo1NTg6MDowOjA6MCE2OTU1OjQ6LTk0OjU1NDowOjA6MDowITE0MTQxOjQ6LTEyNTo1Mzg6MDowOjA6MCEgMSwwLDk0MTs5NDEsMTI5MSw4LjkwNzI5MTUzNDM3MDYzZSs1OCwxLC0xLy0xLy0xIDMgMTY4NjQ0MTkwMDQ0OSAxLDAsOTQxOzg1NywxMjA3LDMuOTY5NjIxNjc2MTcyNTkzZSs1NiwyLDYyLjY3MDc0ODQxNjk4NTc0IDAgNzM0NiAxLDAsODU3Ozg5NywxMjQ3LDYuMjgzMzIyMDEzMzkzMDIyZSs1NSwwLCwxLDg5Nzs4NjksMTIxOSwxLjk1MDAzMzU1ODU2MDM3NzdlKzU2LDAsLDEsODY5Ozg2MCwxMjEwLDIuNDMyODY1ODI4OTE2OTI0MmUrNTgsMCwsMSw4NjA7ODQyLDExOTIsOC4zODE5NDUzNDY4MjMyNTVlKzU4LDAsLDEsODQyOzgyMywxMTczLDEuNjM2NzgwMzQ5OTkwNTk5MmUrNTgsMCwsMSw4MjM7ODA2LDExNTYsNS4yOTYwOTg2MjM0MjkzMDdlKzU4LDAsLDEsODA2Ozc4NywxMTM3LDUuODM0MzI0MDQwODc2ODA4ZSs1OCwwLCwxLDc4Nzs3NzEsMTEyMSwyLjEzMDYwNjA1MDI5Mzk2NjZlKzU5LDAsLDEsNzcxOzczMSwxMDgxLDcuMzYyMDk5ODcyODQ5NDI3NWUrNTksMCwsMSw3MzE7Njk1LDEwNDUsNy4zOTQzNDc3MzM4OTM0MmUrNTgsMCwsMSw2OTU7NjYwLDEwMTAsMi41OTMwNzgwOTE0NjcxNjkzZSs1OSwwLCwxLDY2MDs2NTAsMTAwMCw0LjkxMTYzMzc3OTQ5NTA1NWUrNTksMCwsMCw2NTA7fDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMDEwMTAxMDEwMTAxMDExMTExMTExMTExMDAxMTExMTEwMDEwMTExMTAxMTExMTExMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDAxMTExMTExMTExMTExMTExMTEwMTAxMDEwMTAxMDEwMTExMDAwMTAxMDEwMTAxMDEwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMDExMDEwMTAxMDEwMTAxMTExMTExMTExMTExMTExMDEwMTAxMDAwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDAxMDAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTExMDEwMTAxMDEwMDAwMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAwMDEwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMDAwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTAwMTExMTExMTExMTExMTExMTExMTEwMDAwMDAwMTAxMDEwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMDExMTExMTAxMDEwMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMTExMTExMTExMTExMTExMTAxMDEwMTAxMDEwMTExMTEwMTExMTExMDExMTExMTExMTExMTExMTExMTExMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTExMTExMDExMDExMTExMTExMTExMDEwMTAxMDExMTF8MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTExMDAwMDAwMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMTExMTAxMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTAwMDAwMDAwMDAwMTExMDExMTExMTExMTExMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTExMTAwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTExMDEwMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTExMTExMTAwMTExMTExMXx8%21END%21'
  iniLumps=103 
  chooseLump=0 
  d1Aura=13 
  d2Aura=4
  forceFtHoF='building special'
  gardenSeed=14
  gardenP1=[17, 60]
  gardenP2=[6, 60]
  gardenLevel=8
  officeL=4
  spirit1=1
  spirit2=4
  spirit3=6
  iniSpawn=true
  iniGC=19
  iniDO=false 
  iniDEoRL=false 
  iniTimer=0 
  iniF=true 
  iniDH=true 
  fortuneG=0 
  forceFortune=0.04
  boughtSF=0 
  boughtCE=0 
  setSeason=183
  initCastFindSeason=null
  setPledge=true 
  Game.specialTab="dragon";
  };
    
var limitedReset = false;
var noLoadCCCEMData = false;
 
function ResetGame(toFindRaw) {
  Game.popups=0;
  if (!(typeof Game.Objects.Temple.minigame === "undefined")){Game.Objects.Temple.minigame.slot=[Game.Objects.Temple.minigame.slot[0],Game.Objects.Temple.minigame.slot[1],Game.Objects.Temple.minigame.slot[2]]}; //fixes import corruption before importing the save
  if (iniLoadSave!=false) {
    var isSpecialTab=Game.specialTab
    noLoadCCCEMData=true;
    Game.ImportSaveCode(iniLoadSave); 
    noLoadCCCEMData=false;
    iniCE=Game.cookiesEarned
    Game.specialTab=isSpecialTab
    Game.Objects['Wizard tower'].level = wizLevel - 1;
    Game.Objects['Wizard tower'].levelUp(true);
    Game.Objects['Farm'].level = gardenLevel - 1;
    Game.Objects['Farm'].levelUp(true);
    } 
  else {
    for (var i in Game.Upgrades) 
      {
        if (Game.Upgrades[i].pool=='toggle' || Game.Upgrades[i].pool == 'debug') {}
        else Game.Upgrades[i].earn();
      }
    Game.SetAllAchievs(1);
    Game.MaxSpecials();
    Game.nextResearch=0;
    Game.researchT=-1;
    var buildCount=iniBC;
    var rebuy=useRebuy
    if (toFindRaw) rebuy=0
    if (!useEB || toFindRaw) {buildCount+=buildingRelList[rebuy+1]} else {buildCount+=buildingRelListEB[rebuy+1]}
    var num=0
    for (var i = 0; i < Object.keys(Game.Objects).length; i++)
      {
        if (buildCount<0) buildCount=0;
        Game.ObjectsById[i].amount=buildCount; 
        if (i==7) {num+=wizCount} else {num+=buildCount};
        if (!useEB || toFindRaw) {buildCount+=buildingRelList[rebuy][i]} else {buildCount+=buildingRelListEB[rebuy][i]}; 
      }
    Game.BuildingsOwned=num
    Game.cookies=iniC;
    Game.cookiesEarned=iniCE;
    Game.prestige=iniP;
    
    for (var i = 0; i < Object.keys(Game.Objects).length; i++)
      {
        var me=Game.ObjectsById[i];
        if (i==0) {me.level=19;} else if (i==7) {me.level=wizLevel-1;} else if (i==2) { me.level=gardenLevel-1; } else {me.level=9; };
        me.levelUp(true);
      }
    };
  Game.prefs.autosave=0;
  Game.ObjectsById[7].amount=wizCount
  Game.Upgrades['Chocolate egg'].bought=boughtCE;
  Game.Upgrades['Sugar frenzy'].bought=boughtSF;
  Game.popups=0
  if (setSeason!=0) Game.UpgradesById[setSeason].earn(); else { Game.UpgradesById[182].clickFunction();Game.UpgradesById[183].clickFunction();Game.UpgradesById[184].clickFunction();Game.UpgradesById[185].clickFunction();Game.UpgradesById[209].clickFunction(); Game.season = ""; }
  if (setPledge!=false) Game.UpgradesById[74].earn();
  if (!Game.Has('Golden switch [on]')) {Game.UpgradesById[332].earn();Game.UpgradesById[331].bought = 0;}
  Game.seasonUses=0;
  Game.upgradesToRebuild=1;
  Game.recalculateGains=1;
  Game.storeBulkButton(buyOption1);
  Game.storeBulkButton(buyOption2);
  
  Game.killBuffs();
  Game.killShimmers(); 
  Game.shimmerTypes.golden.last=''
  Game.goldenClicks=GCCount
  Game.reindeerClicked=iniRein
  Game.cookieClicks=0
  Game.fortuneGC=fortuneG
  Game.fortuneCPS=1
  Game.lumpCurrentType=chooseLump;
  Game.computeLumpTimes();
  Game.lumpT=Date.now()-Game.lumpRipeAge;
  Game.dragonAura=(toFindRaw?0:d1Aura)
  Game.dragonAura2=(toFindRaw?0:d2Aura)
  Game.TickerAge=0;
  
  Game.Logic();
  Game.popups=1;
  };
 
function ResetMinigames(toFindRaw) {
  if (toFindRaw) {Game.popups=0}
  for (var i = 0; i < Object.keys(Game.Objects).length; i++)
    {
      var me=Game.ObjectsById[i];
      if (me.minigame && me.minigame.onRuinTheFun) me.minigame.onRuinTheFun();
      if (muteBuildings[i]==0 || me.minigame && unmuteMinigames) {me.muted=0;me.switchMinigame(1)} else {me.muted=1;};
    }
  Game.lumps=iniLumps;
  Game.Objects['Wizard tower'].minigame.magicM=Math.floor(4+Math.pow(wizCount,0.6)+Math.log((wizCount+(wizLevel-1)*10)/15+1)*15);
  Game.Objects['Wizard tower'].minigame.magic=Game.Objects['Wizard tower'].minigame.magicM
  Game.lumpRefill=0;
  var gardenR=setGardenR?setGardenR:Math.floor(Math.random()*4+1)

  for (var y=0;y<6;y++) {
    for (var x=0;x<6;x++) {
      if (!Game.Objects['Farm'].minigame.isTileUnlocked(x,y)) { Game.Objects['Farm'].minigame.plot[y][x]=[0,0]; continue; }
      if ((gardenR>=3 && (x+gardenR)%2) || (gardenR<3 && (y+gardenR)%2)) {Game.Objects['Farm'].minigame.plot[y][x]=[gardenP1[0], gardenP1[1]]} else {Game.Objects['Farm'].minigame.plot[y][x]=[gardenP2[0], gardenP2[1]]}
      }
    }
  Game.Objects['Farm'].minigame.freeze=0;
  Game.Objects['Farm'].minigame.soil=2;
  if (toFindRaw) {Game.Objects['Farm'].minigame.harvestAll(); Game.Objects['Farm'].minigame.computeEffs()}
  Game.Objects['Farm'].minigame.nextStep=window.PForPause?window.PForPause.cumulativeRealTime:Date.now()
  if (!toFindRaw) {Game.Objects['Farm'].minigame.logic(); let nextTick = (window.PForPause?window.PForPause.cumulativeRealTime:Date.now())+(toNextTick?toNextTick:Math.round(Math.random()*900))*1000;
  if (!limitedReset) { Game.Objects['Farm'].minigame.nextStep=nextTick } else { MacadamiaModList.cccem.mod.nextTickRPC.send({ time: nextTick }); } }
  Game.Objects['Farm'].minigame.seedSelected=gardenSeed;
  Game.Objects.Farm.minigame.buildPlot();
  Game.Objects.Farm.minigame.buildPanel();
  
  Game.Objects['Bank'].minigame.reset();
  Game.Objects['Bank'].minigame.officeLevel=officeL;
 
  Game.Objects['Temple'].minigame.reset();
  Game.Objects['Temple'].minigame.dragging=Game.Objects['Temple'].minigame.godsById[(toFindRaw?0:spirit1)];
  Game.Objects['Temple'].minigame.slotGod(Game.Objects['Temple'].minigame.godsById[(toFindRaw?0:spirit1)], 0);
  var div=l('templeGod'+(toFindRaw?0:spirit1));
  div.className='ready templeGod titleFont';
  div.style.transform='none';
  l('templeSlot'+0).appendChild(div);
  Game.Objects['Temple'].minigame.dragging=Game.Objects['Temple'].minigame.godsById[(toFindRaw?0:spirit2)];
  Game.Objects['Temple'].minigame.slotGod(Game.Objects['Temple'].minigame.godsById[(toFindRaw?0:spirit2)], 1);
  var div=l('templeGod'+(toFindRaw?0:spirit2));
  div.className='ready templeGod titleFont';
  div.style.transform='none';
  l('templeSlot'+1).appendChild(div);
  Game.Objects['Temple'].minigame.dragging=Game.Objects['Temple'].minigame.godsById[(toFindRaw?0:spirit3)];
  Game.Objects['Temple'].minigame.slotGod(Game.Objects['Temple'].minigame.godsById[(toFindRaw?0:spirit3)], 2);
  var div=l('templeGod'+(toFindRaw?0:spirit3));
  div.className='ready templeGod titleFont';
  div.style.transform='none';
  l('templeSlot'+2).appendChild(div);
  Game.Objects['Temple'].minigame.dragging=false;
  Game.Objects['Temple'].minigame.swaps=3
  if (toFindRaw) {Game.Objects['Temple'].minigame.reset();};
  
  Game.popups=1;
  };
    
function setGrimoireCasts() {
  if (typeof hasFinder === 'undefined') {
  for (var i = 0; i < ((forceFtHoF=='random' || forcedCastCount[1])?0:9999); i++) {
    Math.seedrandom(Game.seed+'/'+i);
    if (Math.random()<(1-0.15)) {
      Math.random();
      Math.random();
      if ((initCastFindSeason ?? setSeason) == 209 || (initCastFindSeason ?? setSeason) == 184) { Math.random(); } 
      var choices=[];
      choices.push('frenzy','multiply cookies');
      if (!Game.hasBuff('Dragonflight')) choices.push('click frenzy');
      if (Math.random()<0.1) choices.push('cookie storm','cookie storm','blab');
      if (Game.BuildingsOwned>=10 && Math.random()<0.25) choices.push('building special');
      if (Math.random()<0.15) choices=['cookie storm drop'];
      if (Math.random()<0.0001) choices.push('free sugar lump');
      var chosen=choose(choices);
      if (chosen!=forceFtHoF) {continue;};
      Game.Objects['Wizard tower'].minigame.spellsCastTotal=i
      Game.Notify('Successfully found a '+forceFtHoF,'Your seed is '+Game.seed,[11,5]);
      break
      }
    else {
      Math.random();
      Math.random();
      if ((initCastFindSeason ?? setSeason) == 209 || (initCastFindSeason ?? setSeason) == 184) { Math.random(); } 
      var choices=[];
      choices.push('clot','ruin cookies');
      if (Math.random()<0.1) choices.push('cursed finger','blood frenzy');
      if (Math.random()<0.003) choices.push('free sugar lump');
      if (Math.random()<0.1) choices=['blab'];
      var chosen=choose(choices);
      if (chosen!=forceFtHoF) {continue;};
      Game.Objects['Wizard tower'].minigame.spellsCastTotal=i
      Game.Notify('Successfully found a '+forceFtHoF,'Your seed is '+Game.seed,[11,5])
      break
      }
    }
  if (forceFtHoF=='random' && !forcedCastCount[1]) {Game.Notify('FtHoF randomized','Your seed is '+Game.seed,[0, 7]);Game.Objects['Wizard tower'].minigame.spellsCastTotal = 0;}
  else if (chosen!=forceFtHoF && !forcedCastCount[1]) {Game.Notify('Failed to find a '+forceFtHoF,'Your seed is '+Game.seed,[15, 5])} else if (forcedCastCount[1]) {Game.Objects['Wizard tower'].minigame.spellsCastTotal=forcedCastCount[0];Game.Notify('FtHoF set','Cast count (all time): '+forcedCastCount[0],[22,11]);}
  } else if (autoExecute && !usingPreload) {
    Math.seedrandom(Game.seed+'+execute');
    let casting = interpret(Math.floor(Math.sqrt(Math.random())*limit), chooseSequence());
  if (typeof casting != 'boolean' && !(casting instanceof cfExcep)) { 
    Game.Objects['Wizard tower'].minigame.spellsCastTotal = casting; 
    //if (hasHarbor) { MacadamiaModList.cccem.mod.setGrimoireRPC.send({ seed: Game.seed, spellsCastTotal: Game.Objects['Wizard tower'].minigame.spellsCastTotal }); }
    Game.Objects['Wizard tower'].minigame.spellsCast = 0; 
  }
  } else if (usingPreload) {
    loadPreLoadedSeeds();
    Game.Notify('Preloaded seeds loaded!','',0)
  }
  if (hasHarbor ) { MacadamiaModList.cccem.mod.setGrimoireRPC.send({ seed: Game.seed, spellsCastTotal: Game.Objects['Wizard tower'].minigame.spellsCastTotal }); }
}
 
function SpawnGoldenCookies(noSpawn) {
  if (iniSB==true) Game.gainBuff('sugar blessing',24*60*60,1);
  var priorVol=Game.volume
  Game.volume=0
    
  if (hasHarbor && !netcodeSettingsExport.hosting) { return; }
    
  if (!noSpawn) {
    var newShimmer=new Game.shimmer('golden',{noWrath:true});
    newShimmer.spawnLead=1; 
    Game.shimmerTypes.golden.spawned=1;
    Game.Logic();
  }
  Game.killShimmers();
  Game.volume=priorVol
  var effectDurMod=GetEffectDurMod();
  if (!noSpawn) {
    if (iniDO==true) 
    {
    var newShimmer=new Game.shimmer('golden',{noWrath:setPledge});
    if (iniGC2!='R') newShimmer.force=Game.goldenCookieChoices[iniGC2].toLowerCase();
    };
  if (iniSpawn==true) 
    {
    var newShimmer=new Game.shimmer('golden',{noWrath:setPledge}); 
    newShimmer.spawnLead=1; 
    Game.shimmerTypes.golden.spawned=1;
    if (iniGC!='R') newShimmer.force=Game.goldenCookieChoices[iniGC].toLowerCase();
    };
  if (iniDEoRL==true) 
    {
    var newShimmer=new Game.shimmer('golden',{noWrath:setPledge});
    if (iniGC3!='R') newShimmer.force=Game.goldenCookieChoices[iniGC3].toLowerCase();
    };
  }
  for (var i in Game.shimmerTypes) {me=Game.shimmerTypes[i]; me.time=iniTimer};
  if (iniF==true) {Game.gainBuff('frenzy',(77*effectDurMod<iniFdur)?iniFdur:77*effectDurMod,7); Game.buffs['Frenzy'].time=iniFdur*Game.fps};
  if (iniDH==true) {Game.gainBuff('dragon harvest',(60*effectDurMod<iniDHdur)?iniDHdur:60*effectDurMod,15); Game.buffs['Dragon Harvest'].time=iniDHdur*Game.fps};
  
  var list=[];
  for (var i in Game.Objects) {if (Game.Objects[i].amount>=10) list.push(Game.Objects[i].id);}
  var len=Math.min(list.length, iniBSCount)
  var time=(30*effectDurMod<iniBSdur)?iniBSdur:30*effectDurMod
  for (var i=0; i<len; i++) {var obj=choose(list); list.splice(list.indexOf(obj), 1); Game.gainBuff('building buff',time,Game.ObjectsById[obj].amount/10+1,obj); Game.buffs[Game.goldenCookieBuildingBuffs[Game.ObjectsById[obj].name][0]].time=iniBSdur*Game.fps; }
  };

function ResetAll(manual) {
  if (hasHarbor && !netcodeSettingsExport.hosting) { MacadamiaModList.cccem.mod.tryAgainRequest.send(); return; }
  if (manual) {
    FindMaxComboPow();
    PrintScore();
    maxComboPow=1
    relComboPow=1
    maxBSCount=0
    maxGodz=1
  }
  let tempseed = Game.makeSeed();
  if (iniSeed=='R') {Game.seed=tempseed; } else {Game.seed=iniSeed;}; console.log(Game.seed);
  ResetGame(1);
  ResetMinigames(1);
  if (iniSeed=='R') {Game.seed=tempseed}
  Game.recalculateGains=1
  Game.Logic();
  if (!(typeof CCCEMUILoaded === "undefined")) {iniRaw=Game.cookiesPsRaw};
  ResetGame();
  ResetMinigames();
  if (iniSeed=='R') {Game.seed=tempseed}
  setGrimoireCasts();
  overrideBuildings(); Game.Logic();
  SpawnGoldenCookies();
  };

function overrideBuildings() {
  for (var i = 0; i < Object.keys(Game.Objects).length; i++)
      {
        if (manualBuildings[i] > 0) { Game.ObjectsById[i].amount=manualBuildings[i]; } 
        else if (manualBuildings[i] < 0) { Game.ObjectsById[i].amount=0; }
      }
}
function GetEffectDurMod() {
  var effectDurMod=1;
  if (Game.Has('Get lucky')) effectDurMod*=2;
  if (Game.Has('Lasting fortune')) effectDurMod*=1.1;
  if (Game.Has('Lucky digit')) effectDurMod*=1.01;
  if (Game.Has('Lucky number')) effectDurMod*=1.01;
  if (Game.Has('Green yeast digestives')) effectDurMod*=1.01;
  if (Game.Has('Lucky payout')) effectDurMod*=1.01;
  effectDurMod*=1+Game.auraMult('Epoch Manipulator')*0.05;
  if (setPledge) effectDurMod*=Game.eff('goldenCookieEffDur');
  else effectDurMod*=Game.eff('wrathCookieEffDur');

  if (Game.hasGod) {
    var godLvl=Game.hasGod('decadence');
    if (godLvl==1) effectDurMod*=1.07;
    else if (godLvl==2) effectDurMod*=1.05;
    else if (godLvl==3) effectDurMod*=1.02;
  };
  return effectDurMod
};

function CheckModLoaded() {
  if (typeof CCCEMUILoaded === "undefined") {var keepNotifs=Game.prefs.notifs; Game.prefs.notifs=0; Game.Notify('Mod partially not loaded','Try reloading and clearing mod data, and maybe try later',[15, 5]); Game.prefs.notifs=keepNotifs};
  };

var gameSettings = [];
function pushStoredGameSettings() {
  let p = Game.prefs;
  let strs = gameSettings;
  p.altDraw = strs[0]; p.askLumps = strs[1]; p.autosave = strs[2]; p.autoupdate = strs[3]; p.bgMusic = strs[4]; p.cloudSave = strs[5]; p.cookiesound = strs[6]; p.crates = strs[7]; p.cursors = strs[8]; p.customGrandmas = strs[9]; p.discordPresence = strs[10]; if(p.extraButtons != strs[11]) { p.extraButtons = strs[11]; Game.ToggleExtraButtons(); } if(p.fancy != strs[12]) { p.fancy = strs[12]; Game.ToggleFancy(); } p.filters = strs[13]; p.focus = strs[14]; p.milk = strs[15]; p.monospace = strs[16]; p.notif = strs[17]; p.notScary = strs[18]; p.numbers = strs[19]; p.particles = strs[20]; p.screenreader = strs[21]; p.showBackupWarning = strs[22]; p.wobbly = strs[23]; Game.volume = strs[24]; Game.volumeMusic = strs[25];
}
    
function getSettingsCode() { 
	let str = ">>CCCEMContainerTop<<";
    const s = '/';
    const p = Game.prefs;
    
    str += CCCEMVer + s
    str += iniSeed + s
    str += iniC + s
    str += iniCE + s
    str += iniP + s
    str += iniLumps + s
    str += iniBC + s
    for (let j = 0; j < 20; j++) {
      str += manualBuildings[j] + s
    }
    str += forceFtHoF + s
    str += wizCount + s
    str += wizLevel + s
    str += forcedCastCount[0] + s + forcedCastCount[1] + s
    str += toNextTick + s
    
    str += chooseLump + s + d1Aura + s + d2Aura + s + seedNats + s + seedTicker + s + gardenSeed + s + gardenP1[0] + s + gardenP1[1] + s + gardenP2[0] + s + gardenP2[1] + s + setGardenR + s + officeL + s + spirit1 + s + spirit2 + s + spirit3 + s + iniGC + s + iniGC2 + s + iniGC3 + s + iniDO + s + iniDEoRL + s + iniF + s + iniDH + s + iniDHdur + s + iniBSCount + s + iniBSdur + s + iniSB + s + buyOption1 + s + buyOption2 + s + forceFortune + s
      
    str += GCCount + s + iniRein + s + iniSpawn + s + iniTimer + s + iniFdur + s + fortuneG + s + boughtSF + s + boughtCE + s + setSeason + s + setPledge + s
    for (let j = 0; j < 20; j++) {
      str += muteBuildings[j] + s
    }
    str += unmuteMinigames + s
    str += useEB + s + useRebuy + s
    
    str += p.altDraw + s + p.askLumps + s + p.autosave + s + p.autoupdate + s + p.bgMusic + s + p.cloudSave + s + p.cookiesound + s + p.crates + s + p.cursors + s + p.customGrandmas + s + p.discordPresence + s + p.extraButtons + s + p.fancy + s + p.filters + s + p.focus + s + p.milk + s + p.monospace + s + p.notif + s + p.notScary + s + p.numbers + s + p.particles + s + p.screenreader + s + p.showBackupWarning + s + p.wobbly + s
    console.log('volume: '+ Game.volume);
    str += Game.volume + s + Game.volumeMusic + s
    str += autoSaveCCCEM + s + DFChanceMult + s + gcRateMult + s + clickWait + s + gardenLevel + s + ((initCastFindSeason == null)?'n':initCastFindSeason);
    str += ">>ContainerEnd<<"
    
    return str;
}

function setSettings(str) { 
	CCCEMContainerModObj.load(str, true);
}

var CCCEMContainerModObj = null;
Game.registerMod('CCCEMContainer', {
  init:function() { CCCEMContainerModObj = this; },
  save:function() { 
    if (!pureWriteSave) {
    	return getSettingsCode();
    }
    return '';
  },
  load:function(str, noNotify) {
    if (noLoadCCCEMData) { return; }
    str = str.replace('>>CCCEMContainerTop<<', ''); str = str.replace('>>ContainerEnd<<', '');
    console.log(str)
    if (str != '') {
    let strs = str.split('/');
    let manualProcessing = [];
    for (let j in strs) {
      if(!isNaN(parseFloat(strs[j])) && !manualProcessing.includes(j)) { strs[j] = parseFloat(strs[j]); } else if 
          (strs[j] == "true") { strs[j] = true; } else if (strs[j] == "false") 
          { strs[j] = false } else if (strs[j] == 'NaN') 
          { strs[j] = NaN } else if (strs[j] == 'undefined') 
          { strs[j] = undefined } else if (strs[j] == 'null') 
          { strs[j] = null }
    }
        
    if (strs[0] !== CCCEMVer && !noNotify) { 
    	if (strs[0][0] === 'v' && !isNaN(parseInt(strs[0][1]))) { 
        	Game.Notify('Saved CCCEM settings wiped!','Because of an update that affected the saving system, your CCCEM settings was wiped to prevent corrupting the host save.',[30,5],20,0,1);
        } else {
        	//was settings before 2.46
            Game.Notify('Saved CCCEM settings wiped!','Your CCCEM settings was wiped to prevent corrupting the host save. If you experienced an issue where host save gets corrupted upon saving settings, it should be fixed now.',[30,5],20,0,1);
        }
        Game.deleteModData('CCCEMContainer'); Game.WriteSave(); return 0;
    }    
    if (strs[0] !== CCCEMVer && noNotify) { 
    	Game.Notify('Warning', 'You imported a settings code from an older version, which may cause some values to be set to bad values. Re-setting such values should usually fix the problem. Code version: '+strs[0]+'; current version: '+strs[1]+'.', 0);
    }
    if (strs.length < 123) { return 0; }
    
      hasSettingsSet = 1;
      iniSeed = strs[1]
      iniC = strs[2]
      iniCE = strs[3]
      iniP = strs[4]
      iniLumps = strs[5]
      iniBC = strs[6]
      for (let j = 0; j < 20; j++) {
          manualBuildings[j] = strs[7+j]
      }
      forceFtHoF = strs[27]
      wizCount = strs[28]
      wizLevel = strs[29]
      forcedCastCount[0] = strs[30]
      forcedCastCount[1] = strs[31]
      toNextTick = strs[32]
      chooseLump = strs[33]; d1Aura = strs[34]; d2Aura = strs[35]; seedNats = strs[36]; seedTicker = strs[37]; gardenSeed = strs[38]; gardenP1[0] = strs[39]; gardenP1[1] = strs[40]; gardenP2[0] = strs[41]; gardenP2[1] = strs[42]; setGardenR = strs[43]; officeL = strs[44]; spirit1 = strs[45]; spirit2 = strs[46]; spirit3 = strs[47]; iniGC = strs[48]; iniGC2 = strs[49]; iniGC3 = strs[50]; iniDO = strs[51]; iniDEoRL = strs[52]; iniF = strs[53]; iniDH = strs[54]; iniDHdur = strs[55]; iniBSCount = strs[56]; iniBSdur = strs[57]; iniSB = strs[58]; buyOption1 = strs[59]; buyOption2 = strs[60]; forceFortune = strs[61];
      
      GCCount = strs[62]; iniRein = strs[63]; iniSpawn = strs[64]; iniTimer = strs[65]; iniFdur = strs[66]; fortuneG = strs[67]; boughtSF = strs[68]; boughtCE = strs[69]; setSeason = strs[70]; setPledge = strs[71]; 
      for (let j = 0; j < 20; j++) {
          muteBuildings[j] = strs[72+j]
      }
      unmuteMinigames = strs[92]
      useEB = strs[93]; useRebuy = strs[94]
      
      for (let j = 0; j < 26; j++) {
        gameSettings.push(strs[95+j]);
      }
      autoSaveCCCEM = strs[121];
      DFChanceMult = strs[122];
      gcRateMult = strs[123];
      clickWait = strs[124];
      strs[125] && (gardenLevel = strs[125]);
      strs[126] && (initCastFindSeason = (typeof strs[126] == 'string' && strs[126][0] == 'n')?null:parseInt(strs[126]));
    }
  }
    })

var cccemDir = window.locally_hosted?'./':'https://cursedsliver.github.io/CCCEM/';
if (Game.ready && !l('topbarFrenzy')) {
  pureWriteSave=false;
  Game.LoadMod(cccemDir+"cccemInterface.js");
  console.log(cccemDir+"cccemInterface.js");
  
  if (Game.chimeType==0 && !hasSettingsSet) {PresetSettingsConsist(); ResetGame(1); PresetSettingsGrail();} else if (hasSettingsSet) {IntegratedSettingsConsist(); ResetGame(1); IntegratedSettingsGrail(); pushStoredGameSettings(); } else {ResetGame(1);};
  if (!hasSettingsSet) { Game.Notify("CCCEM "+CCCEMVerReal+" Loaded!", "Your save will return upon closing the game.<br><b>Shift+click on interface buttons to view more information!</b><br>You can also cycle through options in the opposite direction by Ctrl+clicking.", [18, 6]) } else { Game.Notify("CCCEM "+CCCEMVerReal+" Loaded!", "Stored settings successfully loaded.<br><b>Shift+click on interface buttons to view more information!</b><br>You can also cycle through options in the opposite direction by Ctrl+clicking.", [19, 6]) }
  Game.prefs.autosave=0
  Game.bakeryNameSet('grail moments')
    
  Game.Reset();

  setTimeout(CheckModLoaded, 1900);
  setTimeout(ResetAll, 2000); 
} else if (!l('topbarFrenzy')) {console.log("mod launch halted, game not loaded")};

var hasHarbor = false; 
var produceGrades = true;

if (typeof Macadamia != 'undefined' && Macadamia) {
	class CCCEMHarbor extends Macadamia.Mod {
        async rpcBuilder() { 
            this.tryAgainRPC = this.createRPC('tryAgain');
            this.tryAgainRPC.setCallback(() => {
                console.log('executed: before');
                setTimeout(() => {
                console.log('executed!');
                produceGrades = false;
                limitedReset = true;
                ResetGame();
                window.DO_NOT_RPC = true;
                ResetMinigames();
                SpawnGoldenCookies(true);
                overrideBuildings();
                window.DO_NOT_RPC = false;
                limitedReset = false;
                produceGrades = true;
                }, 100);
            });
            
            this.tryAgainRequest = this.createRPC('tryAgainRequest');
            this.tryAgainRequest.setCallback(() => {
                if (netcodeSettingsExport.hosting) { ResetAll(); MacadamiaModList.cccem.mod.tryAgainRPC.send();}
            });
            
            this.syncSettingsRPC = this.createRPC('syncSettings');
            this.syncSettingsRPC.setCallback((arg) => {
           		setSettings(arg.code); 
                window.DO_NOT_RPC = true;
                RedrawCCCEM();
                window.DO_NOT_RPC = false;
            });
            
            this.setGrimoireRPC = this.createRPC('setGrimoire');
            this.setGrimoireRPC.setCallback((arg) => {
          		let M = Game.Objects['Wizard tower'].minigame;
                
                M.spellsCastTotal = arg.spellsCastTotal;
                M.spellsCast = 0;
                Game.seed = arg.seed;
            });
            
            this.nextTickRPC = this.createRPC('nextTick');
            this.nextTickRPC.setCallback((arg) => {
            	Game.Objects['Farm'].minigame.nextStep=arg.nextTick;
            });

            this.loadModRPC = this.createRPC('loadMod');
            this.loadModRPC.setCallback((arg) => {
            	Game.LoadMod(arg.path);
            });

            this.loadCastFinderRPC = this.createRPC('loadCastFinder');
            this.loadCastFinderRPC.setCallback((arg) => {
              if (hasFinder) { return; }
            	setupFinderIntegration();
            });
            
            hasHarbor = true;
        }
    }
    Macadamia.register(CCCEMHarbor, {
		uuid: "cccem",
		name: "CCCEM Harbor",
		description: "Syncs CCCEM interactions.",
		author: "CursedSliver",
		version: "1.0.0"
	});
}
//this curly brace is the if statement encompassing everything
}