<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
include 'db.php';

$query = "SELECT status, person_detected, confidence, failed_attempts FROM system_state WHERE id=1";
$result = $conn->query($query);

if ($row = $result->fetch_assoc()) {
    $row['person_detected'] = (bool)$row['person_detected'];
    echo json_encode($row);
}
?>
