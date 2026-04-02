<?php
header('Content-Type: application/json');
$file = 'members.json';
$action = $_GET['action'] ?? '';

if ($action == 'saveMember') {
    $data = json_decode(file_get_contents('php://input'), true);
    $members = json_decode(file_get_contents($file) ?: '[]', true);
    $members[] = $data;
    file_put_contents($file, json_encode($members));
    echo json_encode(['status' => 'success']);
} else if ($action == 'getMembers') {
    echo file_get_contents($file) ?: '[]';
} else {
    echo json_encode(['error' => 'Invalid Action']);
}
?>
