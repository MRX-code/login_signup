const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "js_backend_test"
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL");
});
// Middleware to handle JSON requests
const handleLoginRequest = (req, res) => {
  const { loginName, email, password } = req.body;

  // Validate input
  if (!email || !password || !loginName) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sql = "SELECT * FROM person WHERE name = ? AND email = ? AND password = ?";
  
  const handleQuery = (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
    if (results.length > 0) {
      return res.status(200).json({ message: "Login successful, welcome " + loginName + "!" });
    } else {
      return res.status(401).json({ message: "Invalid email, password, or login name" });
    }
  };

  db.query(sql, [loginName, email, password], handleQuery);
};


const handleSignupRequest = (req, res) => {
  let { name, age, location, email, phone, password } = req.body;
    name = name.trim();
    email = email.trim();
    password = password.trim();
    age = parseInt(age, 10); 
    location = location.trim();
    phone = phone.trim();
  if (!email || !password || !name || !age || !location || !name.trim() || !email.trim() || !password.trim() || !age.toString().trim() || !location.trim() || !phone.trim()) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (age < 18 || age > 100) {
    return res.status(400).json({ message: "Age must be between 18 and 100" });
  }
  if (!/^[a-zA-Z\s]+$/.test(name)) {
    return res.status(400).json({ message: "Name must contain only letters and spaces" });
  }
  if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }

  // Check if the email already exists
  const checkEmailSql = "SELECT * FROM person WHERE email = ?";
  db.query(checkEmailSql, [email], (err, emailResults) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
    if (emailResults.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Check if the phone already exists
    const checkPhoneSql = "SELECT * FROM person WHERE phone_number = ?";
    db.query(checkPhoneSql, [phone], (err, phoneResults) => {
      if (err) {
        console.error("Database query error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }
      if (phoneResults.length > 0) {
        return res.status(400).json({ message: "Phone number already exists" });
      }

      // Now insert user
      const sql = "INSERT INTO person (name, email, password, age, location, phone_number) VALUES (?, ?, ?, ?, ?, ?)";
      db.query(sql, [name, email, password, age, location, phone], (err, result) => {
        if (err) {
          console.error("Database insert error:", err);
          return res.status(500).json({ message: "Internal server error" });
        }
        return res.status(201).json({ message: "Signup successful, welcome " + name + "!" });
      });
    });
  });
};



app.post("/login", handleLoginRequest);
app.post("/signup", handleSignupRequest);
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});



