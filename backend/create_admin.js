const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root', // Change if your DB password is different
    database: 'dental_clinic'
});

async function setupSecureAdmin() {
    try {
        console.log("1. Deleting old plain-text accounts...");
        await db.promise().query('DELETE FROM users');

        console.log("2. Generating secure hash for 'admin123'...");
        const hashedPassword = await bcrypt.hash('admin123', 10);

        console.log("3. Inserting secure admin into database...");
        await db.promise().query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', hashedPassword, 'admin']);

        console.log("✅ SUCCESS! Secure admin created. You can now log in!");
        process.exit(0);
    } catch (error) {
        console.error("❌ ERROR:", error.message);
        process.exit(1);
    }
}

setupSecureAdmin();