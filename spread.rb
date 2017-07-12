require 'redis'
require 'geocoder'
require 'twitter'
require 'yaml'
require 'json'
require 'sinatra'
require 'haml'

set :client, YAML.load_file('client.yml')
set :config, YAML.load_file('config.yml')
set :redis, Redis.new(host: 'redis')
Geocoder.configure(lookup: :google, api_key: settings.config['google_api_key'], use_https: true, timeout: settings.config['geocoder_timeout'])

helpers do
  def asset_url asset
    settings.config['host'] + settings.config['base_url'] + asset
  end

  def action_url action
    settings.config['base_url'] + action
  end
end

get '/' do
  haml :index
end

get '/search.json' do
  content_type :json
  tweets = settings.client.search(params['query']).each
  @tweets = []
  tweets.each do |tweet|
    if tweet.geo?
      coords = tweet.geo.coords
      @tweets.push({'text' => tweet.text, 'created_at' => tweet.created_at, 'lat' => coords[0], 'lng' => coords[1]})
    else
      if tweet.user.location?
        coords_ary = settings.redis.get(tweet.user.location.downcase.strip)
        if coords_ary.nil?
          result = Geocoder.search(tweet.user.location).first
          unless result.nil?
            coords = result.coordinates
            settings.redis.set(tweet.user.location.downcase.strip, JSON.dump(coords))
            @tweets.push({'text' => tweet.text, 'created_at' => tweet.created_at, 'lat' => coords[0], 'lng' => coords[1], 'address' => tweet.user.location})
          end
        else
          coords = JSON.parse(coords_ary)
          @tweets.push({'text' => tweet.text, 'created_at' => tweet.created_at, 'lat' => coords[0], 'lng' => coords[1], 'address' => tweet.user.location})
        end
      end
    end
  end
  @tweets.to_json
end
