(function() { 
    if (!localStorageGet('CookieClickerLang')) { return; }
    window.locally_hosted = true;
    const interval = setInterval(() => { 
        if (Game.ready) { 
            Game.LoadMod('cccem.js');
            clearInterval(interval);
        }
    }, 10);
})()