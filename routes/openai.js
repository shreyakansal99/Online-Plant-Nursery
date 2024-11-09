const axios = require('axios');
const openaiApiKey = process.env.OPENAI_API_KEY;

const chatWithOpenAI = async (userQuery) => {
    try {
        // console.log("OpenAI API Key:", openaiApiKey);
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: userQuery }],
        }, {
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json',
            },
        });

        return response.data.choices[0].message.content; 
    } 
    catch (error) {
        // console.error('Error communicating with OpenAI:', error);
        throw error; 
    }
};

module.exports = {chatWithOpenAI};
