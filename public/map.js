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
      initMap(result);
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

  var markers = tweets.map(function(tweet, i) {
    var marker = new google.maps.Marker({
      position: tweet,
      map: map
    });
    marker.tweet = tweet;
    marker.addListener('click', function() {
      var tweet = marker.tweet;
      $('#tweetinfo').html('<strong>Text:</strong> ' + tweet.text + '<br><strong>Created_at:</strong> ' + tweet.created_at + '<br><strong>Location:</strong> ' + tweet.address);
    });
    return marker;
  });

  var markerCluster = new MarkerClusterer(map, markers,
    {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
};
