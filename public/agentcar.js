(function() {

// Localize jQuery variable
var jQuery;

var ACurl = "localhost:3000";
//var ACurl = "82.196.1.193";

/******** Load jQuery if not present *********/
if (window.jQuery === undefined || window.jQuery.fn.jquery !== '3.0.0') {
    var script_tag = document.createElement('script');
    script_tag.setAttribute("type","text/javascript");
    script_tag.setAttribute("src",
        "https://ajax.googleapis.com/ajax/libs/jquery/3.0.0/jquery.min.js");
    if (script_tag.readyState) {
      script_tag.onreadystatechange = function () { // For old versions of IE
          if (this.readyState == 'complete' || this.readyState == 'loaded') {
              scriptLoadHandler();
          }
      };
    } else {
      script_tag.onload = scriptLoadHandler;
    }
    // Try to find the head, otherwise default to the documentElement
    (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
} else {
    // The jQuery version on the window is the one we want to use
    jQuery = window.jQuery;
    main();
}

/******** Called once jQuery has loaded ******/
function scriptLoadHandler() {
    // Restore $ and window.jQuery to their previous values and store the
    // new jQuery in our local jQuery variable
    jQuery = window.jQuery.noConflict(true);
    // Call our main function
    main(); 
}

/******** Our main function ********/
function main() { 
    jQuery(document).ready(function($) { 
        /******* Load CSS *******/
        var css_link = $("<link>", { 
            rel: "stylesheet", 
            type: "text/css", 
            href: "http://" + ACurl + "/agentcar.css" 
        });
        css_link.appendTo('head');
		
		// connect to our application
		var agentCarApp = new Asteroid(ACurl);
		
		// subscribe to the publication
		agentCarApp.subscribe('cars');
		
		var carsCollection = agentCarApp.getCollection('cars');
		var recentCars = carsCollection.reactiveQuery({});
		
		var ac_html = '<div class="agent_car_border"><div class="agent_car_body"><form class="agent_car_form" action="" id="agent_car_form"></form><div class="agent_car_logo"></div></div></div>',
			ac_logo = '<a href="#"><img src="http://'+ ACurl +'/agentcar.png" width="92" height="92" alt="AgentСar"/></a>',
			ac_close = '<div class="agent_car_close"><a href="#" id="agent_car_close_x">X</a></div>',
			ac_form_want = '<div class="agent_car_group"><label for="agent_car_mark">Я хочу KIA</label><div class="agent_car_cell"><select name="agent_car_mark" id=""><option value="Любую">Любую</option><option value="picanto">Picanto</option><option value="Rio">Rio</option><option value="Ceed">Ceed</option><option value="Pro Ceed">Pro Ceed</option><option value="Sportage">Sportage</option></select></div></div>',
			ac_i_have = '<div class="agent_car_group"><label for="agent_car_i_have">У меня есть</label><div class="agent_car_cell"><input name="agent_car_i_have" id="agent_car_i_have" type="text" value=""/></div></div>',
			ac_i_credit = '<div class="agent_car_group"><label for="agent_car_credit">Я хочу кредит</label><div class="agent_car_cell"><input name="agent_car_credit" id="agent_car_credit" type="checkbox" value=""/></div></div>',
			ac_i_credit_pay = '<div class="agent_car_group" id="agent_car_credit_pay"><label for="agent_car_credit_pay">с ежимесячным платежом</label><div class="agent_car_cell"><input name="agent_car_credit_pay" id="agent_car_credit_pay" type="text" value="10000"/></div></div>',
			ac_i_credit_time = '<div class="agent_car_group" id="agent_car_credit_time"><label for="agent_car_credit_time">сроком на</label><div class="agent_car_cell"><select name="agent_car_credit_time" id="agent_car_credit_time"><option value="12">12</option><option value="24">24</option><option value="36">36</option><option value="60">60</option></select></div></div>',
			ac_trade_in = '<div class="agent_car_group"><label for="agent_car_trade_in">Хочу Trade-In</label><div class="agent_car_cell"><input name="agent_car_trade_in" id="agent_car_trade_in" type="checkbox" value=""/></div></div>',
			ac_cost = '<div class="agent_car_group" id="agent_car_my_car_cost"><label for="agent_car_my_car_cost">Моя машина стоит</label><div class="agent_car_cell"><input name="agent_car_my_car_cost" id="agent_car_my_car_cost" type="text" value=""/></div></div>',
			ac_run = '<div class="agent_car_group"><label for="agent_car_run_in">Рассматриваем авто с пробегом?</label><div class="agent_car_cell"><input name="agent_car_trade_in" type="checkbox" value=""/></div></div><input type="submit" name="go" class="agent_car_search" value="Что Вы можете мне предложить?"/>'
		
		$( ".agent_car_widget" ).append( ac_html );
		$( ".agent_car_logo" ).append( ac_logo );
		$( "#agent_car_form" ).append( ac_form_want, ac_i_have, ac_i_credit, ac_i_credit_pay, ac_i_credit_time, ac_trade_in, ac_cost, ac_run);
		$( "#agent_car_credit_pay" ).hide();
		$( "#agent_car_credit_time" ).hide();
		$( "#agent_car_my_car_cost" ).hide();
		
		$('#agent_car_credit').click(function() {
			$('#agent_car_credit_pay').toggle();
   			$('#agent_car_credit_time').toggle();
		});
		
		$('#agent_car_trade_in').click(function() {
			$('#agent_car_my_car_cost').toggle();
		});
		
		$('#agent_car_form').submit(function () {
			$('#agent_car_form').hide();
			var ac_form_i_have = $("input#agent_car_i_have").val(),
				ac_form_credit_pay = $("input#agent_car_credit_pay").val(),
				ac_form_credit_time = $("select#agent_car_credit_time").val(),
				ac_form_car_cost = $("input#agent_car_my_car_cost").val(),
				ac_form_cash = +ac_form_i_have + ac_form_credit_pay * ac_form_credit_time + +ac_form_car_cost,
				ac_return = '';
				
				switch(true) {
					case (ac_form_cash >= 470000 && ac_form_cash <= 530000): {
						ac_return = '<div class="agent_car_return"><h3>Мы нашли для вас</h3><div class="agent_car_return_"><img src="/img/picanto1.jpg" width="250"/></div></div>';
						break;
					}
					case (ac_form_cash > 530000 && ac_form_cash <= 610000): {
						ac_return = '<div class="agent_car_return"><h3>Мы нашли для вас</h3><div class="agent_car_return_"><img src="/img/picanto2.jpg" width="250"/></div></div>';
						break;
					}
					default: {
						ac_return = '<div class="ac_return"><h3>Сегодня мы не нашли для Вас автомобиль :( но, мы сообщим Вам сразу, когда он появится!</h3></div>';
						break;
					}
				}
				$( ".agent_car_body" ).append( ac_return );
			return false;
	    });		

// 		recentCars.on('change', function() {
// 		  var result;
// //		  $('.agent_car_body').empty();
// 		  result = recentCars.result;
// 		  result.forEach(function(result) {
// 		    $('.agent_car_body').append('<li>' + result.model + '</li>');
// 		  });
// 		});		

    });
}

})(); // We call our anonymous function immediately