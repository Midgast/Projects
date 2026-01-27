<?php
require_once 'config.php';

// Health check endpoint
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $_SERVER['REQUEST_URI'] === '/') {
    response_json([
        'status' => 'OK',
        'message' => 'AL TAMIMI College System API is running',
        'timestamp' => date('Y-m-d H:i:s'),
        'version' => '1.0.0'
    ]);
}

// Route to appropriate handler
$request_uri = $_SERVER['REQUEST_URI'];
$request_method = $_SERVER['REQUEST_METHOD'];

// Remove query string
$request_uri = strtok($request_uri, '?');

// API routes
switch ($request_uri) {
    case '/api/auth/login':
        require_once 'api/auth/login.php';
        break;
    
    case '/api/auth/register':
        require_once 'api/auth/register.php';
        break;
    
    case '/api/users':
        if ($request_method === 'GET') {
            require_once 'api/users/list.php';
        }
        break;
    
    case '/api/users/profile':
        if ($request_method === 'GET') {
            require_once 'api/users/profile.php';
        }
        break;
    
    case '/api/schedule':
        if ($request_method === 'GET') {
            require_once 'api/schedule/list.php';
        }
        break;
    
    case '/api/attendance':
        if ($request_method === 'GET') {
            require_once 'api/attendance/list.php';
        } elseif ($request_method === 'POST') {
            require_once 'api/attendance/mark.php';
        }
        break;
    
    case '/api/analytics/dashboard':
        if ($request_method === 'GET') {
            require_once 'api/analytics/dashboard.php';
        }
        break;
    
    case '/api/analytics/performance':
        if ($request_method === 'GET') {
            require_once 'api/analytics/performance.php';
        }
        break;
    
    case '/api/news':
        if ($request_method === 'GET') {
            require_once 'api/news/list.php';
        } elseif ($request_method === 'POST') {
            require_once 'api/news/create.php';
        }
        break;
    
    case '/api/badges':
        if ($request_method === 'GET') {
            require_once 'api/badges/list.php';
        }
        break;
    
    default:
        response_json(['error' => 'Route not found'], 404);
}
?>
