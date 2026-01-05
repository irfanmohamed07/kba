# ML Service for Hostel Management System
# Complaint Category Classification using NLP

from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import os
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
import numpy as np

app = Flask(__name__)
CORS(app)  # Enable CORS for Node.js integration

# Categories for classification
CATEGORIES = ['electrical', 'plumbing', 'housekeeping', 'carpentry', 'medical', 'other']

# Training data - Hostel complaint examples
TRAINING_DATA = {
    'electrical': [
        "fan not working", "light not working", "switch broken", "power issue",
        "electricity problem", "socket not working", "bulb fused", "fan speed problem",
        "tube light flickering", "fan making noise", "ceiling fan stopped",
        "electrical short circuit", "wire exposed", "plug not working",
        "ac not cooling", "air conditioner problem", "fan blade broken",
        "inverter not working", "power cut in room", "main switch tripped",
        "led light not working", "charger not charging", "extension board issue",
        "electric shock from switch", "fan regulator not working",
        "room light fused", "bathroom light issue", "corridor light off",
        "table lamp broken", "night lamp flickering", "tubelight blinking"
    ],
    'plumbing': [
        "water leakage", "tap not working", "drain blocked", "toilet not flushing",
        "water supply issue", "pipe leaking", "bathroom flooded", "no water",
        "hot water not coming", "geyser not working", "sink blocked",
        "washbasin crack", "shower not working", "water tank overflow",
        "low water pressure", "tap dripping", "commode problem", "flush broken",
        "water heater issue", "pipeline burst", "sewage smell", "drain smell",
        "water clogging", "bathroom tap leak", "kitchen tap broken",
        "water motor not working", "tank not filling", "overhead tank empty",
        "water filter problem", "RO not working", "drinking water issue"
    ],
    'housekeeping': [
        "room not cleaned", "need cleaning", "dustbin full", "floor dirty",
        "bed sheet not changed", "bathroom not cleaned", "garbage not collected",
        "sweeping required", "mopping needed", "cobwebs in room",
        "room smelling bad", "mattress dirty", "pillow cover change",
        "curtain washing", "window cleaning", "toilet not cleaned",
        "common area dirty", "corridor cleaning", "dust everywhere",
        "pest control needed", "cockroach problem", "mosquito issue",
        "ant infestation", "rat problem", "insects in room",
        "bed bugs issue", "blanket washing", "room sanitization needed",
        "deep cleaning required", "mess area dirty", "dining hall cleaning"
    ],
    'carpentry': [
        "door broken", "window broken", "furniture repair", "cupboard door loose",
        "table broken", "chair broken", "bed frame issue", "wardrobe handle broken",
        "lock not working", "door lock jammed", "hinge broken", "shelf broken",
        "drawer stuck", "almirah key lost", "door not closing properly",
        "window glass broken", "window frame damaged", "desk damage",
        "locker problem", "key duplicate needed", "door handle broken",
        "bed plank broken", "study table repair", "bookshelf loose",
        "cupboard termite", "wooden furniture damage", "partition broken",
        "room door swelling", "bathroom door issue", "main door lock"
    ],
    'medical': [
        "feeling sick", "fever", "headache", "body pain", "stomach ache",
        "need medicine", "first aid required", "injury", "accident",
        "doctor needed", "health issue", "vomiting", "loose motion",
        "diarrhea", "cold and cough", "allergy", "skin problem",
        "eye problem", "ear pain", "tooth ache", "ambulance needed",
        "emergency medical", "blood pressure issue", "diabetes medicine",
        "inhaler needed", "asthma attack", "breathing problem",
        "food poisoning", "feeling dizzy", "unconscious", "fainting"
    ],
    'other': [
        "wifi not working", "internet issue", "network problem", "tv not working",
        "mess food complaint", "food quality bad", "hostel timing issue",
        "noise complaint", "roommate issue", "ragging complaint",
        "security issue", "theft in hostel", "lost item", "visitor entry",
        "parking issue", "laundry problem", "gym equipment broken",
        "sports equipment", "reading room issue", "common room problem",
        "canteen complaint", "water cooler not working", "fridge problem",
        "washing machine broken", "iron not working", "microwave issue",
        "general complaint", "suggestion", "feedback", "other issue"
    ]
}

# Global model variable
model = None
vectorizer = None

