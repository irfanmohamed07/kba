import subprocess
import os
import sys

def start_agent(filename):
    print(f"Starting {filename}...")
    return subprocess.Popen([sys.executable, filename])

if __name__ == "__main__":
    agents_dir = os.path.dirname(__file__)
    
    # List of agent files to start
    agent_files = [
        'chatbot_agent.py',
        'complaint_agent.py',
        'mess_agent.py'
    ]
    
    processes = []
    
    try:
        for agent in agent_files:
            path = os.path.join(agents_dir, agent)
            if os.path.exists(path):
                processes.append(start_agent(path))
            else:
                print(f"Error: {agent} not found.")
        
        print("\nAll AI Agents are running. Press Ctrl+C to stop all.")
        
        # Keep the script running
        for p in processes:
            p.wait()
            
    except KeyboardInterrupt:
        print("\nStopping all agents...")
        for p in processes:
            p.terminate()
        print("Done.")
