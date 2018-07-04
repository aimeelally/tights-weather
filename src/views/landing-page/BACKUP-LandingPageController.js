"use strict";

angular.module("landingPage", [])
  .component("landingPage", {
    template: require("./landing-page.html"), 
    controller: [ '$scope',
      function LandingPageController($scope) {
        
        var API_KEY = "8c6a2b7bed32554a35fc122f6b27ad07";
        var celsius = false;
        var weatherData;
        var timeOfDay = getTimeOfDay();

        function getTimeOfDay () {
          if (new Date().getHours() > 17 && new Date.getHours() <= 24) {
            return 'night';
          }
          return 'day';
        }

        function getIconFromId (id, time) {
          if (id >= 200 && id <= 232){
            return '005-thunder';
          }else if (id >= 300 && id <= 321){
            return '027-rainy';
          }else if (id >= 500 && id <= 531){
            return '013-rain';
          }else if (id >= 600 && id <= 622){
            return '009-snow';
          }else if (id >= 701 && id <= 721 ){
            return '014-overcast';
          } else if (id === 800){
            return time == 'day' ? '032-sun' : '015-moon';
          }else if (id >= 801 && id <= 804){
            return '031-cloud';
          }else if (id >= 900 && id <= 902){
            return '021-gust';
          }else if (id === 903){
            return '029-cold-1';
          }else if (id === 904){
            return time == 'day' ? '032-sun' : '015-moon';
          }else if (id === 905){
            return '034-windy';
          }else if (id === 906){
            return '019-hail';
          }else{
            return '031-cloud';
          }
        }    

             
        function displayTemp(fTemp, c){
          if (c) return Math.round((fTemp - 32) * (5/9)) + "&#8451";
          return Math.round(fTemp) + "&#8457";
        }

        

        function render(weatherData, celsius){
          //debugger;
          var currentLocation = weatherData.name;
          var currentWeather = weatherData.weather[0].description;
          var currentTemp = displayTemp(weatherData.main.temp, celsius);
          var highTemp = displayTemp(weatherData.main.temp_max, celsius);
          var lowTemp = displayTemp(weatherData.main.temp_min, celsius);
          //var icon = weatherData.weather[0].icon;
          var icon = getIconFromId(weatherData.weather[0].id, timeOfDay);
          
          $('#currentLocation').html(currentLocation);
          $('#currentTemp').html(currentTemp);
          $('#currentWeather').html(currentWeather);
          $('#highTemp-lowTemp').html(highTemp + "/" + lowTemp);
          
          
          // var iconSrc = "http://openweathermap.org/img/w/" + icon + ".png";
          var iconSrc = "/assets/png-flat/" + icon + ".png";
          $('#currentTemp').prepend('<img class="span-12" src="' + iconSrc + '">');
              
          
        }
        $(function(){
          
          var loc;
          $.getJSON('https://ipinfo.io', function(d) {
            console.log("assigning data here...")
            loc = d.loc.split(",");
            console.log(loc);
            
            $.getJSON('https://api.openweathermap.org/data/2.5/forecast?units=metric&lat='+ loc[0] + '&lon=' + loc[1] + '&APPID=' + API_KEY, function(apiData){
              weatherData = apiData;
              //debugger;
              var id = weatherData['weather'][0]['id']; 
            
              render(apiData, celsius);
              $('#toggle').click(function(){
                celsius = !celsius;
                render(weatherData, celsius);
              })
              
              //selectImage(id);

            })
           
          })
        })
                


      }
    ]
  });
