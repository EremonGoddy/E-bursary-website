// server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const pool = require('./db-config');

const app = express();

/* ----------------------------- CORS ----------------------------- */

const allowedOrigins = (
  process.env.CLIENT_ORIGINS ||
  'https://e-bursary-website.vercel.app,http://localhost:5173'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(
      new Error(`Origin ${origin} is not allowed by CORS policy`)
    );
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition'],
};

app.use(cors(corsOptions));

/* -------------------------- Middleware -------------------------- */

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* -------------------------- JWT/Auth --------------------------- */

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error('JWT_SECRET is required');
}

const authenticateToken = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({ message: 'Token required' });
  }

  const parts = authorization.split(' ');
  const token = parts.length === 2 ? parts[1] : null;

  if (!token) {
    return res.status(401).json({ message: 'Token required' });
  }

  jwt.verify(token, secret, (error, user) => {
    if (error) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  });
};

/* ----------------------------- Root ----------------------------- */

app.get('/', (_req, res) => {
  res.send('🚀 Backend is running and connected to PostgreSQL.');
});

/* ----------------------- Password Verification ------------------ */

app.get(
  '/api/verify-password',
  authenticateToken,
  async (req, res) => {
    const { userId } = req.user;
    const { password } = req.query;

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    try {
      const result = await pool.query(
        'SELECT password FROM bursary.users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isMatch = await bcrypt.compare(
        password,
        result.rows[0].password
      );

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid password' });
      }

      res.status(200).json({ message: 'Password verified' });
    } catch (error) {
      console.error('Error verifying password:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/* ------------------------------ OTP ----------------------------- */

app.post('/api/send-otp', async (req, res) => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({
      message: 'Please provide either email or phone number',
    });
  }

  try {
    let userResult;

    if (email) {
      userResult = await pool.query(
        'SELECT * FROM bursary.users WHERE email = $1',
        [email]
      );
    } else {
      userResult = await pool.query(
        'SELECT * FROM bursary.users WHERE phone_number = $1',
        [phoneNumber]
      );
    }

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    if (email) {
      await pool.query(
        `UPDATE bursary.users
         SET otp_code = $1, otp_expires = $2
         WHERE email = $3`,
        [otp, expiresAt, email]
      );

      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        return res.status(500).json({
          message: 'Email service is not configured',
        });
      }

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: `Bursary System <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is: ${otp}\n\nIt expires in 5 minutes.`,
      });

      return res.json({
        message: 'OTP sent to email successfully',
      });
    }

    await pool.query(
      `UPDATE bursary.users
       SET otp_code = $1, otp_expires = $2
       WHERE phone_number = $3`,
      [otp, expiresAt, phoneNumber]
    );

    console.log(
      `OTP ${otp} would be sent via SMS to phone: ${phoneNumber}`
    );

    return res.json({
      message: 'OTP sent to phone successfully (simulated)',
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/verify-otp', async (req, res) => {
  const { email, phoneNumber, otp } = req.body;

  if (!otp || (!email && !phoneNumber)) {
    return res.status(400).json({
      message: 'OTP and either email or phone number are required',
    });
  }

  try {
    let userResult;

    if (email) {
      userResult = await pool.query(
        'SELECT * FROM bursary.users WHERE email = $1',
        [email]
      );
    } else {
      userResult = await pool.query(
        'SELECT * FROM bursary.users WHERE phone_number = $1',
        [phoneNumber]
      );
    }

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];

    if (user.otp_code !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > new Date(user.otp_expires)) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    await pool.query(
      'UPDATE bursary.users SET otp_code = NULL, otp_expires = NULL WHERE id = $1',
      [user.id]
    );

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      message: 'Server error while verifying OTP',
    });
  }
});

/* ---------------------------- Sign In --------------------------- */

app.post('/api/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    const userResult = await pool.query(
      'SELECT * FROM bursary.users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    const [studentResult, committeeResult] = await Promise.all([
      pool.query(
        'SELECT * FROM bursary.personal_details WHERE email = $1',
        [email]
      ),
      pool.query(
        'SELECT * FROM bursary.profile_committee WHERE email = $1',
        [email]
      ),
    ]);

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      secret,
      { expiresIn: '1h' }
    );

    const response = {
      message: 'Login successful',
      token,
      role: user.role,
      name: user.name,
      student: studentResult.rows[0] || null,
      committee: null,
    };

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
        signature: committee.signature || null,
      };
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Error in /api/signin:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/logout', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    await pool.query(
      'SELECT name FROM bursary.users WHERE id = $1',
      [userId]
    );

    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error logging logout:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ---------------------- Student Information --------------------- */

