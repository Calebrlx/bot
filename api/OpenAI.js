const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const ideasSys = "You are an AI managing the Twitter page for Relixs, an innovative AI service provider. Craft tweets that are creative, engaging, and shareable to elevate brand visibility among young adults aged 18 to 24—a group that may be interested in tech but isnt deeply acquainted with AI. Highlight the practicality and fascination of AI technology in everyday life, using a conversational tone that resonates with this demographic. Include varied content such as intriguing AI facts, light humor, user interactive polls, and tech tips to spark curiosity and dialogue. Every tweet should reflect Relixs cutting-edge expertise and friendly approach to technology, enticing followers to learn more and engage with the brand. Encourage interaction by asking questions or inviting followers to share their views on AI, and always include a call to action when appropriate."

const evalSys = "You are an AI tasked with assessing the impact and engagement potential of tweet concepts for Relixs’s Twitter page, targeting young adults aged 18 to 24. Review the provided tweet concepts, considering factors such as relevance to the AI industry, likelihood to inspire engagement (likes, retweets, replies), and alignment with Relixss brand voice. Your objective is to critically evaluate each tweet for its creativity, engagement level, clarity, and call to action. Identify the tweet that you anticipate will perform the best based on these criteria, and explain your rationale for the selection"

const finalSys = "You are an AI tasked with choosing the final tweet to post for Relixs. Review the potential tweets and their corresponding analyses to select the most effective one for engagement with an 18 to 24-year-old demographic. End your response with the final tweet text only."

async function tweetIdeas() {
    try {
        // First step - getting ideas
        const ideasResponse = await openai.chat.completions.create({
            messages: [{
                role: 'system', 
                content: ideasSys
            }, {
                role: 'user', 
                content: 'Could you draft five tweet concepts based on the guidance provided? Id love to see a mix of content types, from AI facts to interactive elements. Lets make them catchy!'
            }],
            model: 'gpt-4',
        });

        // Parse the ideas into a format that can be concatenated into a follow-up message
        const ideaContent = ideasResponse.choices[0].message.content;
        return ideaContent;
    } catch (error) {
        console.error("Error getting tweet ideas:", error);
        throw error; 
    }
}


async function evalTweets(ideaContent) {
    if (!ideaContent) { 
        console.log("No input");
        return;
    }
    try {
        // Second step - evaluating tweets
        const evalResponse = await openai.chat.completions.create({
            messages: [{
                role: 'system', 
                content: evalSys
            }, {
                role: 'user', 
                content: 'Based on prior analysis, the third tweet was determined to be the most effective due to its balance of informative content and a clear call to action. Here are the tweets for a final review: ' + ideaContent
            }],
            model: 'gpt-4',
            });
        
        // Extract the best tweet analysis from the evaluation
        const evalContent = evalResponse.choices[0].message.content;
        return evalContent
    } catch (error) {
        console.error("Error evaluating tweets:", error);
        throw error;
    }
}

async function finalTweet(evalContent) {
    if (!evalContent) { 
        console.log("No input");
        return;
    }
    try {
        // Third step - selecting the final tweet to post
        const finalResponse = await openai.chat.completions.create({
            messages: [{
                role: 'system', 
                content: finalSys
            }, {
                role: 'user', 
                content: 'Based on prior analysis, the third tweet was determined to be the most effective due to its balance of informative content and a clear call to action. Here are the tweets for a final review: ' + evalContent
            }],
            model: 'gpt-4',
        });
        
        // Extract the final tweet
        let finalTweet = finalResponse.choices[0].message.content.trim();
        // Format final tweet using the formatFinal function
        finalTweet = formatFinal(finalTweet);
        return(finalTweet)
    } catch (error) {
        console.error("Error selecting final tweet:", error);
        throw error;
    }
}

function formatFinal(tweet) {
    // Remove quotes at the beginning and end if present
    if (tweet.startsWith('"') && tweet.endsWith('"')) {
        return tweet.substring(1, tweet.length - 1);
    }
    return tweet;
}


module.exports = {
    tweetIdeas,
    evalTweets,
    finalTweet
};




/*

async function GPT() {
    // First step - getting ideas
    const ideasResponse = await openai.chat.completions.create({
    messages: [{
        role: 'system', 
        content: ideasSys
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
        content: evalSys
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
        content: finalSys
    }, {
        role: 'user', 
        content: 'Based on prior analysis, the third tweet was determined to be the most effective due to its balance of informative content and a clear call to action. Here are the tweets for a final review: ' + evalContent
    }],
    model: 'gpt-4',
    });

    // Extract the final tweet
    const finalTweet = finalResponse.choices[0].message.content.trim();
    console.log(finalTweet);
    return(finalTweet)
    
}

*/