import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const router = express.Router();

// --- Resolve project root for file reading ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RULES_FILE_PATH = path.join(__dirname, '..', 'hostel_rules.txt');

// --- OpenAI Configuration ---
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
let openai = null;

if (OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    console.log("✅ OpenAI client initialized successfully.");
} else {
    console.warn("⚠️  OPENAI_API_KEY not found in .env — Chatbot will run in fallback mode.");
}

// --- Load Hostel Rules from file ---
function loadHostelRules() {
    try {
        if (fs.existsSync(RULES_FILE_PATH)) {
            const rules = fs.readFileSync(RULES_FILE_PATH, 'utf-8');
            console.log("✅ Hostel rules loaded from:", RULES_FILE_PATH);
            return rules;
        }
    } catch (error) {
        console.error("❌ Error loading hostel_rules.txt:", error.message);
    }
    // Minimal fallback if file is missing
    return "Hostel rules: 9 PM curfew, no ragging, mess timings: 7:30AM-9AM, 12:30PM-2PM, 7:30PM-9PM. Contact Warden for details.";
}

// Load rules on startup
let HOSTEL_KNOWLEDGE_BASE = loadHostelRules();

// --- Build System Prompt ---
function buildSystemPrompt() {
    return `You are "KBA Assistant", an intelligent and friendly virtual assistant for KBA Men's Hostel.

Your role:
1. Answer ALL hostel-related queries accurately using the knowledge base provided below.
2. Be helpful, polite, and concise in your responses.
3. If a question is about the hostel but not covered in the knowledge base, provide a helpful general answer and suggest contacting the Warden or RT for specific details.
4. For completely unrelated questions (e.g., math homework, coding), politely redirect the student by saying you specialize in hostel-related queries and suggest they ask about hostel services instead.
5. Use a warm, supportive tone — remember, the students are away from home.
6. When listing information (like timings or rules), format it clearly.
7. Keep responses concise — ideally 2-4 sentences unless more detail is explicitly asked for.

KNOWLEDGE BASE:
${HOSTEL_KNOWLEDGE_BASE}

Important guidelines:
- Always respond in plain text (no markdown formatting like ** or ##).
- If a student seems distressed or mentions an emergency, prioritize providing emergency contact information.
- Never make up information that isn't in the knowledge base. If unsure, say so and direct to the appropriate authority.`;
}

// --- API to reload rules without restarting server ---
router.get('/api/chat/reload-rules', (req, res) => {
    HOSTEL_KNOWLEDGE_BASE = loadHostelRules();
    res.json({ success: true, message: "Hostel rules reloaded successfully!" });
});

// --- Store conversation history per session ---
const conversationHistories = new Map();

router.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.json({ response: "I didn't catch that. Could you say it again?" });
    }

    try {
        if (openai) {
            // Get or create conversation history for this session
            const sessionId = req.session?.id || 'default';
            if (!conversationHistories.has(sessionId)) {
                conversationHistories.set(sessionId, []);
            }
            const history = conversationHistories.get(sessionId);

            // Build messages array for OpenAI
            const recentHistory = history.slice(-20); // 20 messages = 10 exchanges

            const messages = [
                { role: "system", content: buildSystemPrompt() },
                ...recentHistory,
                { role: "user", content: message }
            ];

            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: messages,
                max_tokens: 500,
                temperature: 0.7,
            });

            const responseText = completion.choices[0].message.content;

            // Save to history
            history.push({ role: "user", content: message });
            history.push({ role: "assistant", content: responseText });

            // Limit history size
            if (history.length > 30) {
                history.splice(0, history.length - 20);
            }

            return res.json({ response: responseText });
        }

        // Fallback if no API key
        throw new Error("No OpenAI API key configured");

    } catch (error) {
        console.error("OpenAI API Error:", error.message);

        // Fallback keyword-based responses
        const lowerMsg = message.toLowerCase();
        let response = "I'm sorry, I'm having trouble connecting to my AI brain right now. Please try again in a moment, or contact the Warden's office at +91-12345-67890 for immediate help.";

        if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
            response = "Hello! I'm the KBA Assistant. I can help you with gate passes, mess timings, maintenance requests, medical info, and more. What do you need?";
        } else if (lowerMsg.includes('gate pass') || lowerMsg.includes('leave') || lowerMsg.includes('permission') || lowerMsg.includes('outing')) {
            response = "Gate passes must be applied at least 24 hours in advance through the portal. For emergencies, contact your RT immediately. Weekend outings are usually Saturday afternoon to Sunday evening.";
        } else if (lowerMsg.includes('food') || lowerMsg.includes('mess') || lowerMsg.includes('menu') || lowerMsg.includes('eating') || lowerMsg.includes('breakfast') || lowerMsg.includes('lunch') || lowerMsg.includes('dinner')) {
            response = "Mess timings: Breakfast 7:30-9:00 AM, Lunch 12:30-2:00 PM, Tea 4:30-5:30 PM, Dinner 7:30-9:00 PM. Check the portal for the daily menu!";
        } else if (lowerMsg.includes('wifi') || lowerMsg.includes('internet') || lowerMsg.includes('network')) {
            response = "High-speed WiFi is available across the hostel. If you're facing connectivity issues, please report it under 'Maintenance' on the portal.";
        } else if (lowerMsg.includes('maintenance') || lowerMsg.includes('repair') || lowerMsg.includes('broken') || lowerMsg.includes('fix')) {
            response = "You can report maintenance issues through the 'Maintenance' section on the portal. Issues are categorized as Electrical, Plumbing, Carpentry, or Housekeeping.";
        } else if (lowerMsg.includes('medical') || lowerMsg.includes('doctor') || lowerMsg.includes('sick') || lowerMsg.includes('health') || lowerMsg.includes('ambulance')) {
            response = "A doctor visits every Monday and Thursday (4-6 PM). For emergencies, ambulance service is available 24/7. First-aid is at the security desk. Contact the Warden at +91-12345-67890.";
        } else if (lowerMsg.includes('contact') || lowerMsg.includes('phone') || lowerMsg.includes('email') || lowerMsg.includes('warden') || lowerMsg.includes('rt')) {
            response = "Warden: +91-12345-67890 | RT Block A: +91-12345-67891 | RT Block B: +91-12345-67892 | Security: +91-12345-67893 | Email: admin@kbahostel.com";
        } else if (lowerMsg.includes('rule') || lowerMsg.includes('curfew') || lowerMsg.includes('time')) {
            response = "Key rules: Be inside by 9 PM, silence hours 10:30 PM - 6 AM, no ragging, no smoking/alcohol. Always carry your hostel ID card.";
        } else if (lowerMsg.includes('room') || lowerMsg.includes('furniture') || lowerMsg.includes('bed')) {
            response = "Each room comes with a bed, study table, chair, and wardrobe. For room change requests, please contact the Warden's office.";
        } else if (lowerMsg.includes('cleaning') || lowerMsg.includes('housekeeping') || lowerMsg.includes('clean')) {
            response = "Housekeeping requests can be made daily before 10:00 AM through the portal. Keep your room clean at all times.";
        }

        res.json({ response });
    }
});

export default router;
