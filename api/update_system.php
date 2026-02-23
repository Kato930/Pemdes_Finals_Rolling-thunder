<?php
header("Access-Control-Allow-Origin: *");
include 'db.php';

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$data = $_POST ? $_POST : $_GET;

if (isset($data['type'])) {
    $type = $data['type'];

    if ($type == 'AI') {
        $detected = $data['person_detected'];
        $conf = $data['confidence'];
        $trigger = isset($data['trigger_log']) ? $data['trigger_log'] : 'false';

        $conn->query("UPDATE system_state SET person_detected=$detected, confidence=$conf WHERE id=1");
        
        if ($detected == 'true' && $trigger == 'true') {
            $conn->query("INSERT INTO security_events (type, details, result) VALUES ('AI Detection', 'Human Presence Check', 'Person Found')");
        }
    }

    if ($type == 'RFID') {
        $uid = $data['uid'];
        
        if ($uid == "AUTO_LOCK") {
            $conn->query("UPDATE system_state SET status='LOCKED' WHERE id=1");
            echo "LOCKED";
        } 
        else if ($uid == "1 2 3 4") {
            $conn->query("UPDATE system_state SET status='UNLOCKED', failed_attempts=0 WHERE id=1");
            $conn->query("INSERT INTO security_events (type, details, result) VALUES ('RFID', 'UID: $uid', 'DOOR IS UNLOCKED')");
            echo "ALLOWED";
        } 
        else {
            $conn->query("UPDATE system_state SET failed_attempts = failed_attempts + 1 WHERE id=1");
            $res = $conn->query("SELECT failed_attempts FROM system_state WHERE id=1")->fetch_assoc();
            
            if ($res['failed_attempts'] >= 3) {
                $conn->query("UPDATE system_state SET status='LOCKED' WHERE id=1");
                $conn->query("INSERT INTO security_events (type, details, result) VALUES ('RFID', 'UID: $uid', 'INTRUDER ALERT')");
            } else {
                $conn->query("INSERT INTO security_events (type, details, result) VALUES ('RFID', 'UID: $uid', 'INCORRECT ATTEMPT')");
            }
            echo "DENIED";
        }
    }
}
?>
