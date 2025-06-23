function getNewListWithAjax(awesome, input) {
    console.log('inside getNewListWithAjax');
    let ajax = new XMLHttpRequest();

    ajax.open("GET", "https://wpt-a.smhi.se/backend-weatherpage/geo/autocomplete/places/" + input.value, true);

    ajax.onload = function () {
        let list = buildListFromLocations(JSON.parse(ajax.responseText));

        // Update awesome with new list
        awesome.list = list;
        awesome.evaluate();
    };
    ajax.send();
}

function buildListFromLocations(locations) {
    let list = [];

    Object.values(locations).forEach(function (location) {

        // Set munincipality as default region
        let region = location.municipality;

        // If no municipality exists for this place, set country as region
        if (region === undefined) {
            region = location.country;
        }


        // Create a place label
        let fullplace = location.place;
        // Only add region if different
        if (location.place != region) {
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
        list.push({
            label: fullplace,
            value: data
        });

    });

    return list;
}

function comparePlaces(a, b) {
    if (a > b) return 1;
    if (b > a) return -1;

    return 0;
}

/*
 *
 * Create and configure the autocomplete input-box
 *
 */

try {
    let myInput = document.querySelector("#plats-search input");
    let myOptions = {
        "minChars": 1,
        "autoFirst": true,
        "filter": Awesomplete.FILTER_STARTSWITH
    };
    let myAwesome = new Awesomplete(myInput, myOptions);
    myInput.addEventListener('input', function () {
        getNewListWithAjax(myAwesome, myInput);
    });

    myInput.addEventListener('awesomplete-select', function (obj) {

        console.log("obj", obj.text);

        // Create a new cookie with new selected location data as first object
        addPlace(obj.text.value);

        // change value to label (otherwise data-Object is displayed in input box)
        obj.text.value = obj.text.label

        //alert("Wait");

        // Go back to Weather-page
        location.assign("index.html");

    });

    console.log("Done");

} catch (err) {
    console.log(err);
    // Clear cookie if that is the problem
    deletePlaces();
}

function displayRecentSearches() {
    let recentSearchesDiv = document.getElementById("recent-searches");
    let places = getPlaces();

    if (places.length > 0) {
        let recentSearchesHTML = "";

        places.forEach(place => {
            recentSearchesHTML += `<div class="recent-search-item" onclick="selectRecentPlace('${place.name}', '${place.lat}', '${place.lon}')">${place.name}</div>`;
        });

        recentSearchesDiv.innerHTML = recentSearchesHTML;
    }
}

function selectRecentPlace(name, lat, lon) {
    let selectedPlace = {
        name: name,
        lat: lat,
        lon: lon
    };
    addPlace(selectedPlace);
    location.assign("index.html");
}
