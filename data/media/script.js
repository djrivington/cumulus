function getCity(inputLocation, callback) {
	var woeid = null;
	//Get woeid using location from settings input
	$.ajax({
		type : "GET",
		dataType : "json",
		url : "https://query.yahooapis.com/v1/public/yql?q=select woeid from geo.places(1) where text='" + inputLocation + "'&format=json",
		success : function(data) {
			woeid = data.query.results.place.woeid;
			$.ajax({
				type : "GET",
				dataType : "json",
				url : "https://query.yahooapis.com/v1/public/yql?q=select location from weather.forecast where woeid=" + woeid + "&format=json",
				success : function(data) {
					localStorage.cumulus_location = data.query.results.channel.location.city;
					callback(woeid);
				},
				error: function(data) {
					if (data.status === 0) {
						showError('network');
					}
				}
			})
		},
		error: function(data) {
			if (data.status === 0) {
				showError('network');
			}
		}
	});
}
$(document).ready(function() {
	//Filters Proprietary RSS Tags
	jQuery.fn.filterNode = function(name){
		return this.filter(function(){
			return this.nodeName === name;
		});
	};

	//APP START.
	init_settings();
	if (!localStorage.typhoon) {
		show_settings("location");
	} else {
		//Has been run before
		render(localStorage.typhoon);
		setInterval(function() {
			console.log("Updating Data...");
			$(".border .sync").click();
		}, 600000);
	}
});

function getWeatherData(woeid, callback) {
	//Get json using woeid got from yql
	$.ajax({
		type : "GET",
		dataType : "json",
		url: "https://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where woeid=" + woeid + "&format=json",
		success: function(data) {
			$('#errorMessage').fadeOut(350);
			callback(data);
		},
		error: function(data) {
			if (data.status === 0) {
				showError('network');
			}
		}
	});
}

function generateStats(data, callback) {
	//Weather Object
	weather = {};
	
	var channel = data.query.results.channel;
	var location = data.query.results.channel.location;
	var units = data.query.results.channel.units;
	var item = data.query.results.channel.item;
	var wind = data.query.results.channel.wind;
	var atmosphere = data.query.results.channel.atmosphere;

	//Location
	weather.city = location.city;
	weather.country = location.country;

	//Link
	weather.link = channel.link;

	//Temperature
	weather.temperature = item.condition.temp;
	weather.temperatureUnit = units.temperature;

	//Wind
	weather.windUnit = units.speed;
	weather.windSpeed = wind.speed;
	weather.windDirection = wind.direction;

	//Humidity
	weather.humidity = atmosphere.humidity;

	//Weekly Weather
	weekArr = item.forecast;
	weather.week = [];
	for (var i=0; i<5; i++) {
		weather.week[i] = {};
		weather.week[i].day = $(weekArr[i]).attr("day");
		weather.week[i].code = $(weekArr[i]).attr("code");
		weather.week[i].low = $(weekArr[i]).attr("low");
		weather.week[i].high = $(weekArr[i]).attr("high");
	}

	//Current Weather		var city = getCity(locationInput.val());		

	weather.code = item.condition.code;
	if (weather.code == "3200") {
		weather.code = weather.week[0].code;
	}

	if (callback) {
		callback(weather);
	}
}

//Converts Yahoo weather to icon font
function weather_code(a){var b={0:"(",1:"z",2:"(",3:"z",4:"z",5:"e",6:"e",7:"o",8:"3",9:"3",10:"9",11:"9",12:"9",13:"o",14:"o",15:"o",16:"o",17:"e",18:"e",19:"s",20:"s",21:"s",22:"s",23:"l",24:"l",25:"`",26:"`",27:"2",28:"1",29:"2",30:"1",31:"/",32:"v",33:"/",34:"v",35:"e",36:"v",37:"z",38:"z",39:"z",40:"3",41:"o",42:"o",43:"o",44:"`",45:"z",46:"o",47:"z",3200:"`"};return b[a];}

