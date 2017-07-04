require 'twitter'
require 'yaml'
require 'pry'
require 'net-http-spy'
require 'logger'

logger = Logger.new 'requests.log'
Net::HTTP.http_logger = logger
client = YAML.load_file 'client2.yml'
SEARCH_QUERY = "#Petya OR #petya OR Petya OR petya geocode:52,21,1000km -filter:retweets"
tweets = client.search(SEARCH_QUERY)
tweets_ary = tweets.each.to_a
ITERATION_COUNT = 15

logger.debug "Starting threads."
begin
thr1 = Thread.new do
  newer_tweets = tweets
  newer_tweets_ary = []
  Thread.current[:count] = 0
  ITERATION_COUNT.times do |i|
    logger.debug 'iteration %d' % i
    newer_tweets = client.search(SEARCH_QUERY, {since_id: newer_tweets.max_by(&:id)})
    ary = newer_tweets.each.to_a
    newer_tweets_ary += ary
    Thread.current[:count] += ary.count
    break unless ary.count > 0
  end
  newer_tweets_ary
end

thr2 = Thread.new do
  older_tweets = tweets
  older_tweets_ary = []
  Thread.current[:count] = 0
  ITERATION_COUNT.times do |i|
    logger.debug 'iteration %d' % i
    older_tweets = client.search(SEARCH_QUERY, {since_id: older_tweets.min_by(&:id)})
    ary = older_tweets.each.to_a
    older_tweets_ary += ary
    Thread.current[:count] += ary.count
    break unless ary.count > 0
  end
  older_tweets_ary
end
all_tweets = thr1.value + thr2.value
tweets_with_geo = all_tweets.select(&:geo?)
tweets_with_user_location = all_tweets.select {|tweet| tweet.user.location?}
rescue Twitter::Error::TooManyRequests
  logger.debug thr1[:count]
  logger.debug thr2[:count]
end
pry
