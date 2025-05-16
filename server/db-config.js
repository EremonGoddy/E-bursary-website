const { Pool } = require('pg');

// Load environment variables from .env file
require('dotenv').config();

// Create a new pool of connections
const pool = new Pool({
  host: process.env.DATABASE_HOST,       // Database host from Render
  port: parseInt(process.env.DATABASE_PORT, 10), // Port should be a number
  user: process.env.DATABASE_USER,       // Database username
  password: process.env.DATABASE_PASSWORD, // Database password
  database: process.env.DATABASE_NAME,   // Database name
  ssl: {
    rejectUnauthorized: false,           // Necessary for connecting to Render's managed databases
  }
});
app.post("/api/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const userQuery = "SELECT * FROM users WHERE email = $1";
    const userResult = await db.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResult.rows[0];

    if (!user.password) {
      return res.status(500).json({ message: "User record is missing password hash" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // ... rest of the original code
    const studentResult = await db.query("SELECT * FROM personal_details WHERE email = $1", [email]);
    const committeeResult = await db.query("SELECT * FROM profile_committee WHERE email = $1", [email]);

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
// Function to test the connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to the PostgreSQL database!');
    client.release();
  } catch (err) {
    console.error('❌ Error connecting to the PostgreSQL database:', err.stack);
  }
};

testConnection();

module.exports = pool;
