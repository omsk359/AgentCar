// ==UserScript==
// @name           AgentCar
// @description    
// @version        1.0
// @include        *
// @run-at         document-end
// @grant GM_getValue
// @grant GM_setValue
// @grant GM_registerMenuCommand
// ==/UserScript==

console.log('AgentCar start');

var id = GM_getValue('agentCarId', 'kZD2WwvnheGtest1');

console.log('AgentCar id: ', id);

function changeId(newId) {
	if (id == newId) return;
	GM_setValue('agentCarId', newId);
	location.reload(false);
}

GM_registerMenuCommand('Lada', changeId.bind(null, 'kZD2WwvnheGtest1'), 'L');
GM_registerMenuCommand('Skoda', changeId.bind(null, 'kZD2WwvnheGtest3'), 'S');


var script = document.createElement('script');

script.src = '//debian359.tk/agentcar.js';
script.charset = 'UTF-8';
script.type = 'text/javascript';
script.setAttribute('data-id', id);

document.body.appendChild(script);

console.log('AgentCar added');


// if (typeof localStorage != 'undefined')
// 	localStorage.setItem('agentCarDebug', 1);
