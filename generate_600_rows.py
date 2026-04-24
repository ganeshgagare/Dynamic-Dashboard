import json
import random
from datetime import datetime, timedelta

def generate_test_data(rows=600):
    statuses = ['Completed', 'In Progress', 'Pending']
    categories = ['Development', 'Design', 'Marketing', 'DevOps', 'Sales', 'HR', 'Support']
    data = []
    
    start_date = datetime(2024, 1, 1)
    
    for i in range(1, rows + 1):
        random_days = random.randint(0, 365)
        current_date = (start_date + timedelta(days=random_days)).strftime('%Y-%m-%d')
        
        data.append({
            "id": 1000 + i,
            "name": f"Task_{i:04d}",
            "status": random.choice(statuses),
            "category": random.choice(categories),
            "date": current_date,
            "value": random.randint(100, 10000)
        })
    
    return data

if __name__ == "__main__":
    test_data = generate_test_data(600)
    with open('test_data_600.json', 'w') as f:
        json.dump(test_data, f, indent=2)
    print("Successfully generated test_data_600.json with 600 rows.")