app.post('/api/approve-student', async (req, res) => {
  try {
    const { studentUserId, committeeName } = req.body;

    if (!studentUserId || !committeeName) {
      return res.status(400).json({
        message: 'Student ID and Committee Name are required',
      });
    }

    const result = await pool.query(
      `UPDATE bursary.personal_details
       SET approved_by_committee = $1
       WHERE user_id = $2
       RETURNING *`,
      [committeeName, studentUserId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({
      message: 'Student approved successfully',
      student: result.rows[0],
    });
  } catch (error) {
    console.error('Error in /api/approve-student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/status-message/user/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT status_message, is_new
       FROM bursary.personal_details
       WHERE user_id = $1`,
      [req.params.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching status message:', error);
    res.status(500).send('Server error');
  }
});

app.put('/api/status-message/user/:userId/read', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE bursary.personal_details
       SET is_new = false
       WHERE user_id = $1
       RETURNING status_message, is_new`,
      [req.params.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).send('Server error');
  }
});

/* ---------------------------- Users ----------------------------- */

app.post('/api/post', async (req, res) => {
  const { name, email, password, role, phoneNumber } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({
      message: 'Name, email, password, and role are required',
    });
  }

  try {
    const existing = await pool.query(
      `SELECT id
       FROM bursary.users
       WHERE LOWER(email) = LOWER($1)
          OR LOWER(name) = LOWER($2)
          OR phone_number = $3`,
      [email, name, phoneNumber]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        message: 'Email, name, or phone number is already registered',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO bursary.users
       (name, email, password, role, phone_number)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, phone_number`,
      [name, email, hashedPassword, role, phoneNumber]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Error inserting user:', error);
    res.status(500).json({
      message: 'Server error while registering user',
    });
  }
});

app.post('/api/reset-password', async (req, res) => {
  const { contactValue, newPassword } = req.body;

  if (!contactValue || !newPassword) {
    return res.status(400).json({
      message: 'Both contact and new password are required',
    });
  }

  try {
    const result = await pool.query(
      `SELECT id
       FROM bursary.users
       WHERE email = $1 OR phone_number = $1
       LIMIT 1`,
      [contactValue]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE bursary.users SET password = $1 WHERE id = $2',
      [hashedPassword, result.rows[0].id]
    );

    res.status(200).json({
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      message: 'Server error while resetting password',
    });
  }
});

app.post('/api/change-password', authenticateToken, async (req, res) => {
  const { userId } = req.user;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      message: 'Current and new passwords are required',
    });
  }

  try {
    const result = await pool.query(
      'SELECT password FROM bursary.users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      result.rows[0].password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid current password',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE bursary.users SET password = $1 WHERE id = $2',
      [hashedPassword, userId]
    );

    res.status(200).json({
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* -------------------- Application Progress ---------------------- */

async function hasPersonalDetails(userId) {
  const result = await pool.query(
    'SELECT 1 FROM bursary.personal_details WHERE user_id = $1',
    [userId]
  );

  return result.rows.length > 0;
}

async function hasAmountDetails(userId) {
  const result = await pool.query(
    'SELECT 1 FROM bursary.amount_details WHERE user_id = $1',
    [userId]
  );

  return result.rows.length > 0;
}

async function hasFamilyDetails(userId) {
  const result = await pool.query(
    'SELECT 1 FROM bursary.family_details WHERE user_id = $1',
    [userId]
  );

  return result.rows.length > 0;
}

async function hasDisclosureDetails(userId) {
  const result = await pool.query(
    'SELECT 1 FROM bursary.disclosure_details WHERE user_id = $1',
    [userId]
  );

  return result.rows.length > 0;
}

async function hasUploadedDocuments(userId) {
  const result = await pool.query(
    'SELECT 1 FROM bursary.uploaded_document WHERE user_id = $1',
    [userId]
  );

  return result.rows.length > 0;
}

app.get('/api/application-progress/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const steps = [
      await hasPersonalDetails(userId),
      await hasAmountDetails(userId),
      await hasFamilyDetails(userId),
      await hasDisclosureDetails(userId),
      await hasUploadedDocuments(userId),
    ];

    const completedSteps = [];
    let currentStep = 0;

    for (let index = 0; index < steps.length; index++) {
      if (!steps[index]) break;

      completedSteps.push(index);
      currentStep = index + 1;
    }

    res.json({ currentStep, completedSteps });
  } catch (error) {
    console.error('Application progress error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ---------------------- Personal Details ------------------------ */

app.get('/api/personal-details/user/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM bursary.personal_details
       WHERE user_id = $1
       LIMIT 1`,
      [req.params.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

app.post('/api/personal-details', async (req, res) => {
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
    admission,
  } = req.body;

  try {
    const check = await pool.query(
      `SELECT 1
       FROM bursary.personal_details
       WHERE LOWER(fullname) = LOWER($1)
          OR LOWER(email) = LOWER($2)`,
      [fullname, email]
    );

    if (check.rows.length > 0) {
      return res.status(409).json({
        message: 'This full name or email is already registered.',
      });
    }

    const result = await pool.query(
      `INSERT INTO bursary.personal_details
       (
         fullname, email, subcounty, ward, village, birth,
         gender, institution, year, admission, status
       )
       VALUES
       ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')
       RETURNING user_id`,
      [
        fullname,
        email,
        subcounty,
        ward,
        village,
        birth,
        gender,
        institution,
        year,
        admission,
      ]
    );

    res.json({
      message: 'Data inserted successfully',
      userId: result.rows[0].user_id,
    });
  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).send('Server error');
  }
});

app.get('/students/all-names', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT fullname, email FROM bursary.personal_details'
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

/* ------------------------- Amount Details ----------------------- */

app.get('/api/amount-details/user/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM bursary.amount_details
       WHERE user_id = $1
       LIMIT 1`,
      [req.params.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

app.post('/api/amount-details', async (req, res) => {
  const {
    userId,
    payablewords,
    payablefigures,
    outstandingwords,
    outstandingfigures,
    accountname,
    accountnumber,
    branch,
  } = req.body;

  try {
    await pool.query(
      `INSERT INTO bursary.amount_details
       (
         user_id,
         payable_words,
         payable_figures,
         outstanding_words,
         outstanding_figures,
         school_accountname,
         school_accountnumber,
         school_branch
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId,
        payablewords,
        payablefigures,
        outstandingwords,
        outstandingfigures,
        accountname,
        accountnumber,
        branch,
      ]
    );

    res.send('Data inserted successfully');
  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).send('Server error');
  }
});

/* ------------------------- Family Details ----------------------- */

app.get('/api/family-details/user/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM bursary.family_details
       WHERE user_id = $1
       LIMIT 1`,
      [req.params.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

app.post('/api/family-details', async (req, res) => {
  const {
    userId,
    family_status,
    disability,
    parentname,
    relationship,
    contact,
    occupation,
    guardian_children,
    working_siblings,
    studying_siblings,
    monthly_income,
  } = req.body;

  try {
    await pool.query(
      `INSERT INTO bursary.family_details
       (
         user_id,
         family_status,
         disability,
         parent_guardian_name,
         relationship,
         contact_info,
         occupation,
         guardian_children,
         working_siblings,
         studying_siblings,
         monthly_income
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        userId,
        family_status,
        disability,
        parentname,
        relationship,
        contact,
        occupation,
        guardian_children,
        working_siblings,
        studying_siblings,
        monthly_income,
      ]
    );

    res.send('Data inserted successfully');
  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).send('Server error');
  }
});

