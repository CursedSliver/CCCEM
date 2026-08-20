const __CCCEM_INIT_FUNCTION__ = function() { 
    if (!localStorageGet('CookieClickerLang')) { return; }
    window.cccemDir = App?(this.dir+'/'):(window.locally_hosted?'./':'https://cursedsliver.github.io/CCCEM/');
    window.cccemSpritesheet = cccemDir+"cccemAsset.png";
    const supportedLang = [
        'EN'
    ];
    const curLang = localStorageGet('CookieClickerLang') ?? 'EN';
    Game.LoadMod(supportedLang.includes(curLang)?(cccemDir+'locPatches/'+(curLang)+'.js'):(cccemDir+'locPatches/'+('EN')+'.js'));
    Game.LoadMod(cccemDir+"locPatches/TEMP.js");
    const interval = setInterval(() => { 
        if (Game.ready && this.langLoaded) { 
            if (App) {
                this.prepSteam();
            }
            eval('Game.UpdateMenu='+Game.UpdateMenu.toString()
                .replace('if (App && App.writeModUI)', 'str += Game.mods[\'CCCEMLoader\'].getMenuStr(); if (App && App.writeModUI)')
                .replace('Game.toSave=true;Game.toQuit=true;', 'Game.toSave=true;Game.toQuit=true;if (window.PRACTICE_MODE) { Game.toSave=false; window.prepareWarn(); }')
                .replace('"Save & Quit"', 'window.PRACTICE_MODE?\'Quit\':\'Save & Quit\'')
            );
            if (!App) { this.initialize(); }
            clearInterval(interval);
        }
    }, 10);
    Game.Notify('Loading...', '', 0);
    const cccemTimeoutErrors = {
        EN: 'CCCEM failed to load relevant localization files for language '+curLang+'. Please check your internet connection.\nForce close the game (or reload on web) to return to your save.\nIf this issue persists, and it is not because of blocking policies, report at https://github.com/cursedsliver/CCCEM/issues alongside relevant details.'
    };
    const timeout = setTimeout(() => { 
        if (this.langLoaded) { return; }
        alert(cccemTimeoutErrors[curLang] ?? cccemTimeoutErrors['EN']);
        clearInterval(interval);
    }, 8000);
    window.prepareWarn = function() {
        setTimeout(() => {
            Game.Prompt('<id prepareWarn><noClose><h3>'+loc('Exit error')+'</h3><div class="line"></div><div class="block">'+
                loc('It appears that exiting failed. To exit, manually close the game via the default button for closing any window in your OS, or use the Task Manager, then reopen the game. As far as we know this is an issue in the game itself and is not fixable.')
            +'</div>', []);
        }, 1000);
    }
    window.attemptRestoreSaveFromCCCEM = function() { 
        try { if (localStorageGet('CCCEMBackup')) { 
            Game.LoadSave(localStorageGet('CCCEMBackup'), true);
        } } catch(e) {
            Game.Notify(loc('Failed to restore save from backup.'), e.message, 0);
        }
    }
};

