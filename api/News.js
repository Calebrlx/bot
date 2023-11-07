const NewsAPI = require('newsapi');
require('dotenv').config();

const newsapi = new NewsAPI('7e73302f019e47a39a38638b83625732');


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