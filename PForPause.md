# P For Pause
P For Pause is a mod that adds the ability to manipulate time itself in cookie clicker. As its name states, you can press **P** to **pause or unpause** the game, but you can also press **Shift+P** to slow down or speed up the game smoothly!

## Installation
<table>
  <colgroup>
    <col style="width:20%">
    <col style="width:30%">
    <col style="width:50%">
  </colgroup>
  <thead>
    <tr>
      <th>Method</th>
      <th>Code/Link</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>CCMM extension</td>
      <td>`https://cursedsliver.github.io/CCCEM/PForPause.js`</td>
      <td>Install the [CCMM extension](https://chromewebstore.google.com/detail/cookie-clicker-mod-manage/gehplcbdghdjeinldbgkjdffgkdcpned) and click the "Register new mod" box at the bottom. Paste the link into the URL field of the textbox that appears, then confirm.</td>
    </tr>
    <tr>
      <td>Bookmarklet</td>
      <td>`javascript:{(function(){Game.LoadMod('https://cursedsliver.github.io/CCCEM/PForPause.js');})();}`</td>
      <td>Input into the URL field of the bookmarklet, then click on the bookmark while on an instance of Cookie Clicker.</td>
    </tr>
    <tr>
      <td>Console command</td>
      <td>`javascript:{(function(){Game.LoadMod('https://cursedsliver.github.io/CCCEM/PForPause.js');})();}`</td>
      <td>[Open the developer console](https://balsamiq.com/support/troubleshooting-faqs/browser-console/) and paste the command into the console.</td>
    </tr>
    <tr>
      <td>Tampermonkey/Greasemonkey</td>
      <td>In the addendum section.</td>
      <td>Post the code in the addendum of this document to a new script on your userscript manager, such as Tampermonkey or Greasemonkey.</td>
    </tr>
    <tr>
      <td>Steam Workshop</td>
      <td>[https://steamcommunity.com/sharedfiles/filedetails/?id=3789272587](https://steamcommunity.com/sharedfiles/filedetails/?id=3789272587)</td>
      <td>Subscribe on Steam Workshop.</td>
    </tr>
  </tbody>
</table>

## Loading disclaimer
The vanilla game has minimal support for game speed adjustments, so this mod may break other mods. Try to put it late in the loading order, but before any big content or gameplay mods. If this doesn't work, try to put it as early as possible. 

If you speed up a lot and then unload the mod sugar lump growths WILL revert and show text such as "This sugar lump has been exposed to time travel shenanigans".

## Contact
If you encounter any bugs, or have feature requests and questions/concerns, you can make a pull request or DM @cursedsliver on discord (make sure that you don't misspell it!)

### Addendum
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