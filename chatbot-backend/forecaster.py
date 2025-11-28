from prophet import Prophet
import pandas as pd
from datetime import datetime, timedelta
import numpy as np

def forecast_income_and_spending(transactions, days_ahead=7):
    """
    Forecasts income and spending by category for the next N days.
    
    Args:
        transactions: List of dicts with keys: 'date', 'amount', 'category'
        days_ahead: Number of days to forecast (default: 7)
    
    Returns:
        dict: {
            "income_forecast": [daily_income_list],
            "spending_forecast": { "category": [daily_amounts], ... }
        }
    """
    if not transactions:
        return _empty_forecast(days_ahead)
    
    try:
        # Validate transaction structure
        required_keys = {"date", "amount", "category"}
        if not all(isinstance(t, dict) and required_keys.issubset(t.keys()) for t in transactions):
            return _empty_forecast(days_ahead)
        
        # Convert to DataFrame
        df = pd.DataFrame(transactions)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        
        # Separate income and expenses
        income_df = df[df['category'] == 'income'][['date', 'amount']].copy()
        if not income_df.empty:
            income_df = income_df.rename(columns={'amount': 'y'})
            income_df['ds'] = income_df['date']
            income_forecast = _forecast_series(income_df[['ds', 'y']], days_ahead)
        else:
            income_forecast = [0] * days_ahead
        
        # Forecast spending by category
        spending_forecast = {}
        expense_df = df[df['category'] != 'income']
        if not expense_df.empty:
            for category in expense_df['category'].unique():
                cat_df = expense_df[expense_df['category'] == category][['date', 'amount']].copy()
                # Only consider negative amounts (expenses) for forecasting
                cat_df = cat_df[cat_df['amount'] < 0]
                if not cat_df.empty:
                    # Make spending positive for forecasting
                    cat_df['y'] = -cat_df['amount']  # expenses are negative in your data
                    cat_df['ds'] = cat_df['date']
                    cat_forecast = _forecast_series(cat_df[['ds', 'y']], days_ahead)
                    spending_forecast[category] = cat_forecast
        else:
            spending_forecast = {}
        
        return {
            "income_forecast": income_forecast,
            "spending_forecast": spending_forecast
        }
        
    except Exception as e:
        # Fallback to zeros on error
        return _empty_forecast(days_ahead)

def _forecast_series(df, days_ahead):
    """Forecast a single time series with Prophet"""
    if len(df) < 2:
        # Not enough data - return last value or zero
        last_value = df['y'].iloc[-1] if not df.empty else 0
        return [max(0, last_value)] * days_ahead
    
    try:
        # Ensure daily frequency
        df = df.set_index('ds').resample('D').sum().reset_index()
        df['y'] = df['y'].fillna(0)
        
        # Fit Prophet
        m = Prophet(
            yearly_seasonality=False,
            weekly_seasonality=True,
            daily_seasonality=False,
            interval_width=0.8,
            n_changepoints=10
        )
        m.fit(df)
        
        # Forecast
        future = m.make_future_dataframe(periods=days_ahead)
        forecast = m.predict(future)
        
        # Return last N days of forecast, ensure non-negative
        result = forecast['yhat'][-days_ahead:].clip(lower=0).tolist()
        return [float(x) for x in result]
        
    except:
        # Fallback to average if Prophet fails
        avg = df['y'].mean() if not df.empty else 0
        return [max(0, avg)] * days_ahead

def _empty_forecast(days_ahead):
    """Return empty forecast structure"""
    return {
        "income_forecast": [0.0] * days_ahead,
        "spending_forecast": {}
    }

def get_forecast_summary(transactions, days_ahead=7):
    """
    Get a summarized forecast for chatbot use.
    
    Returns:
        dict: {
            "predicted_income": total_income,
            "predicted_spending": total_spending,
            "predicted_balance_change": income - spending,
            "daily_income": [rounded_daily_income],
            "daily_spending": {category: [rounded_daily_spending]}
        }
    """
    forecast = forecast_income_and_spending(transactions, days_ahead)
    total_income = sum(forecast["income_forecast"])
    total_spending = sum(
        sum(amounts) for amounts in forecast["spending_forecast"].values()
    )
    return {
        "predicted_income": round(total_income, 2),
        "predicted_spending": round(total_spending, 2),
        "predicted_balance_change": round(total_income - total_spending, 2),
        "daily_income": [round(x, 2) for x in forecast["income_forecast"]],
        "daily_spending": {
            cat: [round(x, 2) for x in amounts]
            for cat, amounts in forecast["spending_forecast"].items()
        }
    }

def calculate_days_to_goal(transactions, goal_amount, current_balance=0):
    """
    Calculate days to reach a savings goal.
    
    Args:
        transactions: List of transaction dicts
        goal_amount: Target savings amount (float)
        current_balance: Current account balance (float)
    
    Returns:
        dict: {
            "days_to_goal": int (or inf if impossible),
            "daily_savings_needed": float
        }
    """
    if goal_amount <= current_balance:
        return {"days_to_goal": 0, "daily_savings_needed": 0.0}
    
    if not transactions:
        # No transaction history - assume 30 days
        return {
            "days_to_goal": float('inf'),
            "daily_savings_needed": round(goal_amount / 30, 2)
        }
    
    try:
        df = pd.DataFrame(transactions)
        df['date'] = pd.to_datetime(df['date'])
        
        # Calculate actual savings behavior
        savings_df = df[df['category'] == 'savings_investments']
        if not savings_df.empty:
            # Use actual savings rate
            actual_savings_rate = savings_df['amount'].mean()
        else:
            # If no savings transactions, use net positive flow as proxy
            income_df = df[df['category'] == 'income']
            expense_df = df[(df['category'] != 'income') & (df['amount'] < 0)]
            income = income_df['amount'].sum() if not income_df.empty else 0
            expenses = -expense_df['amount'].sum() if not expense_df.empty else 0
            net_flow = income - expenses
            days_of_history = (df['date'].max() - df['date'].min()).days
            days_of_history = max(days_of_history, 30)  # Minimum 30 days
            actual_savings_rate = max(0, net_flow / days_of_history)
        
        # Check if goal is achievable
        if actual_savings_rate <= 0:
            return {
                "days_to_goal": float('inf'),
                "daily_savings_needed": round(goal_amount / 30, 2)
            }
        
        # Calculate days needed
        amount_needed = goal_amount - current_balance
        days_to_goal = amount_needed / actual_savings_rate
        
        return {
            "days_to_goal": int(round(days_to_goal)),
            "daily_savings_needed": round(goal_amount / 30, 2)
        }
        
    except Exception as e:
        # Fallback on error
        return {
            "days_to_goal": float('inf'),
            "daily_savings_needed": round(goal_amount / 30, 2)
        }
