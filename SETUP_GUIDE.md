# KBA Men's Hostel Management System
## Complete Setup Guide

---

## 📋 Prerequisites

Make sure you have these installed:

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **Python** (v3.8 or higher) - [Download](https://python.org/)
3. **PostgreSQL** (v14 or higher) - [Download](https://postgresql.org/)
4. **Git** (optional) - [Download](https://git-scm.com/)

---

## 🗄️ Step 1: Database Setup

### 1.1 Create PostgreSQL Database

Open terminal/command prompt and run:

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE kbahostel;

# Create user (optional)
CREATE USER hosteluser WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE kbahostel TO hosteluser;

# Exit
\q
```

### 1.2 Run the Schema

```bash
# Navigate to database folder
cd database

# Run schema file
psql -U postgres -d kbahostel -f schema.sql
```

Or copy the contents of `schema.sql` and run in pgAdmin.

---

## ⚙️ Step 2: Environment Configuration

### 2.1 Create .env file

Create a `.env` file in the project root with:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kbahostel
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# Session Secret
SESSION_SECRET=your-secret-key-here-change-this

# Email Configuration (for gate pass notifications)
NODEMAILER_EMAIL=your_email@gmail.com
NODEMAILER_PASS=your_app_password

# ML Service
ML_SERVICE_URL=http://localhost:5000

# Server Port
PORT=3000
```

### 2.2 Gmail App Password (for email features)

1. Go to Google Account Settings
2. Security → 2-Step Verification → Enable
3. App passwords → Generate new app password
4. Use this password in `NODEMAILER_PASS`

---

## 📦 Step 3: Install Dependencies

### 3.1 Node.js Dependencies

```bash
# In project root folder
npm install
```

### 3.2 Python Dependencies (for ML Service)

```bash
# Navigate to ML service folder
cd ml-service

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

## 🚀 Step 4: Run the Application

### Terminal 1 - Start ML Service

```bash
cd ml-service
python app.py
```

You should see:
```
Training ML model...
Model trained successfully!
Starting ML Service on port 5000...
```

### Terminal 2 - Start Node.js Server

```bash
# In project root
node index.js
```

You should see:
```
server is running on port 3000
```

---

## 🌐 Step 5: Access the Application

Open your browser and go to:

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Student Login |
| http://localhost:3000/managementadmin | Management Admin Login |
| http://localhost:3000/maintenanceadmin | Maintenance Admin Login |
| http://localhost:3000/rtadmin | RT Admin Login |
| http://localhost:3000/watchman | Watchman Login |

---

## 👤 Step 6: Create Initial Admin Account

Run this SQL to create the first admin:

```sql
-- First, generate a bcrypt hash for your password
-- You can use an online bcrypt generator or the app

INSERT INTO admin (username, id, email, password) 
VALUES (
    'admin', 
    1, 
    'admin@kbahostel.com', 
    '$2b$10$YourBcryptHashedPasswordHere'
);
```

Or use the Management Admin Panel to create accounts after login.

---

## 📁 Project Structure

```
KBAMENSHOSTEL-master/
├── Routes/                 # Express route handlers
├── views/                  # EJS templates
├── public/                 # Static files (CSS, JS, images)
├── Db/                     # Database configuration
├── middleware/             # Auth middleware
├── ml-service/             # Python ML service
│   ├── app.py              # Flask ML API
│   ├── requirements.txt    # Python dependencies
│   └── README.md           # ML service docs
├── database/               # SQL schema files
│   └── schema.sql          # Complete database schema
├── uploads/                # Uploaded gate pass PDFs
├── index.js                # Main entry point
├── package.json            # Node.js dependencies
└── .env                    # Environment variables
```

---

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Windows - Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

### Database Connection Error

1. Check PostgreSQL is running
2. Verify database credentials in `.env`
3. Make sure database `kbahostel` exists

### ML Service Not Working

1. Check Python is installed: `python --version`
2. Install dependencies: `pip install -r requirements.txt`
3. Check Flask is running on port 5000

### Email Not Sending

1. Enable 2-Step Verification in Google
2. Generate App Password
3. Update `.env` with correct credentials

---

## 🎓 ML Features (Final Year Project)

The system includes AI-powered features:

1. **Complaint Category Classification**
   - Uses NLP (TF-IDF + Naive Bayes)
   - 6 categories: Electrical, Plumbing, Housekeeping, Carpentry, Medical, Other

2. **Sentiment Analysis**
   - Detects urgency level
   - Sets priority (High/Normal)

3. **Smart Routing**
   - Suggests appropriate department
   - Shows confidence percentage

Access at: `http://localhost:3000/maintenance`

---

## 📞 Support

For issues, check:
1. Console logs in both terminals
2. Browser developer tools (F12)
3. PostgreSQL logs

---

## 📝 License

This is a Final Year Project for BSA Crescent Institute.
KBA Men's Hostel Management System with ML Integration.
