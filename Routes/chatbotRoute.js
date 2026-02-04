import express from "express";

const router = express.Router();

router.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.json({ response: "I didn't catch that. Could you say it again?" });
    }

    try {
        // Call Python Chatbot Agent
        const mlResponse = await fetch('http://localhost:5001/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });

        if (mlResponse.ok) {
            const data = await mlResponse.json();
            return res.json({ response: data.response });
        }

        throw new Error('ML Service Error');

    } catch (error) {
        console.warn("ML Service unavailable, using fallback logic.");

        const lowerMsg = message.toLowerCase();
        let response = "I'm not sure about that. Try asking about gate passes, maintenance, food, or contact info.";

        // Basic Keyword Matching Logic (Original implementation as fallback)
        if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
            response = "Hello! How can I help you today?";
        } else if (lowerMsg.includes('gate pass') || lowerMsg.includes('leave') || lowerMsg.includes('permission') || lowerMsg.includes('out')) {
            response = "You can apply for a gate pass in the 'Gate Pass' section. Make sure to apply 24 hours in advance!";
        } else if (lowerMsg.includes('food') || lowerMsg.includes('mess') || lowerMsg.includes('menu') || lowerMsg.includes('eating')) {
            response = "The mess serves breakfast (7:30-9:00), lunch (12:30-2:00), and dinner (7:30-9:00).";
        } else if (lowerMsg.includes('wifi') || lowerMsg.includes('internet')) {
            response = "We provide high-speed WiFi. If you're facing issues, please report it under 'Maintenance'.";
        } else {
            response = "I'm currently in basic mode. You can ask about mess timings, gate passes, or contact details.";
        }

        res.json({ response });
    }
});

export default router;
