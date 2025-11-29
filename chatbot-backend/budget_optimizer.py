import pandas as pd
import numpy as np
from sklearn.svm import SVR
from sklearn.preprocessing import StandardScaler
from sklearn.multioutput import MultiOutputRegressor
import joblib
import os
from datetime import datetime, timedelta

# Categories that match your existing system
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
    "gifts_donations",
    "miscellaneous"
]

# Priority levels for categories (higher = more essential, harder to cut)
CATEGORY_PRIORITY = {
    "household": 5,           # Rent, utilities - essential
    "health_personal_care": 5, # Health - essential
    "food": 4,                # Food - essential but can optimize
    "transport": 4,           # Transport - often necessary
    "education": 3,           # Education - important investment
    "pets": 3,                # Pets - responsibility
    "social_life_entertainment": 2,  # Entertainment - can reduce
    "apparel": 2,             # Clothing - can defer
    "gifts_donations": 2,     # Gifts - can reduce
    "travel": 1,              # Travel - can postpone
    "miscellaneous": 1        # Misc - can cut
}

# Risk threshold for triggering budget optimization
RISK_THRESHOLD = 80

def _generate_budget_training_data(n_samples=1000):
    """Generate synthetic training data for budget optimization"""
    np.random.seed(42)
    data = []
    
    for i in range(n_samples):
        # Input features
        income = np.random.uniform(2000, 5000)
        current_food = np.random.uniform(100, 800)
        current_social = np.random.uniform(50, 400)
        current_transport = np.random.uniform(50, 300)
        current_household = np.random.uniform(300, 1200)
        current_health = np.random.uniform(50, 300)
        current_apparel = np.random.uniform(20, 200)
        current_travel = np.random.uniform(0, 800)
        current_misc = np.random.uniform(10, 200)
        current_pets = np.random.uniform(0, 150)
        current_education = np.random.uniform(0, 300)
        current_gifts = np.random.uniform(0, 150)
        
        current_total = current_food + current_social + current_transport + current_household + \
                       current_health + current_apparel + current_travel + current_misc + \
                       current_pets + current_education + current_gifts
        
        eir = current_total / income if income > 0 else 1.0
        risk_score = min(eir * 100, 100)
        
        # Generate optimized budgets (reduced amounts for high-risk users - now at 80% threshold)
        reduction_factor = 0.8 if risk_score > 80 else 0.95  # Changed threshold to 80%
        
        optimized_food = current_food * reduction_factor * np.random.uniform(0.8, 1.2)
        optimized_social = current_social * reduction_factor * np.random.uniform(0.6, 1.0)  # Bigger cut for entertainment
        optimized_transport = current_transport * reduction_factor * np.random.uniform(0.85, 1.15)
        optimized_household = current_household * reduction_factor * np.random.uniform(0.9, 1.1)  # Less cut for essentials
        optimized_health = current_health * reduction_factor * np.random.uniform(0.95, 1.05)  # Minimal cut for health
        optimized_apparel = current_apparel * reduction_factor * np.random.uniform(0.6, 0.9)  # Bigger cut for non-essentials
        optimized_travel = current_travel * reduction_factor * np.random.uniform(0.3, 0.7)  # Big cut for travel
        optimized_misc = current_misc * reduction_factor * np.random.uniform(0.7, 1.0)
        optimized_pets = current_pets * reduction_factor * np.random.uniform(0.8, 1.0)
        optimized_education = current_education * reduction_factor * np.random.uniform(0.85, 1.0)
        optimized_gifts = current_gifts * reduction_factor * np.random.uniform(0.7, 0.95)
        
        # Input features (current spending ratios, income, risk factors)
        features = [
            current_food/income, current_social/income, current_transport/income,
            current_household/income, current_health/income, current_apparel/income,
            current_travel/income, current_misc/income, current_pets/income,
            current_education/income, current_gifts/income, income, eir, risk_score
        ]
        
        # Target: optimized budgets
        targets = [
            optimized_food, optimized_social, optimized_transport, optimized_household,
            optimized_health, optimized_apparel, optimized_travel, optimized_misc,
            optimized_pets, optimized_education, optimized_gifts
        ]
        
        data.append(features + targets)
    
    feature_cols = [
        'food_ratio', 'social_ratio', 'transport_ratio', 'household_ratio', 
        'health_ratio', 'apparel_ratio', 'travel_ratio', 'misc_ratio',
        'pets_ratio', 'education_ratio', 'gifts_ratio', 'income', 'eir', 'risk_score'
    ] + [f'optimized_{cat}' for cat in EXPENSE_CATEGORIES]
    
    return pd.DataFrame(data, columns=feature_cols)

