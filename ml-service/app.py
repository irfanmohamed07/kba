# ML Service for Hostel Management System
# Features: Chatbot (LLM), Complaint Classification (NLP), Mess Demand Prediction

from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import os
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
import numpy as np
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# --- LLM CONFIGURATION ---
# Get API Key from environment variable
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model_llm = genai.GenerativeModel('gemini-pro')
else:
    print("WARNING: GEMINI_API_KEY not found in environment variables. Chatbot will use fallback logic.")
    model_llm = None

# Load Knowledge Base
def load_knowledge_base():
    try:
        kb_path = os.path.join(os.path.dirname(__file__), 'hostel_rules.txt')
        with open(kb_path, 'r') as f:
            return f.read()
    except Exception as e:
        print(f"Error loading knowledge base: {e}")
        return "Hostel rules: No ragging, maintain silence at night, mess timings apply."

HOSTEL_CONTEXT = load_knowledge_base()

# --- COMPLAINT CLASSIFICATION CONFIG ---
CATEGORIES = ['electrical', 'plumbing', 'housekeeping', 'carpentry', 'medical', 'other']

TRAINING_DATA = {
    'electrical': ["fan not working", "light not working", "switch broken", "power issue", "socket not working", "bulb fused", "ac not cooling"],
    'plumbing': ["water leakage", "tap not working", "drain blocked", "toilet not flushing", "no water", "geyser not working", "pipe leaking"],
    'housekeeping': ["room not cleaned", "dustbin full", "floor dirty", "bathroom not cleaned", "pest control needed", "mosquito issue"],
    'carpentry': ["door broken", "window broken", "furniture repair", "cupboard door loose", "lock not working", "hinge broken"],
    'medical': ["feeling sick", "fever", "headache", "need medicine", "injury", "doctor needed", "emergency medical"],
    'other': ["wifi not working", "internet issue", "mess food complaint", "noise complaint", "security issue", "lost item"]
}

# Add more comprehensive training data in a real scenario
# For brevity, I'll stick to a representative set

model_pipeline = None

def train_model():
    global model_pipeline
    texts = []
    labels = []
    for category, examples in TRAINING_DATA.items():
        for example in examples:
            texts.append(example.lower())
            labels.append(category)
    
    model_pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2), max_features=1000)),
        ('clf', MultinomialNB(alpha=0.1))
    ])
    model_pipeline.fit(texts, labels)
    print("NLP Model trained successfully!")

def preprocess_text(text):
    text = text.lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    return ' '.join(text.split())

# --- API ROUTES ---

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'AI Support Service'})

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        message = data.get('message', '')
        
        if not message:
            return jsonify({'response': "I didn't catch that. How can I help?"})

        if model_llm:
            prompt = f"""
            You are 'KBA Assistant', an AI for KBA Men's Hostel. 
            Use the following Hostel Knowledge Base to answer student questions.
            If the answer is not in the knowledge base, be polite and suggest contacting the warden.
            
            Knowledge Base:
            {HOSTEL_CONTEXT}
            
            User Question: {message}
            Assistant Answer:"""
            
            response = model_llm.generate_content(prompt)
            return jsonify({'response': response.text})
        else:
            # Fallback simple logic
            return jsonify({'response': "AI logic is currently in fallback mode. Please check the mess timings or contact info in the dashboard."})
            
    except Exception as e:
        print(f"Chat Error: {e}")
        return jsonify({'response': "I'm experiencing a technical glitch. Please try again later."}), 500

@app.route('/analyze-complaint', methods=['POST'])
def analyze_complaint():
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400

        if model_pipeline is None:
            train_model()

        processed_text = preprocess_text(text)
        prediction = model_pipeline.predict([processed_text])[0]
        probs = model_pipeline.predict_proba([processed_text])[0]
        confidence = round(max(probs) * 100, 2)

        # Enhanced Sentiment/Priority Analysis
        urgent_keywords = ['emergency', 'urgent', 'immediately', 'danger', 'shock', 'fire', 'flooded', 'bleeding', 'unconscious']
        is_urgent = any(word in processed_text for word in urgent_keywords)
        
        # Simple sentiment logic upgrade
        if is_urgent:
            priority = 'high'
            sentiment = 'urgent'
        elif confidence < 60:
            priority = 'normal'
            sentiment = 'neutral'
        else:
            priority = 'medium'
            sentiment = 'negative' # Usually complaints are negative

        return jsonify({
            'category': prediction,
            'confidence': confidence,
            'priority': priority,
            'sentiment': sentiment
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    train_model()
    # Ensure Knowledge Base exists
    if not os.path.exists(os.path.join(os.path.dirname(__file__), 'hostel_rules.txt')):
        with open(os.path.join(os.path.dirname(__file__), 'hostel_rules.txt'), 'w') as f:
            f.write("Hostel rules: No ragging, maintain silence at night, mess timings apply.")
            
    app.run(host='0.0.0.0', port=5000, debug=True)
