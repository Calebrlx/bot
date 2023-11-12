const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function callGPT(sys, msg) {
    if (!sys) { 
        console.log("No sys");
        return;
    }
    if (!msg) { 
        console.log("No msg");
        return;
    }
    try {
        const Response = await openai.chat.completions.create({
            messages: [{
                role: 'system', 
                content: sys
            }, {
                role: 'user', 
                content: msg
            }],
            model: 'gpt-4',
        });

        let Responce = Response.choices[0].message.content.trim();
        return(Responce)
    } catch (error) {
        console.error("Error selecting final tweet:", error);
        throw error;
    }
}

module.exports = {
    callGPT,
};