-- Create `settings` table
CREATE TABLE `settings` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `value` TEXT NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_setting` (`name`)
);

-- Create `tweet_logs` table
CREATE TABLE `tweet_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `tweet_id` VARCHAR(255) NOT NULL,
  `account_id` VARCHAR(255) NOT NULL,
  `tweet_type` ENUM('tweet', 'retweet') NOT NULL,
  `content` VARCHAR(280),
  `likes` INT DEFAULT 0,
  `retweets` INT DEFAULT 0,
  `created_at` DATETIME NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
