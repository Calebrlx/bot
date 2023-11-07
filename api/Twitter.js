const { TwitterApi } = require('twitter-api-v2');
const logFilePath = './data/tweet_log.txt';
require('dotenv').config();

const client = new TwitterApi({
    appKey: process.env.TWITTER_CONSUMER_KEY,
    appSecret: process.env.TWITTER_CONSUMER_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});
  
const rwClient = client.readWrite;
const tweetPostingEnabled = true;

async function postTweet(status) {
    if (!tweetPostingEnabled) {
        console.log("Tweet posting is disabled.");
        return;
    }
    
    try {
        const tweet = await rwClient.v2.tweet(status);
        console.log("Successfully tweeted: ", tweet);
        return tweet; // Return the tweet object if you need it outside
    } catch (error) {
        console.error("Failed to tweet. Error: ", error);
        if (error?.response) { // Optional chaining for safety
            console.error("Response status code: ", error.response.status);
            console.error("Response body: ", error.response.data);
        }
        throw error; // Re-throw the error for the caller to handle
    }
}

function logTweet(tweet) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - ${tweet}\n`;
    fs.appendFile(logFilePath, logEntry, function(err) {
      if (err) throw err;
      console.log('Saved tweet to log:', tweet);
    });
}

// Export the functions you want to make available
module.exports = {
    postTweet,
    logTweet 
};