def _get_or_train_budget_model():
    """Get existing model or train new one"""
    model_path = "budget_model.pkl"
    scaler_path = "budget_scaler.pkl"
    
    if os.path.exists(model_path) and os.path.exists(scaler_path):
        return joblib.load(model_path), joblib.load(scaler_path)
    
    print("Training budget optimization model...")
    df = _generate_budget_training_data(1000)
    
    feature_cols = [
        'food_ratio', 'social_ratio', 'transport_ratio', 'household_ratio', 
        'health_ratio', 'apparel_ratio', 'travel_ratio', 'misc_ratio',
        'pets_ratio', 'education_ratio', 'gifts_ratio', 'income', 'eir', 'risk_score'
    ]
    
    X = df[feature_cols]
    y = df[[f'optimized_{cat}' for cat in EXPENSE_CATEGORIES]]
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    model = MultiOutputRegressor(SVR(kernel='rbf', C=1.0, gamma='scale'))
    model.fit(X_scaled, y)
    
    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)
    print("Budget optimization model trained and saved!")
    
    return model, scaler

def optimize_budgets(income, current_spending, risk_score):
    """
    Optimize category budgets based on current spending and risk level
    
    Args:
        income: Total monthly income
        current_spending: Dict with category spending amounts
        risk_score: Current risk score (0-100)
    
    Returns:
        Dict with recommended budgets for each category, or None if risk <= threshold
    """
    try:
        model, scaler = _get_or_train_budget_model()
        
        # Only provide budget recommendations when risk score exceeds threshold
        if risk_score < RISK_THRESHOLD:
            return None
        
        # Prepare input features
        features = []
        for cat in EXPENSE_CATEGORIES:
            spending = current_spending.get(cat, 0)
            ratio = spending / income if income > 0 else 0
            features.append(ratio)
        
        total_spending = sum(current_spending.get(cat, 0) for cat in EXPENSE_CATEGORIES)
        eir = total_spending / income if income > 0 else 1.0
        features.extend([income, eir, risk_score])
        
        # Scale features
        X_scaled = scaler.transform([features])
        
        # Predict optimized budgets
        optimized = model.predict(X_scaled)[0]
        
        # Create result dictionary
        result = {}
        for i, cat in enumerate(EXPENSE_CATEGORIES):
            result[cat] = max(0, round(optimized[i], 2))  # Ensure non-negative
        
        return result
        
    except Exception as e:
        print(f"Budget optimization error: {e}")
        # Fallback to rule-based optimization
        return _rule_based_optimization(income, current_spending, risk_score)


def _rule_based_optimization(income, current_spending, risk_score):
    """Fallback rule-based budget optimization when ML model fails"""
    if risk_score < RISK_THRESHOLD:
        return None
    
    # Calculate reduction factors based on risk level
    if risk_score >= 90:
        base_reduction = 0.65  # Aggressive reduction for very high risk
    elif risk_score >= 85:
        base_reduction = 0.75
    else:
        base_reduction = 0.85
    
    result = {}
    for cat in EXPENSE_CATEGORIES:
        current = current_spending.get(cat, 0)
        priority = CATEGORY_PRIORITY.get(cat, 2)
        
        # Higher priority = less reduction
        category_reduction = base_reduction + (priority - 1) * 0.05
        category_reduction = min(category_reduction, 1.0)  # Cap at 100%
        
        result[cat] = max(0, round(current * category_reduction, 2))
    
    return result


