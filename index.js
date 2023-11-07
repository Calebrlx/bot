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

/*

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

*/

function postTweet(tweetData) { 
  (async () => {
    try {
      // Note: the URL and the parameters are dependent on the Twitter API version you are using.
      // Make sure you refer to the correct documentation for API v2.
      const { data: responseData, errors } = await client.post('tweets', tweetData);

      // If there's an error returned by the Twitter API, log the error message.
      if (errors) {
        console.log('Errors:', errors);
      } else {
        // If the request was successful, the new tweet's data would be logged here.
        console.log('Tweet created:', responseData);
      }
    } catch (error) {
      // In case of a network error or other Axios-related issue, it will be caught here.
      console.error('Error posting the tweet:', error);
    }
  })();
}

async function GPT() {
  // First step - getting ideas
  const ideasResponse = await openai.chat.completions.create({
    messages: [{
      role: 'system', 
      content: 'You are an AI managing the Twitter page for Relixs, an innovative AI service provider. Craft tweets that are creative, engaging, and shareable to elevate brand visibility among young adults aged 18 to 24—a group that may be interested in tech but isnt deeply acquainted with AI. Highlight the practicality and fascination of AI technology in everyday life, using a conversational tone that resonates with this demographic. Include varied content such as intriguing AI facts, light humor, user interactive polls, and tech tips to spark curiosity and dialogue. Every tweet should reflect Relixs cutting-edge expertise and friendly approach to technology, enticing followers to learn more and engage with the brand. Encourage interaction by asking questions or inviting followers to share their views on AI, and always include a call to action when appropriate.'
    }, {
      role: 'user', 
      content: 'Could you draft five tweet concepts based on the guidance provided? Id love to see a mix of content types, from AI facts to interactive elements. Lets make them catchy!'
    }],
    model: 'gpt-4',
  });

  // Parse the ideas into a format that can be concatenated into a follow-up message
  const ideaContents = ideasResponse.choices[0].message.content;

  // Second step - evaluating tweets
  const evalResponse = await openai.chat.completions.create({
    messages: [{
      role: 'system', 
      content: 'You are an AI tasked with assessing the impact and engagement potential of tweet concepts for Relixs’s Twitter page, targeting young adults aged 18 to 24. Review the provided tweet concepts, considering factors such as relevance to the AI industry, likelihood to inspire engagement (likes, retweets, replies), and alignment with Relixss brand voice. Your objective is to critically evaluate each tweet for its creativity, engagement level, clarity, and call to action. Identify the tweet that you anticipate will perform the best based on these criteria, and explain your rationale for the selection'
    }, {
      role: 'user', 
      content: 'Based on prior analysis, the third tweet was determined to be the most effective due to its balance of informative content and a clear call to action. Here are the tweets for a final review: ' + ideaContents
    }],
    model: 'gpt-4',
  });

  // Extract the best tweet analysis from the evaluation
  const evalContent = evalResponse.choices[0].message.content;

  // Third step - selecting the final tweet to post
  const finalResponse = await openai.chat.completions.create({
    messages: [{
      role: 'system', 
      content: 'You are an AI tasked with choosing the final tweet to post for Relixs. Review the potential tweets and their corresponding analyses to select the most effective one for engagement with an 18 to 24-year-old demographic. End your response with the final tweet text only.'
    }, {
      role: 'user', 
      content: 'Based on prior analysis, the third tweet was determined to be the most effective due to its balance of informative content and a clear call to action. Here are the tweets for a final review: ' + evalContent
    }],
    model: 'gpt-4',
  });

  // Extract the final tweet
  const finalTweet = finalResponse.choices[0].message.content.trim();
  console.log(finalTweet);
  // Now postTweet should be a defined function that takes 'finalTweet' as the tweet text to post
  postTweet(finalTweet);
}

// Call the GPT function to perform the operations
GPT().catch(console.error);

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

function customLogic() {
  // Your logic to trigger a tweet goes here...
  GPT();
  scheduleNextAction();
}

const server = http.createServer((req, res) => {
  if (req.url === '/tweet-now') {
    customLogic();
    currentStatus = 'Tweet sent!';
    res.writeHead(302, { 'Location': '/' });
    res.end();
  } else if (req.url === '/reset-timer') {
    scheduleNextAction();
    currentStatus = 'Timer reset, waiting to tweet...';
    res.writeHead(302, { 'Location': '/' });
    res.end();
  } else {
    // Serve an HTML page with improved UI and dark mode
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Relixs Twitter Scheduler</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #121212;
            color: #fff;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
          }
          h1, p {
            text-align: center;
          }
          .container {
            max-width: 600px;
            margin: auto;
            padding: 20px;
          }
          .status {
            background-color: #222;
            padding: 10px;
            border: 1px solid #333;
            margin: 20px 0;
          }
          input[type=submit] {
            display: block;
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            border: none;
            border-radius: 5px;
            background-color: #1E90FF;
            color: white;
            cursor: pointer;
            font-size: 18px;
          }
          input[type=submit]:hover {
            background-color: #4169E1;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Relixs Twitter Scheduler Status</h1>
          <div class="status">
            <p>Next tweet will be sent at: ${nextTweetTime.toLocaleString("en-US", {timeZone: "America/Denver"})}</p>
            <p>Current status: ${currentStatus}</p>
          </div>
          <form action="/tweet-now" method="post">
            <input type="submit" value="Tweet Now" />
          </form>
          <form action="/reset-timer" method="post">
            <input type="submit" value="Reset Timer" />
          </form>
        </div>
      </body>
      </html>
    `);
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  scheduleNextAction(); // Start the schedule
});