/* ----------------------- Disclosure Details --------------------- */

app.get('/api/disclosure-details/user/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM bursary.disclosure_details
       WHERE user_id = $1
       LIMIT 1`,
      [req.params.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

app.post('/api/disclosure-details', async (req, res) => {
  const {
    userId,
    bursary,
    bursarysource,
    bursaryamount,
    helb,
    granted,
    noreason,
  } = req.body;

  try {
    await pool.query(
      `INSERT INTO bursary.disclosure_details
       (
         user_id,
         receiving_bursary,
         bursary_source,
         bursary_amount,
         applied_helb,
         helb_outcome,
         helb_noreason
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userId,
        bursary,
        bursarysource,
        bursaryamount,
        helb,
        granted,
        noreason,
      ]
    );

    res.send('Data inserted successfully');
  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).send('Server error');
  }
});

/* ------------------------- Document Upload ---------------------- */

const UPLOAD_DIR =
  process.env.NODE_ENV === 'production'
    ? '/tmp/uploads'
    : path.join(__dirname, 'uploads');

const SIGN_DIR = path.join(UPLOAD_DIR, 'signatures');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(SIGN_DIR, { recursive: true });

const documentStorage = multer.diskStorage({
  destination(_req, _file, callback) {
    callback(null, UPLOAD_DIR);
  },

  filename(_req, file, callback) {
    const safeName = path.basename(file.originalname).replace(
      /[^a-zA-Z0-9._-]/g,
      '_'
    );

    callback(null, `${Date.now()}-${safeName}`);
  },
});

const documentFileFilter = (_req, file, callback) => {
  const allowedTypes = new Set([
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
  ]);

  if (allowedTypes.has(file.mimetype)) {
    return callback(null, true);
  }

  callback(new Error('Only PDF and image files are allowed.'));
};

const upload = multer({
  storage: documentStorage,
  fileFilter: documentFileFilter,
  limits: {
    files: 3,
    fileSize: 10 * 1024 * 1024,
  },
});

