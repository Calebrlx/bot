const OpenAI = require('./api/OpenAI');
const { postTweet } = require('./api/Twitter');

let nextTweetTime = '';
let currentStatus = 'Waiting to send the next tweet...';

// Random time generator function based on current time
function generateRandomTime() {
    const currentHour = new Date().getHours();
    let randomHour, randomMinute, randomSecond;
  
    // If current time is before 3 PM, schedule for current day
    // Otherwise, schedule for next day if it's past 10 PM
    let scheduleDate = new Date();
    if (currentHour >= 15 && currentHour < 19) {
      // Choose a time between 7 PM - 10 PM if it's past 3 PM
      randomHour = Math.floor(Math.random() * 3 + 19);
    } else {
      // Choose a time between 12 PM - 3 PM
      if (currentHour >= 10) {
        // If it's past 10 AM, schedule for the next day
        scheduleDate.setDate(scheduleDate.getDate() + 1);
      }
      randomHour = Math.floor(Math.random() * 3 + 12);
    }
    randomMinute = Math.floor(Math.random() * 60);
    randomSecond = Math.floor(Math.random() * 60);
  
    // Set the random time for execution
    scheduleDate.setHours(randomHour + 7, randomMinute, randomSecond, 0);
  
    return scheduleDate;
}

// Schedule a function to run at the random time
function scheduleNextAction() {
    const nextTime = generateRandomTime();
    nextTweetTime = nextTime; // Store the next tweet time globally
  
    const delay = nextTime.getTime() - new Date().getTime();
    if (delay < 0) {
      // If for any reason the delay is negative, schedule immediately
      setImmediate(main);
      currentStatus = 'Sending tweet immediately due to time calculation error.';
    } else {
      console.log(`Next action scheduled for: ${nextTime}`);
      setTimeout(main, delay);
      currentStatus = 'Waiting to send the next tweet...';
    }
}

async function main() { 
    let finalTweet = ''; // Initialize the variable to use it outside of try-catch
    try {
        const ideas = await OpenAI.tweetIdeas(); 
        const evaluation = await OpenAI.evalTweets(ideas); 
        finalTweet = await OpenAI.finalTweet(evaluation); 
    } catch (error) {
        console.error("An error occurred in the tweet generation process:", error);
        scheduleNextAction(); // Ensure we schedule the next action even if this one fails
        return; // Exit the function if an error occurs
    }

    postTweet(finalTweet)
        .then((tweet) => {
            console.log(tweet); // Log the successful tweet data
        })
        .catch((error) => {
            console.error("An error occurred when trying to post the tweet:", error);
        });

    scheduleNextAction();
}

module.exports = {
    main,
    scheduleNextAction
};
