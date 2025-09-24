const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'your_mysql_username',
    password: 'your_mysql_password',
    database: 'user_registration'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
    console.log('Connected to MySQL database.');
});

// Registration endpoint
app.post('/register', async (req, res) => {
    const { firstName, lastName, email, password, dateOfBirth, referralCode } = req.body;

    if (!firstName || !lastName || !email || !password || !dateOfBirth) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into DB
        const query = `INSERT INTO users (first_name, last_name, email, password, date_of_birth, referral_code) VALUES (?, ?, ?, ?, ?, ?)`;
        db.query(query, [firstName, lastName, email, hashedPassword, dateOfBirth, referralCode || null], (err, results) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ message: 'Email already registered.' });
                }
                return res.status(500).json({ message: 'Database error.', error: err });
            }
            res.status(201).json({ message: 'User  registered successfully.' });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});