app.use('/uploads', express.static(UPLOAD_DIR));

const documentFields = upload.fields([
  { name: 'admissionLetter', maxCount: 1 },
  { name: 'feesStructure', maxCount: 1 },
  { name: 'guardianIdCopy', maxCount: 1 },
]);

app.post('/api/upload', (req, res) => {
  documentFields(req, res, async (uploadError) => {
    if (uploadError) {
      const status =
        uploadError.code === 'LIMIT_FILE_SIZE' ? 413 : 400;

      return res.status(status).json({
        message: uploadError.message || 'Document upload rejected.',
        field: uploadError.field || null,
      });
    }

    const files = req.files || {};
    const uploadedFiles = Object.values(files).flat();

    const removeUploadedFiles = () => {
      uploadedFiles.forEach((file) => {
        if (file.path && fs.existsSync(file.path)) {
          fs.unlink(file.path, () => {});
        }
      });
    };

    const { userId } = req.body;
    const admissionLetter = files.admissionLetter?.[0];
    const feesStructure = files.feesStructure?.[0];
    const guardianIdCopy = files.guardianIdCopy?.[0];

    if (!userId) {
      removeUploadedFiles();
      return res.status(400).json({
        message: 'userId is required.',
      });
    }

    if (!admissionLetter || !feesStructure || !guardianIdCopy) {
      removeUploadedFiles();
      return res.status(400).json({
        message:
          'Admission Letter, Fees Structure, and Parent/Guardian ID Copy are required.',
      });
    }

    try {
      await pool.query(
        `INSERT INTO bursary.uploaded_document
         (
           user_id,
           admission_letter,
           fees_structure,
           parent_guardian_id
         )
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id)
         DO UPDATE SET
           admission_letter = EXCLUDED.admission_letter,
           fees_structure = EXCLUDED.fees_structure,
           parent_guardian_id = EXCLUDED.parent_guardian_id`,
        [
          userId,
          admissionLetter.path,
          feesStructure.path,
          guardianIdCopy.path,
        ]
      );

      res.status(200).json({
        message: 'Documents uploaded and saved successfully.',
      });
    } catch (error) {
      removeUploadedFiles();
      console.error('Error saving uploaded documents:', error);
      res.status(500).json({
        message: 'Database error saving documents.',
      });
    }
  });
});

app.get('/api/upload/status/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT admission_letter, fees_structure, parent_guardian_id
       FROM bursary.uploaded_document
       WHERE user_id = $1`,
      [req.params.userId]
    );

    const document = result.rows[0];

    res.json({
      uploaded: Boolean(
        document?.admission_letter &&
        document?.fees_structure &&
        document?.parent_guardian_id
      ),
    });
  } catch (error) {
    res.status(500).json({
      uploaded: false,
    });
  }
});

app.get('/api/get-document/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         ud.*,
         pd.fullname,
         pd.admission,
         pd.institution
       FROM bursary.uploaded_document ud
       JOIN bursary.personal_details pd
         ON ud.user_id = pd.user_id
       WHERE pd.user_id = $1`,
      [req.params.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      message: 'Error fetching uploaded documents.',
    });
  }
});

/* ---------------------------- Profiles -------------------------- */

app.get('/api/admin-details', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT name, email
       FROM bursary.users
       WHERE role = $1
       LIMIT 1`,
      ['Admin']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Admin not found',
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching admin details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/profile-committee', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM bursary.profile_committee
       WHERE email = $1
       LIMIT 1`,
      [req.user.email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Committee profile not found',
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching committee profile:', error);
    res.status(500).json({
      message: 'Server error',
    });
  }
});

