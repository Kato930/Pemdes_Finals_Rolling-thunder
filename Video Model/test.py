import cv2
from ultralytics import YOLO
from flask import Flask, Response
from flask_cors import CORS
import requests
import time

app = Flask(__name__)
CORS(app)
model = YOLO("best.pt")
cap = cv2.VideoCapture(0)

last_notification_time = 0
cooldown_period = 5 

def gen_frames():
    global last_notification_time
    while True:
        success, frame = cap.read()
        if not success:
            break
        
        results = model(frame, stream=True)
        detected = "false"
        max_conf = 0

        for r in results:
            for box in r.boxes:
                conf = float(box.conf[0])
                if conf > 0.5:
                    detected = "true"
                    max_conf = conf
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

        current_time = time.time()
        
        should_log = False
        if detected == "true" and (current_time - last_notification_time) > cooldown_period:
            should_log = True
            last_notification_time = current_time

        try:
            requests.post("http://localhost/api/update_system.php", data={
                'type': 'AI',
                'person_detected': detected,
                'confidence': max_conf,
                'trigger_log': 'true' if should_log else 'false'
            }, timeout=0.1)
        except:
            pass

        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, threaded=True)
