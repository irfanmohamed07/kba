# Agent 1: AI Support Chatbot (Virtual Assistant)
# Port: 5001
# Goal: 24/7 support for student FAQs using LLM

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Gemini Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-pro')
else:
    print("WARNING: GEMINI_API_KEY not found. Chatbot Agent in fallback mode.")
    model = None

# Load Knowledge Base Reference
def get_context():
    try:
        kb_path = os.path.join(os.path.dirname(__file__), 'hostel_rules.txt')
        if os.path.exists(kb_path):
            with open(kb_path, 'r') as f:
                return f.read()
    except Exception as e:
        print(f"Error loading KB: {e}")
    return "Hostel rules: 9PM curfew, no ragging, mess timings: 7:30AM-9AM, 12:30PM-2PM, 7:30PM-9PM."

CONTEXT = get_context()

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    message = data.get('message', '')
    
    if not message:
        return jsonify({'response': "I'm listening. How can I help?"})

    if model:
        prompt = f"""
        Role: KBA Hostel Virtual Assistant.
        Context:
        {CONTEXT}
        
        Answer this student question based on the context. If unknown, suggest contacting the warden.
        Question: {message}
        Answer:"""
        try:
            response = model.generate_content(prompt)
            return jsonify({'response': response.text})
        except Exception as e:
            return jsonify({'response': f"Chat error: {str(e)}"}), 500
    else:
        return jsonify({'response': "I'm currently undergoing maintenance. Please check rules in the dashboard."})

if __name__ == '__main__':
    print("Chatbot Agent starting on port 5001...")
    app.run(host='0.0.0.0', port=5001, debug=True)
