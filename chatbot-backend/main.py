from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import threading
import time
from datetime import datetime
from dotenv import load_dotenv
from groq import Groq
from risk import calculate_risk_score_from_transactions
from data import get_user_transactions
from n8n_integration import n8n_agent

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize Groq client
GROQ_API_KEY = os.environ.get('GROQ_API_KEY')
groq_client = Groq(api_key=GROQ_API_KEY)

# Try to import forecaster (requires Prophet which may not be installed)
try:
    from forecaster import get_forecast_summary, calculate_days_to_goal
    FORECASTER_AVAILABLE = True
except ImportError:
    FORECASTER_AVAILABLE = False
    print("Warning: Prophet not installed. Forecasting features disabled.")

# Conversation history for context
conversation_history = {}

# ============================================
# RISK MONITORING SYSTEM
# ============================================

# Risk monitoring configuration
RISK_ALERT_THRESHOLD = 80  # Trigger alert when risk >= 80%
MONITOR_INTERVAL = 30  # Check every 30 seconds
monitored_users = {'user123'}  # Users to monitor
risk_alerts_sent = {}  # Track sent alerts to avoid spam
risk_monitor_running = False
latest_risk_data = {}  # Store latest risk data for real-time access
alert_history = []  # Store alert history
risk_monitor = None  # Global risk monitor instance

def check_risk_and_alert(user_id):
    """Check risk score for a user and trigger alert if needed"""
    global risk_alerts_sent, latest_risk_data, alert_history
    
    try:
        transactions = get_user_transactions(user_id)
        if not transactions:
            return None
        
        risk_data = calculate_risk_score_from_transactions(transactions)
        risk_score = risk_data['risk_score']
        
        # Store latest risk data
        latest_risk_data[user_id] = {
            'risk_score': risk_score,
            'risk_level': risk_data['risk_level'],
            'timestamp': datetime.now().isoformat(),
            'data': risk_data
        }
        
        # Check if risk exceeds threshold
        if risk_score >= RISK_ALERT_THRESHOLD:
            # Check if we already sent an alert recently (within last 5 minutes)
            last_alert_time = risk_alerts_sent.get(user_id)
            current_time = time.time()
            
            if last_alert_time is None or (current_time - last_alert_time) > 300:  # 5 minute cooldown
                # Trigger alert!
                alert_message = f"🚨 RISK ALERT! Risk score {risk_score}% exceeds {RISK_ALERT_THRESHOLD}% threshold!"
                print(f"\n{alert_message}")
                print(f"   User: {user_id}")
                print(f"   Risk Level: {risk_data['risk_level'].upper()}")
                print(f"   Reasons: {', '.join(risk_data['top_risk_reasons'][:2])}")
                
                # Store in alert history
                alert_entry = {
                    'id': len(alert_history) + 1,
                    'user_id': user_id,
                    'timestamp': datetime.now().isoformat(),
                    'risk_score': risk_score,
                    'risk_level': risk_data['risk_level'],
                    'threshold': RISK_ALERT_THRESHOLD,
                    'message': alert_message,
                    'reasons': risk_data.get('top_risk_reasons', [])[:3],
                    'recommended_actions': risk_data.get('recommended_actions', [])[:3],
                    'type': 'automatic'
                }
                alert_history.append(alert_entry)
                
                # Trigger n8n crisis alert
                alert_data = {
                    'user_id': user_id,
                    'email': 'user@example.com',
                    'name': 'User',
                    'risk_score': risk_score,
                    'risk_level': risk_data['risk_level'],
                    'risk_reasons': risk_data.get('top_risk_reasons', []),
                    'recommended_actions': risk_data.get('recommended_actions', []),
                    'spending_last_30d': risk_data['spending_last_30d'],
                    'income_last_30d': risk_data['income_last_30d'],
                    'alert_type': 'automatic',
                    'threshold': RISK_ALERT_THRESHOLD,
                }
                
                result = n8n_agent.trigger_crisis_alert(alert_data)
                risk_alerts_sent[user_id] = current_time
                
                return {
                    'alert_triggered': True,
                    'risk_score': risk_score,
                    'risk_level': risk_data['risk_level'],
                    'message': alert_message,
                    'alert_id': alert_entry['id']
                }
        
        return {
            'alert_triggered': False,
            'risk_score': risk_score,
            'risk_level': risk_data['risk_level']
        }
        
    except Exception as e:
        print(f"Error checking risk for {user_id}: {e}")
        return None

