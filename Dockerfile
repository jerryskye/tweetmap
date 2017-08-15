FROM ruby:2.3

RUN apt-get update -qq && apt-get install -y build-essential
ENV APP_HOME /app
RUN mkdir $APP_HOME
WORKDIR $APP_HOME
COPY Gemfile $APP_HOME/
RUN bundle install
COPY config.ru $APP_HOME/
COPY client.yml $APP_HOME/
COPY config.yml $APP_HOME/
COPY spread.rb $APP_HOME/
COPY views $APP_HOME/views
COPY public $APP_HOME/public
