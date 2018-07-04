"use strict";
import * as $ from 'jquery';

angular.module("landingPage", [])
  .component("landingPage", {
    template: require("./landing-page.html"), 
    controller: [ '$scope',
      function LandingPageController($scope) {
        
        var API_KEY = "8c6a2b7bed32554a35fc122f6b27ad07",
            API_GET_FORECAST = 'https://api.openweathermap.org/data/2.5/forecast?units=metric',
            API_GET_LOCATION = 'https://ipinfo.io';
        
        $(function(){
          
          $.getJSON(API_GET_LOCATION, function(e) {

            var userLocation = e.loc.split(","),
                lat = userLocation[0],
                lon = userLocation[1];
            
            $.getJSON(`${API_GET_FORECAST}&lat=${lat}&lon=${lon}&APPID=${API_KEY}`,
              function(forecast){

                var weatherNow = forecast.list[0],
                    weatherIn3Hours = forecast.list[1],
                    weatherIn6Hours = forecast.list[2],
                    weatherIn9Hours = forecast.list[2];
                
                render(weatherNow);
                render(weatherIn3Hours);
                render(weatherIn6Hours);
                render(weatherIn9Hours);
              
              });
           
          });
        });

        function render(forecast) {
          console.log(forecast);
        }
                


      }
    ]
  });
