const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 photo uploads

// Database Connection
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'dental_clinic'
});

// Helper for Activity Logging
const logActivity = (action) => {
    db.query('INSERT INTO activity_logs (action) VALUES (?)', [action]);
};

// --- ROUTES ---

// Login Endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) {
            logActivity(`User ${username} logged in`);
            res.json({ success: true, user: results[0].username });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    });
});

// Dashboard Polling Endpoint
app.get('/api/dashboard/stats', (req, res) => {
    const queries = {
        weeklyCustomers: 'SELECT COUNT(DISTINCT patient_id) as count FROM transactions WHERE transaction_date >= DATE_SUB(NOW(), INTERVAL 1 WEEK)',
        proceduresChart: 'SELECT p.name, COUNT(t.id) as value FROM transactions t JOIN procedures p ON t.procedure_id = p.id GROUP BY p.name',
        revenueChart: "SELECT DATE_FORMAT(transaction_date, '%a') as day, SUM(amount_paid) as total FROM transactions WHERE transaction_date >= DATE_SUB(NOW(), INTERVAL 7 DAY) GROUP BY day ORDER BY transaction_date ASC"
    };

    db.query(queries.weeklyCustomers, (err, custRes) => {
        if (err) return res.status(500).json({ error: err.message });
        db.query(queries.proceduresChart, (err, procRes) => {
            if (err) return res.status(500).json({ error: err.message });
            db.query(queries.revenueChart, (err, revRes) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({
                    weeklyCustomers: custRes[0].count,
                    procedures: procRes,
                    revenue: revRes.length > 0 ? revRes : [{ day: 'Mon', total: 0 }, { day: 'Tue', total: 0 }]
                });
            });
        });
    });
});

// System Logs
app.get('/api/logs', (req, res) => {
    db.query('SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 50', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// --- NEW: Register Patient Endpoint ---
app.post('/api/patients', (req, res) => {
    const { firstName, middleName, lastName, age, cellphone, address, photo } = req.body;
    
    // Generate ID: F[Year][Count] -> e.g., F26001
    const year = new Date().getFullYear().toString().slice(-2); // gets "26" from 2026
    
    db.query(`SELECT COUNT(*) as count FROM patients WHERE unique_id LIKE 'F${year}%'`, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Pad the number with zeros (e.g., 1 becomes '001')
        const nextNumber = (result[0].count + 1).toString().padStart(3, '0');
        const uniqueId = `F${year}${nextNumber}`;

        const sql = `INSERT INTO patients (unique_id, first_name, middle_name, last_name, age, contact_number, address, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        
        db.query(sql, [uniqueId, firstName, middleName, lastName, age, cellphone, address, photo], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            
            logActivity(`Registered new patient: ${firstName} ${lastName} (${uniqueId})`);
            res.json({ success: true, uniqueId });
        });
    });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));