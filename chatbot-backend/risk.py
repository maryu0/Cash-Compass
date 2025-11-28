import pandas as pd
import numpy as np
import os
import joblib
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler

# ----------------------------
# YOUR CATEGORY DEFINITIONS
# ----------------------------
INCOME_CATEGORY = "income"
EXPENSE_CATEGORIES = [
    "food",
    "social_life_entertainment",
    "transport",
    "household",
    "health_personal_care",
    "education",
    "pets",
    "apparel",
    "travel",
    "savings_investments",
    "gifts_donations",
    "miscellaneous"
]

# ----------------------------
# 1. SYNTHETIC DATA GENERATOR (WITH YOUR CATEGORIES)
# ----------------------------
def _generate_synthetic_dataset(n_users=1000):
    np.random.seed(42)
    data = []
    
    for user_id in range(n_users):
        monthly_income = np.random.choice([2000, 2500, 3000, 3500, 4000])
        is_at_risk = (user_id % 5 == 0)
        
        transactions = []
        balance = 0
        crisis_triggered = False
        
        for day in range(60):
            current_date = datetime(2024, 1, 1) + timedelta(days=day)
            date_str = current_date.strftime("%Y-%m-%d")
            weekday = current_date.weekday()
            
            # Income
            if day % 15 == 0:
                income = np.random.normal(monthly_income / 2, monthly_income * 0.1)
                transactions.append({"date": date_str, "amount": float(income), "category": INCOME_CATEGORY})
                balance += income
            
            # Expenses
            spend_factor = 1.5 if is_at_risk else 1.0
            if weekday in [2, 5] or np.random.rand() < 0.2:
                amt = np.random.uniform(40, 100) * spend_factor
                transactions.append({"date": date_str, "amount": -float(amt), "category": "food"})
                balance -= amt
            if (weekday >= 4 and np.random.rand() < 0.3) or day in [5, 20, 35, 50]:
                amt = np.random.uniform(30, 150) * spend_factor
                transactions.append({"date": date_str, "amount": -float(amt), "category": "social_life_entertainment"})
                balance -= amt
            if day % 8 == 0:
                amt = np.random.uniform(25, 80) * spend_factor
                transactions.append({"date": date_str, "amount": -float(amt), "category": "transport"})
                balance -= amt
            if day == 2:
                amt = np.random.uniform(800, 1500) * spend_factor
                transactions.append({"date": date_str, "amount": -float(amt), "category": "household"})
                balance -= amt
            elif day == 15:
                amt = np.random.uniform(100, 300) * spend_factor
                transactions.append({"date": date_str, "amount": -float(amt), "category": "household"})
                balance -= amt
            if day in [10, 40] or np.random.rand() < 0.02:
                amt = np.random.uniform(50, 200) * spend_factor
                transactions.append({"date": date_str, "amount": -float(amt), "category": "health_personal_care"})
                balance -= amt
            if day in [25, 55] or (is_at_risk and np.random.rand() < 0.05):
                amt = np.random.uniform(50, 300) * spend_factor
                transactions.append({"date": date_str, "amount": -float(amt), "category": "apparel"})
                balance -= amt
            if day == 30 and np.random.rand() < 0.4:
                amt = np.random.uniform(200, 800) * spend_factor
                transactions.append({"date": date_str, "amount": -float(amt), "category": "travel"})
                balance -= amt
            if np.random.rand() < 0.01:
                amt = np.random.uniform(20, 100)
                transactions.append({"date": date_str, "amount": -float(amt), "category": "pets"})
                balance -= amt
            if np.random.rand() < 0.01:
                amt = np.random.uniform(50, 200)
                transactions.append({"date": date_str, "amount": -float(amt), "category": "education"})
                balance -= amt
            if np.random.rand() < 0.02:
                amt = np.random.uniform(20, 100)
                transactions.append({"date": date_str, "amount": -float(amt), "category": "gifts_donations"})
                balance -= amt
            if np.random.rand() < 0.01:
                amt = np.random.uniform(10, 50)
                transactions.append({"date": date_str, "amount": -float(amt), "category": "miscellaneous"})
                balance -= amt
            if np.random.rand() < 0.01:
                amt = np.random.uniform(100, 500)
                transactions.append({"date": date_str, "amount": float(amt), "category": "savings_investments"})
                balance += amt
            
            if balance < 0 and not crisis_triggered:
                crisis_triggered = True
        
        # Feature extraction
        expense_tx = [t for t in transactions if t["category"] != INCOME_CATEGORY][-30:]
        income_tx = [t for t in transactions if t["category"] == INCOME_CATEGORY]
        if not expense_tx:
            continue
            
        total_income = sum(t["amount"] for t in income_tx)
        total_expense = -sum(t["amount"] for t in expense_tx if t["amount"] < 0)
        net_flow = total_income - total_expense
        eir = total_expense / total_income if total_income > 0 else 10.0
        
        sorted_exp = sorted(expense_tx, key=lambda x: x["date"])
        daily_bal = []
        bal = 0
        for tx in sorted_exp:
            bal += tx["amount"]
            daily_bal.append(bal)
        
        balance_trend = np.polyfit(range(len(daily_bal)), daily_bal, 1)[0] if len(daily_bal) > 1 else 0
        low_bal_days = sum(1 for b in daily_bal if b < 50)
        projected_bal_7d = daily_bal[-1] + (net_flow / 30) * 7 if daily_bal else 0
        
        df_exp = pd.DataFrame(sorted_exp)
        category_spend = df_exp.groupby("category")["amount"].sum().apply(lambda x: -x if x < 0 else x).to_dict()
        
        features = [
            eir, balance_trend, low_bal_days, net_flow, projected_bal_7d,
            total_income, total_expense,
            category_spend.get("food", 0),
            category_spend.get("social_life_entertainment", 0),
            category_spend.get("transport", 0),
            category_spend.get("household", 0),
            category_spend.get("health_personal_care", 0),
            category_spend.get("apparel", 0),
            category_spend.get("travel", 0)
        ]
        data.append(features + [1 if crisis_triggered else 0])
    
    feature_cols = [
        'eir', 'balance_trend', 'low_bal_days', 'net_flow', 'projected_bal_7d',
        'total_income', 'total_expense', 'food_spend', 'social_spend', 'transport_spend',
        'household_spend', 'health_spend', 'apparel_spend', 'travel_spend', 'crisis'
    ]
    return pd.DataFrame(data, columns=feature_cols)

