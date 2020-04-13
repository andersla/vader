function getCookie(name) {
    let cookie = {};
    document.cookie.split(';').forEach(function(el) {
      let [k,v] = el.split('=');
      cookie[k.trim()] = v;
    });
    return cookie[name];
  }

  function setCookie(name, value, expires = "Tue, 19 Jan 2038 03:14:00 UTC") {
    let cookie_string = name + "=" + value + ";expires=" + expires + ";path=/";
    console.log("cookiestring", cookie_string);
    document.cookie = cookie_string;
  }

  function deleteCookie(name){
    setCookie(name, '', -1);
  }

  function setCookieData(name, data) {
    console.log("data:", data);
    // Data is stored in base64 encoded and in json format
    let value = window.btoa(JSON.stringify(data));
    setCookie(name, value);
  }

  function getCookieData(name) {
    let cookie = getCookie(name);
    console.log("cookie", cookie);
    if(cookie == null){
      return null;
    }
    else{
      // Data is base64 encoded and in json format
      return JSON.parse(window.atob(cookie));
    }
  }

  function getPlaces(){
    let places = getCookieData("places");
    if(places == null){
      places = getDefaultPlaces();
    }
    return places;
  }

  function setPlaces(places){
    setCookieData("places", places);
  }

  function getDefaultPlaces(){
    let places = new Array(10);
    places[0] = {"name": "Uppsala", "geoname": "Uppsala", "lon": "17.636540", "lat": "59.842069"};
    return places;
  }


  function getNewListWithAjax(awesome, input){
    console.log('inside getNewListWithAjax');
    let ajax = new XMLHttpRequest();

    ajax.open("GET", "https://www.smhi.se/wpt-a/backend_tendayforecast/geo/autocomplete/" + input.value, true);

    ajax.onload = function() {
      let list = buildListFromLocations(JSON.parse(ajax.responseText));

      // Update awesome with new list
      awesome.list = list;
          awesome.evaluate();
    };
    ajax.send();
  }

  function buildListFromLocations(locations){
    let list = [];

    Object.values(locations).forEach(function(location) {

    // Set munincipality as default region
    let region = location.municipality;

    // If no municipality exists for this place, set country as region
    if(region === undefined){
        region = location.country;
      }


      // Create a place label
      let fullplace = location.place;
      // Only add region if different
      if(location.place != region){
        fullplace += ', ' + region;
      }

      // Add lat/lon to data object
      data = {
        "name": fullplace,
        "geoname": location.place,
        "lat": location.lat,
        "lon": location.lon
      }

      // Add element to list
      list.push( {label: fullplace, value: data} );

        });

    return list;
  }

  /*
  *
  * Create and configure the autocomplete input-box
  *
  */

try{
  let myInput = document.querySelector("#plats-search input");
  let myOptions = {"minChars": 1,
                   "autoFirst": true,
                   "filter": Awesomplete.FILTER_STARTSWITH};
  let myAwesome = new Awesomplete(myInput, myOptions);
      myInput.addEventListener('input', function() {
          getNewListWithAjax(myAwesome, myInput);
      });

  myInput.addEventListener('awesomplete-select',function(obj){

        console.log("obj", obj.text);

    // Create a new cookie with new location data
    let places = new Array(10);
    places[0] = obj.text.value;
    setPlaces(places);

    // change value to label (otherwise data-Object is displayed in input box)
    obj.text.value = obj.text.label

    //alert("Wait");

    // Go back to Weather-page
    location.assign("index.html");

  });

  console.log("Done");

}
catch(err) {
  console.log(err);
  // Clear cookie if that is the problem
  deleteCookie("places");
}