function init_settings() {

	//Prevents Dragging on certain elements
	$('.border .settings, .border .sync, .border .close, .border .minimize, #locationModal input, #locationModal .measurement span, #locationModal .speed span, #locationModal .loader, #locationModal a, #locationModal .color, #locationModal .btn, #errorMessage .btn, #city span, #locationModal img').mouseover(function() {
		document.title = "disabledrag";
	}).mouseout(function() {
		document.title = "enabledrag";
	}).click(function() {
		if ($(this).hasClass("close")) {
			document.title = 'close';
		} else if ($(this).hasClass("minimize")) {
			document.title = 'minimize';
		} else if ($(this).hasClass("settings")) {
			show_settings("all");
		} else if ($(this).hasClass("sync")) {
			render(localStorage.typhoon);
		}
	});

	//First Run
	var locationInput = $("#locationModal input");
	var typingTimer = 0;
	var doneTypingInterval = 1500;

	//on keyup, start the countdown
	locationInput.keyup(function(){
	    typingTimer = setTimeout(doneTyping, doneTypingInterval);
	}).keydown(function(){
	//on keydown, clear the countdown
	    clearTimeout(typingTimer);
	});

	function doneTyping() {
		$("#locationModal .loader").attr("class", "loading loader").html("|");
		getCity(locationInput.val(), function(cityCode) {
			if ( cityCode ) {
				$("#locationModal .loader").attr("class", "tick loader").html("&#10003;").attr("data-code", cityCode);
			} else {
				$("#locationModal .loader").attr("class", "loader").html("&#10005;");
			}
		});	

	}

	//This can only be run if there is a tick.
	$("#locationModal .loader").click(function() {
		if ($(this).hasClass("tick")) {
			localStorage.typhoon = $("#locationModal .loader").attr("data-code")
			render(localStorage.typhoon)
			show_settings("noweather")
			setInterval(function() {
				console.log("Updating Data...")
				$(".border .sync").click()
			}, 600000)
		}
	})

	// Sets up localstorage
	localStorage.typhoon_measurement = localStorage.typhoon_measurement || "c";
	localStorage.typhoon_speed = localStorage.typhoon_speed || "kph";
	localStorage.typhoon_color =  localStorage.typhoon_color || "gradient";
	localStorage.typhoon_launcher = localStorage.typhoon_launcher || "checked";

	$('#locationModal .measurement [data-type=' + localStorage.typhoon_measurement + ']').addClass('selected');
	$('#locationModal .speed [data-type=' + localStorage.typhoon_speed + ']').addClass('selected');

	//Sets up the Toggle Switches
	$('#locationModal .toggleswitch span').click(function() {
		$(this).parent().children().removeClass('selected');
		localStorage.setItem("typhoon_" + $(this).parent().attr("class").replace("toggleswitch ", ""), $(this).addClass('selected').attr("data-type"));
		$(".border .settings").hide();
	});

	//Color thing
	$('.color span').click(function() {
		localStorage.typhoon_color = $(this).attr("data-color");
		background(null);
	});
    $('.color span[data-color=gradient]').click(function() {
        $(".border .settings").hide();
    });
	

	if (localStorage.typhoon_launcher == "checked") {
		$('#locationModal .launcher input').attr("checked", "checked");
		document.title = "enable_launcher";
	}
	$('#locationModal .launcher input').click(function() {
		localStorage.typhoon_launcher = $('#locationModal .launcher input').attr("checked");
		if (localStorage.typhoon_launcher == "checked") {
			document.title = "enable_launcher";
		} else {
			document.title = "disable_launcher";
		}
	});

	//Control CSS.
	$("span[data-color]:not([data-color=gradient])").map(function() { $(this).css('background', '#' + $(this).attr("data-color")); });

	/* Error Message Retry Button */
	$('#errorMessage .btn').click(function() {
		render(localStorage.typhoon);
	});

}

function show_settings(amount) {
	if (amount == 'all') {
		$("#locationModal .full").show();
		$("#locationModal .credits").hide();
	} else if (amount == 'location') {
		$("#locationModal .full").hide();
		$("#locationModal .credits").hide();
	}
	$('.btn[tag="credits"]').click(function() {
		$("#locationModal .input, #locationModal .full, .settings, .sync").hide();
		$("#locationModal .credits").fadeIn(500);
	});
	$('#locationModal .credits img').click(function() {
		$("#locationModal .credits").fadeOut(350);
		$("#locationModal .input, #locationModal .full, .settings, .sync").fadeIn(350);
	});
	//Show the Modal
	$("#locationModal").fadeToggle(350);
	if (amount != "noweather") {
		$("#actualWeather").fadeToggle(350);
	}
}