(function() { 
    const int = setInterval(() => { 
        if (!(typeof Game !== 'undefined' && Game && Game.ready)) { return; }

        Game.registerMod('CCCEMLoader', {
            init: __CCCEM_INIT_FUNCTION__,
            langLoaded: false,
            initializationAllowed: true,
            saveToDestination: '',
            registerLang: function(a, b, c) {
                AddLanguage(a, b, c, true);
                this.langLoaded = true;
            },
            prepSteam: function() {
                Game.Notify(loc('CCCEM ready'), loc('Go to the options menu to enter practice mode!'), 0);
                window.locally_hosted = true;
            },
            initialize: function() {
                if (!this.initializationAllowed) { return; }
                let toModWarn = false;
                this.saveToDestination = Game.SaveTo;
                Game.SaveTo = 'GARBAGE';
                const allowedMods = [
                    'CCCEMLoader',
                    'CCCEMContainer',
                    'P for Pause',
                    'CastFinder',
                    'Crumbs engine'
                ];
                for (let i in Game.mods) { 
                    if (!allowedMods.includes(i)) {
                        toModWarn = true;
                        break;
                    }
                }
                if (toModWarn) {
                    this.modWarn();
                } else {
                    this.triggerInit();
                }
            },
            triggerInit: function() {
                this.initializationAllowed = false;
                Game.LoadMod(cccemDir + 'cccemCore.js');
            },
            modWarn: function() {
                Game.Prompt('<id modWarn><noClose><h3>'+loc('Hold up!')+'</h3><div class="block">'+
                    loc('It looks like you have other unknown mods enabled alongside CCCEM.')+
                    '<div class="line"></div>'+
                    loc('Most likely it won\'t cause any issues, but if you want to really make sure of the integrity of your save, you should unload them or back up your save first.')+
                    '</div>'
                , [
                    [loc('I know what I\'m doing!'), 'Game.mods[\'CCCEMLoader\'].triggerInit(); Game.ClosePrompt();'],
                    [App?loc('Open mod menu'):loc('Reload game'), 'if (App) { App.modsPopup(); } else { location.reload(); }'],
                    [loc('Export save'), 'Game.ExportSave();'],
                    [loc('Cancel'), 'Game.ClosePrompt();']
                ]);
                //I could focus the cancel button here but... hmmmm
            },
            getMenuStr() {
                let str = '';
                str += '<div class="subsection"><div class="title">' + loc('CCCEM') + '</div><div class="block" style="text-align: center;">';
                if (App) { 
                    str += '<a class="smallFancyButton" style="font-size: 150%; padding: 8px 12px; ' + (!window.PRACTICE_MODE ? '' : 'opacity: 0.5; border: 1px solid gray;') + '" onclick="Game.mods[\'CCCEMLoader\'].initialize();">' + loc('Enter practice mode') + '</a>';
                    str += '<div class="listing" style="color:rgba(255,255,255,0.5); font-size:12px;">' + loc('Entering practice mode will load you into a new save that can be adjusted by a new interface at top left of the screen. Your save will be restored when you exit practice mode, which you can do here.') + '</div>';
                    str += '<div class="line"></div>';

                    str += '<div class="listing" style="color:rgba(255,255,255,0.5); font-size:12px;">' + (window.PRACTICE_MODE ? loc('You are currently in practice mode.') : loc('You are currently NOT in practice mode.')) + '</div>';

                    str += '<a class="smallFancyButton" style="' + (window.PRACTICE_MODE ? '' : 'opacity: 0.5; border: 1px solid gray;') + '" onclick="if (window.PRACTICE_MODE) { Game.toReload = true; window.prepareWarn(); }">' + loc('Exit practice mode') + '</a>';
                    str += '<a class="smallFancyButton" style="' + (window.PRACTICE_MODE ? '' : 'opacity: 0.5; border: 1px solid gray;') + '" onclick="if (window.PRACTICE_MODE) { customSave(); Game.toReload = true; window.prepareWarn(); }">' + loc('Save settings & exit practice mode') + '</a>';
                } else {
                    str += '<div class="listing" style="color:rgba(255,255,255,0.5); font-size:12px;">' + loc('To exit practice mode, simply unload the mod by reloading the game or removing it from your mod manager.') + '</div>';
                }
                str += '<div class="line"></div>';
                str += '<div class="listing" style="color:rgba(255,255,255,0.5); font-size:12px;">' + loc('Questions, concerns, or want to discuss? You will be most likely to find other CCCEM users <a href="%1" target="_blank">in the official cookie clicker discord server</a>. Channels are #cookie-clicker or #dashnet-modding.', 'https://discord.gg/cookie') + '</div>';
                if (localStorageGet && localStorageGet('CCCEMBackup')) { str += '<div class="line"></div>';
                str += '<div class="listing" style="color:rgba(255,255,255,0.5); font-size:12px;">' + loc('Lost your save to this mod? My apologies, but do try <a onclick="window.attemptRestoreSaveFromCCCEM();">loading from backup</a>!') + '</div>'; }
                str += '</div></div>';
                return str;
            },
            save: function () { },
            load: function () { }
        });
        clearInterval(int);
    }, 10);
})();