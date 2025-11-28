# Chatbot Backend Setup Guide

## Overview

The AI Financial Buddy chatbot backend provides intelligent financial insights, risk monitoring, and agentic capabilities to take actions on your behalf.

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

## Installation Steps

### 1. Navigate to chatbot-backend folder

```powershell
cd chatbot-backend
```

### 2. Install Python dependencies

```powershell
pip install -r requirements.txt
```

**Dependencies included:**

- `fastapi` - Modern web framework
- `uvicorn` - ASGI server
- `python-multipart` - Form data parsing
- `pandas` - Data manipulation
- `numpy` - Numerical computing
- `scikit-learn` - Machine learning (risk prediction)
- `groq` - Groq API for ultra-fast LLM inference
- `python-dotenv` - Environment variables
- `pydantic` - Data validation

### 3. Configure Environment Variables

Create a `.env` file with your Groq API key:

```env
GROQ_API_KEY=your_groq_api_key_here
N8N_BASE_URL=http://localhost:5678
N8N_WEBHOOK_SECRET=cashcompass-secret-key-2024
```

**About Groq API:**

- Groq provides ultra-fast LLM inference
- The API key is already configured and ready to use
- If you need your own key: [Groq Console](https://console.groq.com/)

**Optional N8N Integration:**

- N8N enables workflow automation (sending emails, notifications, etc.)
- If you're not using N8N, the chatbot will still work without it

### 4. Start the chatbot server

```powershell
python main.py
```

Server will start on `http://localhost:5001`

## API Endpoints

### 1. **Chat Endpoint**

- **POST** `/api/chat`
- **Body:**

```json
{
  "message": "What's my risk score?",
  "user_id": "user123"
}
```

- **Response:**

```json
{
  "success": true,
  "response": {
    "message": "Your current financial risk score is 45/100...",
    "type": "risk_analysis",
    "data": {
      "risk_score": 45,
      "risk_level": "caution"
    },
    "agentic_actions": [
      {
        "action": "send_report",
        "success": true
      }
    ]
  }
}
```

### 2. **Risk Score**

- **GET** `/api/risk`
- Returns current risk score and analysis

### 3. **Current Risk**

- **GET** `/api/risk/current`
- Returns real-time risk data with critical status

### 4. **Monitoring Status**

- **GET** `/api/monitoring/status`
- Returns whether monitoring is active

### 5. **Alerts**

- **GET** `/api/alerts?limit=5`
- Returns recent risk alerts

### 6. **Health Check**

- **GET** `/api/health`
- Server status check

## Features

### 🤖 Agentic AI Capabilities

The chatbot can take actions based on your requests:

- **📧 Send Reports** - "Send me a weekly report"
- **🚨 Set Alerts** - "Set up crisis alerts for me"
- **💰 Create Budgets** - "Create a smart budget for me"
- **⏰ Reminders** - "Remind me about bills"
- **🎯 Set Goals** - "Set a savings goal"

### 📊 Risk Monitoring

- Real-time financial risk calculation
- Machine learning model (using `risk_model_final.pkl`)
- Automatic alerts when risk exceeds 80%
- Risk levels: Healthy, Caution, High

### 💬 Intelligent Conversations

- Groq-powered ultra-fast responses
- Context-aware financial advice
- Transaction analysis
- Spending pattern detection

## File Structure

```
chatbot-backend/
├── main.py                    # Main FastAPI server
├── data.py                    # Data processing utilities
├── forecaster.py              # Financial forecasting
├── risk.py                    # Risk calculation engine
├── risk_fallback.py           # Fallback risk logic
├── n8n_integration.py         # Integration with n8n workflows
├── requirements.txt           # Python dependencies
├── transactions.csv           # Sample transaction data
├── risk_model_final.pkl       # Trained ML model
├── risk_scaler_final.pkl      # Data scaler for ML model
└── .env                       # Environment configuration
```

## Testing the Chatbot

1. **Start the backend server:**

   ```powershell
   cd chatbot-backend
   python main.py
   ```

2. **Start your React frontend:**

   ```powershell
   cd ..
   npm run dev
   ```

3. **Access the chatbot:**

   - Navigate to `http://localhost:3000` (or your dev server port)
   - Login/Signup
   - Go to Dashboard
   - Click "AI Buddy" in the sidebar

4. **Try these commands:**
   - "What's my risk score?"
   - "Where is my money going?"
   - "Send me a weekly report"
   - "Set up crisis alerts for me"
   - "Give me financial tips"

## Troubleshooting

**Server won't start:**

- Check if port 5001 is available
- Verify Python version: `python --version`
- Reinstall dependencies: `pip install -r requirements.txt --force-reinstall`

**OpenAI API errors:**

- Verify your API key is correct in `.env`
- Check if you have available credits on OpenAI
- Ensure API key has proper permissions

**Groq API errors:**

- Verify your Groq API key is correct in `.env`
- Check your Groq API usage limits
- Ensure you have an active Groq account

**Risk model errors:**

- Ensure `risk_model_final.pkl` and `risk_scaler_final.pkl` exist
- Check that scikit-learn version matches the model training version

**CORS errors:**

- Server is configured to allow `http://localhost:3000`
- If using a different port, update CORS settings in `main.py`

## Advanced Configuration

### Change Server Port

Edit `.env`:

```env
GROQ_API_KEY=your_groq_key_here
N8N_BASE_URL=http://localhost:5678
N8N_WEBHOOK_SECRET=cashcompass-secret-key-2024
PORT=5002
```

Also update the frontend API calls in `ChatbotPage.jsx`:

```javascript
const response = await fetch("http://localhost:5002/api/chat", ...);
```

### Add Custom Actions

Edit `main.py` to add new agentic actions:

```python
def handle_custom_action(action_type, user_data):
    # Your custom logic here
    pass
```

## Production Deployment

For production, consider:

1. Using a proper ASGI server (Gunicorn with Uvicorn workers)
2. Setting up environment variables securely
3. Implementing rate limiting
4. Adding authentication/authorization
5. Using a production database instead of CSV files
6. Setting up logging and monitoring

## Support

If you encounter issues:

1. Check the server logs in the terminal
2. Verify all dependencies are installed
3. Ensure the `.env` file is properly configured
4. Check that the frontend is pointing to the correct backend URL
