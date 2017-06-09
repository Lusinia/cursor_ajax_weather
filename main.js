var latitude = $("#latitude")[0];
var longitude = $("#longitude")[0];
var city = $(".city")[0];
var temperatura = $(".temp")[0];
var weather = $(".weather")[0];
var search = $("#city-search")[0];
var searchButton = $("#search-button")[0];
var searchBox = new google.maps.places.SearchBox(search);

// Data
var cityName;
var lat;
var long;

var icons = ['clear-day', 'clear-night', 'rain', 'snow', 'sleet',
    'wind', 'fog', 'cloudy', 'partly-cloudy-day', 'partly-cloudy-night'];
var iconsClasses = ['icon-Sun', 'icon-New', 'icon-CD', 'icon-CS', 'icon-CH', 'icon-Wind', 'icon-Fog-Alt',
    'icon-CR-Alt', 'icon-CSSA', 'icon-CM'];

function navGeoPosition() {
    navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
}


function geoSuccess(position) {
    lat = (position.coords.latitude).toFixed(4);
    long = (position.coords.longitude).toFixed(4);
    latitude.innerText = lat;
    longitude.innerText = long;
    reverseGeolocation(lat, long);
    weatherNow(lat, long);

    $('.prev')[0].addEventListener("click", function () {
         getPrevWeather(lat, long);
    });
    $('.post')[0].addEventListener("click", function () {
        getNextWeather(lat, long);
     });
    console.log('geoSuccess ', 'lat ', lat, 'long ', long);

}
function geoError(err) {
    deniedGeolocation();
    console.log('geoError ', err.message);
}


function deniedGeolocation() {
    $.ajax({
        url: "//api.wunderground.com/api/99700a5f18fd6339/geolookup/q/autoip.json",
        dataType: "jsonp",
        async: true,
        success: function (parsed_json) {
            cityName = parsed_json.location.city;
            lat = parsed_json.location.lat;
            long = parsed_json.location.lon;

            latitude.innerText = lat;
            longitude.innerText = long;
            city.innerText = cityName;
            weatherNow(lat, long);

            $('.prev')[0].addEventListener("click", function () {
                 getPrevWeather(lat, long);
            });
            $('.post')[0].addEventListener("click", function () {
                getNextWeather(lat, long);
             });

        },
        error: function (xhr) {
            console.error('autoip - error', xhr.message)
        }
    });
}


function reverseGeolocation(lat, long) {

    var xhr = new XMLHttpRequest();
    var url = "https://maps.googleapis.com/maps/api/geocode/json";

    url += "?sensor=false&latlng=" + lat + ',' + long;

    xhr.open("GET", url, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var data = JSON.parse(xhr.responseText);

            cityName = data.results[3].formatted_address;
            city.innerText = cityName;

        }
    };

    xhr.send();
}


// Search sity you want

searchBox.addListener('places_changed', function () {
    var locale = searchBox.getPlaces()[0];
    if (locale.length == 0) {
        return;
    }
    if (!locale.geometry) {
        console.log("Returned place contains no geometry");
        return;
    }


    searchButton.addEventListener("click", function (e) {
        e.preventDefault();
        lat = locale.geometry.location.lat();
        long = locale.geometry.location.lng();

        latitude.innerText = lat.toFixed(4);
        longitude.innerText = long.toFixed(4);
        city.innerText = locale.formatted_address;
        weatherNow(lat, long);
        $('#city-search')[0].value = '';

    });

});

