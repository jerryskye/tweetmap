require 'geocoder'
require 'twitter'
require 'yaml'
require 'json'
require 'sinatra'
require 'haml'

set :client, YAML.load_file('client.yml')
set :config, YAML.load_file('config.yml')
Geocoder.configure(lookup: :google, api_key: settings.config['google_api_key'])

helpers do
  def asset_url asset
    settings.config['host'] + settings.config['base_url'] + asset
  end

  def action_url action
    settings.config['base_url'] + action
  end
end

get '/' do
  @search_query = settings.config['default_search_query']
  haml :index
end

get '/search.json' do
  content_type :json
  tweets = settings.client.search(params['query']).each
  @tweets = []
  tweets.each do |tweet|
    if tweet.geo?
      coords = tweet.geo.coords
      @tweets.push({'lat' => coords[0], 'lng' => coords[1]})
    else
      if tweet.user.location?
        location = Geocoder.search(tweet.user.location).first
        unless location.nil?
          coords = location.coordinates
          @tweets.push({'lat' => coords[0], 'lng' => coords[1]})
        end
      end
    end
  end
  @tweets.to_json
end
