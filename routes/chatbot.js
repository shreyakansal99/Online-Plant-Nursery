const express = require("express");
const router = express.Router();
const {chatWithOpenAI} = require("./openai.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ChatbotInteraction = require("../models/otherModel.js");

const allowedKeywords = ["plants", "flowers", "seeds", "soil", "watering", "growth", "sunlight", "fertilizer"];

router.get('/', (req, res) => {
    res.render('chatbot/chatbot.ejs');
});

// Route for chatbot interaction
router.post('/chat', async (req, res) => {
    const userQuery = req.body.query.toLowerCase();
    // Check if the query contains any of the allowed keywords
    const hasRelevantKeyword = allowedKeywords.some(keyword => userQuery.includes(keyword));
    if (!hasRelevantKeyword) {
        return res.json({ response: "I'm here to help with plant-related topics. Please ask about plants, flowers, seeds, or similar topics!" });
    }
    try {
        // Get response from OpenAI
        const botResponse = await chatWithOpenAI(userQuery);
        // Save the interaction in the database
        const interaction = new ChatbotInteraction({
            userid: req.user ? req.user._id : null, // Assuming req.user contains user info; adjust if necessary
            query: userQuery,
            response: botResponse
        });
        await interaction.save();
        res.json({ response: botResponse });
    } catch (error) {
        console.error("Error communicating with OpenAI:", error);
        res.status(500).json({ error: "Failed to get response from OpenAI" });
    }
});

module.exports = router;