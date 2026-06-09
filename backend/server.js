const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

const JWT_SECRET = 'dental_clinic_super_secret_key_2024';

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

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access Denied' });
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid Token' });
        req.user = user;
        next();
    });
};

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(401).json({ success: false });
        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ success: false });
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
        logActivity('AUTH', `User logged in: ${username}`);
        res.json({ success: true, user: user.username, role: user.role, token });
    });
});

app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
    const queries = {
        weeklyCustomers: 'SELECT COUNT(DISTINCT patient_id) as count FROM transactions',
        proceduresChart: 'SELECT p.name, COUNT(t.id) as value FROM transactions t JOIN procedures p ON t.procedure_id = p.id GROUP BY p.name, p.id',
        revenueChart: "SELECT DATE_FORMAT(transaction_date, '%a') as day, SUM(amount_paid) as total FROM transactions GROUP BY DATE(transaction_date), DATE_FORMAT(transaction_date, '%a') ORDER BY DATE(transaction_date) DESC LIMIT 7",
        usersChart: "SELECT DATE_FORMAT(transaction_date, '%a') as day, COUNT(DISTINCT patient_id) as users FROM transactions GROUP BY DATE(transaction_date), DATE_FORMAT(transaction_date, '%a') ORDER BY DATE(transaction_date) DESC LIMIT 7",
        currRev: "SELECT SUM(amount_paid) as total FROM transactions WHERE transaction_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)",
        prevRev: "SELECT SUM(amount_paid) as total FROM transactions WHERE transaction_date >= DATE_SUB(CURDATE(), INTERVAL 14 DAY) AND transaction_date < DATE_SUB(CURDATE(), INTERVAL 7 DAY)"
    };
    db.query(queries.weeklyCustomers, (err, custRes) => {
        if (err) return res.status(500).json({ error: err.message });
        db.query(queries.proceduresChart, (err, procRes) => {
            if (err) return res.status(500).json({ error: err.message });
            db.query(queries.revenueChart, (err, revRes) => {
                if (err) return res.status(500).json({ error: err.message });
                db.query(queries.usersChart, (err, userRes) => {
                    if (err) return res.status(500).json({ error: err.message });
                    db.query(queries.currRev, (err, currRes) => {
                        if (err) return res.status(500).json({ error: err.message });
                        db.query(queries.prevRev, (err, prevRes) => {
                            if (err) return res.status(500).json({ error: err.message });
                            let current = currRes[0]?.total || 0;
                            let previous = prevRes[0]?.total || 0;
                            let trend = 0;
                            if (previous > 0) trend = ((current - previous) / previous) * 100;
                            else if (current > 0) trend = 100;
                            res.json({
                                weeklyCustomers: custRes[0].count,
                                procedures: procRes,
                                revenue: revRes.reverse(),
                                users: userRes.reverse(),
                                growthTrend: trend.toFixed(1)
                            });
                        });
                    });
                });
            });
        });
    });
});

app.get('/api/logs', authenticateToken, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;
    const { query, type, dateFilter, customDate } = req.query;
    let countSql = 'SELECT COUNT(*) as total FROM activity_logs WHERE 1=1';
    let dataSql = 'SELECT id, action, timestamp FROM activity_logs WHERE 1=1';
    let params = [];

    if (query) {
        countSql += ' AND action LIKE ?';
        dataSql += ' AND action LIKE ?';
        params.push(`%${query}%`);
    }

    if (type && type !== 'All') {
        countSql += ' AND action LIKE ?';
        dataSql += ' AND action LIKE ?';
        params.push(`${type}|%`);
    }

    if (dateFilter) {
        if (dateFilter === 'Today') {
            countSql += ' AND DATE(timestamp) = CURDATE()';
            dataSql += ' AND DATE(timestamp) = CURDATE()';
        } else if (dateFilter === 'Week') {
            countSql += ' AND YEARWEEK(timestamp, 1) = YEARWEEK(CURDATE(), 1)';
            dataSql += ' AND YEARWEEK(timestamp, 1) = YEARWEEK(CURDATE(), 1)';
        } else if (dateFilter === 'Month') {
            countSql += ' AND MONTH(timestamp) = MONTH(CURDATE()) AND YEAR(timestamp) = YEAR(CURDATE())';
            dataSql += ' AND MONTH(timestamp) = MONTH(CURDATE()) AND YEAR(timestamp) = YEAR(CURDATE())';
        } else if (dateFilter === 'Custom' && customDate) {
            countSql += ' AND DATE(timestamp) = ?';
            dataSql += ' AND DATE(timestamp) = ?';
            params.push(customDate);
        }
    }

    dataSql += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';

    db.query(countSql, params, (err, countResult) => {
        if (err) return res.status(500).json({ error: err.message });
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);
        db.query(dataSql, [...params, limit, offset], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ data: results, pagination: { total, totalPages, currentPage: page, limit } });
        });
    });
});