def risk_monitor_loop():
    """Background loop that continuously monitors risk scores"""
    global risk_monitor_running
    
    print(f"\n🔍 Risk Monitor Started - Checking every {MONITOR_INTERVAL} seconds")
    print(f"   Alert Threshold: {RISK_ALERT_THRESHOLD}%")
    print(f"   Monitoring users: {monitored_users}")
    
    while risk_monitor_running:
        for user_id in list(monitored_users):
            result = check_risk_and_alert(user_id)
            if result:
                if result.get('alert_triggered'):
                    print(f"   ⚡ Alert sent for {user_id}!")
                else:
                    print(f"   ✓ {user_id}: Risk {result['risk_score']}% ({result['risk_level']})")
        
        time.sleep(MONITOR_INTERVAL)

def start_risk_monitor():
    """Start the background risk monitoring thread"""
    global risk_monitor_running
    
    if risk_monitor_running:
        print("Risk monitor already running")
        return
    
    risk_monitor_running = True
    monitor_thread = threading.Thread(target=risk_monitor_loop, daemon=True)
    monitor_thread.start()
    print("✅ Risk monitoring started in background")

def stop_risk_monitor():
    """Stop the background risk monitoring"""
    global risk_monitor_running
    risk_monitor_running = False
    print("⏹️ Risk monitoring stopped")

# ============================================
# AGENTIC AI FUNCTIONS
# ============================================

def detect_agentic_intent(user_message):
    """Detect if user wants to trigger an agentic action"""
    user_message_lower = user_message.lower()
    
    actions = []
    
    # Crisis Alert triggers
    crisis_keywords = ['set alert', 'notify me', 'send alert', 'crisis alert', 'warn me', 'alert me', 'send notification', 'enable alerts']
    if any(phrase in user_message_lower for phrase in crisis_keywords):
        actions.append('crisis_alert')
    
    # Weekly Report triggers
    report_keywords = ['send report', 'email report', 'weekly report', 'mail me', 'send summary', 'email summary', 'send me a report', 'generate report']
    if any(phrase in user_message_lower for phrase in report_keywords):
        actions.append('weekly_report')
    
    # Smart Budget triggers
    budget_keywords = ['budget suggestion', 'smart budget', 'optimize budget', 'budget plan', 'create budget', 'make budget', 'budget for me', 'suggest budget']
    if any(phrase in user_message_lower for phrase in budget_keywords):
        actions.append('smart_budget')
    
    # Bill Reminder triggers
    bill_keywords = ['remind me', 'bill reminder', 'payment reminder', 'remind about bill', 'set reminder', 'remind bill']
    if any(phrase in user_message_lower for phrase in bill_keywords):
        actions.append('bill_reminder')
    
    # Savings Goal triggers
    goal_keywords = ['savings goal', 'set goal', 'track goal', 'create goal', 'saving target', 'help me save']
    if any(phrase in user_message_lower for phrase in goal_keywords):
        actions.append('savings_goal')
    
    return actions

def execute_agentic_actions(actions, user_id, risk_data):
    """Execute the detected agentic actions via n8n"""
    results = []
    
    user_data = {
        'user_id': user_id,
        'email': 'user@example.com',  # In production, get from user profile
        'name': 'User',
        'risk_score': risk_data['risk_score'],
        'risk_level': risk_data['risk_level'],
        'risk_reasons': risk_data.get('top_risk_reasons', []),
        'recommended_actions': risk_data.get('recommended_actions', []),
        'spending_last_30d': risk_data['spending_last_30d'],
        'income_last_30d': risk_data['income_last_30d'],
        'category_spending': risk_data.get('category_spending', {}),
        'financial_summary': risk_data,
        'income': risk_data['income_last_30d'],
        'spending': risk_data['spending_last_30d'],
        'current_savings': risk_data['income_last_30d'] - risk_data['spending_last_30d'],
    }
    
    for action in actions:
        if action == 'crisis_alert':
            result = n8n_agent.trigger_crisis_alert(user_data)
            results.append({'action': 'crisis_alert', 'success': result.get('success', False), 'pending': result.get('pending', False)})
        
        elif action == 'weekly_report':
            result = n8n_agent.trigger_weekly_report(user_data)
            results.append({'action': 'weekly_report', 'success': result.get('success', False), 'pending': result.get('pending', False)})
        
        elif action == 'smart_budget':
            result = n8n_agent.trigger_smart_budget(user_data)
            results.append({'action': 'smart_budget', 'success': result.get('success', False), 'pending': result.get('pending', False)})
        
        elif action == 'bill_reminder':
            result = n8n_agent.trigger_bill_reminder(user_data)
            results.append({'action': 'bill_reminder', 'success': result.get('success', False), 'pending': result.get('pending', False)})
        
        elif action == 'savings_goal':
            result = n8n_agent.trigger_savings_goal(user_data)
            results.append({'action': 'savings_goal', 'success': result.get('success', False), 'pending': result.get('pending', False)})
    
    return results

