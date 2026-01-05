import express from "express";
import pool from "../Db/index.js";
import axios from "axios";

const router = express.Router();

// ML Service URL
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

// Smart Maintenance Page
router.get('/smart-maintenance', (req, res) => {
    res.render('smart-maintenance', {
        user: req.session.user,
        message: null
    });
});

// Submit Smart Maintenance Complaint
router.post('/smart-maintenance', async (req, res) => {
    const {
        name,
        rrn,
        block,
        room,
        description,
        category,
        aiCategory,
        aiConfidence,
        aiPriority
    } = req.body;

    try {
        // Insert complaint into database
        const insertQuery = `
            INSERT INTO maintenance_complaints 
            (name, rrn, block, room_number, description, category, ai_predicted_category, ai_confidence, priority, status, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
            RETURNING id
        `;

        const values = [
            name,
            rrn,
            block,
            room,
            description,
            category,
            aiCategory || category,
            aiConfidence ? parseFloat(aiConfidence) : null,
            aiPriority || 'normal',
            'pending'
        ];

        const result = await pool.query(insertQuery, values);
        const complaintId = result.rows[0].id;

        res.render('smart-maintenance', {
            user: req.session.user,
            message: `Complaint #${complaintId} submitted successfully! Category: ${category.toUpperCase()}`
        });

    } catch (error) {
        console.error('Error submitting complaint:', error);

        // If table doesn't exist, create it and retry
        if (error.code === '42P01') {
            try {
                await pool.query(`
                    CREATE TABLE IF NOT EXISTS maintenance_complaints (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        rrn VARCHAR(50) NOT NULL,
                        block VARCHAR(50),
                        room_number VARCHAR(50),
                        description TEXT,
                        category VARCHAR(50),
                        ai_predicted_category VARCHAR(50),
                        ai_confidence DECIMAL(5,2),
                        priority VARCHAR(20) DEFAULT 'normal',
                        status VARCHAR(20) DEFAULT 'pending',
                        created_at TIMESTAMP DEFAULT NOW(),
                        updated_at TIMESTAMP
                    )
                `);

                // Retry the insert
                const insertQuery = `
                    INSERT INTO maintenance_complaints 
                    (name, rrn, block, room_number, description, category, ai_predicted_category, ai_confidence, priority, status, created_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
                    RETURNING id
                `;

                const values = [
                    name, rrn, block, room, description, category,
                    aiCategory || category,
                    aiConfidence ? parseFloat(aiConfidence) : null,
                    aiPriority || 'normal',
                    'pending'
                ];

                const result = await pool.query(insertQuery, values);
                const complaintId = result.rows[0].id;

                res.render('smart-maintenance', {
                    user: req.session.user,
                    message: `Complaint #${complaintId} submitted successfully! Category: ${category.toUpperCase()}`
                });
                return;
            } catch (createError) {
                console.error('Error creating table:', createError);
            }
        }

        res.render('smart-maintenance', {
            user: req.session.user,
            message: 'Error submitting complaint. Please try again.'
        });
    }
});

