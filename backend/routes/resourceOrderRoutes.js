const express = require('express');
const resourcesRouter = express.Router();
const ordersRouter = express.Router();
const {
  getProducts,
  getAllProducts,
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
resourcesRouter.get('/products', getProducts);
resourcesRouter.get('/admin/catalog', protect, adminOnly, getAllProducts);
resourcesRouter.post('/products', protect, adminOnly, createProduct);
resourcesRouter.put('/products/:id', protect, adminOnly, updateProduct);
resourcesRouter.delete('/products/:id', protect, adminOnly, deleteProduct);

// Order routes
ordersRouter.post('/', protect, createOrder);
ordersRouter.get('/my-orders', protect, getMyOrders);
ordersRouter.get('/all', protect, adminOnly, getAllOrders);
ordersRouter.put('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = { resourcesRouter, ordersRouter };