# ============================================
# FINANCIAL CONTEXT
# ============================================

def get_financial_context(transactions):
    """Get comprehensive financial context for the AI"""
    risk_data = calculate_risk_score_from_transactions(transactions)
    
    # Build spending breakdown
    category_spending = risk_data.get("category_spending", {})
    spending_breakdown = "\n".join([
        f"  - {cat.replace('_', ' ').title()}: ₹{amt:,}" 
        for cat, amt in sorted(category_spending.items(), key=lambda x: x[1], reverse=True) 
        if amt > 0
    ])
    
    context = f"""
USER'S FINANCIAL DATA (Last 30 days):
=====================================
Risk Score: {risk_data['risk_score']}/100 ({risk_data['risk_level'].upper()})
Total Income: ₹{risk_data['income_last_30d']:,}
Total Spending: ₹{risk_data['spending_last_30d']:,}
Net Savings: ₹{risk_data['income_last_30d'] - risk_data['spending_last_30d']:,}
Projected Balance (7 days): ₹{risk_data['projected_balance_7d']:,.0f}

Top Spending Category: {risk_data['top_spending_category'].replace('_', ' ').title()} (₹{risk_data['top_spending_amount']:,})

Spending by Category:
{spending_breakdown if spending_breakdown else "No spending data available"}

Risk Factors:
{chr(10).join('- ' + reason for reason in risk_data['top_risk_reasons'])}

Current Recommendations:
{chr(10).join('- ' + action for action in risk_data['recommended_actions'])}
"""
    return context, risk_data

# ============================================
# GROQ AI RESPONSE WITH AGENTIC CAPABILITIES
# ============================================

def get_groq_response(user_message, user_id, transactions):
    """Get response from Groq LLM with financial context and agentic capabilities"""
    
    # Get financial context
    financial_context, risk_data = get_financial_context(transactions)
    
    # Detect and execute agentic actions
    detected_actions = detect_agentic_intent(user_message)
    agentic_results = []
    
    if detected_actions:
        agentic_results = execute_agentic_actions(detected_actions, user_id, risk_data)
    
    # Build agentic context for the AI
    agentic_context = ""
    if agentic_results:
        agentic_context = "\n\n🤖 AGENTIC ACTIONS TRIGGERED:\n"
        for result in agentic_results:
            if result.get('success') or result.get('pending'):
                status = "✅ Successfully triggered" if result['success'] else "⏳ Registered (pending n8n setup)"
            else:
                status = "❌ Failed"
            action_name = result['action'].replace('_', ' ').title()
            agentic_context += f"- {action_name}: {status}\n"
        agentic_context += "\nIMPORTANT: Acknowledge the triggered action(s) in your response and explain what will happen."
    
    # Get forecast if available
    forecast_context = ""
    if FORECASTER_AVAILABLE:
        try:
            forecast = get_forecast_summary(transactions, 7)
            forecast_context = f"""
7-DAY FORECAST:
- Predicted Income: ₹{forecast['predicted_income']:,.0f}
- Predicted Spending: ₹{forecast['predicted_spending']:,.0f}
- Expected Balance Change: ₹{forecast['predicted_balance_change']:,.0f}
"""
        except:
            pass
    
    # System prompt for the AI with Agentic capabilities
    system_prompt = f"""You are CashCompass AI Buddy, a friendly and knowledgeable personal finance assistant with AGENTIC AI capabilities. You help users understand their finances, provide budgeting advice, and can TAKE ACTIONS on their behalf.

🤖 YOUR AGENTIC CAPABILITIES:
When users ask, you can trigger these automated workflows:
1. 📧 "Send me a report" → Sends weekly financial report via email
2. 🚨 "Set up alerts" → Enables crisis alert notifications when risk is high
3. 💰 "Create a budget" → Generates smart budget recommendations
4. ⏰ "Remind me about bills" → Sets up bill payment reminders
5. 🎯 "Set savings goal" → Creates and tracks savings goals

IMPORTANT GUIDELINES:
1. Be conversational, warm, and encouraging - like a supportive financial coach
2. Use emojis sparingly to make responses engaging (📊💰💡🎯✅⚠️🤖)
3. Always base your advice on the user's ACTUAL financial data provided below
4. Give specific, actionable advice - not generic tips
5. When you trigger an agentic action, CONFIRM it clearly in your response
6. Use Indian Rupee (₹) for all currency
7. Keep responses concise but informative (aim for 150-250 words)
8. Format responses with clear sections using **bold** for headers
9. If an action was triggered, explain what will happen next

{financial_context}
{forecast_context}
{agentic_context}

Remember: You have access to their real financial data AND can take actions. Be proactive in suggesting actions that could help them!"""

    # Initialize or get conversation history
    if user_id not in conversation_history:
        conversation_history[user_id] = []
    
    # Build messages for API call
    messages = [
        {"role": "system", "content": system_prompt}
    ]
    
    # Add conversation history (last 10 messages for context)
    messages.extend(conversation_history[user_id][-10:])
    
    # Add current user message
    messages.append({"role": "user", "content": user_message})
    
    try:
        # Call Groq API
        chat_completion = groq_client.chat.completions.create(
            messages=messages,
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=1024,
            top_p=0.9,
        )
        
        assistant_message = chat_completion.choices[0].message.content
        
        # Update conversation history
        conversation_history[user_id].append({"role": "user", "content": user_message})
        conversation_history[user_id].append({"role": "assistant", "content": assistant_message})
        
        # Keep only last 20 messages
        if len(conversation_history[user_id]) > 20:
            conversation_history[user_id] = conversation_history[user_id][-20:]
        
        return {
            "message": assistant_message,
            "data": risk_data,
            "type": "ai_response",
            "agentic_actions": agentic_results
        }
        
    except Exception as e:
        print(f"Groq API error: {e}")
        return get_fallback_response(user_message, risk_data, agentic_results)

