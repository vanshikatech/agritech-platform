const { sendControllerError } = require('../middleware/errorMiddleware');
const Product = require('../models/Product');
const Order = require('../models/Order');

// ---------------- PRODUCTS / RESOURCES ---------------- //

// @desc    Get all available agricultural products
// @route   GET /api/resources
// @access  Public / Private
const getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { inStock: true, stock: { $gt: 0 } };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      const escapedSearch = search.trim().slice(0, 80).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.name = { $regex: escapedSearch, $options: 'i' };
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

// @desc    Create new agricultural product (Admin)
// @route   POST /api/resources
// @access  Private / Admin
const createProduct = async (req, res) => {
  try {
    const { name, category, price, unit, stock, description, imageUrl } = req.body;

    const product = await Product.create({
      name,
      category,
      price,
      unit: unit || 'kg',
      stock: stock ?? 100,
      description,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=500&auto=format&fit=crop&q=60',
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

// @desc    Update product (Admin)
// @route   PUT /api/resources/:id
// @access  Private / Admin
const updateProduct = async (req, res) => {
  try {
    const fields = ['name', 'category', 'price', 'unit', 'stock', 'description', 'imageUrl', 'inStock'];
    const update = Object.fromEntries(Object.entries(req.body).filter(([key]) => fields.includes(key)));
    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

// @desc    Delete product (Admin)
// @route   DELETE /api/resources/:id
// @access  Private / Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    await product.deleteOne();
    res.json({ success: true, message: 'Product removed' });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

// ---------------- ORDERS ---------------- //

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;

    if (!Array.isArray(orderItems) || orderItems.length === 0 || orderItems.length > 50) {
      return res.status(400).json({ success: false, message: 'Provide between 1 and 50 order items' });
    }

    const quantities = new Map();
    for (const item of orderItems) {
      if (!item || typeof item !== 'object') return res.status(400).json({ success: false, message: 'Order items must be objects' });
      const quantity = Number(item.quantity);
      if (!item.productId || !Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ success: false, message: 'Each order item needs a valid product and positive whole-number quantity.' });
      }
      quantities.set(String(item.productId), (quantities.get(String(item.productId)) || 0) + quantity);
    }

    const normalizedItems = [];
    const reserved = [];
    const restoreReservedStock = async () => Promise.allSettled(reserved.map(({ id, count }) => Product.findByIdAndUpdate(id, { $inc: { stock: count } })));
    try {
      for (const [productId, quantity] of quantities) {
        // Conditional decrement prevents concurrent checkouts from overselling stock.
        const product = await Product.findOneAndUpdate(
          { _id: productId, inStock: true, stock: { $gte: quantity } },
          { $inc: { stock: -quantity } },
          { new: true, runValidators: true }
        );
        if (!product) {
          const stockError = new Error('An item is unavailable or has insufficient stock. Refresh the catalog and try again.');
          stockError.statusCode = 409;
          throw stockError;
        }
        reserved.push({ id: product._id, count: quantity });
        normalizedItems.push({ productId: product._id, name: product.name, unit: product.unit, price: product.price, quantity });
      }
    } catch (error) {
      await restoreReservedStock();
      throw error;
    }
    const totalAmount = normalizedItems.reduce((total, item) => total + item.price * item.quantity, 0);

    let order;
    try {
      order = await Order.create({
        userId: req.user._id,
        orderItems: normalizedItems,
        shippingAddress,
        paymentMethod: paymentMethod || 'Cash on Delivery (COD)',
        totalAmount,
        orderStatus: 'Order Placed',
      });
    } catch (error) {
      await restoreReservedStock();
      throw error;
    }

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private / Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private / Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const allowedStatuses = ['Order Placed', 'Confirmed', 'Dispatched', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!allowedStatuses.includes(orderStatus)) return res.status(400).json({ success: false, message: 'Invalid order status' });
    if (order.orderStatus === 'Cancelled' && orderStatus !== 'Cancelled') return res.status(409).json({ success: false, message: 'Cancelled orders cannot be reopened' });
    if (orderStatus === 'Cancelled' && order.orderStatus !== 'Cancelled') {
      await Promise.all(order.orderItems.map((item) => Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } })));
    }
    order.orderStatus = orderStatus;
    const updatedOrder = await order.save();

    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

module.exports = {
  getProducts,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
};
