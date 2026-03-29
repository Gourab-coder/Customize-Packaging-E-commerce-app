const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT, // 🔥 IMPORTANT
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,

  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,

  // ssl: {
  //   rejectUnauthorized: false // 🔥 REQUIRED for Railway
  // }
});

const deriveCloudinaryPublicId = (imageUrl) => {
  if (typeof imageUrl !== 'string' || !imageUrl.includes('/upload/')) {
    return null;
  }

  try {
    const parsedUrl = new URL(imageUrl);
    if (!parsedUrl.hostname.includes('cloudinary.com')) {
      return null;
    }

    const uploadIndex = parsedUrl.pathname.indexOf('/upload/');
    if (uploadIndex === -1) {
      return null;
    }

    const assetPath = parsedUrl.pathname.slice(uploadIndex + '/upload/'.length);
    const segments = assetPath.split('/').filter(Boolean);
    if (segments.length === 0) {
      return null;
    }

    const cleanedSegments = segments[0].match(/^v\d+$/) ? segments.slice(1) : segments.slice();
    if (cleanedSegments.length === 0) {
      return null;
    }

    cleanedSegments[cleanedSegments.length - 1] = cleanedSegments[cleanedSegments.length - 1].replace(/\.[^.]+$/, '');
    return cleanedSegments.join('/');
  } catch (error) {
    return null;
  }
};

const ensureProductImagePublicIdColumn = async () => {
  const [columns] = await pool.query("SHOW COLUMNS FROM product_images LIKE 'public_id'");

  if (columns.length === 0) {
    await pool.query('ALTER TABLE product_images ADD COLUMN public_id VARCHAR(255) NULL AFTER image_url');
  }
};

const backfillProductImagePublicIds = async () => {
  const [rows] = await pool.query(
    'SELECT id, image_url FROM product_images WHERE public_id IS NULL OR public_id = ""'
  );

  for (const row of rows) {
    const publicId = deriveCloudinaryPublicId(row.image_url);
    if (!publicId) {
      continue;
    }

    await pool.query('UPDATE product_images SET public_id = ? WHERE id = ?', [publicId, row.id]);
  }
};

const ensureAppTables = async () => {
  await ensureProductImagePublicIdColumn();
  await backfillProductImagePublicIds();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS consultation_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      contact_number VARCHAR(30) NOT NULL,
      preferred_call_time VARCHAR(20) NOT NULL,
      product_type VARCHAR(50) NOT NULL,
      product_details TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS quotation_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      whatsapp_number VARCHAR(30) NOT NULL,
      drive_link VARCHAR(500) NOT NULL,
      product_type VARCHAR(50) NOT NULL,
      product_description TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

const connectDB = async () => {
  const connection = await pool.getConnection();
  await connection.ping();
  connection.release();
  await ensureAppTables();
  console.log('Connected to MySQL (packaging DB)');
};

module.exports = { pool, connectDB };