function weatherNow(now) {
    var date = Math.round((new Date().getTime()) / 1000); // time now;
    $.ajax({
        url: 'https://api.darksky.net/forecast/9099c83276a95ceebdcc6baafccf3059/' + lat + ',' + long + ',' + date + '?lang=ru&units=ca',
        method: "get", //send it through get method
        async: true,
        jsonp: "callback",
        dataType: "jsonp",
        xhrFields: {
            withCredentials: true
        },
        success: function (response) {
            console.log('response ', response);
            temperatura.innerHTML = response.currently.temperature + ' 	&#176;';
            weather.innerText = response.currently.summary;

            // clean class list
            for (var i = 0; i < icons.length; i++) {
                if ($('.icon').hasClass(iconsClasses[i])) {
                    $('.icon').removeClass(iconsClasses[i]);

                }
            }
            for (var i = 0; i < icons.length; i++) {
                if (response.currently.icon == icons[i]) {
                    $('.icon').addClass(iconsClasses[i]);
                    console.log(response.currently.icon);
                }
            }

        },
        error: function (xhr) {
            alert('error')
        }
    });
}

// giv current format to date
function formatDate(day) {
    var dd = day.getDate();
    var mm = day.getMonth() + 1; //January is 0!

    var yyyy = day.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    return dd + '/' + mm + '/' + yyyy

}

// remove one day
function awayDay() {
    var date = new Date();

    date.setDate(date.getDate() - 1);
    date.getDate();

    return date
}
// add one day
function addDay() {
    var date = new Date();
    date.setDate(date.getDate() + 1);
    return date
}

function getPrevWeather(lat, long) {
    var myDate = formatDate(awayDay()); // in format dd/mm/yyyy
    myDate = Math.round((new Date(myDate).getTime()) / 1000); // in unix format

    $.ajax({
        url: 'https://api.darksky.net/forecast/9099c83276a95ceebdcc6baafccf3059/' + lat + ',' + long + ',' + myDate + '?lang=ru&units=auto',
        method: "get", //send it through get method
        jsonp: "callback",
        async: true,
        dataType: "jsonp",
        xhrFields: {
            withCredentials: true
        },
        success: function (response) {
            temperatura.innerHTML = 'Максимальная температура: <br/> ' + response.daily.data[0].temperatureMax + '  &#176;<br/> Минимальная температура:<br/>  ' + response.daily.data[0].temperatureMin + '  &#176;';
            weather.innerText = response.daily.data[0].summary;
            for (var i = 0; i < icons.length; i++) {
                if ($('.icon').hasClass(icons[i])) {
                    $('.icon').removeClass(icons[i]);
                }
            }
            for (var i = 0; i < icons.length; i++) {
                if (response.daily.data["0"].icon == icons[i]) {
                    $('.icon').addClass(iconsClasses[i]);
                }
            }
            console.log(response);
        },
        error: function (xhr) {
            console.log('error getPrevWeather() ', xhr);
        }

    });

}
function getNextWeather(lat, long) {
    var myDate = formatDate(addDay()); // in format dd/mm/yyyy
    myDate = Math.round((new Date(myDate).getTime()) / 1000); // in unix format

    $.ajax({
        url: 'https://api.darksky.net/forecast/9099c83276a95ceebdcc6baafccf3059/' + lat + ',' + long + ',' + myDate + '?lang=ru&units=auto',
        method: "get", //send it through get method
        jsonp: "callback",
        dataType: "jsonp",
        xhrFields: {
            withCredentials: true
        },
        success: function (response) {
            //   city.innerText  = response.timezone;
            temperatura.innerHTML = 'Максимальная температура: <br/> ' + response.daily.data[0].temperatureMax + '  &#176;<br/> Миніиальная температура:<br/>  ' + response.daily.data[0].temperatureMin + '  &#176;';
            weather.innerText = response.daily.data[0].summary;
            for (var i = 0; i < icons.length; i++) {
                if ($('.icon').hasClass(icons[i])) {
                    $('.icon').removeClass(icons[i])
                }
            }
            for (var i = 0; i < icons.length; i++) {
                if (response.daily.data["0"].icon == icons[i]) {
                    $('.icon').addClass(iconsClasses[i]);
                }
            }
        },
        error: function (xhr) {
            console.log('error getNextWeather() ', xhr)
        }
    });
}

