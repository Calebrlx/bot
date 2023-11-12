const OpenAI = require('./api/OpenAI');

const BLOG_BRAINSTORM_SYSTEM_MSG = `
    You are an AI designed to brainstorm blog post ideas for https://blogs.relix.ai. The audience is young adults interested in technology, especially AI. Generate ideas that are SEO-friendly, covering trends, how-to guides, industry insights, AI impact stories, and historical retrospectives. The ideas should appeal to tech enthusiasts and novices alike and be optimized for search engines with potential keywords highlighted.
`;

const BLOG_CREATION_SYSTEM_MSG = `
    You are an AI responsible for drafting detailed blog posts in markdown format. Use the provided blog ideas list and follow SEO best practices with keyword-rich headers and subheaders, engaging introductions, and structured content that provides value to readers and encourages social sharing. Remember to format the blog post with the proper metadata for title, subtitle, date, and category.
`;

// Function to brainstorm blog ideas and titles
async function brainstormBlogIdeas() {
    const userMessage = "I need a list of potential blog post topics with engaging titles and subtitles that cater to young adults with an interest in AI. They should be informative and SEO-optimized.";
    return await openai.callGPT(BLOG_BRAINSTORM_SYSTEM_MSG, userMessage);
}

// Function to format the selected blog idea into a Markdown post with metadata
function formatBlogPost(title, subtitle, category, date, content) {
    const formattedDate = date || new Date().toISOString().split('T')[0] + " 10:30:00"; // Use provided date or today's date
    return `
---
title: '${title}'
subtitle: '${subtitle}'
date: '${formattedDate}'
category: '${category}'
---

${content}
`;
}

// Use these functions as follows:
brainstormBlogIdeas().then(blogIdeas => {
    // Example for turning one idea into a formatted blog post
    const exampleIdea = blogIdeas.split("\n")[0]; // Taking the first idea for demonstration
    const exampleTitle = "Title extracted from exampleIdea"; // Extract title logic here
    const exampleSubtitle = "Subtitle extracted from exampleIdea"; // Extract subtitle logic here
    const exampleCategory = "AI"; // Define category as needed
    const exampleDate = "2023-09-20 10:30:00"; // Define the date as needed
    const exampleContent = "## Introduction\n\nContent of the blog post..."; // The content of the blog post

    const formattedPost = formatBlogPost(exampleTitle, exampleSubtitle, exampleCategory, exampleDate, exampleContent);
    console.log("Formatted Blog Post in Markdown:", formattedPost);
    // Further processing... such as saving to a file or database, or posting to the blog
});

/*

const BLOG_BRAINSTORM_SYSTEM_MSG = `
    You are an AI designed to brainstorm blog post ideas for https://blogs.relix.ai. The audience is young adults interested in technology, especially AI. Generate ideas that are SEO-friendly, covering trends, how-to guides, industry insights, AI impact stories, and historical retrospectives. The ideas should appeal to tech enthusiasts and novices alike and be optimized for search engines with potential keywords highlighted.
`;

// Function to brainstorm blog ideas
async function brainstormBlogIdeas() {
    const userMessage = "I need a list of potential blog post topics that cater to young adults with an interest in AI. They should be engaging, informative, and SEO-optimized. Please highlight possible keywords.";
    return await openai.callGPT(BLOG_BRAINSTORM_SYSTEM_MSG, userMessage);
}

// Function to create a single blog post in Markdown format
async function createBlogPost(blogTitle, subtitle, category, dateString, introduction) {
    const userMessage = `Create a blog post titled "${blogTitle}" with the subtitle "${subtitle}", categorized under "${category}" to be published on "${dateString}". Start with an engaging introduction: "${introduction}"`;
    return await openai.callGPT(BLOG_CREATION_SYSTEM_MSG, userMessage);
}

// Example usage for brainstorming blog ideas:
brainstormBlogIdeas().then(blogIdeas => {
    // Save the blog ideas for later use
    console.log("Blog Ideas:", blogIdeas);
    // Further processing... such as saving to a file or database
});

*/