app.post('/api/profile-committee', authenticateToken, async (req, res) => {
  const {
    fullname,
    email,
    phone_no,
    national_id,
    subcounty,
    ward,
    position,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO bursary.profile_committee
       (
         fullname,
         email,
         phone_no,
         national_id,
         subcounty,
         ward,
         position
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (email)
       DO UPDATE SET
         fullname = EXCLUDED.fullname,
         phone_no = EXCLUDED.phone_no,
         national_id = EXCLUDED.national_id,
         subcounty = EXCLUDED.subcounty,
         ward = EXCLUDED.ward,
         position = EXCLUDED.position
       RETURNING *`,
      [
        fullname,
        email || req.user.email,
        phone_no,
        national_id,
        subcounty,
        ward,
        position,
      ]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error saving committee profile:', error);
    res.status(500).json({
      message: 'Server error',
    });
  }
});

app.get('/api/comreport', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         'REFNO' || LPAD(CAST(id AS TEXT), 2, '0') AS reference_number,
         fullname,
         email,
         phone_no,
         national_id,
         subcounty,
         ward,
         position
       FROM bursary.profile_committee
       WHERE email = $1`,
      [req.user.email]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('Committee member not found');
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching committee data:', error);
    res.status(500).send('Error fetching committee data');
  }
});

/* ----------------------- Student Reports ------------------------ */

app.get('/api/student', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
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
       FROM bursary.personal_details
       WHERE email = $1`,
      [req.user.email]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('Student not found');
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).send('Error fetching data');
  }
});

app.get('/api/reports', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         'REFXE' || LPAD(pd.user_id::text, 2, '0') AS reference_number,
         pd.fullname,
         pd.email,
         pd.subcounty,
         pd.ward,
         pd.village,
         TO_CHAR(pd.birth, 'YYYY-MM-DD') AS birth,
         pd.gender,
         pd.institution,
         pd.year,
         pd.admission,
         pd.status,
         pd.bursary,
         pd.approved_by_committee,
         pd.allocation_date,
         pc.signature AS committee_signature,
         pc.fullname AS committee_fullname,
         pc.position AS committee_position
       FROM bursary.personal_details pd
       LEFT JOIN bursary.profile_committee pc
         ON TRIM(LOWER(pd.approved_by_committee)) =
            TRIM(LOWER(pc.fullname))
       WHERE pd.email = $1`,
      [req.user.email]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('Student not found');
    }

    const student = result.rows[0];
    let digitalSignature = null;

    if (student.approved_by_committee) {
      const firstLetter =
        student.approved_by_committee.trim().charAt(0).toUpperCase();

      digitalSignature = `HOLD-${firstLetter}`;
    }

    res.json({
      reference_number: student.reference_number,
      fullname: student.fullname,
      email: student.email,
      subcounty: student.subcounty,
      ward: student.ward,
      village: student.village,
      birth: student.birth,
      gender: student.gender,
      institution: student.institution,
      year: student.year,
      admission: student.admission,
      status: student.status,
      bursary: student.bursary,
      approved_by_committee: student.approved_by_committee,
      allocation_date: student.allocation_date,
      digital_signature: digitalSignature,
      committee_signature: student.committee_signature || null,
      committee_fullname: student.committee_fullname || null,
      committee_position: student.committee_position || null,
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      error: 'Error fetching data',
      details: error.message,
    });
  }
});

app.put('/api/student/update', authenticateToken, async (req, res) => {
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
    admission,
  } = req.body;

  const formattedBirth = birth
    ? new Date(birth).toISOString().split('T')[0]
    : null;

  try {
    await pool.query(
      `UPDATE bursary.personal_details
       SET
         fullname = $1,
         email = $2,
         subcounty = $3,
         ward = $4,
         village = $5,
         birth = $6,
         gender = $7,
         institution = $8,
         year = $9,
         admission = $10
       WHERE email = $11`,
      [
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
        req.user.email,
      ]
    );

    res.send({
      message: 'Profile updated successfully',
      data: req.body,
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).send('Error updating data');
  }
});

/* -------------------------- Statistics -------------------------- */

app.get('/api/committee-count', async (_req, res) => {
  try {
    const totalResult = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) AS total_amount FROM bursary.bursary_funds'
    );

    const allocatedResult = await pool.query(
      'SELECT COALESCE(SUM(bursary), 0) AS total_allocated FROM bursary.personal_details'
    );

    const totalAmount = Number(totalResult.rows[0].total_amount);
    const allocatedAmount = Number(
      allocatedResult.rows[0].total_allocated
    );

    res.status(200).json({
      amount: totalAmount,
      allocated: allocatedAmount,
      remaining: totalAmount - allocatedAmount,
    });
  } catch (error) {
    console.error('Error in fund calculations:', error);
    res.status(500).json({
      error: 'Server error calculating funds',
    });
  }
});

app.get('/api/bursary-count/:ward', async (req, res) => {
  const { ward } = req.params;

  try {
    const totalResult = await pool.query(
      `SELECT amount
       FROM bursary.bursary_funds
       WHERE ward_allocated = $1
       LIMIT 1`,
      [ward]
    );

    if (totalResult.rows.length === 0) {
      return res.status(404).json({
        error: `No bursary fund found for ward: ${ward}`,
      });
    }

    const allocatedResult = await pool.query(
      `SELECT COALESCE(SUM(bursary), 0) AS total_allocated
       FROM bursary.personal_details
       WHERE ward = $1`,
      [ward]
    );

    const totalAmount = Number(totalResult.rows[0].amount);
    const allocatedAmount = Number(
      allocatedResult.rows[0].total_allocated
    );

    res.status(200).json({
      ward,
      amount: totalAmount,
      allocated: allocatedAmount,
      remaining: totalAmount - allocatedAmount,
    });
  } catch (error) {
    console.error('Error in fund calculations:', error);
    res.status(500).json({
      error: 'Server error calculating funds per ward',
    });
  }
});