function render(location) {
	$('.border .sync').addClass('busy');
	$(".border .settings").show();

	getWeatherData(location, function(rawdata) {
		generateStats(rawdata, function(weather) {
			$('#city span').html('<a href="' + weather.link + '">' + localStorage.cumulus_location + '</a>');
			$("#code").text(weather_code(weather.code)).attr("class", "w" + weather.code);

			//Sets initial temp as Fahrenheit
			var temp = weather.temperature;
			if (localStorage.typhoon_measurement == "c") {
				temp = Math.round((weather.temperature -32)*5/9);
				$("#temperature").text(temp + " °C");
			} else if (localStorage.typhoon_measurement == "k") {
				temp = Math.round((weather.temperature -32)*5/9) + 273;
				$("#temperature").text(temp + " °K");
			} else {
				$("#temperature").text(temp + " °F");
			}
			document.title = temp;

			var windSpeed = weather.windSpeed;
			if (localStorage.typhoon_speed != "mph") {
				//Converts to either kph or m/s
				windSpeed = (localStorage.typhoon_speed == "kph") ? Math.round(windSpeed * 1.609344) : Math.round(windSpeed * 4.4704) /10;
			}
			$("#windSpeed").text(windSpeed);
			$("#windUnit").text((localStorage.typhoon_speed == "ms") ? "m/s" : localStorage.typhoon_speed);
			$("#humidity").text(weather.humidity + " %");

			//Background Color
			background(weather.temperature);

			//Weekly Bro.
			for (var i=0; i<5; i++) {
				$('#' + i + ' .day').text(weather.week[i].day);
				$('#' + i + ' .code').text(weather_code(weather.week[i].code));
				if (localStorage.typhoon_measurement == "c") {
					$('#' + i + ' .temp').html(Math.round((weather.week[i].high -32)*5/9) + "°<span>" + Math.round((weather.week[i].low -32)*5/9) + "°</span>");
				} else if (localStorage.typhoon_measurement == "k") {
					$('#' + i + ' .temp').html(Math.round((weather.week[i].high -32)*5/9) + 273 + "<span>" + Math.round((weather.week[i].low -32)*5/9 + 273)  + "</span>");
				} else {
					$('#' + i + ' .temp').html(weather.week[i].high + "°<span>" + weather.week[i].low + "°</span>");
				}
			}

			//Show Icon
			$('.border .sync, .border .settings').css("opacity", "0.8");
			$('#actualWeather').fadeIn(500);
			$("#locationModal").fadeOut(500);
			// spin the thing for 500ms longer than it actually takes, because
			// most of the time refreshing is actually instant :)
			setTimeout(function() { 
				$('.border .sync').removeClass('busy'); 
				}, 500);
		});
	});
}

function opacity() {
	//On first run, opacity would be 0.8
	if (localStorage.getItem("app_opacity") === null) {
		localStorage.app_opacity = 0.8;
	}
	$('input[type=range]').val(localStorage.app_opacity);
	document.title = "o" + localStorage.app_opacity;
	document.title = enable_drag;
}

function updateTitle(val) {
	document.title = "o" + val;
	localStorage.app_opacity = val;
}

function showError() {
	$('#actualWeather').fadeOut(350);
	$('#errorMessage').fadeIn(350);
}

function background(temp) {
	// Convert RGB array to CSS
	var convert = function(i) {
		// Array to RGB
		if (typeof(i) == 'object') {
			return 'rgb(' + i.join(', ') + ')';

		// Hex to array
		} else if (typeof(i) == 'string') {
			var output = [];
			if (i[0] == '#') i = i.slice(1);
			if (i.length == 3)	i = i[0] + i[0] + i[1] + i[1] + i[2] + i[2];
			output.push(parseInt(i.slice(0,2), 16));
			output.push(parseInt(i.slice(2,4), 16));
			output.push(parseInt(i.slice(4,6), 16));
			return output;
		}
	};

	// Get color at position
	var blend = function(x) {
		x = Number(x);
		var gradient = [{
			pos: 0,
			color: convert('#0081d3')
		}, {
			pos: 10,
			color: convert('#007bc2')
		}, {
			pos: 20,
			color: convert('#0071b2')
		}, {
			pos: 30,
			color: convert('#2766a2')
		}, {
			pos: 40,
			color: convert('#575591')
		}, {
			pos: 50,
			color: convert('#94556b')
		}, {
			pos: 60,
			color: convert('#af4744')
		}, {
			pos: 70,
			color: convert('#bb4434')
		}, {
			pos: 80,
			color: convert('#c94126')
		}, {
			pos: 90,
			color: convert('#d6411b')
		}, {
			pos: 100,
			color: convert('#e44211')
		}];

		var left = {
			pos: -1,
			color: false,
			percent: 0
		};
		var right = {
			pos: 101,
			color:  false,
			percent: 0
		};

		// Get the 2 closest stops to the specified position
		for (var i=0, l=gradient.length; i<l; i++) {
			var stop = gradient[i];
			if (stop.pos <= x && stop.pos > left.pos) {
				left.pos = stop.pos;
				left.color = stop.color;
			} else if (stop.pos >= x && stop.pos < right.pos) {
				right.pos = stop.pos;
				right.color = stop.color;
			}
		}

		// If there is no stop to the left or right
		if (!left.color) {
			return convert(right.color);
		} else if (!right.color) {
			return convert(left.color);
		}

		// Calculate percentages
		right.percent = Math.abs(1 / ((right.pos - left.pos) / (x - left.pos)));
		left.percent = 1 - right.percent;

		// Blend colors!
		var blend = [
			Math.round((left.color[0] * left.percent) + (right.color[0] * right.percent)),
			Math.round((left.color[1] * left.percent) + (right.color[1] * right.percent)),
			Math.round((left.color[2] * left.percent) + (right.color[2] * right.percent)),
		];
		return convert(blend);
	};

	//Sets Background Color
	if (localStorage.typhoon_color == "gradient") {
		var percentage = Math.round((temp - 45) *  2.2);
		$("#container").css("background", blend(percentage));
	} else {
		$("#container").css("background", "#" + localStorage.typhoon_color);
	}
}