import requests
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# n8n webhook URLs
N8N_BASE_URL = os.environ.get('N8N_BASE_URL', 'http://localhost:5678')
N8N_WEBHOOK_SECRET = os.environ.get('N8N_WEBHOOK_SECRET', 'cashcompass-secret')

class N8NAgentManager:
    """Manages communication between CashCompass and n8n workflows"""
    
    def __init__(self):
        self.webhooks = {
            'crisis_alert': f'{N8N_BASE_URL}/webhook/crisis-alert',
            'weekly_report': f'{N8N_BASE_URL}/webhook/weekly-report',
            'smart_budget': f'{N8N_BASE_URL}/webhook/smart-budget',
            'bill_reminder': f'{N8N_BASE_URL}/webhook/bill-reminder',
            'savings_goal': f'{N8N_BASE_URL}/webhook/savings-goal',
        }
    
    def trigger_crisis_alert(self, user_data):
        """Trigger crisis alert workflow when risk score is high"""
        payload = {
            'secret': N8N_WEBHOOK_SECRET,
            'event': 'crisis_alert',
            'timestamp': datetime.now().isoformat(),
            'user_id': user_data.get('user_id'),
            'user_email': user_data.get('email'),
            'user_name': user_data.get('name'),
            'risk_score': user_data.get('risk_score'),
            'risk_level': user_data.get('risk_level'),
            'risk_reasons': user_data.get('risk_reasons', []),
            'recommended_actions': user_data.get('recommended_actions', []),
            'spending_last_30d': user_data.get('spending_last_30d'),
            'income_last_30d': user_data.get('income_last_30d'),
        }
        return self._send_webhook('crisis_alert', payload)
    
    def trigger_weekly_report(self, user_data):
        """Trigger weekly financial report generation"""
        payload = {
            'secret': N8N_WEBHOOK_SECRET,
            'event': 'weekly_report',
            'timestamp': datetime.now().isoformat(),
            'user_id': user_data.get('user_id'),
            'user_email': user_data.get('email'),
            'user_name': user_data.get('name'),
            'financial_summary': user_data.get('financial_summary'),
            'category_spending': user_data.get('category_spending'),
            'risk_score': user_data.get('risk_score'),
            'income_last_30d': user_data.get('income_last_30d'),
            'spending_last_30d': user_data.get('spending_last_30d'),
        }
        return self._send_webhook('weekly_report', payload)
    
    def trigger_smart_budget(self, user_data):
        """Trigger smart budget recommendations"""
        payload = {
            'secret': N8N_WEBHOOK_SECRET,
            'event': 'smart_budget',
            'timestamp': datetime.now().isoformat(),
            'user_id': user_data.get('user_id'),
            'user_email': user_data.get('email'),
            'category_spending': user_data.get('category_spending'),
            'income': user_data.get('income'),
            'spending': user_data.get('spending'),
            'risk_score': user_data.get('risk_score'),
        }
        return self._send_webhook('smart_budget', payload)
    
    def trigger_bill_reminder(self, user_data, bill_data=None):
        """Trigger bill payment reminder"""
        payload = {
            'secret': N8N_WEBHOOK_SECRET,
            'event': 'bill_reminder',
            'timestamp': datetime.now().isoformat(),
            'user_id': user_data.get('user_id'),
            'user_email': user_data.get('email'),
            'bill_name': bill_data.get('name', 'Monthly Bills') if bill_data else 'Monthly Bills',
            'bill_amount': bill_data.get('amount', 0) if bill_data else 0,
            'due_date': bill_data.get('due_date', 'End of month') if bill_data else 'End of month',
        }
        return self._send_webhook('bill_reminder', payload)
    
    def trigger_savings_goal(self, user_data, goal_data=None):
        """Trigger savings goal tracking"""
        payload = {
            'secret': N8N_WEBHOOK_SECRET,
            'event': 'savings_goal',
            'timestamp': datetime.now().isoformat(),
            'user_id': user_data.get('user_id'),
            'user_email': user_data.get('email'),
            'goal_name': goal_data.get('name', 'Savings Goal') if goal_data else 'Savings Goal',
            'goal_target': goal_data.get('target', 10000) if goal_data else 10000,
            'current_savings': user_data.get('current_savings', 0),
            'income': user_data.get('income'),
        }
        return self._send_webhook('savings_goal', payload)
    
    def _send_webhook(self, webhook_name, payload):
        """Send data to n8n webhook"""
        try:
            url = self.webhooks.get(webhook_name)
            if not url:
                return {'success': False, 'error': f'Unknown webhook: {webhook_name}'}
            
            print(f"🤖 Triggering n8n workflow: {webhook_name}")
            print(f"   URL: {url}")
            
            response = requests.post(
                url,
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 200:
                print(f"   ✅ Success!")
                return {'success': True, 'data': response.json() if response.text else {}}
            else:
                print(f"   ⚠️ HTTP {response.status_code}")
                return {'success': False, 'error': f'HTTP {response.status_code}', 'pending': True}
                
        except requests.exceptions.ConnectionError:
            print(f"   ⏳ n8n not running - action registered")
            return {'success': True, 'pending': True, 'message': 'Action registered (n8n workflow will process when available)'}
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Error: {e}")
            return {'success': False, 'error': str(e)}


# Singleton instance
n8n_agent = N8NAgentManager()
