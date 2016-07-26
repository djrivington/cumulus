function getCity(inputLocation, callback) {
    var id = null;
    //Get id using location from settings input
    locationIdFromInput(inputLocation, function(cityId) {
        id = cityId;
        saveLocationLocally(id, function(result) {            
            callback(result);
        });
    });
}

function saveLocationLocally(locationId, callback) {
    if ( localStorage.api == "owm" ) {  
        $.ajax({
            type : "GET",
            dataType : "json",
            url : "http://api.openweathermap.org/data/2.5/weather?id=" + locationId + "&appid=6cfbd805297a2ab8fe60cfc1fbcf8278",
            success : function(data) {
                localStorage.cumulus_location = data.name;
                callback(locationId);
            },
            error: function(data) {
                if (data.status === 0) {
                    showError('network');
                }
            }
        });
    }
    else{
        $.ajax({
            type : "GET",
            dataType : "json",
            url : "https://query.yahooapis.com/v1/public/yql?q=select location from weather.forecast where woeid=" + locationId + "&format=json",
            success : function(data) {
                localStorage.cumulus_location = data.query.results.channel.location.city;
                callback(locationId);
            },
            error: function(data) {
                if (data.status === 0) {
                    showError('network');
                }
            }
        });
    }
}

function getWeatherData(id, callback) {
    if ( localStorage.api == "owm" ) {
        $.ajax({
            type : "GET",
            dataType : "json",
            url : "http://api.openweathermap.org/data/2.5/weather?id=" + id + "&appid=6cfbd805297a2ab8fe60cfc1fbcf8278",
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
    else {
        $.ajax({
            type : "GET",
            dataType : "json",
            url: "https://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where woeid=" + id + "&format=json",
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
    
}

function generateStats(data, callback) {
    if ( localStorage.api == "owm" ) {
        generateOpenWeatherStats(data, function(weather) {
            callback(weather);
        });
    }
    else {
        generateYahooStats(data, function(weather) {
            callback(weather);
        });
    }    
}

//Converts Yahoo weather to icon font
function weather_code(a){
    var b={0:"(",1:"z",2:"(",3:"z",4:"z",5:"e",6:"e",7:"o",8:"3",9:"3",10:"9",11:"9",12:"9",13:"o",14:"o",15:"o",16:"o",17:"e",18:"e",19:"s",20:"s",21:"s",22:"s",23:"l",24:"l",25:"`",26:"`",27:"2",28:"1",29:"2",30:"1",31:"/",32:"v",33:"/",34:"v",35:"e",36:"v",37:"z",38:"z",39:"z",40:"3",41:"o",42:"o",43:"o",44:"`",45:"z",46:"o",47:"z",3200:"`"};
    return b[a];
}


//Converts OpenWeatherMap Code to Yahoo code
function yahooCodeFromOwm(owmCode){    
    var yCode= {200: "37", 201: "38", 202: "45", 210: "45", 211: "4", 212: "3", 221: "39", 230: "47", 231: "47", 232: "47", 300: "9", 301: "9", 302: "9", 310: "9", 311: "9", 312: "9", 313: "40", 314: "40", 321: "40", 500: "11",
            501: "11", 502: "11", 503: "11", 504: "11", 511: "10", 520: "12", 521: "12", 522: "12", 531: "12", 600: "14", 601: "16", 602: "41", 611: "18", 612: "7", 615: "5", 616: "5", 620: "13", 621: "15", 622: "46", 701: "20", 711: "22",
            721: "21", 731: "19", 741: "20", 751: "19", 761: "19", 762: "3200", 771: "24", 781: "0", 800: "34", 900: "0", 901: "1", 902: "2", 903: "25", 904: "36", 905: "24", 906: "17", 951: "34", 952: "30", 953: "30", 954: "30", 955: "30",
            956: "30", 957: "24", 958: "24", 959: "24", 960: "23", 961: "23", 962: "2", 3200: "3200", 801: "30", 802: "30", 803: "28", 804: "26",};
    return yCode[owmCode];
}

function locationIdFromInput(inputLocation, callback) {
    var id = null;
    if ( localStorage.api == "owm" ) {
        $.ajax({
            type : "GET",
            dataType : "json",
            url : "http://api.openweathermap.org/data/2.5/weather?q=" + inputLocation + "&appid=6cfbd805297a2ab8fe60cfc1fbcf8278",
            success : function(data) {
                id = data.id;
                callback(id);
            },
            error: function(data) {
                if (data.status === 0) {
                    showError('network');
                }
            }
        });
    }
    else {
        $.ajax({
            type : "GET",
            dataType : "json",
            url : "https://query.yahooapis.com/v1/public/yql?q=select woeid from geo.places(1) where text='" + inputLocation + "'&format=json",
            success : function(data) {
                id = data.query.results.place.woeid;
                callback(id);
            },
            error: function(data) {
                if (data.status === 0) {
                    showError('network');
                }
            }
        });
    }
} 



function generateYahooStats(data, callback) {
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

    //Current Weather 
    weather.code = item.condition.code;
    if (weather.code == "3200") {
        weather.code = weather.week[0].code;
    }

    if (callback) {
        callback(weather);
    }
}

function generateOpenWeatherStats(data, callback) {
    //Weather Object
    weather = {};
    
    weather.code = yahooCodeFromOwm(data.weather[0].id); 
    //Location
    weather.city = data.name;
    weather.country = data.sys.country;

    //Link
    weather.link = "http://openweathermap.org/city/" + data.id;

    //Temperature
    weather.temperature = kelvinToFahr(data.main.temp);

    //Wind
    weather.windUnit = "mph";
    weather.windSpeed = msToMph(data.wind.speed);
    weather.windDirection = data.wind.deg;

    //Humidity
    weather.humidity = data.main.humidity;
    
    //Weekly Weather
    weather.week = [];
    
    $.ajax({
        type : "GET",
        dataType : "json",
        url : "http://api.openweathermap.org/data/2.5/forecast/daily?id=" + data.id + "&appid=6cfbd805297a2ab8fe60cfc1fbcf8278&lang=" + weather.country,
        success : function(data) {
            weekArr = data.list;
            var j = 0;
            for (var i = 0; i < 5; i++) {
//                alert(weekArr[i].weather.id + " | " + yahooCodeFromOwm(weekArr[i].weather.id));
                weather.week[i] = {};
                weather.week[i].day = getDay(weekArr[i].dt);
                weather.week[i].code = yahooCodeFromOwm(weekArr[i].weather[0].id);
                weather.week[i].low =  kelvinToFahr(weekArr[i].temp.min);
                weather.week[i].high =  kelvinToFahr(weekArr[i].temp.max);               
            }
            
          //Current Weather 
            
            if (weather.code == "3200") {
                weather.code = weather.week[0].code;
            }
            if (callback) {
                callback(weather);
            } 
        },
        error: function(data) {
            if (data.status === 0) {
                showError('network');
            }
        }
    });
       
    function setWeekArray(arrayObject, position) {        
        weather.week[position] = arrayObject;
    }
}

function openWeatherForecast(id, callback) {
    $.ajax({
        type : "GET",
        dataType : "json",
        url : "http://api.openweathermap.org/data/2.5/forecast?id=" + id + "&appid=6cfbd805297a2ab8fe60cfc1fbcf8278",
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

function getDay(date) {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(date * 1000).getDay()];
}

function kelvinToFahr(temperature) {
    return ((temperature * (9 / 5)) - 459.67);
}

function msToMph(speed) {
    return Math.round(speed / 0.44704);
}