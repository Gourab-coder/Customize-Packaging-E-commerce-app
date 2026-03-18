const { pool } = require('../config/db');

const normalizeImageUrls = (imageUrls) => {
  if (!Array.isArray(imageUrls)) {
    return [];
  }

  return imageUrls
    .map((url) => String(url).trim())
    .filter((url) => url.length > 0);
};

const mapProductsWithImages = (products, imageRows) => {
  const imageMap = imageRows.reduce((acc, item) => {
    if (!acc[item.product_id]) {
      acc[item.product_id] = [];
    }
    acc[item.product_id].push(item.image_url);
    return acc;
  }, {});

  return products.map((product) => ({
    ...product,
    images: imageMap[product.id] || []
  }));
};

const getProducts = async (req, res) => {
  try {
    const [products] = await pool.query(
      `SELECT p.id, p.name, p.description, p.price, p.stock, p.category_id, p.created_at,
              c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY p.id DESC`
    );

    const [images] = await pool.query('SELECT product_id, image_url FROM product_images');
    return res.json(mapProductsWithImages(products, images));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const [products] = await pool.query(
      `SELECT p.id, p.name, p.description, p.price, p.stock, p.category_id, p.created_at,
              c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?
       LIMIT 1`,
      [req.params.id]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const [images] = await pool.query('SELECT image_url FROM product_images WHERE product_id = ?', [req.params.id]);
    return res.json({ ...products[0], images: images.map((item) => item.image_url) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch product', error: error.message });
  }
};

const createProduct = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { name, description, price, stock, category_id, image_urls } = req.body;

    if (!name || price === undefined || stock === undefined || !category_id) {
      return res.status(400).json({
        message: 'name, price, stock and category_id are required'
      });
    }

    await connection.beginTransaction();

    const [categoryRows] = await connection.query('SELECT id FROM categories WHERE id = ? LIMIT 1', [category_id]);
    if (categoryRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Category not found' });
    }

    const [result] = await connection.query(
      'INSERT INTO products (name, description, price, stock, category_id) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), description || null, price, stock, category_id]
    );

    const productId = result.insertId;
    const cleanImageUrls = normalizeImageUrls(image_urls);

    if (cleanImageUrls.length > 0) {
      const imageValues = cleanImageUrls.map((url) => [productId, url]);
      await connection.query('INSERT INTO product_images (product_id, image_url) VALUES ?', [imageValues]);
    }

    await connection.commit();
    return res.status(201).json({ message: 'Product created successfully', product_id: productId });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ message: 'Failed to create product', error: error.message });
  } finally {
    connection.release();
  }
};

const updateProduct = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { name, description, price, stock, category_id, image_urls } = req.body;
    const productId = Number(req.params.id);

    if (!name || price === undefined || stock === undefined || !category_id) {
      return res.status(400).json({
        message: 'name, price, stock and category_id are required'
      });
    }

    await connection.beginTransaction();

    const [result] = await connection.query(
      'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category_id = ? WHERE id = ?',
      [name.trim(), description || null, price, stock, category_id, productId]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Product not found' });
    }

    if (Array.isArray(image_urls)) {
      await connection.query('DELETE FROM product_images WHERE product_id = ?', [productId]);

      const cleanImageUrls = normalizeImageUrls(image_urls);
      if (cleanImageUrls.length > 0) {
        const imageValues = cleanImageUrls.map((url) => [productId, url]);
        await connection.query('INSERT INTO product_images (product_id, image_url) VALUES ?', [imageValues]);
      }
    }

    await connection.commit();
    return res.json({ message: 'Product updated successfully' });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ message: 'Failed to update product', error: error.message });
  } finally {
    connection.release();
  }
};

const deleteProduct = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query('DELETE FROM product_images WHERE product_id = ?', [req.params.id]);
    const [result] = await connection.query('DELETE FROM products WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Product not found' });
    }

    await connection.commit();
    return res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ message: 'Failed to delete product', error: error.message });
  } finally {
    connection.release();
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
