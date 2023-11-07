# Database Schema Documentation

## Table `settings`

| Field       | Type         | Null | Key | Default           | Extra                         |
|-------------|--------------|------|-----|-------------------|-------------------------------|
| id          | INT          | NO   | PRI | NULL              | auto_increment                |
| name        | VARCHAR(255) | NO   | UNI | NULL              |                               |
| value       | TEXT         | NO   |     | NULL              |                               |
| updated_at  | TIMESTAMP    | YES  |     | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP   |

- **id**: Unique identifier for the setting.
- **name**: The name of the setting.
- **value**: The value of the setting.
- **updated_at**: The last time the setting was updated.

## Table `tweet_logs`

| Field       | Type         | Null | Key | Default           | Extra                         |
|-------------|--------------|------|-----|-------------------|-------------------------------|
| id          | INT          | NO   | PRI | NULL              | auto_increment                |
| tweet_id    | VARCHAR(255) | NO   |     | NULL              |                               |
| account_id  | VARCHAR(255) | NO   |     | NULL              |                               |
| tweet_type  | ENUM         | NO   |     | NULL              | ENUM('tweet', 'retweet')      |
| content     | VARCHAR(280) | YES  |     | NULL              |                               |
| likes       | INT          | YES  |     | 0                 |                               |
| retweets    | INT          | YES  |     | 0                 |                               |
| created_at  | DATETIME     | NO   |     | NULL              |                               |
| updated_at  | TIMESTAMP    | YES  |     | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP   |

- **id**: Unique identifier for the tweet log entry.
- **tweet_id**: The identifier for the tweet on Twitter.
- **account_id**: The identifier for the user account that posted the tweet.
- **tweet_type**: Type of the tweet, either 'tweet' or 'retweet'.
- **content**: The content of the tweet, limited to 280 characters.
- **likes**: Number of likes the tweet has received.
- **retweets**: Number of times the tweet has been retweeted.
- **created_at**: The timestamp when the tweet was created.
- **updated_at**: The timestamp when the tweet log was last updated.