def get_fallback_response(user_message, risk_data, agentic_results=None):
    """Fallback response if Groq API fails"""
    user_message_lower = user_message.lower()
    
    # Add agentic action notification if any
    action_note = ""
    if agentic_results:
        action_note = "\n\n🤖 **Actions Triggered:**\n"
        for result in agentic_results:
            status = "✅" if result.get('success') or result.get('pending') else "❌"
            action_note += f"{status} {result['action'].replace('_', ' ').title()}\n"
    
    if any(word in user_message_lower for word in ["hello", "hi", "hey"]):
        message = f"Hello! 👋 I'm your AI Financial Buddy with Agentic capabilities!\n\nYour current risk score is **{risk_data['risk_score']}/100** ({risk_data['risk_level']}).\n\n🤖 **I can take actions for you:**\n• Send weekly reports\n• Set up crisis alerts\n• Create smart budgets\n• Set bill reminders\n\nHow can I help you today?{action_note}"
    elif any(word in user_message_lower for word in ["risk", "score", "health"]):
        message = f"""📊 **Your Financial Health**

Risk Score: **{risk_data['risk_score']}/100** ({risk_data['risk_level'].upper()})
Income: ₹{risk_data['income_last_30d']:,}
Spending: ₹{risk_data['spending_last_30d']:,}

💡 {risk_data['recommended_actions'][0] if risk_data['recommended_actions'] else 'Keep tracking your finances!'}{action_note}"""
    elif any(word in user_message_lower for word in ["spend", "expense", "where"]):
        message = f"""💸 **Spending Overview**

Total: ₹{risk_data['spending_last_30d']:,}
Top Category: {risk_data['top_spending_category'].replace('_', ' ').title()}

💡 Focus on reducing {risk_data['top_spending_category'].replace('_', ' ')} expenses first!{action_note}"""
    else:
        message = f"""I'm here to help with your finances! 

Your current status: **{risk_data['risk_level'].upper()}** ({risk_data['risk_score']}/100)

🤖 **I can take actions for you:**
• "Send me a weekly report"
• "Set up crisis alerts"
• "Create a smart budget"
• "Remind me about bills"
• "Set a savings goal"

Ask me anything!{action_note}"""
    
    return {
        "message": message,
        "data": risk_data,
        "type": "fallback",
        "agentic_actions": agentic_results or []
    }

# ============================================
# API ROUTES
# ============================================

