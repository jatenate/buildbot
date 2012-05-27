# Buildbot: Twitter DM Notifications

Buildbot let's you easily send notifications via Twitter DM's. It was originally created for sending DM's when a long running build completes, but can easily be used for arbitrary DM's (for example, a daily cron job that DM's the weather).

It is composed of two parts, the bbot script and the Buildbot server.

## bbot script

Prepend bbot to any command to receive a DM with the exit status when it completes.

```
bbot ant long-running-build
```

#### Setting up the bbot script

* Follow [@buildbot](http://www.twitter.com/buildbot)
* You will receive a DM from @buildbot with a token for your account (for example: `"octopusorange"`)
* Set `$BBOT_TO` and `$BBOT_TOKEN` environment variables

```
# Add to your sh profile
export BBOT_TO="your_twitter_handle"
export BBOT_TOKEN="octopusorange"
```

* Put the `bbot` script somewhere in your `PATH`

```
cp ./bbot /usr/local/bin/bbot
chmod +x /usr/local/bin/bbot
```

#### Using Buildbot via curl

`GET` requests to `bldbt.com/send` require 3 parameters:

1. `to`: twitter handle of the user to send to (ie ladygaga). This user must follow @buildbot
2. `token`: token for the user specified by `to`. This token was automatically sent as a DM from @buildbot when you followed
3. `text`: URL encoded text to send

```
curl -G --data-urlencode "text=This is a test of the emergency buildbot system" bldbt.com/send?to=$BBOT_TO&token=$BBOT_TOKEN
```

#### Limitations

The twitter API [limits each account to 250 DM's per day](https://support.twitter.com/articles/15364-about-twitter-limits-update-api-dm-and-following). Want to send a lot? Set up your own instance of Buildbot below.

The twitter API also [prevents you from sending the same dm more than once](https://support.twitter.com/articles/68809). To get around this, when a send fails because the text has been sent before, buildbot prepends a random hex string to the text.



## Buildbot server

An instance of the Buildbot server is running at bldbt.com, using the @buildbot account to send DM's. To set up your own server:

* [Create a new twitter app](https://dev.twitter.com/apps), and generate access tokens for it
* Clone the Buildbot Repo

```
git clone git@github.com:jatenate/buildbot.git
cd buildbot
git remote add upstream git://github.com/jatenate/buildbot.git
npm install
```
* Set `CONSUMER_KEY`, `CONSUMER_SECRET`, `ACCESS_TOKEN`, and `ACCESS_SECRET` in `server/modules/twitter.js`
* Start redis and buildbot

```
redis-server
node server/app.js
```
