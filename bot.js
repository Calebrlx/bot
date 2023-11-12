const OpenAI = require('./api/OpenAI');
const { postTweet } = require('./api/Twitter');

let nextTweetTime = '';
let currentStatus = 'Waiting to send the next tweet...';

const ideasSys = "You are an AI managing the Twitter page for Relixs, an innovative AI service provider. Craft tweets that are creative, engaging, and shareable to elevate brand visibility among young adults aged 18 to 24—a group that may be interested in tech but isnt deeply acquainted with AI. Highlight the practicality and fascination of AI technology in everyday life, using a conversational tone that resonates with this demographic. Include varied content such as intriguing AI facts, light humor, user interactive polls, and tech tips to spark curiosity and dialogue. Every tweet should reflect Relixs cutting-edge expertise and friendly approach to technology, enticing followers to learn more and engage with the brand. Encourage interaction by asking questions or inviting followers to share their views on AI, and always include a call to action when appropriate."

const ideasMsg = "Could you draft five tweet concepts based on the guidance provided? Id love to see a mix of content types, from AI facts to interactive elements. Lets make them catchy!"

const evalSys = "You are an AI tasked with assessing the impact and engagement potential of tweet concepts for Relixs’s Twitter page, targeting young adults aged 18 to 24. Review the provided tweet concepts, considering factors such as relevance to the AI industry, likelihood to inspire engagement (likes, retweets, replies), and alignment with Relixss brand voice. Your objective is to critically evaluate each tweet for its creativity, engagement level, clarity, and call to action. Identify the tweet that you anticipate will perform the best based on these criteria, and explain your rationale for the selection"

const evalMsg = "Based on prior analysis, the third tweet was determined to be the most effective due to its balance of informative content and a clear call to action. Here are the tweets for a final review: " // Needs to be fixed

const finalSys = "You are an AI tasked with choosing the final tweet to post for Relixs. Review the potential tweets and their corresponding analyses to select the most effective one for engagement with an 18 to 24-year-old demographic. End your response with the final tweet text only."

const finalMsg = "Based on prior analysis, the third tweet was determined to be the most effective due to its balance of informative content and a clear call to action. Here are the tweets for a final review: " // Needs to be fixed

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

function formatFinal(tweet) {
  // Remove quotes at the beginning and end if present
  if (tweet.startsWith('"') && tweet.endsWith('"')) {
      return tweet.substring(1, tweet.length - 1);
  }
  return tweet;
}

async function main() { 
    let finalTweet = ''; // Initialize the variable to use it outside of try-catch
    try {

        const ideas = await OpenAI.callGPT(ideasSys, ideasMsg); 
        const evaluation = await OpenAI.evalTweets(evalSys, evalMsg + ideas); 
        finalTweet = await OpenAI.finalTweet(finalSys, finalMsg + evaluation);
        finalTweet = formatFinal(finalTweet);
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
