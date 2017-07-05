require 'geocoder'
require 'twitter'
require 'yaml'
require 'json'
require 'sinatra'
require 'haml'

set :client, YAML.load_file('client.yml')
set :config, YAML.load_file('config.yml')
Geocoder.configure(lookup: :google, api_key: settings.config['google_api_key'], timeout: 2)

get '/' do
  @search_query = settings.config['default_search_query']
  haml :index, :layout => :default
end

post '/search' do
  tweets = settings.client.search(params['query']).each
  @tweets_json = []
  tweets.each do |tweet|
    if tweet.geo?
      coords = tweet.geo.coords
      @tweets_json.push({'lat' => coords[0], 'lng' => coords[1]})
    else
      if tweet.user.location?
        location = Geocoder.search(tweet.user.location).first
        unless location.nil?
          coords = location.coordinates
          @tweets_json.push({'lat' => coords[0], 'lng' => coords[1]})
        end
      end
    end
  end
  @tweets_json = JSON.dump @tweets_json
  haml :search, :layout => :default
end