# ----------------------------
# 2. MODEL TRAINING
# ----------------------------
def _get_or_train_model():
    model_path = "risk_model_final.pkl"
    scaler_path = "risk_scaler_final.pkl"
    
    if os.path.exists(model_path) and os.path.exists(scaler_path):
        return joblib.load(model_path), joblib.load(scaler_path)
    
    print("Training ML model with your categories...")
    df = _generate_synthetic_dataset(1000)
    X = df.drop(columns=['crisis'])
    y = df['crisis']
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_scaled, y)
    
    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)
    print("Model trained and saved!")
    return model, scaler

# ----------------------------
# 3. MAIN FUNCTION
# ----------------------------
def calculate_risk_score_from_transactions(transactions):
    try:
        model, scaler = _get_or_train_model()
        
        if not transactions:
            feature_names = [
                'eir', 'balance_trend', 'low_bal_days', 'net_flow', 'projected_bal_7d',
                'total_income', 'total_expense', 'food_spend', 'social_spend', 'transport_spend',
                'household_spend', 'health_spend', 'apparel_spend', 'travel_spend'
            ]
            features = np.array([[10.0, -10.0, 30, -1000, -200, 0, 1000] + [300]*7])
            total_income = total_expense = 0
            top_category = "none"
            top_amount = 0
            category_breakdown = {cat: 0 for cat in EXPENSE_CATEGORIES}
            eir = 10.0
            low_bal_days = 30
            projected_bal_7d = -200
        else:
            income_tx = [t for t in transactions if t.get("category") == INCOME_CATEGORY]
            expense_tx = [t for t in transactions if t.get("category") != INCOME_CATEGORY]
            
            total_income = sum(t["amount"] for t in income_tx)
            total_expense = -sum(t["amount"] for t in expense_tx if t["amount"] < 0)
            net_flow = total_income - total_expense
            eir = total_expense / total_income if total_income > 0 else 10.0
            
            expense_tx_sorted = sorted(expense_tx[-30:], key=lambda x: x["date"])
            daily_bal = []
            bal = 0
            for tx in expense_tx_sorted:
                bal += tx["amount"]
                daily_bal.append(bal)
            
            balance_trend = np.polyfit(range(len(daily_bal)), daily_bal, 1)[0] if len(daily_bal) > 1 else 0
            low_bal_days = sum(1 for b in daily_bal if b < 50)
            projected_bal_7d = daily_bal[-1] + (net_flow / 30) * 7 if daily_bal else 0
            
            if expense_tx_sorted:
                df_exp = pd.DataFrame(expense_tx_sorted)
                category_spend = df_exp.groupby("category")["amount"].sum().apply(lambda x: -x if x < 0 else x).to_dict()
                if category_spend:
                    top_category = max(category_spend, key=category_spend.get)
                    top_amount = int(category_spend[top_category])
                else:
                    top_category = "miscellaneous"
                    top_amount = 0
            else:
                category_spend = {}
                top_category = "miscellaneous"
                top_amount = 0
            
            # Full category breakdown (all your categories)
            category_breakdown = {}
            for cat in EXPENSE_CATEGORIES:
                category_breakdown[cat] = int(category_spend.get(cat, 0))
            
            features = np.array([[
                eir, balance_trend, low_bal_days, net_flow, projected_bal_7d,
                total_income, total_expense,
                category_breakdown.get("food", 0),
                category_breakdown.get("social_life_entertainment", 0),
                category_breakdown.get("transport", 0),
                category_breakdown.get("household", 0),
                category_breakdown.get("health_personal_care", 0),
                category_breakdown.get("apparel", 0),
                category_breakdown.get("travel", 0)
            ]])
        
        # Predict
        X_scaled = scaler.transform(features)
        prob_crisis = model.predict_proba(X_scaled)[0][1]
        risk_score = int(np.clip(prob_crisis * 100, 1, 100))
        
        # Risk level
        if risk_score <= 30:
            risk_level = "healthy"
        elif risk_score <= 60:
            risk_level = "caution"
        else:
            risk_level = "high"
        
        # Risk reasons
        reasons = []
        if eir > 1.0:
            reasons.append("Spending exceeds income")
        if balance_trend < -5:
            reasons.append("Balance declining rapidly")
        if low_bal_days > 3:
            reasons.append("Frequently low balance")
        if projected_bal_7d < 0:
            reasons.append("Projected negative balance in 7 days")
        if not reasons:
            reasons = ["No major risks detected"]
        
        # Tips
        actions = []
        if eir > 1.0:
            actions.append("You're spending more than you earn.")
        
        tip_map = {
            "food": "Consider meal prepping to reduce food costs.",
            "social_life_entertainment": "Try free local events or limit streaming subscriptions.",
            "transport": "Carpool or use public transit to lower transport costs.",
            "household": "Switch to energy-efficient appliances to reduce utility bills.",
            "health_personal_care": "Compare pharmacy prices or use generic brands.",
            "apparel": "Adopt a '30-day wait' rule for non-essential clothing purchases.",
            "travel": "Book flights in advance and travel off-season for savings.",
            "pets": "Buy pet food in bulk or compare vet prices annually.",
            "education": "Use free online resources like Coursera or Khan Academy.",
            "gifts_donations": "Set a monthly budget for gifts and donations.",
            "miscellaneous": "Track small expenses—they add up quickly!"
        }
        
        if top_amount > 150 and top_category in tip_map:
            actions.append(tip_map[top_category])
        if low_bal_days > 3:
            actions.append("Keep a $100 buffer to avoid overdraft fees.")
        if projected_bal_7d < 0:
            actions.append("Set a weekly spending limit to stay safe.")
        if not actions:
            actions.append("Your finances look stable! Keep tracking your spending.")
        
        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "projected_balance_7d": float(projected_bal_7d),
            "income_last_30d": int(total_income),
            "spending_last_30d": int(total_expense),
            "top_risk_reasons": reasons,
            "recommended_actions": actions,
            "top_spending_category": top_category,
            "top_spending_amount": top_amount,
            "category_spending": category_breakdown
        }
        
    except Exception as e:
        try:
            from risk_fallback import calculate_risk_score_from_transactions as fallback
            return fallback(transactions)
        except:
            category_breakdown = {cat: 0 for cat in EXPENSE_CATEGORIES}
            return {
                "risk_score": 50,
                "risk_level": "unknown",
                "projected_balance_7d": 0.0,
                "income_last_30d": 0,
                "spending_last_30d": 0,
                "top_risk_reasons": ["Unable to analyze transactions"],
                "recommended_actions": ["Ensure your data includes date, amount, and category."],
                "top_spending_category": "unknown",
                "top_spending_amount": 0,
                "category_spending": category_breakdown
            }
