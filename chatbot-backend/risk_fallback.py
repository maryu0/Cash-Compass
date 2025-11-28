# risk_fallback.py
import pandas as pd
import numpy as np

# Your categories (must match risk.py and data.py)
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

def calculate_risk_score_from_transactions(transactions):
    """
    Rule-based fallback using your category system.
    Returns the same dict format as the ML model.
    """
    if not transactions:
        return _default_response()

    try:
        # Separate income and expenses
        income_tx = [t for t in transactions if t.get("category") == INCOME_CATEGORY]
        expense_tx = [t for t in transactions if t.get("category") != INCOME_CATEGORY]
        
        if not expense_tx:
            return _default_response()
        
        total_income = sum(t["amount"] for t in income_tx)
        total_expense = -sum(t["amount"] for t in expense_tx if t["amount"] < 0)
        net_flow = total_income - total_expense
        eir = total_expense / total_income if total_income > 0 else 10.0
        
        # Compute daily balance trajectory (last 30 days)
        expense_tx_sorted = sorted(expense_tx[-30:], key=lambda x: x["date"])
        daily_bal = []
        bal = 0
        for tx in expense_tx_sorted:
            bal += tx["amount"]
            daily_bal.append(bal)
        
        if not daily_bal:
            return _default_response()
            
        balance_trend = np.polyfit(range(len(daily_bal)), daily_bal, 1)[0] if len(daily_bal) > 1 else 0
        low_bal_days = sum(1 for b in daily_bal if b < 50)
        projected_bal_7d = daily_bal[-1] + (net_flow / len(daily_bal)) * 7 if daily_bal else 0
        
        # Category spending
        df_exp = pd.DataFrame(expense_tx_sorted)
        category_spend = df_exp.groupby("category")["amount"].sum().apply(lambda x: -x if x < 0 else x).to_dict()
        
        # Full breakdown for all your categories (including $0)
        category_breakdown = {}
        for cat in EXPENSE_CATEGORIES:
            category_breakdown[cat] = int(category_spend.get(cat, 0))
        
        if category_spend:
            top_category = max(category_spend, key=category_spend.get)
            top_amount = int(category_spend[top_category])
        else:
            top_category = "miscellaneous"
            top_amount = 0
        
        # === RULE-BASED RISK SCORING (1-100) ===
        eir_score = min(eir * 100, 100)
        trend_score = max(0, -balance_trend * 5)
        low_bal_score = min(low_bal_days * 15, 100)
        net_flow_score = max(0, -net_flow / 20)
        proj_bal_score = max(0, -projected_bal_7d / 10)
        
        risk_score = int(np.clip(
            0.35 * eir_score +
            0.25 * trend_score +
            0.20 * low_bal_score +
            0.15 * net_flow_score +
            0.05 * proj_bal_score,
            1, 100
        ))
        
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
        
        # Category-specific tips
        actions = []
        if eir > 1.0:
            actions.append("You're spending more than you earn.")
        
        # Map your categories to actionable advice
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
            "category_spending": category_breakdown,
            "model_type": "rule-based"
        }
        
    except Exception:
        return _default_response()

def _default_response():
    # Return all categories with $0
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
        "category_spending": category_breakdown,
        "model_type": "rule-based"
    }
