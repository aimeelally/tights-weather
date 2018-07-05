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

        const TEMP_MIN = 13;
        const TEMP_MAX = 18;

        // const HAIR_NONE     = 0;
        // const HAIR_LIGHT    = 1;
        // const HAIR_MODERATE = 2;
        // const HAIR_HEAVY    = 3;
        
        var API_KEY          = "8c6a2b7bed32554a35fc122f6b27ad07",
            API_GET_FORECAST = 'https://api.openweathermap.org/data/2.5/forecast?units=metric',
            API_GET_LOCATION = 'https://ipinfo.io';

        $scope.isItTightsWeatherNow = false;
        $scope.isItTightsWeatherIn3h = false;
        $scope.isItTightsWeatherIn6h = false;
        $scope.isItTightsWeatherIn9h = false;
        
        $(function(){
          
          $.getJSON(API_GET_LOCATION, 
            function(locationString) {

            var userLocation = locationString.loc.split(","),
                lat = userLocation[0],
                lon = userLocation[1];
            
            //FOR TEST
            // var lat = 53.1424;
            // var lon = 7.6921;
            // https://openweathermap.org/weather-conditions
            
            $.getJSON(`${API_GET_FORECAST}&lat=${lat}&lon=${lon}&APPID=${API_KEY}`,
              function(forecast) {

                var weatherNow  = buildWeatherObject(forecast.list[0]),
                    weatherIn3h = buildWeatherObject(forecast.list[1]),
                    weatherIn3h = buildWeatherObject(forecast.list[2]),
                    weatherIn9h = buildWeatherObject(forecast.list[3]);

                var isItTightsWeatherNow  = isItTightsWeather(weatherNow),
                    isItTightsWeatherIn3h = isItTightsWeather(weatherIn3h),
                    isItTightsWeatherIn6h = isItTightsWeather(weatherIn3h),
                    isItTightsWeatherIn9h = isItTightsWeather(weatherIn9h);

                
                $scope.$apply(function() {
                  $scope.isItTightsWeatherNow = isItTightsWeatherNow;
                  $scope.isItTightsWeatherIn3h = isItTightsWeatherIn3h;
                  $scope.isItTightsWeatherIn6h = isItTightsWeatherIn6h;
                  $scope.isItTightsWeatherIn9h = isItTightsWeatherIn9h;
                });
              
              });
           
          });
        });

        
        /*
          order by most important factors (survey results)
          
          wind, temp, rain, hair 

          @params ( object )
        */
        function isItTightsWeather (weather) {
          if (isItWindy(weather.windSpeed)) {
            return true;
          }
          if (isTheTempBelowMaxTemp(weather.averageTemp)) {
            return true;
          }
          if (isItRainy(weather.rainLevel)) {
            return true;
          }
          return false;
        }

        function isItWindy (windSpeed) {
          return windSpeed > WIND_LIGHT;
        }

        function isTheTempBelowMaxTemp (temp) {
          return temp < TEMP_MAX;
        }

        function isItRainy (rainLevel) {
          return rainLevel > RAIN_MODERATE;
        }

        function buildWeatherObject (forecast) {
          return {
            windSpeed: getWindSpeed(forecast),
            rainLevel: getRainLevel(forecast),
            averageTemp: getAverageTemp(forecast)
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