app.get('/api/quick-statistics', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE status = 'Approved') AS approved,
         COUNT(*) FILTER (WHERE status = 'Rejected') AS rejected,
         COUNT(*) FILTER (WHERE status = 'pending') AS pending,
         COUNT(*) FILTER (WHERE status = 'Incomplete') AS incomplete
       FROM bursary.personal_details`
    );

    res.status(200).json({
      total: Number(result.rows[0].total),
      approved: Number(result.rows[0].approved),
      rejected: Number(result.rows[0].rejected),
      pending: Number(result.rows[0].pending),
      incomplete: Number(result.rows[0].incomplete),
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      error: 'Error fetching statistics',
    });
  }
});

app.get(
  '/api/committee-statistics',
  authenticateToken,
  async (req, res) => {
    try {
      const committeeResult = await pool.query(
        `SELECT fullname
         FROM bursary.profile_committee
         WHERE LOWER(email) = LOWER($1)
         LIMIT 1`,
        [req.user.email]
      );

      if (committeeResult.rows.length === 0) {
        return res.status(404).json({
          message: 'Committee not found',
        });
      }

      const committeeName = committeeResult.rows[0].fullname;

      const result = await pool.query(
        `SELECT
           COUNT(*) FILTER (
             WHERE LOWER(approved_by_committee) = LOWER($1)
           ) AS total,
           COUNT(*) FILTER (
             WHERE status = 'Approved'
               AND LOWER(approved_by_committee) = LOWER($1)
           ) AS approved,
           COUNT(*) FILTER (
             WHERE status = 'Rejected'
               AND LOWER(approved_by_committee) = LOWER($1)
           ) AS rejected,
           COUNT(*) FILTER (
             WHERE status = 'Incomplete'
               AND LOWER(approved_by_committee) = LOWER($1)
           ) AS incomplete
         FROM bursary.personal_details`,
        [committeeName]
      );

      res.status(200).json({
        total: Number(result.rows[0].total),
        approved: Number(result.rows[0].approved),
        rejected: Number(result.rows[0].rejected),
        incomplete: Number(result.rows[0].incomplete),
      });
    } catch (error) {
      console.error('Error fetching committee statistics:', error);
      res.status(500).json({
        error: 'Error fetching committee statistics',
      });
    }
  }
);

/* ------------------- Personal Information Lists ----------------- */

app.get('/api/personalInformation', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM bursary.personal_details'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

app.get('/api/personalInformation/ward/:ward', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM bursary.personal_details WHERE ward = $1',
      [req.params.ward]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: `No students found in ${req.params.ward} ward`,
      });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching ward data:', error);
    res.status(500).send(
      'Error fetching personal information for this ward'
    );
  }
});

app.get('/api/personalInformation/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM bursary.personal_details WHERE user_id = $1',
      [req.params.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching personal details:', error);
    res.status(500).send('Error fetching data');
  }
});

app.get('/api/amountInformation/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ad.*, pd.fullname, pd.admission, pd.institution
       FROM bursary.amount_details ad
       JOIN bursary.personal_details pd
         ON ad.user_id = pd.user_id
       WHERE pd.user_id = $1`,
      [req.params.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching amount details:', error);
    res.status(500).send('Error fetching data');
  }
});

app.get('/api/familyInformation/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT fd.*, pd.fullname, pd.admission, pd.institution
       FROM bursary.family_details fd
       JOIN bursary.personal_details pd
         ON fd.user_id = pd.user_id
       WHERE pd.user_id = $1`,
      [req.params.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching family details:', error);
    res.status(500).send('Error fetching data');
  }
});

app.get('/api/disclosureInformation/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT dd.*, pd.fullname, pd.admission, pd.institution
       FROM bursary.disclosure_details dd
       JOIN bursary.personal_details pd
         ON dd.user_id = pd.user_id
       WHERE pd.user_id = $1`,
      [req.params.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching disclosure details:', error);
    res.status(500).send('Error fetching data');
  }
});

/* ---------------------------- Statuses -------------------------- */

