const express = require('express');
const router = express.Router();
const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/resourceOrderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Resource / Product routes
router.get('/products', getProducts);
router.post('/products', protect, adminOnly, createProduct);
router.put('/products/:id', protect, adminOnly, updateProduct);
router.delete('/products/:id', protect, adminOnly, deleteProduct);

// Order routes
router.post('/orders', protect, createOrder);
router.get('/orders/my-orders', protect, getMyOrders);
router.get('/orders/all', protect, adminOnly, getAllOrders);
router.put('/orders/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;
