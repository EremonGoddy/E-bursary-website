// Load environment variables
require('dotenv').config();
const pool = require("./db-config");
const express = require("express");
const app = express();
const cors = require("cors");
const fs = require('fs');
const path = require('path');
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const multer = require("multer");



// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ✅ JWT Secret from .env or fallback
const secret = process.env.JWT_SECRET || "your_jwt_secret";

// ✅ Authenticate JWT Token Middleware
const authenticateToken = (req, res, next) => {
const authHeader = req.headers["authorization"];
const token = authHeader && authHeader.split(" ")[1];
if (!token) return res.status(401).json({ message: "Token required" });

jwt.verify(token, secret, (err, user) => {
if (err) return res.status(403).json({ message: "Invalid token" });
req.user = user;
next();
});
};

// ✅ Example route to test DB and server
app.get("/", (req, res) => {
res.send("🚀 Backend is running and connected to PostgreSQL.");
});

// ✅ Verify current password API
app.get("/api/verify-password", authenticateToken, async (req, res) => {
const { userId } = req.user;
const { password } = req.query;

try {
const result = await pool.query("SELECT password FROM users WHERE id = $1", [userId]);

if (result.rows.length === 0) {
return res.status(404).json({ message: "User not found" });
}

const hashedPassword = result.rows[0].password;
const isMatch = await bcrypt.compare(password, hashedPassword);

if (!isMatch) {
return res.status(401).json({ message: "Invalid password" });
}

res.status(200).json({ message: "Password verified" });
} catch (error) {
console.error("Error verifying password:", error);
res.status(500).json({ message: "Server error" });
}
});

// ... rest of your code above

// ✅ Signin route (FIXED catch block and debug logs)
app.post("/api/signin", async (req, res) => {
try {
const { email, password } = req.body;
const userQuery = "SELECT * FROM users WHERE email = $1";
const userResult = await pool.query(userQuery, [email]);

if (userResult.rows.length === 0) {
return res.status(404).json({ message: "User not found" });
}

const user = userResult.rows[0];
console.log('User from DB:', user);
console.log('Password from request:', password);
console.log('Password hash from DB:', user.password);

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const studentResult = await pool.query("SELECT * FROM personal_details WHERE email = $1", [email]);
    const committeeResult = await pool.query("SELECT * FROM profile_committee WHERE email = $1", [email]);

    const token = jwt.sign({ userId: user.id, email: user.email }, secret, { expiresIn: "1h" });

    const response = {
      message: "Login successful",
      token,
      role: user.role,
      name: user.name,
    };

    if (studentResult.rows.length > 0) {
      response.student = studentResult.rows[0];
    }

    if (committeeResult.rows.length > 0) {
      const committee = committeeResult.rows[0];
      response.committee = {
        fullname: committee.fullname,
        email: committee.email,
        phone_no: committee.phone_no,
        national_id: committee.national_id,
        subcounty: committee.subcounty,
        ward: committee.ward,
        position: committee.position,
      };
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Error in /api/signin:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Register a new user (PostgreSQL)
app.post("/api/post", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user
    const result = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, hashedPassword, role]
    );

    // Respond with the created user data
    res.status(201).json({ message: "User registered successfully", user: result.rows[0] });
  } catch (error) {
    console.error("Error inserting user:", error);
    res.status(500).json({ message: "Server error while registering user" });
  }
});