def train_model():
    """Train the ML model with the training data"""
    global model, vectorizer
    
    # Prepare training data
    texts = []
    labels = []
    
    for category, examples in TRAINING_DATA.items():
        for example in examples:
            texts.append(example.lower())
            labels.append(category)
    
    # Create and train pipeline
    model = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2), max_features=1000)),
        ('clf', MultinomialNB(alpha=0.1))
    ])
    
    model.fit(texts, labels)
    print("Model trained successfully!")
    return model

def preprocess_text(text):
    """Clean and preprocess input text"""
    # Convert to lowercase
    text = text.lower()
    # Remove special characters but keep spaces
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    # Remove extra whitespace
    text = ' '.join(text.split())
    return text

def predict_category(text):
    """Predict the category for a complaint"""
    global model
    
    if model is None:
        train_model()
    
    # Preprocess the input
    processed_text = preprocess_text(text)
    
    # Get prediction and probabilities
    prediction = model.predict([processed_text])[0]
    probabilities = model.predict_proba([processed_text])[0]
    
    # Get confidence score
    max_prob = max(probabilities)
    confidence = round(max_prob * 100, 2)
    
    # Get all category probabilities
    category_probs = {}
    classes = model.classes_
    for i, cat in enumerate(classes):
        category_probs[cat] = round(probabilities[i] * 100, 2)
    
    return {
        'predicted_category': prediction,
        'confidence': confidence,
        'all_probabilities': category_probs
    }

def analyze_sentiment(text):
    """Simple sentiment analysis based on keywords"""
    positive_words = ['good', 'great', 'excellent', 'thanks', 'please', 'appreciate', 'nice']
    negative_words = ['bad', 'worst', 'terrible', 'urgent', 'immediately', 'emergency', 'angry', 'frustrated']
    urgent_words = ['urgent', 'emergency', 'immediately', 'asap', 'danger', 'serious', 'critical']
    
    text_lower = text.lower()
    
    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)
    urgent_count = sum(1 for word in urgent_words if word in text_lower)
    
    # Determine sentiment
    if urgent_count > 0:
        sentiment = 'urgent'
        priority = 'high'
    elif negative_count > positive_count:
        sentiment = 'negative'
        priority = 'medium'
    elif positive_count > 0:
        sentiment = 'positive'
        priority = 'low'
    else:
        sentiment = 'neutral'
        priority = 'normal'
    
    return {
        'sentiment': sentiment,
        'priority': priority
    }

# API Routes
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'ML Service is running'})

@app.route('/predict', methods=['POST'])
def predict():
    """Predict complaint category"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
        
        text = data['text']
        
        if not text.strip():
            return jsonify({'error': 'Empty text provided'}), 400
        
        # Get prediction
        result = predict_category(text)
        
        # Add sentiment analysis
        sentiment_result = analyze_sentiment(text)
        result.update(sentiment_result)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analyze', methods=['POST'])
def analyze():
    """Full analysis including category prediction and sentiment"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
        
        text = data['text']
        
        # Get prediction
        prediction = predict_category(text)
        
        # Get sentiment
        sentiment = analyze_sentiment(text)
        
        # Combine results
        result = {
            'input_text': text,
            'category': prediction['predicted_category'],
            'confidence': prediction['confidence'],
            'probabilities': prediction['all_probabilities'],
            'sentiment': sentiment['sentiment'],
            'priority': sentiment['priority'],
            'suggested_department': get_department(prediction['predicted_category'])
        }
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_department(category):
    """Get department based on category"""
    departments = {
        'electrical': 'Electrical Maintenance Team',
        'plumbing': 'Plumbing & Water Supply Team',
        'housekeeping': 'Housekeeping Staff',
        'carpentry': 'Carpentry & Furniture Team',
        'medical': 'Medical/Health Center',
        'other': 'General Administration'
    }
    return departments.get(category, 'General Administration')

@app.route('/categories', methods=['GET'])
def get_categories():
    """Get all available categories"""
    return jsonify({
        'categories': CATEGORIES,
        'description': {
            'electrical': 'Fan, light, switch, power, AC issues',
            'plumbing': 'Water, tap, pipe, drain, toilet issues',
            'housekeeping': 'Cleaning, sweeping, garbage, pest issues',
            'carpentry': 'Door, window, furniture, lock issues',
            'medical': 'Health, medicine, first aid, emergency',
            'other': 'WiFi, food, security, general issues'
        }
    })

if __name__ == '__main__':
    # Train model on startup
    print("Training ML model...")
    train_model()
    print("Starting ML Service on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=True)
