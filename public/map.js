function buildQuery(form) {
  var query = '';
  var queryKeywords = {
    'tags': '',
    'since': 'since:',
    'until': 'until:'
  };
  var inputs = form.getElementsByTagName('input');
  for(var i = 0; i < inputs.length; i++) {
    var input = inputs[i]
    if(inputs[i].type == 'text' && input.value.length > 0)
      query += queryKeywords[input.id] + input.value + ' ';
    else
      if(inputs[i].type == 'checkbox' && !inputs[i].checked)
        query += '-filter:retweets';
  }
  return encodeURIComponent(query);
};

function getTweets(event) {
  event.preventDefault();
  var form = event.target;
  var req = new XMLHttpRequest();
  req.open("GET", form.action + "?query=" + buildQuery(form), true);
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
