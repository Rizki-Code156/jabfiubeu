<?php
session_start();
require_once __DIR__ . '/env.php';

$frontendUrl = getenv('FRONTEND_URL') ?: 'http://localhost/ABIG-Anak-Buah-Ibu-Ghina-/frontend';

if (!isset($_SESSION['role'])) {
    header('Location: ' . $frontendUrl . '/index.html');
    exit;
}

session_unset();
session_destroy();

header('Location: ' . $frontendUrl . '/index.html');
exit;
