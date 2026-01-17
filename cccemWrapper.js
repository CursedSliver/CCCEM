(function() { 
    const interval = setInterval(() => { 
        if (Game.ready) { 
            Game.LoadMod('cccem.js');
            clearInterval(interval);
        }
    }, 10);
})()