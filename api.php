<?php
header('Content-Type: application/json');
$file = 'members.json';

if (!file_exists($file)) {
    file_put_contents($file, json_encode([]));
}

$action = $_GET['action'] ?? '';

// Helper to get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if ($action == 'saveMember') {
    if ($input) {
        $members = json_decode(file_get_contents($file), true) ?: [];
        $members[] = $input;
        file_put_contents($file, json_encode($members));
        echo json_encode(['status' => 'success']);
    }
} 
else if ($action == 'getMembers') {
    echo file_get_contents($file) ?: '[]';
} 
else if ($action == 'updateAll') {
    if ($input) {
        file_put_contents($file, json_encode($input));
        echo json_encode(['status' => 'success']);
    }
}
?>