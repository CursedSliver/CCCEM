# P For Pause
P For Pause is a mod that adds the ability to manipulate time itself in cookie clicker. As its name states, you can press **P** to **pause or unpause** the game, but you can also press **Shift+P** to slow down or speed up the game smoothly!

## Installation
To install this mod, simply paste the following code into the console or put it in the URL field of a bookmarklet:
```js
javascript:{(function(){Game.LoadMod('https://cursedsliver.github.io/CCCEM/PForPause.js');})();}
```

If you use tampermonkey or greasemonkey, use the following userscript:
```js 
// ==UserScript==
// @name P For Pause
// @namespace PForPause
// @include https://orteil.dashnet.org/cookieclicker/
// @include https://cookieclicker.eu/cookieclicker/
// @grant none
// ==/UserScript==

window.eval("javascript:{(function(){Game.LoadMod('https://cursedsliver.github.io/CCCEM/PForPause.js');})();}");
```

## Loading disclaimer
The vanilla game has minimal support for game speed adjustments, so this mod may break other mods. Try to put it late in the loading order, but before any big content or gameplay mods. If this doesn't work, try to put it as early as possible. 

If you speed up a lot and then unload the mod sugar lump growths WILL revert and show text such as "This sugar lump has been exposed to time travel shenanigans".

## Contact
If you encounter any bugs, or have feature requests and questions/concerns, you can make a pull request or DM @cursedsliver on discord (make sure that you don't misspell it!)