// Quick Complaint submission (from maintenance page inline form)
router.post('/quick-complaint', async (req, res) => {
    const { name, rrn, block, room, category, description } = req.body;

    try {
        // Try to insert into database
        const insertQuery = `
            INSERT INTO maintenance_complaints 
            (name, rrn, block, room_number, description, category, ai_predicted_category, priority, status, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
            RETURNING id
        `;

        const values = [name, rrn, block, room, description, category, category, 'normal', 'pending'];

        const result = await pool.query(insertQuery, values);
        const complaintId = result.rows[0].id;

        // Redirect back to maintenance with success message
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Complaint Submitted</title>
                <style>
                    body { font-family: 'Inter', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; }
                    .success-box { background: white; padding: 3rem; border-radius: 20px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
                    .icon { font-size: 4rem; color: #10b981; margin-bottom: 1rem; }
                    h1 { color: #333; margin-bottom: 0.5rem; }
                    p { color: #666; margin-bottom: 1.5rem; }
                    .complaint-id { font-size: 2rem; color: #667eea; font-weight: bold; }
                    .btn { display: inline-block; padding: 1rem 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 50px; font-weight: 600; }
                </style>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
            </head>
            <body>
                <div class="success-box">
                    <div class="icon"><i class="fas fa-check-circle"></i></div>
                    <h1>Complaint Submitted!</h1>
                    <p>Your ${category} complaint has been registered</p>
                    <p class="complaint-id">#${complaintId}</p>
                    <a href="/maintenance" class="btn"><i class="fas fa-arrow-left"></i> Back to Services</a>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Quick complaint error:', error);

        // If table doesn't exist, create it
        if (error.code === '42P01') {
            try {
                await pool.query(`
                    CREATE TABLE IF NOT EXISTS maintenance_complaints (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        rrn VARCHAR(50) NOT NULL,
                        block VARCHAR(50),
                        room_number VARCHAR(50),
                        description TEXT,
                        category VARCHAR(50),
                        ai_predicted_category VARCHAR(50),
                        ai_confidence DECIMAL(5,2),
                        priority VARCHAR(20) DEFAULT 'normal',
                        status VARCHAR(20) DEFAULT 'pending',
                        created_at TIMESTAMP DEFAULT NOW(),
                        updated_at TIMESTAMP
                    )
                `);

                // Retry
                const result = await pool.query(`
                    INSERT INTO maintenance_complaints 
                    (name, rrn, block, room_number, description, category, ai_predicted_category, priority, status, created_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
                    RETURNING id
                `, [name, rrn, block, room, description, category, category, 'normal', 'pending']);

                res.redirect('/maintenance?success=' + result.rows[0].id);
                return;
            } catch (createError) {
                console.error('Create table error:', createError);
            }
        }

        res.redirect('/maintenance?error=1');
    }
});

// API endpoint to predict category (proxy to ML service)
router.post('/api/predict-category', async (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'No text provided' });
    }

    try {
        const response = await axios.post(`${ML_SERVICE_URL}/analyze`, { text });
        res.json(response.data);
    } catch (error) {
        console.error('ML Service error:', error.message);

        // Fallback to local prediction if ML service is not available
        const prediction = localPredict(text);
        res.json(prediction);
    }
});

// Local prediction fallback function
function localPredict(text) {
    text = text.toLowerCase();

    const keywords = {
        electrical: ['fan', 'light', 'switch', 'power', 'electricity', 'ac', 'bulb', 'socket', 'wire', 'electric'],
        plumbing: ['water', 'tap', 'pipe', 'drain', 'toilet', 'leak', 'flush', 'geyser', 'bathroom', 'shower'],
        housekeeping: ['clean', 'dirty', 'dust', 'garbage', 'sweep', 'mop', 'pest', 'cockroach', 'bed sheet', 'room service'],
        carpentry: ['door', 'window', 'furniture', 'table', 'chair', 'lock', 'cupboard', 'shelf', 'bed', 'wood'],
        medical: ['sick', 'fever', 'medicine', 'doctor', 'health', 'pain', 'injury', 'emergency', 'hospital']
    };

    let maxScore = 0;
    let predicted = 'other';

    for (const [category, words] of Object.entries(keywords)) {
        let score = 0;
        for (const word of words) {
            if (text.includes(word)) score++;
        }
        if (score > maxScore) {
            maxScore = score;
            predicted = category;
        }
    }

    const confidence = maxScore > 0 ? Math.min(50 + maxScore * 15, 95) : 30;
    const isUrgent = text.includes('urgent') || text.includes('emergency') || text.includes('immediately');

    return {
        category: predicted,
        confidence: confidence,
        priority: isUrgent ? 'high' : 'normal',
        sentiment: isUrgent ? 'urgent' : 'neutral',
        suggested_department: getDepartment(predicted),
        probabilities: generateProbabilities(predicted, confidence)
    };
}

function getDepartment(category) {
    const departments = {
        electrical: 'Electrical Maintenance Team',
        plumbing: 'Plumbing & Water Supply Team',
        housekeeping: 'Housekeeping Staff',
        carpentry: 'Carpentry & Furniture Team',
        medical: 'Medical/Health Center',
        other: 'General Administration'
    };
    return departments[category] || 'General Administration';
}

function generateProbabilities(predicted, confidence) {
    const categories = ['electrical', 'plumbing', 'housekeeping', 'carpentry', 'medical', 'other'];
    const probs = {};
    let remaining = 100 - confidence;

    for (const cat of categories) {
        if (cat === predicted) {
            probs[cat] = confidence;
        } else {
            const share = Math.floor(remaining / (categories.length - 1));
            probs[cat] = share;
        }
    }

    return probs;
}

export default router;