def get_budget_optimization_report(income, current_spending, risk_score):
    """
    Generate a comprehensive budget optimization report
    
    Args:
        income: Total monthly income
        current_spending: Dict with category spending amounts
        risk_score: Current risk score (0-100)
    
    Returns:
        Dict with full optimization report including recommendations
    """
    # Check if optimization is needed
    if risk_score < RISK_THRESHOLD:
        return {
            "triggered": False,
            "risk_score": risk_score,
            "threshold": RISK_THRESHOLD,
            "message": f"Budget optimization not needed. Risk score ({risk_score}%) is below threshold ({RISK_THRESHOLD}%)."
        }
    
    # Get optimized budgets
    optimized_budgets = optimize_budgets(income, current_spending, risk_score)
    
    if optimized_budgets is None:
        return {
            "triggered": True,
            "risk_score": risk_score,
            "threshold": RISK_THRESHOLD,
            "error": "Failed to generate optimized budgets"
        }
    
    # Calculate savings and changes
    total_current = sum(current_spending.get(cat, 0) for cat in EXPENSE_CATEGORIES)
    total_optimized = sum(optimized_budgets.values())
    total_savings = total_current - total_optimized
    
    # Generate category-wise breakdown
    category_changes = []
    for cat in EXPENSE_CATEGORIES:
        current = current_spending.get(cat, 0)
        optimized = optimized_budgets.get(cat, 0)
        change = current - optimized
        change_percent = (change / current * 100) if current > 0 else 0
        
        category_changes.append({
            "category": cat,
            "category_display": cat.replace('_', ' ').title(),
            "current": round(current, 2),
            "recommended": round(optimized, 2),
            "savings": round(change, 2),
            "reduction_percent": round(change_percent, 1),
            "priority": CATEGORY_PRIORITY.get(cat, 2)
        })
    
    # Sort by savings potential (highest first)
    category_changes.sort(key=lambda x: x['savings'], reverse=True)
    
    # Generate actionable recommendations
    recommendations = _generate_recommendations(category_changes, risk_score, income, total_current)
    
    # Calculate target savings to reach safe zone
    target_monthly_spending = income * 0.7  # Target 70% of income for spending
    additional_cuts_needed = max(0, total_optimized - target_monthly_spending)
    
    return {
        "triggered": True,
        "risk_score": risk_score,
        "threshold": RISK_THRESHOLD,
        "income": round(income, 2),
        "current_total_spending": round(total_current, 2),
        "optimized_total_spending": round(total_optimized, 2),
        "total_potential_savings": round(total_savings, 2),
        "savings_percent": round((total_savings / total_current * 100) if total_current > 0 else 0, 1),
        "target_monthly_spending": round(target_monthly_spending, 2),
        "additional_cuts_needed": round(additional_cuts_needed, 2),
        "optimized_budgets": optimized_budgets,
        "category_breakdown": category_changes,
        "recommendations": recommendations,
        "urgency": _get_urgency_level(risk_score),
        "estimated_weeks_to_recovery": _estimate_recovery_time(risk_score, total_savings, income)
    }


def _generate_recommendations(category_changes, risk_score, income, total_spending):
    """Generate actionable recommendations based on category analysis"""
    recommendations = []
    
    # Urgency message based on risk
    if risk_score >= 90:
        recommendations.append({
            "type": "urgent",
            "icon": "🚨",
            "message": "CRITICAL: Immediate action required! Your finances are at severe risk.",
            "priority": 1
        })
    elif risk_score >= 85:
        recommendations.append({
            "type": "warning",
            "icon": "⚠️",
            "message": "HIGH ALERT: Your spending needs significant reduction this week.",
            "priority": 1
        })
    else:
        recommendations.append({
            "type": "caution",
            "icon": "📊",
            "message": "ATTENTION: Budget optimization activated to prevent financial crisis.",
            "priority": 1
        })
    
    # Category-specific recommendations
    category_tips = {
        "food": {
            "tip": "Meal prep on weekends, use grocery lists, avoid eating out",
            "icon": "🍽️"
        },
        "social_life_entertainment": {
            "tip": "Pause subscriptions, host potlucks instead of dining out, use free entertainment",
            "icon": "🎬"
        },
        "transport": {
            "tip": "Carpool, use public transit, combine errands to save fuel",
            "icon": "🚗"
        },
        "household": {
            "tip": "Reduce energy usage, negotiate bills, delay non-urgent repairs",
            "icon": "🏠"
        },
        "health_personal_care": {
            "tip": "Use generic medications, compare pharmacy prices",
            "icon": "💊"
        },
        "apparel": {
            "tip": "Implement 30-day rule for clothing purchases, shop secondhand",
            "icon": "👔"
        },
        "travel": {
            "tip": "Postpone non-essential travel, use points/miles if available",
            "icon": "✈️"
        },
        "education": {
            "tip": "Use free online resources, library, and open courseware",
            "icon": "📚"
        },
        "pets": {
            "tip": "Buy pet supplies in bulk, compare vet prices",
            "icon": "🐕"
        },
        "gifts_donations": {
            "tip": "Give homemade gifts, set strict gift budgets",
            "icon": "🎁"
        },
        "miscellaneous": {
            "tip": "Track every small expense, eliminate impulse purchases",
            "icon": "📝"
        }
    }
    
    # Top 3 categories to cut
    top_cuts = [c for c in category_changes if c['savings'] > 0][:3]
    for cat_data in top_cuts:
        cat = cat_data['category']
        if cat in category_tips:
            tip = category_tips[cat]
            recommendations.append({
                "type": "action",
                "icon": tip['icon'],
                "category": cat_data['category_display'],
                "message": f"Cut {cat_data['category_display']} by ₹{cat_data['savings']:,.0f} ({cat_data['reduction_percent']:.0f}%)",
                "tip": tip['tip'],
                "priority": 2
            })
    
    # Savings target recommendation
    target_savings = income * 0.2  # 20% savings target
    current_savings = income - total_spending
    if current_savings < target_savings:
        recommendations.append({
            "type": "goal",
            "icon": "🎯",
            "message": f"Target: Save ₹{target_savings:,.0f}/month (20% of income). Current: ₹{max(0, current_savings):,.0f}",
            "priority": 3
        })
    
    # Emergency fund reminder
    recommendations.append({
        "type": "tip",
        "icon": "💡",
        "message": "Build emergency fund: Aim for 3-6 months of expenses",
        "priority": 4
    })
    
    return sorted(recommendations, key=lambda x: x['priority'])


