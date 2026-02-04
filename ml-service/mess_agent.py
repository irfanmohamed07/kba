# Agent 3: Smart Mess Demand Predictor
# Port: 5003
# Goal: Predict meal attendance to reduce waste

from flask import Flask, jsonify
from flask_cors import CORS
import psycopg2
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

app = Flask(__name__)
CORS(app)

def get_db_connection():
    return psycopg2.connect(
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        database=os.getenv("DB_NAME")
    )

@app.route('/predict-demand', methods=['GET'])
def predict():
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # 1. Total Students
        cur.execute("SELECT COUNT(*) FROM users")
        total_students = cur.fetchone()[0]
        
        # 2. Approved Gatepasses for Today
        today = datetime.now().date()
        cur.execute(
            "SELECT COUNT(*) FROM gatepasses WHERE status = 'approved' AND %s >= time_out::date AND %s <= time_in::date",
            (today, today)
        )
        away_gatepass = cur.fetchone()[0]
        
        # 3. Active Medical Leaves
        cur.execute("SELECT COUNT(*) FROM medical_requests WHERE status IN ('pending', 'in-progress')")
        medical_leaves = cur.fetchone()[0]
        
        # Calculation
        expected = total_students - (away_gatepass + medical_leaves)
        
        cur.close()
        return jsonify({
            'totalStudents': total_students,
            'awayOnGatepass': away_gatepass,
            'onMedicalLeave': medical_leaves,
            'expectedAttendance': max(0, expected),
            'status': 'success'
        })
        
    except Exception as e:
        print(f"Mess Prediction Error: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    print("Smart Mess Agent starting on port 5003...")
    app.run(host='0.0.0.0', port=5003, debug=True)
