function getTweets(event) {
  event.preventDefault();
  var req = new XMLHttpRequest();
  req.open("GET", event.target.action + "?query=" + encodeURIComponent(document.getElementById('query').value, true));
  req.onreadystatechange = function() {
    if(this.readyState == XMLHttpRequest.DONE) {
      if(this.status == 200) {
        initMap(JSON.parse(this.responseText));
      }
      else {
        document.getElementById("container").innerHTML = this.responseText;
      }
    }
  }
  req.send();
  document.getElementById("map").innerText = "Map is loading...";
};

function initMap(tweets) {
  var fbc = {lat: 52.233002, lng: 21.038452};

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 3,
    center: fbc
  });

  var markers = tweets.map(function(loc, i) {
    return new google.maps.Marker({
      position: loc,
    });
  });

  var markerCluster = new MarkerClusterer(map, markers,
    {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
};