def _get_urgency_level(risk_score):
    """Determine urgency level based on risk score"""
    if risk_score >= 90:
        return {"level": "critical", "label": "CRITICAL", "color": "red"}
    elif risk_score >= 85:
        return {"level": "high", "label": "HIGH", "color": "orange"}
    else:
        return {"level": "elevated", "label": "ELEVATED", "color": "yellow"}


def _estimate_recovery_time(risk_score, monthly_savings, income):
    """Estimate weeks to recover to healthy financial state"""
    if monthly_savings <= 0:
        return "Unable to estimate - need positive savings"
    
    # Estimate based on building 1 month emergency fund
    target = income * 0.5  # Half month's income as initial target
    weeks = (target / monthly_savings) * 4  # Convert to weeks
    
    return max(4, min(52, int(weeks)))  # Between 4-52 weeks


def get_chatbot_budget_summary(income, current_spending, risk_score):
    """
    Get a formatted summary for chatbot responses
    
    Returns a string summary suitable for including in chatbot context
    """
    report = get_budget_optimization_report(income, current_spending, risk_score)
    
    if not report.get("triggered"):
        return None
    
    if report.get("error"):
        return "⚠️ Budget optimization triggered but encountered an error."
    
    urgency = report.get("urgency", {})
    
    summary = f"""
🚨 BUDGET OPTIMIZATION ACTIVATED (Risk: {report['risk_score']}%)
{'='*50}
Urgency Level: {urgency.get('label', 'ELEVATED')}

💰 FINANCIAL SNAPSHOT:
• Monthly Income: ₹{report['income']:,.0f}
• Current Spending: ₹{report['current_total_spending']:,.0f}
• Optimized Target: ₹{report['optimized_total_spending']:,.0f}
• Potential Savings: ₹{report['total_potential_savings']:,.0f} ({report['savings_percent']:.1f}%)

📊 TOP CATEGORIES TO REDUCE:
"""
    
    # Add top 5 categories
    for cat in report['category_breakdown'][:5]:
        if cat['savings'] > 0:
            summary += f"• {cat['category_display']}: ₹{cat['current']:,.0f} → ₹{cat['recommended']:,.0f} (save ₹{cat['savings']:,.0f})\n"
    
    summary += f"""
🎯 KEY RECOMMENDATIONS:
"""
    for rec in report['recommendations'][:4]:
        summary += f"• {rec['icon']} {rec['message']}\n"
    
    summary += f"""
⏱️ Estimated Recovery: ~{report['estimated_weeks_to_recovery']} weeks with consistent effort
"""
    
    return summary