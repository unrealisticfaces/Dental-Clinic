const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'dental_clinic'
});

const logActivity = (event, description) => {
    const combinedLog = `${event}|${description}`;
    db.query('INSERT INTO activity_logs (action) VALUES (?)', [combinedLog]);
};

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) {
            logActivity('AUTH', `User session initiated for system administrator: ${username}`);
            res.json({ success: true, user: results[0].username });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    });
});

app.get('/api/dashboard/stats', (req, res) => {
    const queries = {
        weeklyCustomers: 'SELECT COUNT(DISTINCT patient_id) as count FROM transactions WHERE transaction_date >= DATE_SUB(NOW(), INTERVAL 1 WEEK)',
        proceduresChart: 'SELECT p.name, COUNT(t.id) as value FROM transactions t JOIN procedures p ON t.procedure_id = p.id GROUP BY p.name',
        revenueChart: "SELECT DATE_FORMAT(transaction_date, '%a') as day, SUM(amount_paid) as total FROM transactions WHERE transaction_date >= DATE_SUB(NOW(), INTERVAL 7 DAY) GROUP BY day ORDER BY transaction_date ASC",
        usersChart: "SELECT DATE_FORMAT(transaction_date, '%a') as day, COUNT(DISTINCT patient_id) as users FROM transactions WHERE transaction_date >= DATE_SUB(NOW(), INTERVAL 7 DAY) GROUP BY day ORDER BY transaction_date ASC"
    };

    db.query(queries.weeklyCustomers, (err, custRes) => {
        if (err) return res.status(500).json({ error: err.message });
        db.query(queries.proceduresChart, (err, procRes) => {
            if (err) return res.status(500).json({ error: err.message });
            db.query(queries.revenueChart, (err, revRes) => {
                if (err) return res.status(500).json({ error: err.message });
                db.query(queries.usersChart, (err, userRes) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({
                        weeklyCustomers: custRes[0].count,
                        procedures: procRes,
                        revenue: revRes,
                        users: userRes
                    });
                });
            });
        });
    });
});

app.get('/api/logs', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;
    const { query } = req.query;

    let countSql = 'SELECT COUNT(*) as total FROM activity_logs';
    let dataSql = 'SELECT id, action, timestamp FROM activity_logs';
    let params = [];

    if (query) {
        const searchCondition = ' WHERE action LIKE ?';
        countSql += searchCondition;
        dataSql += searchCondition;
        const searchParam = `%${query}%`;
        params = [searchParam];
    }

    dataSql += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    
    db.query(countSql, params, (err, countResult) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        db.query(dataSql, [...params, limit, offset], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({
                data: results,
                pagination: { total, totalPages, currentPage: page, limit }
            });
        });
    });
});

