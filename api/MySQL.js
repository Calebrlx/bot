// Import the mysql2 package
const mysql = require('mysql2');

// Create a connection to the database
const connection = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
});

// Connect to MySQL
connection.connect(error => {
  if (error) {
    return console.error('error: ' + error.message);
  }
  console.log('Connected to the MySQL server.');
});

// Function to insert tweet logs
const addTweetLog = (tweetId, accountId, tweetType, content, callback) => {
  // SQL statement to insert tweet log
  const sql = `
    INSERT INTO tweet_logs (tweet_id, account_id, tweet_type, content, created_at)
    VALUES (?, ?, ?, ?, NOW());
  `;

  // Execute the SQL statement with the provided data
  connection.execute(sql, [tweetId, accountId, tweetType, content], (error, results, fields) => {
    if (error) {
      return callback(error);
    }
    callback(null, results);
  });
};

// Export the function to use in other modules
module.exports = {
  addTweetLog,
};
