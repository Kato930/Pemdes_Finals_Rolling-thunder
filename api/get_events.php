<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
include 'db.php';

$query = "SELECT timestamp, type, details, result FROM security_events ORDER BY timestamp DESC LIMIT 10";
$result = $conn->query($query);

$events = [];
while($row = $result->fetch_assoc()) {
    $events[] = $row;
}
echo json_encode($events);
?>
