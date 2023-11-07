const http = require('http');
const WebSocket = require('ws');
const PORT = 3000;
const { parse } = require('url');
require('dotenv').config();
const fs = require('fs');
const express = require('express');
const app = express();
const bot = require('./bot.js'); // Make sure you have the 'bot.js' file with correct exports.

// Middleware to serve static files from the 'public' directory.
app.use(express.static('public'));

// Create HTTP server using Express to handle incoming HTTP requests.
const server = http.createServer(app);

// Define actions on specific POST requests.
app.post('/tweet-now', async (req, res) => {
  try {
    await bot.main(); // Ensure 'main' is an async function in bot.js.
    bot.currentStatus = 'Tweet sent!';
    res.redirect('/'); // Redirect to home after posting.
  } catch (error) {
    console.error('Error in /tweet-now:', error);
    res.status(500).send('Error sending tweet.');
  }
});

app.post('/reset-timer', async (req, res) => {
  try {
    bot.scheduleNextAction(); // This doesn't need to be async unless you make changes.
    bot.currentStatus = 'Timer reset, waiting to tweet...';
    res.redirect('/'); // Redirect to home after resetting.
  } catch (error) {
    console.error('Error in /reset-timer:', error);
    res.status(500).send('Error resetting timer.');
  }
});

app.post('/toggle-posting', async (req, res) => {
  bot.tweetPostingEnabled = !bot.tweetPostingEnabled; // Assuming this variable is exported from bot.js.
  const message = `Tweet posting is now ${bot.tweetPostingEnabled ? 'enabled' : 'disabled'}.`;
  res.send(message); // Send back the current state as response.
});

// Add this to handle delete requests from your application front-end
app.post('/delete-tweet', async (req, res) => {
  // You need to send 'tweetId' from the client to delete the specific tweet.
  // Here, we assume you will use x-www-form-urlencoded content type
  // and 'tweetId' will be a field in the POST request body.
  // Don't forget to use `app.use(express.urlencoded({extended: true}));` middleware to parse the POST body.

  const { tweetId } = req.body; // Replace with the actual parsing logic according to your frontend

  if (!tweetId) {
    res.status(400).send('Tweet ID is required');
    return;
  }

  try {
    await bot.deleteTweet(tweetId); // Assuming you export deleteTweet in bot.js
    res.send(`Tweet with ID ${tweetId} is scheduled for deletion.`); // Or redirect as needed
  } catch (error) {
    console.error(`Error deleting tweet with ID ${tweetId}:`, error);
    res.status(500).send(`Error deleting tweet with ID ${tweetId}.`);
  }
});


// Initialize WebSocket server.
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    console.log('received: %s', message);
  });

  ws.send('something');
});

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

// Override console.log to broadcast messages to WebSocket clients.
const originalConsoleLog = console.log;
console.log = function(...args) {
  originalConsoleLog.apply(console, args);
  wss.broadcast(JSON.stringify({ type: 'log', message: args.join(' ') }));
};

// Start the server.
server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
  bot.scheduleNextAction(); // Make sure this function exists in bot.js and is exported.
});

module.exports = server; // Exporting the server can be helpful for testing.

/*

const http = require('http');
const WebSocket = require('ws');
const PORT = 3000;
const { parse } = require('url');
require('dotenv').config();
const fs = require('fs');
const express = require('express');
const app = express();
const bot = require('./bot.js');

app.use(express.static('public'));

const server = http.createServer((req, res) => {
  const { pathname } = parse(req.url, true);
  
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk; // Convert Buffer to string
    });
    req.on('end', () => {
      if (pathname === '/tweet-now') {
        main();
        currentStatus = 'Tweet sent!';
        res.writeHead(302, { 'Location': '/' });
        res.end();
      } else if (pathname === '/reset-timer') {
        scheduleNextAction();
        currentStatus = 'Timer reset, waiting to tweet...';
        res.writeHead(302, { 'Location': '/' });
        res.end();
      } else if (req.url === '/toggle-posting') {
        tweetPostingEnabled = !tweetPostingEnabled;
        const message = `Tweet posting is now ${tweetPostingEnabled ? 'enabled' : 'disabled'}.`;
        console.log(message);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(message);
        return;
      }
      });
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
            background-color: #242933;
            background-image: url('background.svg');
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
            background-color: #333;
            color: #ddd;
            cursor: pointer;
            font-size: 18px;
            transition: background-color 0.3s ease;
          }
          input[type=submit]:hover {
            background-color: #444;
          }
          #terminal {
            background-color: #000;
            color: #37FDFC;
            border: 1px solid #333;
            padding: 10px;
            width: 100%;
            height: 300px;
            overflow-y: scroll;
            font-family: 'Courier New', Courier, monospace;
            white-space: pre;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Relixs Twitter Scheduler Status</h1>
          <form action="/toggle-posting" method="post">
            <input type="submit" value="Toggle Tweet Posting" />
          </form>
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
        <div id="terminal"></div>
      </body>
      <script>
      // Create WebSocket connection.
      const socket = new WebSocket('ws://localhost:3000');

      // Connection opened
      socket.addEventListener('open', function(event) {
        console.log('Connected to WS Server')
      });

      // Listen for messages
      socket.addEventListener('message', function(event) {
        const logEntry = JSON.parse(event.data);
        if(logEntry.type === 'log') {
          const terminal = document.getElementById('terminal');
          // Append received message to the terminal
          terminal.textContent += logEntry.message + '\n';
          // Auto scroll to the bottom of the terminal
          terminal.scrollTop = terminal.scrollHeight;
        }
      });
      </script>
      </html>
    `);
  }
});

const wss = new WebSocket.Server({ server });

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

const originalConsoleLog = console.log;
console.log = function(...args) {
  originalConsoleLog.apply(console, args);
  // Send the log to the WebSocket
  wss.broadcast(JSON.stringify({ type: 'log', message: args.join(' ') }));
};

server.listen(PORT, function listening() {
  console.log(`Listening on ${server.address().port}`);
  scheduleNextAction();
});

*/