"use strict";
import * as $ from 'jquery';

angular.module("landingPage", [])
  .component("landingPage", {
    template: require("./landing-page.html"), 
    controller: [ '$scope',
      function LandingPageController ($scope) {

        //RAIN LEVELS: NONE, LIGHT, MEDIUM, HEAVY
        //WIND LEVELS: CALM, LIGHT, MEDIUM, HEAVY
        //HAIR LEVELS: NONE, GRAND, TOO MUCH

        const RAIN_NONE     = 0;
        const RAIN_LIGHT    = 0.5;
        const RAIN_MODERATE = 1;
        const RAIN_HEAVY    = 2;

        const WIND_CALM     = 5;
        const WIND_LIGHT    = 11;
        const WIND_MODERATE = 19;
        const WIND_HEAVY    = 28;

        const TEMP_MIN = 15;
        const TEMP_MAX = 22;

        // const HAIR_NONE     = 0;
        // const HAIR_LIGHT    = 1;
        // const HAIR_MODERATE = 2;
        // const HAIR_HEAVY    = 3;
        
        var API_KEY          = "8c6a2b7bed32554a35fc122f6b27ad07",
            API_GET_FORECAST = 'https://api.openweathermap.org/data/2.5/forecast?units=metric',
            API_GET_LOCATION = 'https://ipinfo.io';

        // $scope.isItTightsWeatherNow = false;
        // $scope.isItTightsWeatherIn3h = false;
        // $scope.isItTightsWeatherIn6h = false;
        // $scope.isItTightsWeatherIn9h = false;

        $scope.weather = {};
        $scope.otherWeather = [];
        
        $(function(){
          
          $.getJSON(API_GET_LOCATION, 
            function(locationString) {
            
            $scope.city = locationString.city;

            var userLocation = locationString.loc.split(","),
                lat = userLocation[0],
                lon = userLocation[1];
            
            //FOR TEST
            // var lat = 53.3498;
            // var lon = 6.2603;
            // https://openweathermap.org/weather-conditions
            
            $.getJSON(`${API_GET_FORECAST}&lat=${lat}&lon=${lon}&APPID=${API_KEY}`,
              function(forecast) {

                var weatherNow  = buildWeatherObject(forecast.list[0]),
                    weatherIn3h = buildWeatherObject(forecast.list[1]),
                    weatherIn6h = buildWeatherObject(forecast.list[2]),
                    weatherIn9h = buildWeatherObject(forecast.list[3]);

                $scope.$apply(function() {
                  $scope.currentWeather = getTightsWeatherData(weatherNow);
                  $scope.otherWeather.push(
                    getTightsWeatherData(weatherIn3h),
                    getTightsWeatherData(weatherIn6h),
                    getTightsWeatherData(weatherIn9h)
                  );

                });
              
              });
           
          });
        });
        
        /*
          order by most important factors (survey results)
          wind, temp, rain, hair 
          @params ( object )
        */
        function getTightsWeatherDataOLD (weather) {
          if (isTempHigherThanMaxTightsWearingTemp(weather.averageTemp)) {
            $scope.reasonNow = weather.averageTemp + ': is too hot for tights: ';
            return false;
          }
          if (isItWindy(weather.windSpeed)) {
            $scope.reasonNow = 'There\'ll be a bit of a breeze.';
            return true;
          }
          if (isTheTempBelowMaxTemp(weather.averageTemp)) {
            $scope.reasonNow = 'The temp is below the max temp';
            return true;
          }
          if (isItRainy(weather.rainLevel)) {
            $scope.reasonNow = 'There\'ll be some rain.';
            return true;
          }
          return false;
        }

        function getTightsWeatherData (weather) {
          var weatherObj = weather;
          weatherObj.isItTightsWeather = false;
          weatherObj.reasonsItIs = [];
          weatherObj.reasonsItIsNot = [];

          //WIND
          if (isItWindy(weather.windSpeed)) { //windSpeed > WIND_LIGHT
            //weatherObj.isItTightsWeather = true;
            if (weather.windSpeed >= WIND_HEAVY) {
              weatherObj.reasonsItIs.push('It\'ll be very windy');
            }
            else if (weather.windSpeed > WIND_MODERATE && weather.windSpeed < WIND_HEAVY ) {
              weatherObj.reasonsItIs.push('It\'ll be quite windy');
            }
            else if (weather.windSpeed > WIND_LIGHT && weather.windSpeed <= WIND_MODERATE ){
              weatherObj.reasonsItIs.push('It\'ll be a bit windy');
            }
            else {
              weatherObj.reasonsItIs.push('There\'ll be some light wind'); 
            }
          }
          else {
            //weatherObj.isItTightsWeather = false;
            weatherObj.reasonsItIsNot.push('It\'ll be nice and calm');
          }

          //RAIN
          if (willItRain(weather.rainLevel)) { //rainLevel > RAIN_MODERATE;
            //weatherObj.isItTightsWeather = true;
            if (weather.rainLevel > RAIN_HEAVY) {
              weatherObj.reasonsItIs.push('It\'ll be very rainy');
            }
            else if (weather.rainLevel > RAIN_MODERATE && weather.rainLevel <= RAIN_HEAVY ) {
              weatherObj.reasonsItIs.push('It\'ll be quite rainy');
            }
            else if (weather.rainLevel > RAIN_LIGHT && weather.rainLevel <= RAIN_MODERATE ) {
              weatherObj.reasonsItIs.push('It\'ll be a bit rainy');
            }
            else if (weather.rainLevel > RAIN_NONE && weather.rainLevel <= RAIN_LIGHT) {
              weatherObj.reasonsItIs.push('Might be a few drops of rain');
            }
            else {
              weatherObj.reasonsItIsNot.push('Not a drop of rain');
            }
          }

          //TEMP
          if (weather.minTemp <= TEMP_MIN) { 
            weatherObj.isItTightsWeather = true;
            weatherObj.reasonsItIs.push('It\'ll be cold');
          }
          else if (weather.minTemp <= TEMP_MIN && isItWindy(weather.windSpeed)) { 
            weatherObj.isItTightsWeather = true;
            weatherObj.reasonsItIs.push('It\'ll be cold and a bit windy');
          }
          else if (weather.minTemp <= TEMP_MIN && willItRain(weather.rainLevel)) { 
            weatherObj.isItTightsWeather = true;
            weatherObj.reasonsItIs.push('It\'ll be cold and a bit rainy');
          }
          else if (weather.minTemp <= TEMP_MIN && willItRain(weather.rainLevel) && isItWindy(weather.windSpeed)) { 
            weatherObj.isItTightsWeather = true;
            weatherObj.reasonsItIs.push('It\'ll be cold and rainy and windy. FFS.');
          }
          else {
            weatherObj.isItTightsWeather = false;
            weatherObj.reasonsItIsNot.push('The weather must be lovely');
          }
          

          console.log(weatherObj)
          return weatherObj;

        }

        function isItWindy (windSpeed) {
          return windSpeed > WIND_CALM;
        }

        function isTempHigherThanMaxTightsWearingTemp (temp) {
          return temp > TEMP_MAX;
        }

        function isTheTempBelowMaxTemp (temp) {
          return temp < TEMP_MAX;
        }

        function willItRain (rainLevel) {
          return rainLevel > RAIN_NONE;
        }

        function buildWeatherObject (forecast) {
          return {
            windSpeed: getWindSpeed(forecast),
            rainLevel: getRainLevel(forecast),
            averageTemp: getAverageTemp(forecast),
            minTemp: forecast.main.temp_min,
            maxTemp: forecast.main.temp_max
          }
        }

        function getWindSpeed (forecast) {
          return +(forecast.wind.speed.toFixed(2));
        }

        function getRainLevel (forecast) {
          if ($.isEmptyObject(forecast.rain)) {
            return 0;
          }
          // divide by 3 to get the mm rainfall per hour
          return +((forecast.rain['3h'] / 3).toFixed(2));
        }

        function getAverageTemp (forecast) {
          var max = forecast.main.temp_max;
          var min = forecast.main.temp_min;
          return +((max + min) / 2).toFixed(2);
        }
                


      }
    ]
  });
