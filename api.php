<?php
header('Content-Type: application/json');
$file = 'members.json';

// Ensure the file exists
if (!file_exists($file)) {
    file_put_contents($file, json_encode([]));
}

$action = $_GET['action'] ?? '';

if ($action == 'saveMember') {
    $data = json_decode(file_get_contents('php://input'), true);
    $members = json_decode(file_get_contents($file), true) ?: [];
    $members[] = $data;
    if(file_put_contents($file, json_encode($members))){
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error']);
    }
} 
else if ($action == 'getMembers') {
    echo file_get_contents($file) ?: '[]';
} 
else if ($action == 'updateAll') {
    $data = file_get_contents('php://input');
    if(file_put_contents($file, $data)){
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error']);
    }
}
else {
    echo json_encode(['error' => 'Invalid Action']);
}
?>