// ✅ Change password API
app.post("/api/change-password", authenticateToken, async (req, res) => {
  const { userId } = req.user;
  const { currentPassword, newPassword } = req.body;

  try {
    const result = await pool.query("SELECT password FROM users WHERE id = $1", [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = result.rows[0].password;
    const isMatch = await bcrypt.compare(currentPassword, hashedPassword);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid current password" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedNewPassword, userId]);

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET personal details by user_id
app.get('/api/personal-details/user/:userId', async (req, res) => {
  const userId = req.params.userId;
  const sql = `SELECT * FROM personal_details WHERE user_id = $1 LIMIT 1`;
  try {
    const result = await pool.query(sql, [userId]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// ✅ Insert into personal_details with duplicate name OR email check
app.post('/api/personal-details', async (req, res) => {
  const { fullname, email, subcounty, ward, village, birth, gender, institution, year, admission } = req.body;

  // Duplicate check (case-insensitive for both name and email)
  const checkSql = `
    SELECT 1 FROM personal_details 
    WHERE LOWER(fullname) = LOWER($1) OR LOWER(email) = LOWER($2)
  `;
  try {
    const checkResult = await pool.query(checkSql, [fullname, email]);
    if (checkResult.rows.length > 0) {
      return res.status(409).json({ message: 'This full name or email is already registered.' });
    }

    const sql = `
      INSERT INTO personal_details 
      (fullname, email, subcounty, ward, village, birth, gender, institution, year, admission, status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')
      RETURNING user_id
    `;
    const result = await pool.query(sql, [fullname, email, subcounty, ward, village, birth, gender, institution, year, admission]);
    res.json({ message: 'Data inserted successfully', userId: result.rows[0].user_id });
  } catch (err) {
    console.error('Error inserting data:', err);
    res.status(500).send('Server error');
  }
});

// Get all fullnames from personal_details table (case-insensitive, optional)
app.get('/students/all-names', async (req, res) => {
  try {
    const result = await pool.query('SELECT fullname, email FROM personal_details');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/amount-details/user/:userId
app.get('/api/amount-details/user/:userId', async (req, res) => {
  const userId = req.params.userId;
  const sql = `SELECT * FROM amount_details WHERE user_id = $1 LIMIT 1`;
  try {
    const result = await pool.query(sql, [userId]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// ✅ Insert into amount_details
app.post('/api/amount-details', async (req, res) => {
  const { userId, payablewords, payablefigures, outstandingwords, outstandingfigures, accountname, accountnumber, branch } = req.body;

  const sql = `
    INSERT INTO amount_details 
    (user_id, payable_words, payable_figures, outstanding_words, outstanding_figures, school_accountname, school_accountnumber, school_branch) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `;

  try {
    await pool.query(sql, [userId, payablewords, payablefigures, outstandingwords, outstandingfigures, accountname, accountnumber, branch]);
    res.send('Data inserted successfully');
  } catch (err) {
    console.error('Error inserting data:', err);
    res.status(500).send('Server error');
  }
});

// ✅ Insert into family_details
app.post('/api/family-details', async (req, res) => {
  const { userId, family_status, disability, parentname, relationship, contact, occupation, guardian_children, working_siblings, studying_siblings, monthly_income } = req.body;

  const sql = `
    INSERT INTO family_details 
    (user_id, family_status, disability, parent_guardian_name, relationship, contact_info, occupation, guardian_children, working_siblings, studying_siblings, monthly_income) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
  `;

  try {
    await pool.query(sql, [userId, family_status, disability, parentname, relationship, contact, occupation, guardian_children, working_siblings, studying_siblings, monthly_income]);
    res.send('Data inserted successfully');
  } catch (err) {
    console.error('Error inserting data:', err);
    res.status(500).send('Server error');
  }
});

// ✅ Insert into disclosure_details
app.post('/api/disclosure-details', async (req, res) => {
  const { userId, bursary, bursarysource, bursaryamount, helb, granted, noreason } = req.body;

  const sql = `
    INSERT INTO disclosure_details 
    (user_id, receiving_bursary, bursary_source, bursary_amount, applied_helb, helb_outcome, helb_noreason) 
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;

  try {
    await pool.query(sql, [userId, bursary, bursarysource, bursaryamount, helb, granted, noreason]);
    res.send('Data inserted successfully');
  } catch (err) {
    console.error('Error inserting data:', err);
    res.status(500).send('Server error');
  }
});

app.get('/api/admin-details', async (req, res) => {
  const role = 'Admin';
  const sql = 'SELECT name, email FROM users WHERE role = $1';

  try {
    const result = await pool.query(sql, [role]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.status(200).json(result.rows[0]); // Return the first matching admin.
  } catch (err) {
    console.error('Error fetching admin details:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/forgot-password', async (req, res) => {
  const { identifier } = req.body;

  if (!identifier) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: identifier,
      subject: 'Password Reset Code',
      text: `Your password reset code is: ${resetCode}`,
    };

    await transporter.sendMail(mailOptions);

    console.log(`Reset code sent to ${identifier}: ${resetCode}`);

    // TODO: Save resetCode in DB with expiry timestamp for verification later

    res.status(200).json({ message: 'Reset code sent successfully.' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send reset code. Please try again later.' });
  }
});

app.get('/api/student', (req, res) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send('Token is required');

  jwt.verify(token, secret, async (err, decoded) => {
    if (err) return res.status(401).send('Unauthorized access');

    const sqlGet = `
      SELECT fullname, email, subcounty, ward, village, 
      TO_CHAR(birth, 'YYYY-MM-DD') AS birth, 
      gender, institution, year, admission, status, bursary
      FROM personal_details 
      WHERE email = $1
    `;

    try {
      const result = await pool.query(sqlGet, [decoded.email]);

      if (result.rows.length === 0) {
        return res.status(404).send('Student not found');
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error fetching data:', err);
      res.status(500).send('Error fetching data');
    }
  });
});

app.get('/api/reports', (req, res) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send('Token is required');

  jwt.verify(token, secret, async (err, decoded) => {
    if (err) return res.status(401).send('Unauthorized access');

    const sqlGet = `
      SELECT 
        'REFXE' || LPAD(user_id::text, 2, '0') AS reference_number,
        fullname,
        email,
        subcounty,
        ward,
        village,
        TO_CHAR(birth, 'YYYY-MM-DD') AS birth,
        gender,
        institution,
        year,
        admission,
        status,
        bursary
      FROM personal_details 
      WHERE email = $1
    `;

    try {
      const result = await pool.query(sqlGet, [decoded.email]);
      if (result.rows.length === 0) {
        return res.status(404).send('Student not found');
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error fetching data:', err);
      res.status(500).send('Error fetching data');
    }
  });
});

app.put('/api/student/update', (req, res) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send('Token is required');

  jwt.verify(token, secret, async (err, decoded) => {
    if (err) return res.status(401).send('Unauthorized access');

    const {
      fullname,
      email,
      subcounty,
      ward,
      village,
      birth,
      gender,
      institution,
      year,
      admission
    } = req.body;

    const formattedBirth = birth ? new Date(birth).toISOString().split('T')[0] : null;

    const sqlUpdate = `
      UPDATE personal_details 
      SET fullname = $1, email = $2, subcounty = $3, ward = $4, village = $5,
          birth = $6, gender = $7, institution = $8, year = $9, admission = $10
      WHERE email = $11
    `;

    try {
      await pool.query(sqlUpdate, [
        fullname,
        email,
        subcounty,
        ward,
        village,
        formattedBirth,
        gender,
        institution,
        year,
        admission,
        decoded.email
      ]);

      res.send({ message: 'Profile updated successfully', data: req.body });
    } catch (err) {
      console.error('Error updating data:', err);
      res.status(500).send('Error updating data');
    }
  });
});

// Committee Count Route
app.get('/api/committee-count', async (req, res) => {
  const queryTotalFunds = 'SELECT amount FROM bursary_funds WHERE id = 1';
  const queryAllocatedFunds = 'SELECT SUM(bursary) AS total_allocated FROM personal_details';

  try {
    const totalResult = await pool.query(queryTotalFunds);
    if (totalResult.rows.length === 0) {
      return res.status(404).json({ error: 'No bursary fund found' });
    }

    const totalAmount = totalResult.rows[0].amount;

    const allocatedResult = await pool.query(queryAllocatedFunds);
    const allocatedAmount = allocatedResult.rows[0].total_allocated || 0;
    const remainingAmount = totalAmount - allocatedAmount;

    res.status(200).json({
      amount: totalAmount,
      allocated: allocatedAmount,
      remaining: remainingAmount
    });
  } catch (err) {
    console.error('Error in fund calculations:', err);
    res.status(500).json({ error: 'Server error calculating funds' });
  }
});

// Quick Statistics Route
app.get('/api/quick-statistics', async (req, res) => {
  const queryTotal = 'SELECT COUNT(*) AS total FROM personal_details';
  const queryApproved = "SELECT COUNT(*) AS approved FROM personal_details WHERE status = 'approved'";
  const queryRejected = "SELECT COUNT(*) AS rejected FROM personal_details WHERE status = 'rejected'";
  const queryPending = "SELECT COUNT(*) AS pending FROM personal_details WHERE status = 'pending'";
  const queryIncomplete = "SELECT COUNT(*) AS incomplete FROM personal_details WHERE status = 'incomplete'";

  try {
    const totalResult = await pool.query(queryTotal);
    const approvedResult = await pool.query(queryApproved);
    const rejectedResult = await pool.query(queryRejected);
    const pendingResult = await pool.query(queryPending);
    const incompleteResult = await pool.query(queryIncomplete);

    const totalApplications = totalResult.rows[0].total;
    const approvedApplications = approvedResult.rows[0].approved;
    const rejectedApplications = rejectedResult.rows[0].rejected;
    const pendingApplications = pendingResult.rows[0].pending;
    const incompleteApplications = incompleteResult.rows[0].incomplete;

    res.status(200).json({ total: totalApplications, approved: approvedApplications, 
      rejected: rejectedApplications, pending: pendingApplications, incomplete: incompleteApplications });
  } catch (err) {
    console.error('Error fetching statistics:', err);
    res.status(500).json({ error: 'Error fetching statistics' });
  }
});


app.get("/api/personalInformation", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM personal_details");
    res.send(result.rows);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

app.get("/api/personalInformation/:id", async (req, res) => {
  const userId = req.params.id;
  console.log(userId);

  const sqlGet = "SELECT * FROM personal_details WHERE user_id = $1";

  try {
    const result = await pool.query(sqlGet, [userId]);
    res.send(result.rows);
  } catch (error) {
    console.error("Error fetching personal details:", error);
    res.status(500).send("Error fetching data");
  }
});

app.get("/api/amountInformation/:id", async (req, res) => {
  const userId = req.params.id;
  console.log(userId);

  const sqlGet = `
    SELECT 
      ad.*, pd.fullname, pd.admission, pd.institution 
    FROM 
      amount_details ad
    JOIN 
      personal_details pd 
    ON 
      ad.user_id = pd.user_id
    WHERE pd.user_id = $1
  `;

  try {
    const result = await pool.query(sqlGet, [userId]);
    res.send(result.rows);
  } catch (error) {
    console.error("Error fetching amount and personal details:", error);
    res.status(500).send("Error fetching data");
  }
});

app.get("/api/familyInformation/:id", async (req, res) => {
  const userId = req.params.id;
  console.log("User ID:", userId);

  const sqlGet = `
    SELECT 
      fd.*, pd.fullname, pd.admission, pd.institution 
    FROM 
      family_details fd
    JOIN 
      personal_details pd 
    ON 
      fd.user_id = pd.user_id
    WHERE pd.user_id = $1
  `;

  try {
    const result = await pool.query(sqlGet, [userId]);
    res.send(result.rows);
  } catch (error) {
    console.error("Error fetching family and personal details:", error);
    res.status(500).send("Error fetching data");
  }
});

app.get("/api/disclosureInformation/:id", (req, res) => {
  const userId = req.params.id;
  console.log("User ID:", userId);

  const sqlGet = `
    SELECT 
      dd.*, pd.fullname, pd.admission, pd.institution 
    FROM 
      disclosure_details dd
    JOIN 
      personal_details pd 
    ON 
      dd.user_id = pd.user_id
    WHERE pd.user_id = $1
  `;

  pool.query(sqlGet, [userId], (error, result) => {
    if (error) {
      console.error("Error fetching disclosure details:", error);
      res.status(500).send("Error fetching data");
    } else {
      res.send(result.rows);
    }
  });
});

// Use /tmp/uploads for cloud environments like Render
const UPLOAD_DIR = process.env.NODE_ENV === 'production' ? '/tmp/uploads' : path.join(__dirname, 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

app.post('/api/upload', upload.single('document'), (req, res) => {
  const { documentName } = req.body;
  const document = req.file;

  if (!document) {
    return res.status(400).send('No file uploaded');
  }

  // Optionally: Only store file name or relative path in DB
  const filePath = document.path.startsWith('/tmp/')
    ? document.path // on Render
    : path.relative(__dirname, document.path); // on local

  const query = `
    INSERT INTO uploaded_document (document_name, file_path) 
    VALUES ($1, $2)
  `;

  pool.query(query, [documentName, filePath], (err, result) => {
    if (err) {
      console.error('Error saving to database:', err);
      return res.status(500).send('Database error');
    }
    res.status(200).send('File uploaded and saved to database successfully');
  });
});

app.get("/api/get-document/:id", (req, res) => {
  const userId = req.params.id;
  console.log(userId);

  const sqlGet = `
    SELECT 
      ud.*, pd.fullname, pd.admission, pd.institution 
    FROM 
      uploaded_document ud
    JOIN 
      personal_details pd 
    ON 
      ud.user_id = pd.user_id
    WHERE pd.user_id = $1
  `;

  pool.query(sqlGet, [userId], (error, result) => {
    if (error) {
      console.error("Error fetching uploaded document:", error);
      res.status(500).send("Error fetching data");
    } else {
      res.send(result.rows);
    }
  });
});

app.put('/api/update-status/:id', (req, res) => {
  const userId = req.params.id;
  const { status } = req.body;

  const query = `
    UPDATE personal_details 
    SET status = $1 
    WHERE user_id = $2
  `;

  pool.query(query, [status, userId], (error, result) => {
    if (error) {
      return res.status(500).json({ error: 'Error updating status' });
    }
    res.json({ message: `Status updated to ${status}` });
  });
});

app.get("/api/get-bursary/:id", (req, res) => {
  const userId = req.params.id;
  console.log(userId);

  const sqlGet = `
    SELECT 
      ud.*, pd.fullname, pd.admission, pd.institution 
    FROM 
      uploaded_document ud
    JOIN 
      personal_details pd 
    ON 
      ud.user_id = pd.user_id
    WHERE pd.user_id = $1
  `;

  pool.query(sqlGet, [userId], (error, result) => {
    if (error) {
      console.error("Error fetching bursary details:", error);
      res.status(500).send("Error fetching data");
    } else {
      res.send(result.rows);
    }
  });
});

app.get("/api/get-bursary", (req, res) => {
  const sqlGetAll = `
    SELECT 
      ud.*, pd.fullname, pd.admission, pd.institution 
    FROM 
      uploaded_document ud
    JOIN 
      personal_details pd 
    ON 
      ud.user_id = pd.user_id
  `;

  pool.query(sqlGetAll, (error, result) => {
    if (error) {
      console.error("Error fetching all bursary details:", error);
      res.status(500).send("Error fetching data");
    } else {
      res.send(result.rows);
    }
  });
});

app.put('/api/update-bursary/:id', (req, res) => {
  const userId = req.params.id;
  const { bursary } = req.body;

  console.log('REQ BODY:', req.body);
  console.log('REQ PARAMS:', req.params);

    if (!bursary || isNaN(Number(bursary))) {
    return res.status(400).json({ error: 'Invalid bursary value.' });
  }

  const query = `
    UPDATE personal_details 
    SET bursary = $1, allocation_date = CURRENT_TIMESTAMP 
    WHERE user_id = $2
  `;

  pool.query(query, [bursary, userId], (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Error updating bursary and date' });
    }
    res.json({ message: `Allocated Ksh ${bursary} on ${new Date().toISOString()}` });
  });
});

app.get('/api/users', (req, res) => {
  const query = 'SELECT * FROM users';
  pool.query(query, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results.rows);
  });
});

app.post('/api/users', (req, res) => {
  const { fullname, email, password, role } = req.body;

  if (!fullname || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ message: 'Error hashing password' });

    const query = 'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id';
    pool.query(query, [fullname, email, hashedPassword, role], (err, result) => {
      if (err) return res.status(500).send(err);

      const logQuery = 'INSERT INTO activity_log (log_message) VALUES ($1)';
      pool.query(logQuery, [`Added new user ${fullname}`]);

      res.status(201).json({ message: 'User added', userId: result.rows[0].id });
    });
  });
});

app.delete('/api/users/:id', (req, res) => {
  const userId = req.params.id;

  const selectQuery = 'SELECT name FROM users WHERE id = $1';
  pool.query(selectQuery, [userId], (err, result) => {
    if (err || result.rows.length === 0) {
      return res.status(500).json({ message: 'Error fetching user or user not found' });
    }

    const userFullName = result.rows[0].name;

    const deleteQuery = 'DELETE FROM users WHERE id = $1';
    pool.query(deleteQuery, [userId], (err) => {
      if (err) return res.status(500).send(err);

      const logQuery = 'INSERT INTO activity_log (log_message) VALUES ($1)';
      pool.query(logQuery, [`Deleted user ${userFullName}`], (logErr) => {
        if (logErr) return res.status(500).json({ message: 'Error logging activity' });

        res.status(200).json({ message: 'User deleted' });
      });
    });
  });
});

app.get('/api/activity-logs', (req, res) => {
  const query = 'SELECT * FROM activity_log';
  pool.query(query, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results.rows);
  });
});

app.post('/api/bursary-funds', (req, res) => {
  const { amount } = req.body;

  if (!amount || isNaN(amount)) {
    return res.status(400).json({ message: 'Invalid amount provided' });
  }

  const query = 'INSERT INTO bursary_funds (amount) VALUES ($1)';
  pool.query(query, [amount], (err) => {
    if (err) {
      console.error('Error inserting data:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.status(200).json({ message: 'Funds disbursed successfully' });
  });
});

app.put('/api/adjust-funds', (req, res) => {
  const { amount } = req.body;
  const id = 1;

  const updateQuery = 'UPDATE bursary_funds SET amount = $1 WHERE id = $2';
  pool.query(updateQuery, [amount, id], (err) => {
    if (err) return res.status(500).send(err);
    res.status(200).json({ message: 'Fund allocation adjusted successfully!' });
  });
});

// API to fetch user report by ID
app.get('/api/user-report/:id', (req, res) => {
  const query = `
    SELECT fullname, admission_number AS admission, institution, status, 
           bursary AS "amountAllocated"
    FROM personal_details 
    WHERE user_id = $1
  `;

  const userId = req.params.id;

  pool.query(query, [userId], (err, result) => {
    if (err) {
      console.error('Error fetching user data:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });
});

// GET profile-committee
app.get('/api/profile-committee', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(403).send('Token is required');

  jwt.verify(token, secret, (err, decoded) => {
    if (err) return res.status(401).send('Unauthorized access');

    const sqlGet = `
      SELECT fullname, email, phone_no, national_id, subcounty, 
             ward, position, 
             CASE 
               WHEN fullname IS NULL OR phone_no IS NULL OR national_id IS NULL THEN 0
               ELSE 1
             END AS is_complete
      FROM profile_committee 
      WHERE email = $1
    `;

    pool.query(sqlGet, [decoded.email], (err, result) => {
      if (err) {
        console.error('Error fetching committee data:', err);
        return res.status(500).send('Error fetching data');
      }

      if (result.rows.length === 0) {
        return res.status(404).send('Profile not found');
      }

      res.json(result.rows[0]);
    });
  });
});

// POST profile-form
app.post('/api/profile-form', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(403).send('Token is required');

  jwt.verify(token, secret, (err, decoded) => {
    if (err) return res.status(401).send('Unauthorized access');

    const { fullname, phone_no, national_id, subcounty, ward, position } = req.body;
    if (!fullname || !phone_no || !national_id || !subcounty || !ward || !position) {
      return res.status(400).send('All profile fields are required');
    }

    const email = decoded.email;

    console.log('Insert data:', {
      fullname, email, phone_no, national_id, subcounty, ward, position
    });

    const sqlInsert = `
      INSERT INTO profile_committee (fullname, email, phone_no, national_id, subcounty, ward, position) 
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    pool.query(sqlInsert, [
      fullname,
      email,
      phone_no,
      national_id,
      subcounty,
      ward,
      position
    ], (err, result) => {
      if (err) {
        console.error('Error inserting committee data:', err);
        if (err.code === '23505') {
          // Unique violation
          return res.status(409).send('Profile already exists with this email or national ID');
        }
        return res.status(500).send('Error submitting data');
      }

      res.status(201).send({
        message: 'Profile created successfully',
        data: {
          fullname,
          email,
          phone_no,
          national_id,
          subcounty,
          ward,
          position
        }
      });
    });
  });
});
// GET committee report with generated REFNO
app.get('/api/comreport', (req, res) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send('Token is required');

  jwt.verify(token, secret, (err, decoded) => {
    if (err) return res.status(401).send('Unauthorized access');

    const sqlGet = `
      SELECT 
        'REFNO' || LPAD(CAST(id AS TEXT), 2, '0') AS reference_number,
        fullname, 
        email,
        phone_no,
        national_id,
        subcounty, 
        ward, 
        position
      FROM profile_committee 
      WHERE email = $1
    `;

    pool.query(sqlGet, [decoded.email], (err, result) => {
      if (err) {
        console.error('Error fetching data:', err);
        return res.status(500).send('Error fetching data');
      }
      res.json(result.rows[0]);
    });
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
