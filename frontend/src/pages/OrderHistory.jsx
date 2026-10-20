import React, { useState, useEffect } from 'react';
import { MarketAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

const OrderHistory = () => {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await MarketAPI.getMyOrders();
        setOrders(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-success';
      case 'Dispatched':
      case 'Out for Delivery':
        return 'bg-primary';
      case 'Confirmed':
        return 'bg-info text-dark';
      default:
        return 'bg-warning text-dark';
    }
  };

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">📦 {t('orderHistory')}</h2>
        <p className="text-muted small mb-0">Track farm inputs deliveries and purchase records</p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="card text-center p-5 border-0 shadow-sm rounded-4">
          <div className="fs-1 mb-2">📦</div>
          <h5 className="fw-bold">No Orders Placed Yet</h5>
          <p className="text-muted small">You haven't ordered any seeds or fertilizers yet.</p>
          <div>
            <Link to="/marketplace" className="btn btn-success rounded-pill px-4">
              Explore Agri Store
            </Link>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {orders.map((order) => (
            <div key={order._id} className="agri-card p-4">
              <div className="d-flex flex-wrap justify-content-between align-items-center pb-3 border-bottom mb-3">
                <div>
                  <span className="text-muted small">Order ID: #{order._id.slice(-8)}</span>
                  <div className="fw-bold">
                    Placed on: {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="d-flex align-items-center gap-3 mt-2 mt-sm-0">
                  <span className={`badge ${getStatusBadge(order.orderStatus)} px-3 py-2 rounded-pill`}>
                    {order.orderStatus}
                  </span>
                  <span className="fs-5 fw-bold text-success">₹{order.totalAmount}</span>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-7">
                  <h6 className="small fw-bold text-muted mb-2">ITEMS PURCHASED</h6>
                  <ul className="list-unstyled mb-0">
                    {order.orderItems?.map((item, idx) => (
                      <li key={idx} className="small d-flex justify-content-between py-1 border-bottom border-light">
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        <span className="fw-semibold">₹{item.price * item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="col-md-5">
                  <h6 className="small fw-bold text-muted mb-2">SHIPPING ADDRESS</h6>
                  <p className="small text-muted mb-1">
                    {order.shippingAddress?.address}, {order.shippingAddress?.village}
                  </p>
                  <p className="small text-muted mb-1">
                    {order.shippingAddress?.district}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                  </p>
                  <p className="small text-muted mb-0">
                    <strong>Payment:</strong> {order.paymentMethod}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
