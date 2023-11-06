const http = require('http');
const PORT = 3000;
const Twitter = require('twitter');
const OpenAI = require('openai');
const NewsAPI = require('newsapi');
require('dotenv').config();

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const newsapi = new NewsAPI('7e73302f019e47a39a38638b83625732');

function postTweet(status) {
  client.post('statuses/update', {status}, function(error, tweet, response) {
    if (!error) {
      console.log("Successfully tweeted: " + tweet.text);
    } else {
      console.error("Failed to tweet. Error:", error);
      if (response) {
        console.log("Response statusCode:", response.statusCode);
        console.log("Response body:", response.body);
      }
    }
  });
}

async function GPT() {
  const ideas = await openai.chat.completions.create({
    messages: [{ role: 'system', content: 'You are an AI managing the Twitter page for Relixs, an innovative AI service provider. Craft tweets that are creative, engaging, and shareable to elevate brand visibility among young adults aged 18 to 24—a group that may be interested in tech but isnt deeply acquainted with AI. Highlight the practicality and fascination of AI technology in everyday life, using a conversational tone that resonates with this demographic. Include varied content such as intriguing AI facts, light humor, user interactive polls, and tech tips to spark curiosity and dialogue. Every tweet should reflect Relixs cutting-edge expertise and friendly approach to technology, enticing followers to learn more and engage with the brand. Encourage interaction by asking questions or inviting followers to share their views on AI, and always include a call to action when appropriate.' }, { role: 'user', content: 'Could you draft five tweet concepts based on the guidance provided? Id love to see a mix of content types, from AI facts to interactive elements. Lets make them catchy!' }],
    model: 'gpt-3.5-turbo',
  });
  const eval = await openai.chat.completions.create({
    messages: [{ role: 'system', content: 'You are an AI tasked with assessing the impact and engagement potential of tweet concepts for Relixs’s Twitter page, targeting young adults aged 18 to 24. Review the provided tweet concepts, considering factors such as relevance to the AI industry, likelihood to inspire engagement (likes, retweets, replies), and alignment with Relixss brand voice. Your objective is to critically evaluate each tweet for its creativity, engagement level, clarity, and call to action. Identify the tweet that you anticipate will perform the best based on these criteria, and explain your rationale for the selection.' }, { role: 'user', content: 'Here are the tweet concepts weve generated:' + ideas + '. Which one do you think we should post first, and why?' }],
    model: 'gpt-3.5-turbo',
  });
  const final = await openai.chat.completions.create({
    messages: [{ role: 'system', content: 'You are an AI tasked with choosing the final tweet to post for Relixs. Review the potential tweets and their corresponding analyses to select the most effective one for engagement with an 18 to 24-year-old demographic. End your response with the final tweet text only.' }, {role: 'user', content: 'Based on prior analysis, the third tweet was determined to be the most effective due to its balance of informative content and a clear call to action. Here are the tweets for a final review:' + eval}],
    model: 'gpt-3.5-turbo',
  });
  postTweet(final);
}

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
    setImmediate(customLogic);
    currentStatus = 'Sending tweet immediately due to time calculation error.';
  } else {
    console.log(`Next action scheduled for: ${nextTime}`);
    setTimeout(customLogic, delay);
    currentStatus = 'Waiting to send the next tweet...';
  }
}

function news() {
  newsapi.v2.topHeadlines({
    sources: 'bbc-news,the-verge',
    q: 'bitcoin',
    category: 'business',
    language: 'en',
    country: 'us'
  }).then(response => {
    console.log(response);
  });
}

// Place your custom logic here
function customLogic() {
  GPT()
  scheduleNextAction();
}

const server = http.createServer((req, res) => {
  // Serve an HTML page
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Relixs Twitter Scheduler</title>
    </head>
    <body>
      <h1>Relixs Twitter Scheduler Status</h1>
      <p>Next tweet will be sent at: ${nextTweetTime.toLocaleString()}</p>
      <p>Current status: ${currentStatus}</p>
    </body>
    </html>
  `);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  scheduleNextAction(); // This will start the first scheduling
});