app.post('/api/patients', authenticateToken, (req, res) => {
    const firstName = req.body.firstName || req.body.first_name;
    const middleName = req.body.middleName || req.body.middle_name || '';
    const lastName = req.body.lastName || req.body.last_name;
    const age = req.body.age;
    const gender = req.body.gender || null;
    const phone = req.body.contact_number || req.body.cellphone || req.body.contactNumber || '';
    const address = req.body.address;
    const photo = req.body.photo || null;

    db.query('SELECT id FROM patients WHERE first_name = ? AND last_name = ? AND (contact_number = ? OR age = ?)', [firstName, lastName, phone, age], (checkErr, checkResults) => {
        if (checkErr) return res.status(500).json({ error: checkErr.message });
        if (checkResults.length > 0) {
            return res.status(409).json({
                success: false,
                message: `Duplicated record blocked: Patient name ${firstName} ${lastName} is already registered.`
            });
        }
        const year = new Date().getFullYear().toString().slice(-2);
        db.query(`SELECT COUNT(*) as count FROM patients WHERE unique_id LIKE 'F${year}%'`, (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            const nextNumber = (result[0].count + 1).toString().padStart(3, '0');
            const uniqueId = `F${year}${nextNumber}`;
            const sql = `INSERT INTO patients (unique_id, first_name, middle_name, last_name, age, gender, contact_number, address, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            db.query(sql, [uniqueId, firstName, middleName, lastName, age, gender, phone, address, photo], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                logActivity('REGISTRATION', `Registered profile ID: ${uniqueId}`);
                res.json({ success: true, uniqueId });
            });
        });
    });
});

app.put('/api/patients/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { first_name, middle_name, last_name, gender, contact_number, address, photo } = req.body;
    
    db.query('SELECT unique_id FROM patients WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        const uniqueId = results[0]?.unique_id || id;
        
        let sql;
        let params;
        
        if (photo) {
            sql = `UPDATE patients SET first_name = ?, middle_name = ?, last_name = ?, gender = ?, contact_number = ?, address = ?, photo = ? WHERE id = ?`;
            params = [first_name, middle_name, last_name, gender, contact_number, address, photo, id];
        } else {
            sql = `UPDATE patients SET first_name = ?, middle_name = ?, last_name = ?, gender = ?, contact_number = ?, address = ? WHERE id = ?`;
            params = [first_name, middle_name, last_name, gender, contact_number, address, id];
        }

        db.query(sql, params, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            logActivity('UPDATE', `Updated profile ID: ${uniqueId}`);
            res.json({ success: true });
        });
    });
});

app.get('/api/patients', authenticateToken, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { query } = req.query;
    let countSql = 'SELECT COUNT(*) as total FROM patients';
    let dataSql = 'SELECT id, unique_id, first_name, middle_name, last_name, contact_number, gender FROM patients';
    let params = [];
    if (query) {
        const condition = ' WHERE unique_id LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR contact_number LIKE ?';
        countSql += condition;
        dataSql += condition;
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
            res.json({ data: results, pagination: { total, totalPages, currentPage: page, limit } });
        });
    });
});

app.get('/api/patients/search', authenticateToken, (req, res) => {
    const { q } = req.query;
    const searchQuery = `%${q}%`;
    db.query('SELECT id, unique_id, first_name, last_name FROM patients WHERE unique_id LIKE ? OR first_name LIKE ? OR last_name LIKE ? LIMIT 10', [searchQuery, searchQuery, searchQuery], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/patients/:id', authenticateToken, (req, res) => {
    db.query('SELECT * FROM patients WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0] || {});
    });
});

app.get('/api/patients/:id/history', authenticateToken, (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT 
            t.id, 
            t.amount_paid, 
            t.transaction_date, 
            p.name as procedure_name,
            d.name as dentist_name
        FROM transactions t 
        JOIN procedures p ON t.procedure_id = p.id 
        LEFT JOIN dentists d ON t.dentist_id = d.id
        WHERE t.patient_id = ? 
        ORDER BY t.transaction_date DESC
    `;
    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/patients/:id/chart', authenticateToken, (req, res) => {
    const { id } = req.params;
    const sql = `SELECT * FROM dental_charts WHERE patient_id = ? ORDER BY created_at DESC`;
    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/patients/:id/chart', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { tooth_number, condition_name, notes } = req.body;
    const sql = `INSERT INTO dental_charts (patient_id, tooth_number, condition_name, notes) VALUES (?, ?, ?, ?)`;
    db.query(sql, [id, tooth_number, condition_name, notes], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        logActivity('CLINICAL', `Updated chart for patient ID: ${id}`);
        res.json({ success: true, chartId: result.insertId });
    });
});

app.get('/api/procedures', authenticateToken, (req, res) => {
    db.query('SELECT id, name, cost FROM procedures', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/dentists', authenticateToken, (req, res) => {
    db.query('SELECT id, name, commission_rate FROM dentists', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/reports/dentist-earnings', authenticateToken, (req, res) => {
    const { dateFilter, customDate } = req.query;
    let sql = `
        SELECT 
            d.id,
            d.name,
            d.commission_rate,
            COUNT(t.id) as total_treatments,
            IFNULL(SUM(t.amount_paid), 0) as total_revenue,
            IFNULL(SUM(t.amount_paid * (d.commission_rate / 100)), 0) as total_commission
        FROM dentists d
        LEFT JOIN transactions t ON d.id = t.dentist_id
    `;
    let params = [];
    if (dateFilter === 'Today') {
        sql += ' AND DATE(t.transaction_date) = CURDATE()';
    } else if (dateFilter === 'Week') {
        sql += ' AND YEARWEEK(t.transaction_date, 1) = YEARWEEK(CURDATE(), 1)';
    } else if (dateFilter === 'Month') {
        sql += ' AND MONTH(t.transaction_date) = MONTH(CURDATE()) AND YEAR(t.transaction_date) = YEAR(CURDATE())';
    } else if (dateFilter === 'Custom' && customDate) {
        sql += ' AND DATE(t.transaction_date) = ?';
        params.push(customDate);
    }
    sql += ' GROUP BY d.id, d.name, d.commission_rate';
    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/transactions', authenticateToken, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { query } = req.query;
    let countSql = `SELECT COUNT(*) as total FROM transactions t JOIN patients p ON t.patient_id = p.id JOIN procedures pr ON t.procedure_id = pr.id`;
    let dataSql = `SELECT t.id, t.amount_paid, t.transaction_date, p.unique_id, p.first_name, p.last_name, pr.name as procedure_name FROM transactions t JOIN patients p ON t.patient_id = p.id JOIN procedures pr ON t.procedure_id = pr.id`;
    let params = [];
    if (query) {
        const condition = ' WHERE p.first_name LIKE ? OR p.last_name LIKE ? OR pr.name LIKE ? OR t.id LIKE ?';
        countSql += condition;
        dataSql += condition;
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
            res.json({ data: results, pagination: { total, totalPages, currentPage: page, limit } });
        });
    });
});

app.post('/api/transactions', authenticateToken, (req, res) => {
    const { patient_id, procedure_id, dentist_id, amount_paid } = req.body;
    const logQuery = `SELECT p.unique_id, p.first_name, p.last_name, pr.name as procedure_name FROM patients p, procedures pr WHERE p.id = ? AND pr.id = ?`;
    db.query(logQuery, [patient_id, procedure_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        const detail = results[0];
        db.query('INSERT INTO transactions (patient_id, procedure_id, dentist_id, amount_paid, transaction_date) VALUES (?, ?, ?, ?, NOW())', [patient_id, procedure_id, dentist_id, amount_paid], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (detail) logActivity('PAYMENT', `Settled PHP ${amount_paid} by ${detail.unique_id} for ${detail.procedure_name}`);
            res.json({ success: true, transactionId: result.insertId });
        });
    });
});

app.get('/api/transactions/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const query = `SELECT t.id, t.amount_paid, t.transaction_date, p.unique_id, p.first_name, p.last_name, p.address, p.contact_number, pr.name as procedure_name FROM transactions t JOIN patients p ON t.patient_id = p.id JOIN procedures pr ON t.procedure_id = pr.id WHERE t.id = ?`;
    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Not found' });
        res.json(results[0]);
    });
});