@app.route('/api/chat', methods=['POST'])
def chat():
    """Main chat endpoint with Groq AI and Agentic capabilities"""
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        user_id = data.get('user_id', 'user123')
        
        if not user_message:
            return jsonify({"error": "Message is required"}), 400
        
        # Get user transactions from CSV file
        transactions = get_user_transactions(user_id)
        if not transactions:
            return jsonify({
                "success": False,
                "error": "No transaction data found in transactions.csv."
            }), 404
        
        # Get AI response from Groq with agentic capabilities
        response = get_groq_response(user_message, user_id, transactions)
        
        return jsonify({
            "success": True,
            "response": response
        })
        
    except Exception as e:
        print(f"Chat error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/n8n/trigger/<workflow_name>', methods=['POST'])
def trigger_workflow(workflow_name):
    """Manually trigger an n8n workflow"""
    try:
        data = request.get_json() or {}
        user_id = data.get('user_id', 'user123')
        
        transactions = get_user_transactions(user_id)
        if not transactions:
            return jsonify({"success": False, "error": "No transaction data"}), 404
        
        risk_data = calculate_risk_score_from_transactions(transactions)
        
        user_data = {
            'user_id': user_id,
            'email': data.get('email', 'user@example.com'),
            'name': data.get('name', 'User'),
            'risk_score': risk_data['risk_score'],
            'risk_level': risk_data['risk_level'],
            'risk_reasons': risk_data.get('top_risk_reasons', []),
            'recommended_actions': risk_data.get('recommended_actions', []),
            'category_spending': risk_data.get('category_spending', {}),
            'income_last_30d': risk_data['income_last_30d'],
            'spending_last_30d': risk_data['spending_last_30d'],
            'financial_summary': risk_data,
            'income': risk_data['income_last_30d'],
            'spending': risk_data['spending_last_30d'],
            'current_savings': risk_data['income_last_30d'] - risk_data['spending_last_30d'],
        }
        
        if workflow_name == 'crisis-alert':
            result = n8n_agent.trigger_crisis_alert(user_data)
        elif workflow_name == 'weekly-report':
            result = n8n_agent.trigger_weekly_report(user_data)
        elif workflow_name == 'smart-budget':
            result = n8n_agent.trigger_smart_budget(user_data)
        elif workflow_name == 'bill-reminder':
            result = n8n_agent.trigger_bill_reminder(user_data)
        elif workflow_name == 'savings-goal':
            result = n8n_agent.trigger_savings_goal(user_data)
        else:
            return jsonify({"success": False, "error": f"Unknown workflow: {workflow_name}"}), 400
        
        return jsonify({
            "success": result.get('success', False),
            "pending": result.get('pending', False),
            "data": result
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/chat/clear', methods=['POST'])
def clear_history():
    """Clear conversation history for a user"""
    try:
        data = request.get_json()
        user_id = data.get('user_id', 'user123')
        
        if user_id in conversation_history:
            conversation_history[user_id] = []
        
        return jsonify({
            "success": True,
            "message": "Conversation history cleared"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/risk', methods=['GET'])
def get_risk():
    """Get risk analysis for a user"""
    try:
        user_id = request.args.get('user_id', 'user123')
        transactions = get_user_transactions(user_id)
        if not transactions:
            return jsonify({
                "success": False,
                "error": "No transaction data found in transactions.csv"
            }), 404
        
        risk_data = calculate_risk_score_from_transactions(transactions)
        return jsonify({
            "success": True,
            "data": risk_data
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "CashCompass AI Chatbot",
        "ai_provider": "Groq (Llama 3.3 70B)",
        "agentic_ai": "n8n Integration Enabled",
        "forecaster_available": FORECASTER_AVAILABLE,
        "risk_monitoring": risk_monitor_running
    })

# ============================================
# RISK MONITORING API ROUTES
# ============================================

@app.route('/api/monitoring/start', methods=['POST'])
def start_monitoring():
    """Start the background risk monitoring"""
    global MONITOR_INTERVAL, RISK_ALERT_THRESHOLD
    try:
        data = request.get_json() or {}
        interval = data.get('interval', 30)  # Default 30 seconds
        threshold = data.get('threshold', 80)
        
        if risk_monitor_running:
            return jsonify({
                "success": True,
                "message": "Risk monitoring is already running"
            })
        
        MONITOR_INTERVAL = interval
        RISK_ALERT_THRESHOLD = threshold
        start_risk_monitor()
        
        return jsonify({
            "success": True,
            "message": f"Risk monitoring started with {interval}s interval and {threshold}% threshold"
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/monitoring/stop', methods=['POST'])
def stop_monitoring():
    """Stop the background risk monitoring"""
    try:
        stop_risk_monitor()
        return jsonify({
            "success": True,
            "message": "Risk monitoring stopped"
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/monitoring/status', methods=['GET'])
def monitoring_status():
    """Get the current monitoring status"""
    user_id = request.args.get('user_id', 'user123')
    current_data = latest_risk_data.get(user_id, {})
    
    return jsonify({
        "success": True,
        "monitoring_active": risk_monitor_running,
        "threshold": RISK_ALERT_THRESHOLD,
        "check_interval": MONITOR_INTERVAL,
        "total_alerts": len(alert_history),
        "last_check": current_data.get('timestamp'),
        "current_risk": current_data.get('risk_score'),
        "risk_level": current_data.get('risk_level')
    })

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    """Get all alerts from history"""
    limit = request.args.get('limit', 50, type=int)
    return jsonify({
        "success": True,
        "alerts": alert_history[-limit:],
        "total": len(alert_history)
    })

@app.route('/api/alerts/clear', methods=['POST'])
def clear_alerts():
    """Clear alert history"""
    global alert_history
    alert_history = []
    return jsonify({
        "success": True,
        "message": "Alert history cleared"
    })

@app.route('/api/risk/current', methods=['GET'])
def get_current_risk():
    """Get current risk score with real-time calculation"""
    try:
        user_id = request.args.get('user_id', 'user123')
        transactions = get_user_transactions(user_id)
        if not transactions:
            return jsonify({
                "success": False,
                "error": "No transaction data"
            }), 404
        
        risk_data = calculate_risk_score_from_transactions(transactions)
        risk_score = risk_data['risk_score']
        
        return jsonify({
            "success": True,
            "risk_score": risk_score,
            "risk_level": risk_data['risk_level'],
            "threshold": RISK_ALERT_THRESHOLD,
            "is_critical": risk_score >= RISK_ALERT_THRESHOLD,
            "monitoring_active": risk_monitor_running,
            "data": risk_data
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/alerts/trigger', methods=['POST'])
def trigger_alert_manually():
    """Manually trigger a risk alert (for testing)"""
    global risk_alerts_sent, alert_history
    try:
        user_id = request.args.get('user_id', 'user123')
        
        # Reset the cooldown for this user
        if user_id in risk_alerts_sent:
            del risk_alerts_sent[user_id]
        
        # Force check and create alert
        result = check_risk_and_alert(user_id)
        
        if result and result.get('alert_triggered'):
            return jsonify({
                "success": True,
                "message": "Alert triggered successfully",
                "alert": result
            })
        else:
            return jsonify({
                "success": False,
                "message": "Risk below threshold or no data",
                "result": result
            })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/alerts/reset-cooldown', methods=['POST'])
def reset_cooldown():
    """Reset alert cooldowns (for testing)"""
    global risk_alerts_sent
    risk_alerts_sent = {}
    return jsonify({
        "success": True,
        "message": "All alert cooldowns reset"
    })

# ============================================
# MAIN
# ============================================

if __name__ == '__main__':
    print("""
╔════════════════════════════════════════════════════════╗
║   🤖 CashCompass AI Chatbot Server                     ║
╠════════════════════════════════════════════════════════╣
║   Port: 5001                                           ║
║   AI Provider: Groq (Llama 3.3 70B)                    ║
║   Agentic AI: n8n Integration ✅                       ║
║   Risk Monitoring: Auto-Start ✅                       ║
║   Alert Threshold: 80%                                 ║
║   Forecaster: {:8}                                 ║
║                                                        ║
║   🎯 Agentic Capabilities:                             ║
║      • Crisis Alerts                                   ║
║      • Weekly Reports                                  ║
║      • Smart Budget                                    ║
║      • Bill Reminders                                  ║
║      • Savings Goals                                   ║
║                                                        ║
║   🔔 Risk Monitoring Endpoints:                        ║
║      • GET  /api/monitoring/status                     ║
║      • POST /api/monitoring/start                      ║
║      • POST /api/monitoring/stop                       ║
║      • GET  /api/alerts                                ║
║      • GET  /api/risk/current                          ║
╚════════════════════════════════════════════════════════╝
    """.format("Enabled" if FORECASTER_AVAILABLE else "Disabled"))
    
    # Auto-start risk monitoring
    start_risk_monitor()
    print("🔔 Risk Monitoring Started - Threshold: 80%")
    
    try:
        app.run(host='0.0.0.0', port=5001, debug=True, use_reloader=False)
    finally:
        # Stop monitoring on shutdown
        stop_risk_monitor()
        print("🔔 Risk Monitoring Stopped")
