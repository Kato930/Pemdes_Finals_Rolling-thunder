import requests
import time

BASE_URL = "http://localhost/api/update_system.php"

def send_request(params):
    try:
        response = requests.post(BASE_URL, data=params)
        return response.text
    except Exception as e:
        print(f"Connection Error: {e}")
        return None

if __name__ == "__main__":
    print("--- ROLLING THUNDER MOCK HARDWARE ---")
    
    while True:
        print("\n[1] Valid Card (Unlock & Auto-Lock)")
        print("[2] Invalid Card (Single Fail)")
        print("[3] Intruder (3 Fails -> Stay Locked)")
        choice = input("Select Action: ")

        if choice == '1':
            print("Status: UNLOCKING...")
            send_request({'type': 'RFID', 'uid': '1 2 3 4'})
            
            time.sleep(3) 
            
            print("Status: TIMER EXPIRED. LOCKING...")
            send_request({'type': 'RFID', 'uid': 'AUTO_LOCK'})
            
        elif choice == '2':
            send_request({'type': 'RFID', 'uid': '9 9 9 9'})
            print("Status: ACCESS DENIED")
            
        elif choice == '3':
            print("Sending 3 failed attempts...")
            for i in range(3):
                send_request({'type': 'RFID', 'uid': 'X X X X'})
                print(f"Attempt {i+1} Failed")
                time.sleep(0.5)
            print("System is now LOCKED due to Intruder Alert.")
            
                