app.get('/api/reports/shift', authenticateToken, (req, res) => {
    const sql = `SELECT SUM(amount_paid) as total_cash FROM transactions WHERE DATE(transaction_date) = CURDATE()`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ total_cash: results[0].total_cash || 0 });
    });
});

app.get('/api/appointments', authenticateToken, (req, res) => {
    const sql = `SELECT a.*, p.first_name, p.last_name, p.contact_number as patient_phone, d.name as dentist_name FROM appointments a JOIN patients p ON a.patient_id = p.id LEFT JOIN dentists d ON a.dentist_id = d.id WHERE a.appointment_date >= CURDATE() ORDER BY a.appointment_date ASC, a.appointment_time ASC`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/queue/today', authenticateToken, (req, res) => {
    const sql = `
        SELECT a.id, a.appointment_time, p.first_name, p.last_name, d.name as dentist_name, a.reason
        FROM appointments a 
        JOIN patients p ON a.patient_id = p.id 
        LEFT JOIN dentists d ON a.dentist_id = d.id 
        WHERE a.appointment_date = CURDATE() AND a.status = 'Scheduled' 
        ORDER BY a.appointment_time ASC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/appointments', authenticateToken, (req, res) => {
    const { patient_id, dentist_id, appointment_date, appointment_time, reason } = req.body;
    db.query('SELECT unique_id, first_name, last_name FROM patients WHERE id = ?', [patient_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        const patient = results[0];
        const patientStr = patient ? patient.unique_id : patient_id;
        const sql = `INSERT INTO appointments (patient_id, dentist_id, appointment_date, appointment_time, reason) VALUES (?, ?, ?, ?, ?)`;
        db.query(sql, [patient_id, dentist_id, appointment_date, appointment_time, reason], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            logActivity('APPOINTMENT', `Scheduled appointment for ${patientStr}`);
            res.json({ success: true, appointmentId: result.insertId });
        });
    });
});

app.put('/api/appointments/:id/status', authenticateToken, (req, res) => {
    const { status } = req.body;
    db.query('UPDATE appointments SET status = ? WHERE id = ?', [status, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.post('/api/kiosk/ticket', (req, res) => {
    const { purpose } = req.body;
    
    db.query("SELECT id FROM patients WHERE first_name = 'Walk-In' AND last_name = 'Patient' LIMIT 1", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const insertAppointment = (patientId) => {
            const sql = `INSERT INTO appointments (patient_id, dentist_id, appointment_date, appointment_time, reason, status) 
                         VALUES (?, NULL, CURDATE(), CURTIME(), ?, 'Scheduled')`;
                         
            db.query(sql, [patientId, purpose], (err, result) => {
                if (err) return res.status(500).json({ error: err.message });
                db.query('INSERT INTO activity_logs (action) VALUES (?)', [`KIOSK|Generated Walk-In Ticket for ${purpose}`]);
                
                res.json({ success: true, ticketId: result.insertId });
            });
        };

        if (results.length > 0) {
            insertAppointment(results[0].id);
        } else {
            const year = new Date().getFullYear().toString().slice(-2);
            db.query(`SELECT COUNT(*) as count FROM patients WHERE unique_id LIKE 'W${year}%'`, (err, countResult) => {
                const nextNumber = (countResult[0].count + 1).toString().padStart(3, '0');
                const uniqueId = `W${year}${nextNumber}`;
                
                db.query("INSERT INTO patients (unique_id, first_name, last_name) VALUES (?, 'Walk-In', 'Patient')", [uniqueId], (err, insertRes) => {
                    if (err) return res.status(500).json({ error: err.message });
                    insertAppointment(insertRes.insertId);
                });
            });
        }
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on network port ${PORT}`);
});