const { Pool } = require('pg');

const parseBoolean = (value) => ['1', 'true', 'yes', 'on', 'require'].includes(String(value).toLowerCase());

const createPoolConfig = () => {
  const baseConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL
      }
    : {
        host: process.env.PGHOST || process.env.POSTGRES_HOST || 'localhost',
        port: Number(process.env.PGPORT || process.env.POSTGRES_PORT || 5432),
        user: process.env.PGUSER || process.env.POSTGRES_USER,
        password: process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD,
        database: process.env.PGDATABASE || process.env.POSTGRES_DATABASE
      };

  const shouldUseSsl =
    parseBoolean(process.env.PGSSLMODE) ||
    parseBoolean(process.env.PG_SSL) ||
    parseBoolean(process.env.POSTGRES_SSL);

  return {
    ...baseConfig,
    max: Number(process.env.DB_CONNECTION_LIMIT) || 10,
    ssl: shouldUseSsl ? { rejectUnauthorized: false } : false
  };
};

const pgPool = new Pool(createPoolConfig());

const buildBulkValuesClause = (rows, startIndex) => {
  const values = [];
  let parameterIndex = startIndex;

  const clause = rows
    .map((row) => {
      if (!Array.isArray(row)) {
        throw new Error('Bulk insert values must be arrays');
      }

      const placeholders = row.map((value) => {
        values.push(value);
        return `$${parameterIndex++}`;
      });

      return `(${placeholders.join(', ')})`;
    })
    .join(', ');

  return {
    clause,
    nextIndex: parameterIndex,
    values
  };
};

const transformQuery = (sql, params = []) => {
  if (!Array.isArray(params) || params.length === 0) {
    return { text: sql, values: [] };
  }

  let text = '';
  let values = [];
  let searchStart = 0;
  let parameterIndex = 1;

  for (const param of params) {
    const placeholderIndex = sql.indexOf('?', searchStart);
    if (placeholderIndex === -1) {
      throw new Error('Query placeholder count does not match provided parameters');
    }

    const precedingSql = sql.slice(searchStart, placeholderIndex);
    text += precedingSql;

    if (Array.isArray(param)) {
      if (/\bVALUES\s*$/i.test(precedingSql)) {
        const { clause, nextIndex, values: bulkValues } = buildBulkValuesClause(param, parameterIndex);
        text += clause;
        values = values.concat(bulkValues);
        parameterIndex = nextIndex;
      } else if (/\bIN\s*\(\s*$/i.test(precedingSql)) {
        if (param.length === 0) {
          text += 'NULL';
        } else {
          const placeholders = param.map((value) => {
            values.push(value);
            return `$${parameterIndex++}`;
          });
          text += placeholders.join(', ');
        }
      } else {
        values.push(param);
        text += `$${parameterIndex++}`;
      }
    } else {
      values.push(param);
      text += `$${parameterIndex++}`;
    }

    searchStart = placeholderIndex + 1;
  }

  text += sql.slice(searchStart);
  return { text, values };
};

const withInsertedId = (sql) => {
  if (!/^\s*insert\s+into\b/i.test(sql) || /\breturning\b/i.test(sql)) {
    return sql;
  }

  return `${sql} RETURNING id`;
};

const normalizeResult = (result) => [
  result.rows,
  {
    affectedRows: result.rowCount,
    insertId: result.rows[0]?.id ?? null
  }
];

class PgConnection {
  constructor(client) {
    this.client = client;
  }

  async query(sql, params = []) {
    const transformed = transformQuery(withInsertedId(sql), params);
    const result = await this.client.query(transformed.text, transformed.values);
    return normalizeResult(result);
  }

  async beginTransaction() {
    await this.client.query('BEGIN');
  }

  async commit() {
    await this.client.query('COMMIT');
  }

  async rollback() {
    await this.client.query('ROLLBACK');
  }

  release() {
    this.client.release();
  }

  async ping() {
    await this.client.query('SELECT 1');
  }
}

const pool = {
  async query(sql, params = []) {
    const transformed = transformQuery(withInsertedId(sql), params);
    const result = await pgPool.query(transformed.text, transformed.values);
    return normalizeResult(result);
  },
  async getConnection() {
    const client = await pgPool.connect();
    return new PgConnection(client);
  }
};

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
  const [columns] = await pool.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'product_images'
       AND column_name = 'public_id'
     LIMIT 1`
  );

  if (columns.length === 0) {
    await pool.query('ALTER TABLE product_images ADD COLUMN public_id VARCHAR(255)');
  }
};

const backfillProductImagePublicIds = async () => {
  const [rows] = await pool.query(
    "SELECT id, image_url FROM product_images WHERE public_id IS NULL OR public_id = ''"
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
  await pool.query(`
    CREATE TABLE IF NOT EXISTS consultation_requests (
      id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      contact_number VARCHAR(30) NOT NULL,
      preferred_call_time VARCHAR(20) NOT NULL,
      product_type VARCHAR(50) NOT NULL,
      product_details TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS quotation_requests (
      id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      whatsapp_number VARCHAR(30) NOT NULL,
      drive_link VARCHAR(500) NOT NULL,
      product_type VARCHAR(50) NOT NULL,
      product_description TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await ensureProductImagePublicIdColumn();
  await backfillProductImagePublicIds();
};

const connectDB = async () => {
  const connection = await pool.getConnection();
  await connection.ping();
  connection.release();
  await ensureAppTables();
  console.log('Connected to PostgreSQL (packaging DB)');
};

module.exports = { pool, connectDB };
