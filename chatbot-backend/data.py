import pandas as pd
import random
from datetime import datetime, timedelta
import os

# Get the directory where this script is located
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_CSV_PATH = os.path.join(SCRIPT_DIR, "transactions.csv")

# Your categories (must match risk.py)
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

def load_transactions_from_csv(csv_path=None):
    """
    Load transactions from CSV file
    Expected CSV format: date,amount,category
    Always reads fresh from file (no caching)
    """
    if csv_path is None:
        csv_path = DEFAULT_CSV_PATH
    
    # If path is just filename, look in script directory
    if not os.path.isabs(csv_path):
        csv_path = os.path.join(SCRIPT_DIR, csv_path)
    
    print(f"Loading transactions from: {csv_path}")
    
    if not os.path.exists(csv_path):
        print(f"CSV file not found: {csv_path}")
        return None
    
    try:
        df = pd.read_csv(csv_path)
        print(f"CSV columns found: {list(df.columns)}")
        print(f"CSV shape: {df.shape}")
        
        # Validate required columns
        required_columns = {"date", "amount", "category"}
        if not required_columns.issubset(set(df.columns)):
            raise ValueError(f"CSV must contain columns: {required_columns}. Found: {list(df.columns)}")
        
        # Convert to list of dictionaries
        transactions = df.to_dict('records')
        
        # Validate data types and convert if necessary
        validated_transactions = []
        for transaction in transactions:
            validated_transaction = {
                "date": str(transaction["date"]),
                "amount": float(transaction["amount"]),
                "category": str(transaction["category"]).lower().strip()
            }
            validated_transactions.append(validated_transaction)
        
        print(f"✅ Successfully loaded {len(validated_transactions)} transactions from CSV")
        
        # Print first few transactions for debugging
        if validated_transactions:
            print(f"Sample transactions: {validated_transactions[:3]}")
        
        return validated_transactions
        
    except Exception as e:
        print(f"❌ Error loading CSV: {e}")
        import traceback
        traceback.print_exc()
        return None

def create_sample_csv(csv_path="transactions.csv"):
    """Create a sample CSV file with transaction data"""
    sample_transactions = []
    start_date = datetime(2024, 1, 1)
    
    # Generate sample data similar to your original generator
    for day in range(30):  # 30 days of data
        current_date = start_date + timedelta(days=day)
        
        # Income every 15 days
        if day % 15 == 0:
            income = random.choice([2200, 2500, 2800])
            sample_transactions.append({
                "date": current_date.strftime("%Y-%m-%d"),
                "amount": income,
                "category": "income"
            })
        
        # Random expenses
        if day % 3 == 0:  # Food
            sample_transactions.append({
                "date": current_date.strftime("%Y-%m-%d"),
                "amount": -random.uniform(30, 80),
                "category": "food"
            })
        if day % 7 == 0:  # Transport
            sample_transactions.append({
                "date": current_date.strftime("%Y-%m-%d"),
                "amount": -random.uniform(20, 60),
                "category": "transport"
            })
        if day % 10 == 0:  # Entertainment
            sample_transactions.append({
                "date": current_date.strftime("%Y-%m-%d"),
                "amount": -random.uniform(15, 100),
                "category": "social_life_entertainment"
            })
        if day % 5 == 0:  # Household
            sample_transactions.append({
                "date": current_date.strftime("%Y-%m-%d"),
                "amount": -random.uniform(50, 200),
                "category": "household"
            })
        if day % 12 == 0:  # Savings
            sample_transactions.append({
                "date": current_date.strftime("%Y-%m-%d"),
                "amount": random.uniform(100, 500),  # Positive for savings
                "category": "savings_investments"
            })
    
    # Save to CSV
    df = pd.DataFrame(sample_transactions)
    df.to_csv(csv_path, index=False)
    print(f"Sample CSV created: {csv_path}")

def get_user_transactions(user_id="user123", csv_path=None):
    """
    Get transactions for a specific user
    Always loads fresh from CSV file - no caching
    """
    print(f"Getting transactions for user: {user_id}")
    transactions = load_transactions_from_csv(csv_path)
    
    if transactions is None or len(transactions) == 0:
        print(f"⚠️ No transactions loaded from CSV!")
        return None
    
    return transactions

def generate_mock_transactions(days=30):
    """Generate mock transaction data for testing"""
    transactions = []
    start_date = datetime.now() - timedelta(days=days)
    
    for day in range(days):
        current_date = start_date + timedelta(days=day)
        date_str = current_date.strftime("%Y-%m-%d")
        
        # Income every 15 days
        if day % 15 == 0:
            income = random.choice([2200, 2500, 2800, 3000])
            transactions.append({
                "date": date_str,
                "amount": income,
                "category": "income"
            })
        
        # Random expenses
        if day % 2 == 0:  # Food
            transactions.append({
                "date": date_str,
                "amount": -random.uniform(30, 100),
                "category": "food"
            })
        if day % 5 == 0:  # Transport
            transactions.append({
                "date": date_str,
                "amount": -random.uniform(20, 80),
                "category": "transport"
            })
        if day % 7 == 0:  # Entertainment
            transactions.append({
                "date": date_str,
                "amount": -random.uniform(30, 150),
                "category": "social_life_entertainment"
            })
        if day % 4 == 0:  # Household
            transactions.append({
                "date": date_str,
                "amount": -random.uniform(50, 250),
                "category": "household"
            })
        if day % 10 == 0:  # Health
            transactions.append({
                "date": date_str,
                "amount": -random.uniform(30, 100),
                "category": "health_personal_care"
            })
        if day % 15 == 0:  # Savings
            transactions.append({
                "date": date_str,
                "amount": random.uniform(100, 400),
                "category": "savings_investments"
            })
    
    return transactions

# No more cached data - always load fresh from CSV
# Use get_user_transactions() to load transactions
