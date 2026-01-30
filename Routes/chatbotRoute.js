import express from "express";

const router = express.Router();

router.post('/api/chat', (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.json({ response: "I didn't catch that. Could you say it again?" });
    }

    const lowerMsg = message.toLowerCase();
    let response = "I'm not sure about that. Try asking about gate passes, maintenance, food, or contact info.";

    // Simple Keyword Matching Logic
    if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
        response = "Hello! How can I help you today?";
    } else if (lowerMsg.includes('gate pass') || lowerMsg.includes('leave') || lowerMsg.includes('permission') || lowerMsg.includes('out')) {
        response = "You can apply for a gate pass in the 'Gate Pass' section. Make sure to apply 24 hours in advance!";
    } else if (lowerMsg.includes('food') || lowerMsg.includes('mess') || lowerMsg.includes('menu') || lowerMsg.includes('eating')) {
        response = "The mess serves breakfast (7:30-9:00), lunch (12:30-2:00), and dinner (7:30-9:00).";
    } else if (lowerMsg.includes('wifi') || lowerMsg.includes('internet')) {
        response = "We provide high-speed WiFi. If you're facing issues, please report it under 'Maintenance' > 'Electrical'.";
    } else if (lowerMsg.includes('maintenance') || lowerMsg.includes('repair') || lowerMsg.includes('broken')) {
        response = "You can report issues in the Maintenance section. We have an AI-powered system to categorize your complaints!";
    } else if (lowerMsg.includes('contact') || lowerMsg.includes('phone') || lowerMsg.includes('warden')) {
        response = "You can contact the warden at +91-12345-67890 or email admin@kbahostel.com.";
    } else if (lowerMsg.includes('medical') || lowerMsg.includes('sick') || lowerMsg.includes('doctor')) {
        response = "If it's an emergency, please call the ambulance or warden immediately. For non-emergencies, visit the Medical section.";
    } else if (lowerMsg.includes('thank')) {
        response = "You're welcome! Let me know if you need anything else.";
    }

    // Return the response as JSON
    res.json({ response });
});

export default router;
