# ML Service for Hostel Management System

## Overview
This is a Machine Learning service that provides intelligent complaint classification for the hostel management system. It uses Natural Language Processing (NLP) to automatically categorize maintenance complaints and route them to the appropriate department.

## Features
- **Complaint Category Classification**: Automatically categorizes complaints into:
  - Electrical (fans, lights, switches, power issues)
  - Plumbing (water, taps, pipes, drainage)
  - Housekeeping (cleaning, garbage, pest control)
  - Carpentry (doors, windows, furniture)
  - Medical (health, first aid, emergencies)
  - Other (general issues)

- **Sentiment Analysis**: Detects urgency and priority level
- **Confidence Scoring**: Shows prediction confidence percentage
- **Department Routing**: Suggests the appropriate department

## Tech Stack
- Python 3.8+
- Flask (Web Framework)
- scikit-learn (Machine Learning)
- TF-IDF Vectorization
- Multinomial Naive Bayes Classifier

## Installation

### 1. Navigate to the ml-service directory
```bash
cd ml-service
```

### 2. Create a virtual environment (recommended)
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the ML service
```bash
python app.py
```

The service will start on `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /health
```
Returns service status.

### Predict Category
```
POST /predict
Content-Type: application/json

{
    "text": "fan not working in my room"
}
```

Response:
```json
{
    "predicted_category": "electrical",
    "confidence": 92.5,
    "all_probabilities": {
        "electrical": 92.5,
        "plumbing": 2.1,
        "housekeeping": 1.8,
        "carpentry": 1.4,
        "medical": 1.2,
        "other": 1.0
    },
    "sentiment": "neutral",
    "priority": "normal"
}
```

### Full Analysis
```
POST /analyze
Content-Type: application/json

{
    "text": "urgent - water leaking from bathroom pipe"
}
```

Response:
```json
{
    "input_text": "urgent - water leaking from bathroom pipe",
    "category": "plumbing",
    "confidence": 95.2,
    "probabilities": {...},
    "sentiment": "urgent",
    "priority": "high",
    "suggested_department": "Plumbing & Water Supply Team"
}
```

### Get Categories
```
GET /categories
```
Returns list of all available categories with descriptions.

## Integration with Node.js

The Node.js backend calls this service via HTTP requests. If the ML service is unavailable, the system falls back to local keyword-based prediction.

## Training Data

The model is trained on sample hostel complaint data covering various categories. The training data includes:
- 30+ examples per category
- Common hostel maintenance issues
- Variations in how students describe problems

## Model Performance

- **Algorithm**: TF-IDF + Multinomial Naive Bayes
- **Accuracy**: ~85-90% on test data
- **Response Time**: < 100ms per prediction

## Future Improvements

1. **More Training Data**: Add real complaint data to improve accuracy
2. **Deep Learning**: Upgrade to BERT or transformer models
3. **Image Classification**: Add support for complaint images
4. **Multi-language**: Support regional languages
5. **Feedback Loop**: Learn from user corrections

## Troubleshooting

### Port 5000 already in use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5000
kill -9 <PID>
```

### Module not found errors
```bash
pip install --upgrade -r requirements.txt
```

## License
This is part of the KBA Hostel Management System - Final Year Project.