app.put('/api/update-status/:id', async (req, res) => {
  const { status, status_message } = req.body;

  try {
    await pool.query(
      `UPDATE bursary.personal_details
       SET status = $1, status_message = $2
       WHERE user_id = $3`,
      [status, status_message, req.params.id]
    );

    res.json({
      message: `Status updated to ${status}`,
      status_message,
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({
      error: 'Error updating status and message',
    });
  }
});

app.put('/api/update-bursary/:id', async (req, res) => {
  const { bursary } = req.body;
  const userId = req.params.id;

  if (!bursary || isNaN(Number(bursary))) {
    return res.status(400).json({
      error: 'Invalid bursary value.',
    });
  }

  try {
    const nameResult = await pool.query(
      'SELECT fullname FROM bursary.personal_details WHERE user_id = $1',
      [userId]
    );

    if (nameResult.rowCount === 0) {
      return res.status(404).json({
        error: 'Student not found',
      });
    }

    const studentName =
      nameResult.rows[0].fullname;

    await pool.query(
      `UPDATE bursary.personal_details
       SET bursary = $1, allocation_date = CURRENT_TIMESTAMP
       WHERE user_id = $2`,
      [Number(bursary), userId]
    );

    await pool.query(
      `INSERT INTO bursary.activity_log (log_message)
       VALUES ($1)`,
      [
        `Allocated Ksh ${bursary} to ${studentName} (user ID: ${userId})`,
      ]
    );

    res.json({
      message: `Allocated Ksh ${bursary} to ${studentName}`,
    });
  } catch (error) {
    console.error(
      'Error updating bursary or logging activity:',
      error
    );
    res.status(500).json({
      error: 'Error updating bursary and date',
    });
  }
});

/* ------------------------------ Users --------------------------- */

app.get('/api/users', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, phone_number FROM bursary.users'
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/api/users', async (req, res) => {
  const { fullname, email, password, role } = req.body;

  if (!fullname || !email || !password || !role) {
    return res.status(400).json({
      message: 'All fields are required',
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO bursary.users
       (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [fullname, email, hashedPassword, role]
    );

    await pool.query(
      'INSERT INTO bursary.activity_log (log_message) VALUES ($1)',
      [`Added new user ${fullname}`]
    );

    res.status(201).json({
      message: 'User added',
      userId: result.rows[0].id,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT name FROM bursary.users WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const userFullName = result.rows[0].name;

    await pool.query(
      'DELETE FROM bursary.users WHERE id = $1',
      [req.params.id]
    );

    await pool.query(
      'INSERT INTO bursary.activity_log (log_message) VALUES ($1)',
      [`Deleted user ${userFullName}`]
    );

    res.status(200).json({
      message: 'User deleted',
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

/* -------------------------- Activity Logs ----------------------- */

app.get('/api/activity-logs', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM bursary.activity_log'
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).send(error);
  }
});

/* ---------------------------- Funds ----------------------------- */

app.post('/api/bursary-funds', async (req, res) => {
  const { amount, ward_allocated } = req.body;

  if (!amount || isNaN(amount) || !ward_allocated) {
    return res.status(400).json({
      message: 'Invalid amount or ward provided',
    });
  }

  try {
    await pool.query(
      `INSERT INTO bursary.bursary_funds
       (amount, ward_allocated)
       VALUES ($1, $2)`,
      [Number(amount), ward_allocated]
    );

    res.status(200).json({
      message: 'Funds disbursed successfully',
    });
  } catch (error) {
    console.error('Error inserting bursary funds:', error);
    res.status(500).json({
      message: 'Server error',
    });
  }
});

app.put('/api/adjust-funds', async (req, res) => {
  const { amount, ward_allocated } = req.body;
  const id = 1;

  try {
    await pool.query(
      `UPDATE bursary.bursary_funds
       SET amount = $1, ward_allocated = $2
       WHERE id = $3`,
      [amount, ward_allocated, id]
    );

    await pool.query(
      'INSERT INTO bursary.activity_log (log_message) VALUES ($1)',
      [
        `Bursary fund for ${ward_allocated} adjusted to ${amount} shillings.`,
      ]
    );

    res.status(200).json({
      message: 'Fund allocation adjusted successfully!',
    });
  } catch (error) {
    console.error('Error adjusting funds:', error);
    res.status(500).json({
      message: 'Failed to adjust fund allocation.',
    });
  }
});

/* --------------------------- Forgot Password -------------------- */

app.post('/api/forgot-password', async (req, res) => {
  const { identifier } = req.body;

  if (!identifier) {
    return res.status(400).json({
      error: 'Email is required.',
    });
  }

  const resetCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return res.status(500).json({
        error: 'Email service is not configured',
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: identifier,
      subject: 'Password Reset Code',
      text: `Your password reset code is: ${resetCode}`,
    });

    await pool.query(
      'INSERT INTO bursary.activity_log (log_message) VALUES ($1)',
      [`Password reset code sent to ${identifier}`]
    );

    res.status(200).json({
      message: 'Reset code sent successfully.',
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      error:
        'Failed to send reset code. Please try again later.',
    });
  }
});

/* ------------------------- User Report -------------------------- */

app.get('/api/user-report/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         fullname,
         admission AS admission,
         institution,
         status,
         bursary AS "amountAllocated"
       FROM bursary.personal_details
       WHERE user_id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({
      error: 'Internal Server Error',
    });
  }
});

/* ----------------------- Signature Upload ------------------------ */

function sha256(buffer) {
  return crypto
    .createHash('sha256')
    .update(buffer)
    .digest('hex');
}

function signatureUrl(req, filename) {
  return `${req.protocol}://${req.get('host')}/uploads/signatures/${filename}`;
}

app.post(
  '/api/upload-signature',
  authenticateToken,
  upload.single('signature'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
      });
    }

    try {
      const buffer = fs.readFileSync(req.file.path);
      const hash = sha256(buffer);

      let extension = 'jpg';

      if (req.file.mimetype === 'image/png') {
        extension = 'png';
      } else if (req.file.mimetype === 'image/gif') {
        extension = 'gif';
      }

      const filename = `${hash}.${extension}`;
      const destination = path.join(SIGN_DIR, filename);

      if (!fs.existsSync(destination)) {
        fs.renameSync(req.file.path, destination);
      } else {
        fs.unlinkSync(req.file.path);
      }

      const url = signatureUrl(req, filename);

      await pool.query(
        `UPDATE bursary.profile_committee
         SET signature = $1
         WHERE email = $2`,
        [url, req.user.email]
      );

      res.json({ url });
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      console.error('Signature upload error:', error);
      res.status(500).json({
        error: 'Upload error',
      });
    }
  }
);

/* ---------------------------- Bursary --------------------------- */

app.get('/api/get-bursary/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         ud.*,
         pd.fullname,
         pd.admission,
         pd.institution
       FROM bursary.uploaded_document ud
       JOIN bursary.personal_details pd
         ON ud.user_id = pd.user_id
       WHERE pd.user_id = $1`,
      [req.params.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching bursary details:', error);
    res.status(500).send('Error fetching data');
  }
});

app.get('/api/get-bursary', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         ud.*,
         pd.fullname,
         pd.admission,
         pd.institution
       FROM bursary.uploaded_document ud
       JOIN bursary.personal_details pd
         ON ud.user_id = pd.user_id`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching bursary details:', error);
    res.status(500).send('Error fetching data');
  }
});

