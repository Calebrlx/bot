const { TwitterApi } = require('twitter-api-v2');
const MySQL = require('./MySQL.js');
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
        
        // Log the tweet to the database after successfully tweeting
        logTweet(tweet);

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


// Function to delete a tweet
async function deleteTweet(tweetId) {
    if (!tweetPostingEnabled) {
      console.log("Tweet deletion is disabled.");
      return;
    }
  
    try {
      await rwClient.v2.deleteTweet(tweetId); // Deletes the tweet
      console.log(`Successfully deleted tweet with ID: ${tweetId}`);
      // You might also want to remove this tweet's log from the database here if necessary
    } catch (error) {
      console.error(`Failed to delete tweet with ID ${tweetId}. Error: `, error);
      if (error?.response) { // Optional chaining for safety
        console.error("Response status code: ", error.response.status);
        console.error("Response body: ", error.response.data);
      }
      throw error; // Re-throw the error for the caller to handle
    }
  }

// Update logTweet to insert into the database
function logTweet(tweet) {
    // Extract necessary tweet information
    const tweetId = tweet.data.id; // The ID of the tweet
    const accountId = tweet.includes.users[0].id; // The ID of the account that posted the tweet
    const tweetType = tweet.data.text.startsWith("RT") ? 'retweet' : 'tweet'; // Check if it's a retweet
    const content = tweet.data.text; // The content of the tweet
    
    // Call addTweetLog to insert the data into the tweet_logs table
    MySQL.addTweetLog(tweetId, accountId, tweetType, content, (error, results) => {
        if (error) {
            console.error('Error logging tweet to DB:', error);
        } else {
            console.log('Logged tweet to DB:', results);
        }
    });
}


// Export the functions you want to make available
module.exports = {
    postTweet,
    logTweet,
    deleteTweet
};