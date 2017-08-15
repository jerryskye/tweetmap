Date.prototype.addDays = function(days) {
  var dat = new Date(this.valueOf())
  dat.setDate(dat.getDate() + days);
  return dat;
};

function getDaysBetween(startDate, stopDate) {
  var dateArray = new Array();
  var currentDate = startDate;
  while (currentDate <= stopDate) {
    dateArray.push( new Date (currentDate) )
    currentDate = currentDate.addDays(1);
  }
  dateArray.push(stopDate);
  return dateArray;
};

function buildQuery() {
  var query = '';
  var queryKeywords = {
    'tags': '',
    'since': 'since:',
    'until': 'until:'
  };
  var inputs = $('form > input');
  for(var i = 0; i < inputs.length; i++) {
    var input = inputs[i]
    if(inputs[i].type == 'text' && input.value.length > 0)
      query += queryKeywords[input.id] + input.value + ' ';
    else
      if(inputs[i].type == 'checkbox' && !inputs[i].checked)
        query += '-filter:retweets';
  }
  return query;
};

function getTweets(event) {
  event.preventDefault();
  var form = event.target;
  $.ajax({url: form.action,
    data: {
      query: buildQuery()
    },
    dataType: 'json',
    beforeSend: function() {
      $('#map').html("<h4>Map is loading...</h4>");
    },
    success: function(result) {
      if(result.length > 0)
        initMap(result);
      else
        $('#map').html("<h3>Didn't find any Tweets.</h3>");

    },
    error: function(jqXHR, textStatus, errorThrown) {
      $('#map').html("<h3>" + errorThrown + "</h3>");
    }
  });
};

function initMap(tweets) {
  var fbc = {lat: 52.233002, lng: 21.038452};

  var map = new google.maps.Map($('#map')[0], {
    zoom: 3,
    center: fbc
  });

  markers = tweets.map(function(tweet, i) {
    var marker = new google.maps.Marker({
      position: tweet,
    });
    tweet.created_at = new Date(tweet.created_at);
    marker.tweet = tweet;
    marker.addListener('click', function() {
      var tweet = marker.tweet;
      $('#tweetinfo').html('<strong>Text:</strong> ' + tweet.text + '<br><strong>Created_at:</strong> ' + tweet.created_at + '<br><strong>Location:</strong> ' + tweet.address);
    });
    return marker;
  });

  markerCluster = new MarkerClusterer(map, [], {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});

  days = getDaysBetween(tweets[tweets.length - 1].created_at, tweets[0].created_at);
  var slider = $('<input type="range" value="0" onchange="updateSlider(this.value);">');
  slider.prop('max', days.length - 1);
  $('#slider').html(slider.prop('outerHTML') + '<br><p class="text-center">Use the above slider to cycle through time</p>');
  updateSlider(slider.val());
};

function filterMarker(marker, date) {
  if(marker.tweet.created_at <= date) {
    if(!markerCluster.getMarkers().includes(marker))
      markerCluster.addMarker(marker);
  }
  else
    markerCluster.removeMarker(marker);
};

function updateSlider(value) {
  $("#date").text("Loading...");
  var date = days[value];
  markers.forEach(function(m){ filterMarker(m, date) });
  markerCluster.redraw();
  $('#date').text(date);
};