/* ---------------------- Committee Notifications ----------------- */

app.post('/api/notify-committee-update/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT status, approved_by_committee
       FROM bursary.personal_details
       WHERE user_id = $1`,
      [req.params.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Student not found',
      });
    }

    const {
      status,
      approved_by_committee,
    } = result.rows[0];

    if (!approved_by_committee || status === 'Pending') {
      return res.json({
        message:
          'No notification needed (status is pending)',
        notified: false,
      });
    }

    if (status === 'Incomplete') {
      const committeeResult = await pool.query(
        `UPDATE bursary.profile_committee
         SET
           status_message =
             'The student has updated his/her information.',
           is_new = true
         WHERE fullname = $1
         RETURNING
           id,
           fullname,
           status_message,
           is_new`,
        [approved_by_committee]
      );

      if (committeeResult.rows.length === 0) {
        return res.status(404).json({
          message: 'Committee member not found',
        });
      }

      return res.json({
        message:
          'Notification sent to reviewing committee member',
        notified: true,
        committee: committeeResult.rows[0],
      });
    }

    res.json({
      message: 'No notification required for this status',
      notified: false,
    });
  } catch (error) {
    console.error(
      'Error processing committee notification:',
      error
    );
    res.status(500).json({
      message: 'Server error',
    });
  }
});

app.get(
  '/api/committee/status-message',
  authenticateToken,
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT status_message, is_new
         FROM bursary.profile_committee
         WHERE email = $1`,
        [req.user.email]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: 'Committee member not found',
        });
      }

      res.json({
        status_message:
          result.rows[0].status_message ?? null,
        is_new: result.rows[0].is_new ?? false,
      });
    } catch (error) {
      console.error(
        'Error fetching committee status_message:',
        error
      );
      res.status(500).send('Database error');
    }
  }
);

app.post(
  '/api/committee/status-message/read',
  authenticateToken,
  async (req, res) => {
    try {
      const result = await pool.query(
        `UPDATE bursary.profile_committee
         SET is_new = false
         WHERE email = $1
         RETURNING status_message, is_new`,
        [req.user.email]
      );

      res.json(result.rows[0] || {});
    } catch (error) {
      console.error(
        'Error updating is_new flag:',
        error
      );
      res.status(500).send('Database error');
    }
  }
);

/* ---------------------------- Server ---------------------------- */

app.use((error, _req, res, _next) => {
  if (error.message?.includes('CORS')) {
    return res.status(403).json({
      message: error.message,
    });
  }

  console.error(error);
  res.status(500).json({
    message: 'Server error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});