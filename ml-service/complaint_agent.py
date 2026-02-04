# Agent 2: Enhanced Complaint AI 
# Port: 5002
# Goal: Automatically route complaints and flag emergencies

from flask import Flask, request, jsonify
from flask_cors import CORS
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
import numpy as np

app = Flask(__name__)
CORS(app)

# Training Data
TRAINING_DATA = {
    'electrical': ["fan not working", "light fused", "switch burnt", "power cut", "socket issue", "ac repair"],
    'plumbing': ["leakage", "tap broken", "no water", "flush problem", "pipes leaking", "drainage block"],
    'housekeeping': ["dirty room", "garbage not picked", "pest control", "carpet cleaning", "mopping needed"],
    'carpentry': ["door lock broken", "window hinge", "table repair", "cupboard damage", "bed plank"],
    'medical': ["fever", "accident", "first aid", "doctor visit", "breathing issue", "stomach pain"],
    'other': ["wifi slow", "mess food", "noise complaint", "security", "lost keys"]
}

# Model Setup
pipeline = None

def train():
    global pipeline
    texts = []
    labels = []
    for cat, examples in TRAINING_DATA.items():
        for ex in examples:
            texts.append(ex.lower())
            labels.append(cat)
    
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2))),
        ('clf', MultinomialNB(alpha=0.1))
    ])
    pipeline.fit(texts, labels)

def analyze_text(text):
    text = text.lower()
    # Priority Keywords
    critical = ['urgent', 'emergency', 'danger', 'shock', 'blood', 'fire', 'unconscious', 'immediate']
    is_critical = any(word in text for word in critical)
    
    pred = pipeline.predict([text])[0]
    probs = pipeline.predict_proba([text])[0]
    conf = round(max(probs) * 100, 2)
    
    priority = 'high' if is_critical else ('medium' if conf > 70 else 'normal')
    sentiment = 'urgent' if is_critical else 'negative'
    
    return {
        'category': pred,
        'confidence': conf,
        'priority': priority,
        'sentiment': sentiment
    }

@app.route('/analyze-complaint', methods=['POST'])
def analyze():
    data = request.get_json()
    text = data.get('text', '')
    if not text:
        return jsonify({'error': 'Empty message'}), 400
    
    if pipeline is None:
        train()
        
    result = analyze_text(text)
    return jsonify(result)

if __name__ == '__main__':
    train()
    print("Complaint AI Agent starting on port 5002...")
    app.run(host='0.0.0.0', port=5002, debug=True)
