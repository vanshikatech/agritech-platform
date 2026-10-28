import React, { useState, useEffect } from 'react';
import { MarketAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const CATEGORIES = ['All', 'Seeds', 'Fertilizers', 'Organic Pesticides', 'Irrigation Tools'];

const Marketplace = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { cartItems, addToCart, removeFromCart, clearCart, totalAmount, totalCount } = useCart();

  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const [shippingData, setShippingData] = useState({
    address: 'Near Kisan Mandi Road',
    village: user?.location?.village || 'Baramati',
    district: user?.location?.district || 'Pune',
    state: user?.location?.state || 'Maharashtra',
    pincode: '413102',
    phone: user?.phone || '+91 9876543210',
    paymentMethod: 'Cash on Delivery (COD)',
  });

  const fetchProducts = async (cat) => {
    setLoading(true);
    try {
      const data = await MarketAPI.getProducts(cat === 'All' ? '' : cat);
      setProducts(data || []);
      setLoadError('');
    } catch (err) {
      console.error(err);
      setProducts([]);
      setLoadError(err.response?.data?.message || 'Could not load products. Check that the API is available.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(selectedCategory);
  }, [selectedCategory]);

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    try {
      const orderPayload = {
        orderItems: cartItems,
        shippingAddress: shippingData,
        paymentMethod: shippingData.paymentMethod,
        totalAmount,
      };

      await MarketAPI.createOrder(orderPayload);
      clearCart();
      setShowCheckoutModal(false);
      setOrderSuccess(true);
    } catch (err) {
      alert('Order placement failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="container py-4">
      {loadError && <div className="alert alert-danger" role="alert">{loadError}</div>}
      {/* Header and Cart Trigger */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">🛒 {t('marketplace')}</h2>
          <p className="text-muted small mb-0">Quality agricultural inputs, certified hybrid seeds, and organic fertilizers</p>
        </div>
        <div>
          <button
            className="btn btn-warning rounded-pill px-4 fw-bold shadow-sm"
            onClick={() => setShowCheckoutModal(true)}
            disabled={cartItems.length === 0}
          >
            <i className="bi bi-cart3 me-1"></i> {t('cart')} ({totalCount} items - ₹{totalAmount})
          </button>
        </div>
      </div>

      {orderSuccess && (
        <div className="alert alert-success alert-dismissible fade show rounded-4 p-4 shadow-sm mb-4" role="alert">
          <div className="d-flex align-items-center">
            <span className="fs-1 me-3">🎉</span>
            <div>
              <h5 className="alert-heading fw-bold mb-1">Order Placed Successfully!</h5>
              <p className="mb-0">
                Your agricultural supplies order has been recorded. Delivery estimate is 2-3 days directly to your village.
              </p>
            </div>
          </div>
          <button type="button" className="btn-close" onClick={() => setOrderSuccess(false)}></button>
        </div>
      )}

      {/* Category Pills */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`btn btn-sm rounded-pill px-3 ${
              selectedCategory === cat ? 'btn-success fw-bold' : 'btn-outline-secondary'
            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="card text-center p-5 border-0 shadow-sm rounded-4">
          <h5>No products in this category</h5>
        </div>
      ) : (
        <div className="row g-4">
          {products.map((prod) => (
            <div key={prod._id} className="col-sm-6 col-lg-4">
              <div className="agri-card h-100 d-flex flex-column justify-content-between overflow-hidden">
                <img
                  src={prod.imageUrl}
                  alt={prod.name}
                  className="w-100"
                  style={{ height: '180px', objectFit: 'cover' }}
                />
                <div className="p-4 flex-grow-1 d-flex flex-column justify-content-between">
                  <div>
                    <span className="badge bg-success-subtle text-success border border-success-subtle mb-2">
                      {prod.category}
                    </span>
                    <h5 className="fw-bold mb-1">{prod.name}</h5>
                    <p className="small text-muted mb-3">{prod.description}</p>
                  </div>

                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <span className="fs-4 fw-bold text-success">₹{prod.price}</span>
                        <small className="text-muted ms-1">/ {prod.unit}</small>
                      </div>
                      <span className="badge bg-light text-secondary border">Stock: {prod.stock || 50}</span>
                    </div>

                    <button
                      className="btn btn-outline-success w-100 rounded-pill fw-semibold"
                      onClick={() => addToCart(prod, 1)}
                    >
                      <i className="bi bi-cart-plus me-1"></i> {t('addToCart')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cart & Checkout Modal */}
      {showCheckoutModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-success">
                  <i className="bi bi-bag-check me-2"></i> Review Cart &amp; Confirm Order
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowCheckoutModal(false)}></button>
              </div>

              <div className="modal-body">
                {cartItems.length === 0 ? (
                  <p className="text-center py-4 text-muted">Your cart is currently empty.</p>
                ) : (
                  <div className="row g-4">
                    {/* Items List */}
                    <div className="col-md-6 border-end">
                      <h6 className="fw-bold mb-3">Order Items ({totalCount})</h6>
                      <div className="d-flex flex-column gap-2" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        {cartItems.map((item) => (
                          <div key={item.productId} className="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                            <div>
                              <div className="fw-semibold small">{item.name}</div>
                              <small className="text-muted">
                                {item.quantity} x ₹{item.price}
                              </small>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <span className="fw-bold small">₹{item.price * item.quantity}</span>
                              <button
                                className="btn btn-sm btn-outline-danger border-0 p-0"
                                onClick={() => removeFromCart(item.productId)}
                              >
                                <i className="bi bi-x-circle"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="d-flex justify-content-between mt-3 pt-3 border-top fw-bold fs-5 text-success">
                        <span>Total Payable:</span>
                        <span>₹{totalAmount}</span>
                      </div>
                    </div>

                    {/* Shipping Form */}
                    <div className="col-md-6">
                      <h6 className="fw-bold mb-3">Delivery Destination</h6>
                      <form onSubmit={handleCheckoutSubmit}>
                        <div className="mb-2">
                          <label className="form-label small fw-semibold">Delivery Address</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={shippingData.address}
                            onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                            required
                          />
                        </div>
                        <div className="row g-2 mb-2">
                          <div className="col-6">
                            <label className="form-label small fw-semibold">Village</label>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={shippingData.village}
                              onChange={(e) => setShippingData({ ...shippingData, village: e.target.value })}
                              required
                            />
                          </div>
                          <div className="col-6">
                            <label className="form-label small fw-semibold">District</label>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={shippingData.district}
                              onChange={(e) => setShippingData({ ...shippingData, district: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div className="row g-2 mb-3">
                          <div className="col-6">
                            <label className="form-label small fw-semibold">Pincode</label>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={shippingData.pincode}
                              onChange={(e) => setShippingData({ ...shippingData, pincode: e.target.value })}
                              required
                            />
                          </div>
                          <div className="col-6">
                            <label className="form-label small fw-semibold">Phone</label>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={shippingData.phone}
                              onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label small fw-semibold">Payment Mode</label>
                          <select
                            className="form-select form-select-sm"
                            value={shippingData.paymentMethod}
                            onChange={(e) => setShippingData({ ...shippingData, paymentMethod: e.target.value })}
                          >
                            <option value="Cash on Delivery (COD)">Cash on Delivery (COD)</option>
                            <option value="UPI / NetBanking">UPI / NetBanking</option>
                            <option value="Kisan Credit Card (KCC)">Kisan Credit Card (KCC)</option>
                          </select>
                        </div>

                        <button type="submit" className="btn btn-success w-100 rounded-pill py-2 fw-bold">
                          Confirm &amp; Place Order (₹{totalAmount})
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
