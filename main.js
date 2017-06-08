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


function geolocation() {
    $.ajax({
        url: "https://api.wunderground.com/api/99700a5f18fd6339/geolookup/q/autoip.json",
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

            $('.prev')[0].addEventListener("click", function(){
                console.log(lat, long);
                getPrevWeather(lat, long);
            });
            $('.post')[0].addEventListener("click", function(){
                getNextWeather(lat, long);
                console.log('getnex ',lat, long);
            });

        },
        error: function (xhr) {
            console.log('autoip - error', xhr.message)
        }
    });

}


// https://maps.googleapis.com/maps/api/geocode/json?latlng=40.714224,-73.961452&key=YOUR_API_KEY


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
        lat = locale.geometry.location.lat();
        long = locale.geometry.location.lng();


        e.preventDefault();
        latitude.innerText = lat.toFixed(4);
        longitude.innerText = long.toFixed(4);
        city.innerText = locale.formatted_address;
        weatherNow(lat, long);
        $('#city-search')[0].value ='';


    });

});

function weatherNow(now) {
    var date = Math.round((new Date().getTime()) / 1000); // time now;
    $.ajax({
        url: 'https://api.darksky.net/forecast/9099c83276a95ceebdcc6baafccf3059/' + lat + ',' + long + ',' + date + '?lang=uk&units=ca',
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
        url: 'https://api.darksky.net/forecast/9099c83276a95ceebdcc6baafccf3059/' + lat + ',' + long + ',' + myDate + '?lang=uk&units=auto',
        method: "get", //send it through get method
        jsonp: "callback",
        async: true,
        dataType: "jsonp",
        xhrFields: {
            withCredentials: true
        },
        success: function (response) {
            temperatura.innerHTML = 'Максимальна температура: <br/> ' + response.daily.data[0].temperatureMax + '  &#176;<br/> Мінімальна температура:<br/>  ' + response.daily.data[0].temperatureMin + '  &#176;';
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
            console.log(' response prev ', response);
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
        url: 'https://api.darksky.net/forecast/9099c83276a95ceebdcc6baafccf3059/' + lat + ',' + long + ',' + myDate + '?lang=uk&units=auto',
        method: "get", //send it through get method
        jsonp: "callback",
        dataType: "jsonp",
        xhrFields: {
            withCredentials: true
        },
        success: function (response) {
            //   city.innerText  = response.timezone;
            temperatura.innerHTML = 'Максимальна температура: <br/> ' + response.daily.data[0].temperatureMax + '  &#176;<br/> Мінімальна температура:<br/>  ' + response.daily.data[0].temperatureMin + '  &#176;';
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


/*
 var geocoder;

 function initialize() {
 geocoder = new google.maps.Geocoder();


 }

 function codeLatLng(lat, long) {

 var latlng = new google.maps.LatLng(lat, long);
 geocoder.geocode({'latLng': latlng}, function(results, status) {
 if (status == google.maps.GeocoderStatus.OK) {
 console.log('google search ', results)
 if (results[1]) {
 //formatted address
 alert(results[0].formatted_address)
 //find country name
 for (var i=0; i<results[0].address_components.length; i++) {
 for (var b=0;b<results[0].address_components[i].types.length;b++) {

 //there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
 if (results[0].address_components[i].types[b] == "administrative_area_level_1") {
 //this is the object you are looking for
 city= results[0].address_components[i];
 break;
 }
 }
 }
 //city data
 alert(city.short_name + " " + city.long_name)


 } else {
 alert("No results found");
 }
 } else {
 alert("Geocoder failed due to: " + status);
 }
 });
 }
 */