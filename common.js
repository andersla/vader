function getCookie(name) {
    let cookie = {};
    document.cookie.split(';').forEach(function (el) {
        let [k, v] = el.split('=');
        cookie[k.trim()] = v;
    });
    return cookie[name];
}

function setCookie(name, value, expires = "Tue, 19 Jan 2038 03:14:00 UTC") {
    let cookie_string = name + "=" + value + ";expires=" + expires + ";path=/";
    console.log("cookiestring", cookie_string);
    document.cookie = cookie_string;
}

function deleteCookie(name) {
    setCookie(name, '', "Thu, 01 Jan 1970 00:00:00 GMT");
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
    if (cookie == null) {
        return null;
    } else {
        // Data is base64 encoded and in json format
        return JSON.parse(window.atob(cookie));
    }
}

function getPlaces() {
    let places = getCookieData("places");
    if (places == null) {
        places = getDefaultPlaces();
    }
    return places;
}

function setPlaces(places) {
    setCookieData("places", places);
}

function addPlace(newPlace) {
    let newPlaces = new Array(0);
    newPlaces.push(newPlace);

    // Loop existing places and add them to new if not same as the new one
    let places = getPlaces();
    Object.values(places).forEach(function (place) {

        // Only add if not same as the newPlace
        if (place != null && place.name != newPlace.name) {
            // Add element to list
            newPlaces.push(place);
        }
    });

    // Max 10 long
    if (newPlaces.length > 10) {
        newPlaces = newPlaces.slice(0, 10);
    }

    console.log("newPlaces", newPlaces);

    setPlaces(newPlaces);
}

function deletePlaces() {
    deleteCookie("places");
}

function getDefaultPlaces() {
    let places = new Array(10);
    places[0] = {
        "name": "Uppsala",
        "geoname": "Uppsala",
        "lon": "17.636540",
        "lat": "59.842069"
    };
    return places;
}
