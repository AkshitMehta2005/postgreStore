import { sql } from '../config/db.js';
import redisClient from '../config/redisclient.js';

// GET ALL PRODUCTS — with Redis cache
export const getProducts = async (req, res) => {
  try {
    const cacheData = await redisClient.get("products");

    if (cacheData) {
      console.log("Serving from Redis cache");
      return res.status(200).json({ success: true, data: JSON.parse(cacheData) });
    }

    const products = await sql`SELECT * FROM products ORDER BY created_at DESC`;

    // Save to Redis cache for 1 hour
    await redisClient.setEx("products", 3600, JSON.stringify(products));

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.log("Error in getProducts function", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// CREATE PRODUCT — clear cache after insert
export const createProducts = async (req, res) => {
  const { name, image, price } = req.body;

  if (!name || !image || !price) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    const newProduct = await sql`
      INSERT INTO products (name, price, image)
      VALUES (${name}, ${price}, ${image})
      RETURNING *
    `;

    // Clear products cache
    await redisClient.del("products");

    res.status(201).json({
      success: true,
      message: "New product has been created",
      data: newProduct[0],
    });
  } catch (error) {
    console.log("Error in createProducts function", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// GET SINGLE PRODUCT — with Redis cache
export const getProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const cacheData = await redisClient.get(`product:${id}`);

    if (cacheData) {
      console.log(`Serving product ${id} from Redis`);
      return res.status(200).json({ success: true, data: JSON.parse(cacheData) });
    }

    const fetchProduct = await sql`SELECT * FROM products WHERE id = ${id}`;

    if (!fetchProduct.length) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    await redisClient.setEx(`product:${id}`, 3600, JSON.stringify(fetchProduct[0]));

    res.status(200).json({ success: true, data: fetchProduct[0] });
  } catch (error) {
    console.log("Error in getProduct function", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// UPDATE PRODUCT — clear related caches
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, image, price } = req.body;

  try {
    const updatedProduct = await sql`
      UPDATE products
      SET name = ${name}, price = ${price}, image = ${image}
      WHERE id = ${id}
      RETURNING *
    `;

    if (updatedProduct.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Clear both product list & specific product cache
    await redisClient.del("products");
    await redisClient.del(`product:${id}`);

    res.status(200).json({ success: true, data: updatedProduct[0] });
  } catch (error) {
    console.log("Error in updateProduct function", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// DELETE PRODUCT — clear related caches
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedProduct = await sql`
      DELETE FROM products
      WHERE id = ${id}
      RETURNING *
    `;

    if (deletedProduct.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Clear both product list & specific product cache
    await redisClient.del("products");
    await redisClient.del(`product:${id}`);

    res.status(200).json({ success: true, data: deletedProduct[0] });
  } catch (error) {
    console.log("Error in deleteProduct function", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
