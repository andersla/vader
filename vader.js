function getSunTimes(date, lat, lon) {
  // get today's sunlight times
  let times = SunCalc.getTimes(date, lat, lon);
  return times;
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function toWeekday(date) {
  let options = {
    weekday: 'long'
  };
  let weekday = new Intl.DateTimeFormat('sv-SE', options).format(date);
  return weekday;
}

function toMonth(date) {
  let options = {
    month: 'short'
  };
  let month = new Intl.DateTimeFormat('sv-SE', options).format(date);
  return month;
}

function toWeekdayString(date) {
  let today = new Date();

  let weekday = capitalize(toWeekday(date));
  if (isSameDay(today, date)) {
    weekday = "Idag, " + weekday;
  } else if (isDayAfter(today, date)) {
    weekday = "Imorgon, " + weekday;
  } else if (isDayBefore(today, date)) {
    weekday = "Igår, " + weekday;
  }

  return weekday;
}

function diff_hours(date1, date2) {
  let diff = (date2.getTime() - date1.getTime()) / 1000 / 60 / 60;
  return Math.round(diff);
}

function minus_time(date, millisec) {
  let newDate = new Date(date.getTime() - millisec);
  return newDate;
}

function isSameDay(date1, date2) {
  if (date1 == null || date2 == null) {
    return false;
  }
  return (date1.getFullYear() == date2.getFullYear()) &&
    (date1.getMonth() == date2.getMonth()) &&
    (date1.getDate() == date2.getDate())
}

function isDayAfter(date1, date2) {
  if (date1 == null || date2 == null) {
    return false;
  }
  return isSameDay(date1, minus_time(date2, 1000 * 3600 * 24));
}

function isDayBefore(date1, date2) {
  if (date1 == null || date2 == null) {
    return false;
  }
  return isSameDay(minus_time(date1, 1000 * 3600 * 24), date2);
}

function addCell(parent, cellindex, value) {
  let cell = parent.insertCell(cellindex);
  cell.innerHTML = value;
  return cell;
}

function addCellStyled(parent, cellindex, value, style) {
  let cell = parent.insertCell(cellindex);
  cell.innerHTML = value;
  cell.style = style;
  return cell;
}

function get(url) {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();
    console.log("get:url", url);
    req.open('GET', url);
    req.onload = () => req.status === 200 ? resolve(req.response) : reject(Error(req.statusText));
    req.onerror = (e) => reject(Error(`Network Error: ${e}`));
    req.send();
  });
}

function getWeather() {

  try {

    //deletePlaces();

    places = getPlaces();

    setPlaces(places);

    console.log("places", places);

    let lon = Number(places[0].lon).toFixed(6);
    let lat = Number(places[0].lat).toFixed(6);
    let geoname = places[0].name;

    console.log(lat);
    console.log(lon);

    let now = new Date();
    console.log(now);
    let suntime = getSunTimes(now, lat, lon);

    console.log(suntime);

    let base_url = "https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point";
    let url = base_url + "/lon/" + lon +
      "/lat/" + lat + "/data.json";

    console.log("url", url);

    // document.getElementById('my-console').innerHTML = "Getting Data";
    get(url).then((data) => {
      data = JSON.parse(data);
      // document.getElementById('my-console').innerHTML = "Data Fetched";
      let table = document.getElementById('tempTable');
      let lastDateTime = null;
      let isFirstRow = true;
      for (let i = 0, len = data.timeSeries.length; i < len; i++) {

        let dateTime = new Date(data.timeSeries[i].validTime);
        if (lastDateTime == null) {
          lastDateTime = minus_time(dateTime, 1000 * 3600);
        }
        let weekday = toWeekdayString(dateTime);
        let dayAndMonth = dateTime.getDate() + ' ' + toMonth(dateTime)
        let timeOfDay = dateTime.getHours();
        let hoursSincePrevious = diff_hours(lastDateTime, dateTime);

        let temp = data.timeSeries[i].parameters.filter(obj => {
          return obj.name === 't'
        })[0].values[0];
        let wsymb2 = data.timeSeries[i].parameters.filter(obj => {
          return obj.name === 'Wsymb2'
        })[0].values[0];
        let wd = data.timeSeries[i].parameters.filter(obj => {
          return obj.name === 'wd'
        })[0].values[0];
        let ws = data.timeSeries[i].parameters.filter(obj => {
          return obj.name === 'ws'
        })[0].values[0];
        let gust = data.timeSeries[i].parameters.filter(obj => {
          return obj.name === 'gust'
        })[0].values[0];
        let pmean = data.timeSeries[i].parameters.filter(obj => {
          return obj.name === 'pmean'
        })[0].values[0];

        let rounded_temp = Math.round(temp);
        let rounded_windSpeed = Math.round(ws);
        let rounded_gust = Math.round(gust);
        let windDir = wd;

        let windSpeedOpacity = 0.2;
        if (rounded_windSpeed > 0) {
          windSpeedOpacity = rounded_windSpeed / 10;
        }

        let nightOrDay = "day";
        if (dateTime.getHours() < suntime.sunrise.getHours() ||
          dateTime.getHours() > suntime.sunset.getHours()) {
          nightOrDay = "night";
        }

        let row = table.insertRow(-1);

        if ((!isSameDay(dateTime, lastDateTime)) || (isFirstRow)) {
          addCell(row, 0, '&nbsp');
          row = table.insertRow(-1);
          if (isFirstRow) {
            let cell = addCell(row, 0, '<b>' + weekday + '</b> ' + dayAndMonth + ' - <b><a href="platser.html">' + geoname + '</a></b>');
            cell.colSpan = 6;
            isFirstRow = false;
          } else {
            let cell = addCell(row, 0, '<b>' + weekday + '</b> ' + dayAndMonth);
            cell.colSpan = 6;
          }
          row = table.insertRow(-1);
        } else {

        }

        let totalPrecip = Math.round(hoursSincePrevious * pmean * 10) / 10;

        console.log("hej");
        addCell(row, 0, 'kl. ' + timeOfDay);
        addCell(row, 1, '<img height=42 width=56 src="images/weather-80x60/' + nightOrDay + '/' + wsymb2 + '.png">');
        if (rounded_temp < 0) {
          addCellStyled(row, 2, rounded_temp + "°C", 'color:#0070ff;font-weight: bold;');
        } else {
          addCell(row, 2, rounded_temp + "°C");
        }
        addCell(row, 3, '<img src="images/arrow_south.svg" style="opacity:' + windSpeedOpacity + ';width:25px;height:25px;transform:rotate(' + windDir + 'deg);">');
        addCellStyled(row, 4, rounded_windSpeed + '(' + rounded_gust + ')m/s', 'opacity:' + windSpeedOpacity);
        if (pmean > 0) {
          addCellStyled(row, 5, totalPrecip + 'mm', 'color:#0070ff');
        } else {
          addCell(row, 5, '&nbsp');
        }

        lastDateTime = dateTime;
      }

      // Finally add about message
      let commentDiv = document.getElementById('commentDiv');
      commentDiv.innerHTML = "<a href=https://www.smhi.se/vader/prognoser/meteorologens-kommentar>Meterologens kommentarer (smhi.se)</a>";

      // Finally add about message
      let aboutDiv = document.getElementById('aboutDiv');
      aboutDiv.innerHTML = "All prognosdata hämtas från SMHI via SMHI Open Data API";

    }).catch((err) => {
      console.log(err)
      // Clear cookie if that is the problem
      deletePlaces();
    });

    return false;

  } catch (err) {
    console.log(err);
    // Clear cookie if that is the problem
    deletePlaces();
  }

}
