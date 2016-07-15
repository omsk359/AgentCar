(function() {

// Localize jQuery variable
var jQuery;

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
            href: "http://82.196.1.193/agentcar.css" 
        });
        css_link.appendTo('head');
		
		// connect to our application
		var agentCarApp = new Asteroid("localhost:3000");
		
		// subscribe to the publication
		agentCarApp.subscribe('cars');
		
		var carsCollection = agentCarApp.getCollection('cars');
		var recentCars = carsCollection.reactiveQuery({});
		
		var ac_html = '<div class="agent_car_border"><div class="agent_car_body"><div class="agent_car_logo"></div></div></div>';
		var ac_logo = '<a href="#"><img src="http://82.196.1.193/agentcar.png" width="92" height="92" alt="AgentСar"/></a>';
		var ac_close = '<div class="agent_car_close"><a href="#" id="agent_car_close_x">X</a></div>';
		
		$( ".agent_car_widget" ).append( ac_html );
		$( ".agent_car_logo" ).append( ac_logo );
		$( ".agent_car_body" ).append( ac_close );

		recentCars.on('change', function() {
		  var result;
//		  $('.agent_car_body').empty();
		  result = recentCars.result;
		  result.forEach(function(result) {
		    $('.agent_car_body').append('<li>' + result.model + '</li>');
		  });
		});		

        /******* Load HTML *******/
        // var jsonp_url = "http://localhost/json.html";
        // $.getJSON(jsonp_url, function(data) {
        //   $('.agent_car_body').html("This data comes from another server: " + data.html);
        // });
    });
}

})(); // We call our anonymous function immediately