app.post('/api/patients', (req, res) => {
    const { firstName, middleName, lastName, age, cellphone, address, photo } = req.body;
    const year = new Date().getFullYear().toString().slice(-2);
    
    db.query(`SELECT COUNT(*) as count FROM patients WHERE unique_id LIKE 'F${year}%'`, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const nextNumber = (result[0].count + 1).toString().padStart(3, '0');
        const uniqueId = `F${year}${nextNumber}`;

        const sql = `INSERT INTO patients (unique_id, first_name, middle_name, last_name, age, contact_number, address, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        
        db.query(sql, [uniqueId, firstName, middleName, lastName, age, cellphone, address, photo], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            
            logActivity('REGISTRATION', `Successfully registered new profile for ${firstName} ${lastName} under ID: ${uniqueId}`);
            res.json({ success: true, uniqueId });
        });
    });
});

app.get('/api/patients', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { query } = req.query;

    let countSql = 'SELECT COUNT(*) as total FROM patients';
    // Added middle_name to the select query
    let dataSql = 'SELECT id, unique_id, first_name, middle_name, last_name, contact_number FROM patients';
    let params = [];

    if (query) {
        const searchCondition = ' WHERE unique_id LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR contact_number LIKE ?';
        countSql += searchCondition;
        dataSql += searchCondition;
        const searchParam = `%${query}%`;
        params = [searchParam, searchParam, searchParam, searchParam];
    }

    dataSql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    
    db.query(countSql, params, (err, countResult) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        db.query(dataSql, [...params, limit, offset], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({
                data: results,
                pagination: { total, totalPages, currentPage: page, limit }
            });
        });
    });
});

app.get('/api/patients/search', (req, res) => {
    const { q } = req.query;
    const searchQuery = `%${q}%`;
    db.query(
        'SELECT id, unique_id, first_name, last_name FROM patients WHERE unique_id LIKE ? OR first_name LIKE ? OR last_name LIKE ? LIMIT 10',
        [searchQuery, searchQuery, searchQuery],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        }
    );
});

app.get('/api/patients/:id', (req, res) => {
    db.query('SELECT * FROM patients WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0] || {});
    });
});

app.get('/api/patients/:id/history', (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT t.id, t.amount_paid, t.transaction_date, p.name as procedure_name 
        FROM transactions t 
        JOIN procedures p ON t.procedure_id = p.id 
        WHERE t.patient_id = ? 
        ORDER BY t.transaction_date DESC
    `;
    
    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/procedures', (req, res) => {
    db.query('SELECT id, name FROM procedures', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/transactions', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { query } = req.query;

    let countSql = `
        SELECT COUNT(*) as total 
        FROM transactions t
        JOIN patients p ON t.patient_id = p.id
        JOIN procedures pr ON t.procedure_id = pr.id
    `;
    
    let dataSql = `
        SELECT t.id, t.amount_paid, t.transaction_date, p.unique_id, p.first_name, p.last_name, pr.name as procedure_name
        FROM transactions t
        JOIN patients p ON t.patient_id = p.id
        JOIN procedures pr ON t.procedure_id = pr.id
    `;
    
    let params = [];

    if (query) {
        const searchCondition = ' WHERE p.first_name LIKE ? OR p.last_name LIKE ? OR pr.name LIKE ? OR t.id LIKE ?';
        countSql += searchCondition;
        dataSql += searchCondition;
        const searchParam = `%${query}%`;
        params = [searchParam, searchParam, searchParam, searchParam];
    }

    dataSql += ' ORDER BY t.transaction_date DESC LIMIT ? OFFSET ?';
    
    db.query(countSql, params, (err, countResult) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        db.query(dataSql, [...params, limit, offset], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({
                data: results,
                pagination: { total, totalPages, currentPage: page, limit }
            });
        });
    });
});

app.post('/api/transactions', (req, res) => {
    const { patient_id, procedure_id, amount_paid } = req.body;
    
    const logQuery = `
        SELECT p.unique_id, p.first_name, p.last_name, pr.name as procedure_name 
        FROM patients p, procedures pr 
        WHERE p.id = ? AND pr.id = ?
    `;
    
    db.query(logQuery, [patient_id, procedure_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        const detail = results[0];
        
        db.query(
            'INSERT INTO transactions (patient_id, procedure_id, amount_paid, transaction_date) VALUES (?, ?, ?, NOW())',
            [patient_id, procedure_id, amount_paid],
            (err, result) => {
                if (err) return res.status(500).json({ error: err.message });
                
                if (detail) {
                    logActivity('PAYMENT', `Settled PHP ${amount_paid} for ${detail.procedure_name} (Patient: ${detail.first_name} ${detail.last_name} | ID: ${detail.unique_id})`);
                } else {
                    logActivity('PAYMENT', `Processed payment for local patient ID: ${patient_id}`);
                }
                
                res.json({ success: true, transactionId: result.insertId });
            }
        );
    });
});

app.get('/api/transactions/:id', (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT t.id, t.amount_paid, t.transaction_date, p.unique_id, p.first_name, p.last_name, pr.name as procedure_name
        FROM transactions t
        JOIN patients p ON t.patient_id = p.id
        JOIN procedures pr ON t.procedure_id = pr.id
        WHERE t.id = ?
    `;
    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Transaction not found' });
        res.json(results[0]);
    });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));