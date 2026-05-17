import json
import requests

LOCAL_URL = "http://127.0.0.1:8000/chat"

def run_local_simulation():
    print("🚀 Starting Local SHL Agent Simulation...\n")
    
    # Trace Turn 1: Vague query (The agent should clarify, recommendations must be empty)
    print("--- Turn 1: Sending vague prompt ---")
    history = [{"role": "user", "content": "I need an assessment for an upcoming hire."}]
    
    response = requests.post(LOCAL_URL, json={"messages": history})
    res_data = response.json()
    print(f"Agent Reply: {res_data['reply']}")
    print(f"Recommendations: {res_data['recommendations']}")
    print(f"End of Conversation: {res_data['end_of_conversation']}\n")
    
    # Trace Turn 2: Specific constraints added
    print("--- Turn 2: Sending refined role constraints ---")
    history.append({"role": "assistant", "content": res_data['reply']})
    history.append({"role": "user", "content": "I am hiring a mid-level Java developer who needs to manage stakeholders. Please include personality tests like OPQ."})
    
    response = requests.post(LOCAL_URL, json={"messages": history})
    res_data = response.json()
    print(f"Agent Reply: {res_data['reply']}")
    print(f"Recommendations: {res_data['recommendations']}")
    print(f"End of Conversation: {res_data['end_of_conversation']}\n")

if __name__ == "__main__":
    try:
        run_local_simulation()
    except Exception as e:
        print(f"❌ Error running simulation: {e}")