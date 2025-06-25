import { sql } from '../config/db.js';

export const getProducts = async (req, res) => {
  try {
    const products = await sql`
      SELECT * FROM products ORDER BY created_at DESC
    `;
    res.status(200).json({ success: true, data: products });
    console.log("All products fetched", products);
  } catch (error) {
    console.log("Error in getProducts function", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const createProducts = async (req, res) => {
  const { name, image, price } = req.body;

  if (!name || !image || !price) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const newProduct = await sql`
      INSERT INTO products (name, price, image)
      VALUES (${name}, ${price}, ${image})
      RETURNING *
    `;

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

export const getProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const fetchProduct = await sql`
      SELECT * FROM products WHERE id = ${id}
    `;

    res.status(200).json({ success: true, data: fetchProduct[0] });
  } catch (error) {
    console.log("Error in getProduct function", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

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
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({ success: true, data: updatedProduct[0] });
  } catch (error) {
    console.log("Error in updateProduct function", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedProduct = await sql`
      DELETE FROM products
      WHERE id = ${id}
      RETURNING *
    `;

    if (deletedProduct.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({ success: true, data: deletedProduct[0] });
  } catch (error) {
    console.log("Error in deleteProduct function", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
