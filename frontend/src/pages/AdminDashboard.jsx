import React, { useState, useEffect } from 'react';
import { AdminAPI, MarketAPI, WeatherAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [activity, setActivity] = useState([]);
  const [forumReports, setForumReports] = useState([]);
  const [productForm, setProductForm] = useState({ name: '', category: 'Seeds', price: '', unit: 'kg', stock: '1', description: '' });
  const [editingProductId, setEditingProductId] = useState(null);

  const [alertForm, setAlertForm] = useState({
    title: '',
    alertType: 'Pest Outbreak',
    severity: 'High',
    state: 'Maharashtra',
    district: 'Pune',
    affectedCrops: 'Wheat, Maize',
    preventiveAction: '',
    recommendedPesticideOrRemedy: '',
  });

  const fetchAdminData = async () => {
    try {
      const [data, userRows, orderRows, productRows, activityResult, reports] = await Promise.all([
        AdminAPI.getMetrics(), AdminAPI.getUsers(), MarketAPI.getAllOrders(), MarketAPI.getAdminProducts(), AdminAPI.getActivity(), AdminAPI.getForumReports(),
      ]);
      setMetrics(data);
      setUsers(userRows);
      setOrders(orderRows);
      setProducts(productRows);
      setActivity(activityResult.data || []);
      setForumReports(reports);
      setLoadError('');
    } catch (err) {
      console.error(err);
      setMetrics(null);
      setLoadError(err.response?.data?.message || 'Could not load admin metrics. Check that the API is available.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      const changed = await AdminAPI.updateUserRole(id, role);
      setUsers((rows) => rows.map((row) => row._id === id ? changed : row));
    } catch (err) { alert(err.response?.data?.message || 'Could not update user role.'); }
  };

  const handleOrderStatus = async (id, orderStatus) => {
    try {
      const changed = await MarketAPI.updateOrderStatus(id, orderStatus);
      setOrders((rows) => rows.map((row) => row._id === id ? changed : row));
    } catch (err) { alert(err.response?.data?.message || 'Could not update order status.'); }
  };

  const handleCreateProduct = async (event) => {
    event.preventDefault();
    try {
      const payload = { ...productForm, price: Number(productForm.price), stock: Number(productForm.stock) };
      const product = editingProductId ? await MarketAPI.updateProduct(editingProductId, payload) : await MarketAPI.createProduct(payload);
      setProducts((rows) => editingProductId ? rows.map((row) => row._id === product._id ? product : row) : [product, ...rows]);
      setEditingProductId(null);
      setProductForm({ name: '', category: 'Seeds', price: '', unit: 'kg', stock: '1', description: '' });
    } catch (err) { alert(err.response?.data?.message || 'Could not add product.'); }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Remove this catalog item? Existing order records will remain.')) return;
    try {
      await MarketAPI.deleteProduct(id);
      setProducts((rows) => rows.filter((row) => row._id !== id));
    } catch (err) { alert(err.response?.data?.message || 'Could not remove product.'); }
  };

  const handleModeratePost = async (postId, moderationStatus) => {
    try {
      await AdminAPI.moderateForumPost(postId, moderationStatus);
      setForumReports((rows) => rows.filter((post) => post._id !== postId));
    } catch (err) { alert(err.response?.data?.message || 'Could not moderate post.'); }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleBroadcastAlert = async (e) => {
    e.preventDefault();
    try {
      await WeatherAPI.createPestAlert({
        title: alertForm.title,
        alertType: alertForm.alertType,
        severity: alertForm.severity,
        region: { state: alertForm.state, district: alertForm.district },
        affectedCrops: alertForm.affectedCrops.split(',').map((s) => s.trim()),
        preventiveAction: alertForm.preventiveAction,
        recommendedPesticideOrRemedy: alertForm.recommendedPesticideOrRemedy,
      });

      alert('Pest Alert Broadcasted successfully to all farmers!');
      setShowAlertModal(false);
      fetchAdminData();
    } catch (err) {
      alert('Failed to broadcast alert: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="badge bg-danger mb-1">Restricted Access (Role: Admin)</span>
          <h2 className="fw-bold mb-1">🛡️ AgriTech Admin Management Portal</h2>
          <p className="text-muted small mb-0">System-wide monitoring, agricultural advisories, and database oversight</p>
        </div>
        <button className="btn btn-danger rounded-pill px-4 shadow-sm" onClick={() => setShowAlertModal(true)}>
          <i className="bi bi-broadcast me-1"></i> Broadcast Pest Alert
        </button>
      </div>

      {loadError && <div className="alert alert-danger" role="alert">{loadError}</div>}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status"></div>
        </div>
      ) : metrics ? (
        <>
          {/* Metrics Grid */}
          <div className="row g-3 mb-4">
            <div className="col-sm-6 col-lg-3">
              <div className="kpi-card info-kpi">
                <div className="text-muted small fw-semibold">Total Registered Users</div>
                <div className="display-6 fw-bold text-info my-1">{metrics.totalUsers}</div>
                <div className="small text-muted">{metrics.totalFarmers} Active Farmers</div>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="kpi-card">
                <div className="text-muted small fw-semibold">Managed Farm Plots</div>
                <div className="display-6 fw-bold text-success my-1">{metrics.totalFarms}</div>
                <div className="small text-muted">{metrics.totalCrops} Active Crop Cycles</div>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="kpi-card warning-kpi">
                <div className="text-muted small fw-semibold">Marketplace Revenue</div>
                <div className="display-6 fw-bold text-warning my-1">₹{metrics.totalRevenue}</div>
                <div className="small text-muted">{metrics.totalOrders} Orders Placed</div>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="kpi-card danger-kpi">
                <div className="text-muted small fw-semibold">Active Pest Alerts</div>
                <div className="display-6 fw-bold text-danger my-1">{metrics.activeAlerts}</div>
                <div className="small text-muted">Broadcast in System</div>
              </div>
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-xl-6">
              <section className="agri-card p-4 h-100" aria-labelledby="expert-management-title">
                <h3 id="expert-management-title" className="h5 fw-bold">Expert &amp; user access</h3>
                <p className="small text-muted">Assign or remove agronomist privileges. Admin accounts cannot be changed here.</p>
                <div className="table-responsive">
                  <table className="table table-sm align-middle mb-0"><thead><tr><th>User</th><th>Email</th><th>Role</th></tr></thead>
                    <tbody>{users.map((row) => <tr key={row._id}><td>{row.name}</td><td>{row.email}</td><td>
                      {row.role === 'admin' ? <span className="badge bg-dark">Admin</span> : <select aria-label={`Role for ${row.name}`} className="form-select form-select-sm" value={row.role} onChange={(e) => handleRoleChange(row._id, e.target.value)}><option value="farmer">Farmer</option><option value="expert">Expert</option></select>}
                    </td></tr>)}</tbody>
                  </table>
                </div>
              </section>
            </div>
            <div className="col-xl-6">
              <section className="agri-card p-4 h-100" aria-labelledby="admin-orders-title">
                <h3 id="admin-orders-title" className="h5 fw-bold">Order management</h3>
                <div className="table-responsive"><table className="table table-sm align-middle mb-0"><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
                  <tbody>{orders.slice(0, 10).map((order) => <tr key={order._id}><td>#{order._id.slice(-7)}</td><td>{order.userId?.name || 'Customer'}</td><td>₹{order.totalAmount}</td><td><select aria-label={`Status for order ${order._id}`} className="form-select form-select-sm" value={order.orderStatus} disabled={order.orderStatus === 'Cancelled'} onChange={(e) => handleOrderStatus(order._id, e.target.value)}>{['Order Placed', 'Confirmed', 'Dispatched', 'Out for Delivery', 'Delivered', 'Cancelled'].map((status) => <option key={status}>{status}</option>)}</select></td></tr>)}</tbody>
                </table></div>
                {orders.length === 0 && <p className="text-muted small mb-0">No orders yet.</p>}
              </section>
            </div>
            <div className="col-xl-7">
              <section className="agri-card p-4" aria-labelledby="admin-products-title">
                <h3 id="admin-products-title" className="h5 fw-bold">Resource catalog</h3>
                <form className="row g-2 mb-3" onSubmit={handleCreateProduct}>
                  <div className="col-12"><strong className="small">{editingProductId ? 'Edit catalog item' : 'Add catalog item'}</strong></div>
                  <div className="col-md-5"><label className="visually-hidden" htmlFor="product-name">Product name</label><input id="product-name" className="form-control form-control-sm" placeholder="Product name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} maxLength={120} required /></div>
                  <div className="col-md-3"><label className="visually-hidden" htmlFor="product-category">Category</label><select id="product-category" className="form-select form-select-sm" value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}>{['Seeds', 'Fertilizers', 'Organic Pesticides', 'Irrigation Tools', 'Farm Equipment'].map((item) => <option key={item}>{item}</option>)}</select></div>
                  <div className="col-md-2"><label className="visually-hidden" htmlFor="product-price">Price</label><input id="product-price" type="number" min="0" step="0.01" className="form-control form-control-sm" placeholder="₹ Price" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required /></div>
                  <div className="col-md-2"><label className="visually-hidden" htmlFor="product-stock">Stock</label><input id="product-stock" type="number" min="0" step="1" className="form-control form-control-sm" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} required /></div>
                  <div className="col-md-9"><label className="visually-hidden" htmlFor="product-description">Description</label><input id="product-description" className="form-control form-control-sm" placeholder="Description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} maxLength={500} required /></div>
                  <div className="col-md-3"><button className="btn btn-success btn-sm rounded-pill w-100" type="submit">{editingProductId ? 'Save product' : 'Add product'}</button></div>
                </form>
                <ul className="list-group list-group-flush">{products.slice(0, 20).map((product) => <li key={product._id} className="list-group-item d-flex justify-content-between align-items-center gap-2"><span>{product.name} <small className="text-muted">· ₹{product.price} · stock {product.stock}{product.inStock ? '' : ' · hidden'}</small></span><span className="d-flex gap-1"><button className="btn btn-sm btn-outline-success" type="button" onClick={() => { setEditingProductId(product._id); setProductForm({ name: product.name, category: product.category, price: String(product.price), unit: product.unit, stock: String(product.stock), description: product.description }); }}>Edit</button><button className="btn btn-sm btn-outline-danger" type="button" onClick={() => handleDeleteProduct(product._id)}>Remove</button></span></li>)}</ul>
              </section>
            </div>
            <div className="col-xl-5">
              <section className="agri-card p-4 h-100" aria-labelledby="activity-title">
                <h3 id="activity-title" className="h5 fw-bold">Recent activity</h3>
                {activity.length ? <ul className="list-unstyled small mb-0">{activity.slice(0, 10).map((entry) => <li key={entry._id} className="py-2 border-bottom"><strong>{entry.actorId?.name || 'Guest'}</strong> · {entry.action}<div className="text-muted">{new Date(entry.createdAt).toLocaleString()} · HTTP {entry.statusCode}</div></li>)}</ul> : <p className="text-muted small mb-0">No activity has been recorded yet.</p>}
              </section>
            </div>
            <div className="col-12">
              <section className="agri-card p-4" aria-labelledby="moderation-title">
                <h3 id="moderation-title" className="h5 fw-bold">Forum reports for moderation</h3>
                {forumReports.length ? forumReports.map((post) => <article key={post._id} className="border-top py-3">
                  <div className="d-flex flex-wrap justify-content-between gap-2"><div><strong>{post.title}</strong><p className="small mb-1">{post.question}</p><small className="text-muted">Reported {post.reports.filter((report) => report.status === 'Open').length} time(s)</small></div>
                    <div className="d-flex gap-2 align-items-start"><button type="button" className="btn btn-sm btn-outline-success" onClick={() => handleModeratePost(post._id, 'Visible')}>Keep visible</button><button type="button" className="btn btn-sm btn-danger" onClick={() => handleModeratePost(post._id, 'Hidden')}>Hide post</button></div></div>
                  {post.reports.filter((report) => report.status === 'Open').map((report) => <p key={report._id} className="small text-muted mt-2 mb-0">{report.reporterId?.name || 'User'}: {report.reason}</p>)}
                </article>) : <p className="small text-muted mb-0">No open reports.</p>}
              </section>
            </div>
          </div>

          {/* Admin Operations Section */}
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="agri-card p-4 h-100">
                <h5 className="fw-bold mb-3">🛠️ Admin Quick Controls</h5>
                <ul className="list-group list-group-flush small">
                  <li className="list-group-item d-flex justify-content-between align-items-center py-3">
                    <div>
                      <strong>Emergency Advisory Dispatch</strong>
                      <div className="text-muted">Broadcast weather warnings directly to farmers' dashboard banners</div>
                    </div>
                    <button className="btn btn-outline-danger btn-sm rounded-pill" onClick={() => setShowAlertModal(true)}>
                      Dispatch
                    </button>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center py-3">
                    <div>
                      <strong>Soil Diagnostic Engine</strong>
                      <div className="text-muted">Total tests logged: {metrics.totalSoilReports}</div>
                    </div>
                    <span className="badge bg-success">Algorithmic NPK Active</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center py-3">
                    <div>
                      <strong>Database Integrity &amp; Relational Indexing</strong>
                      <div className="text-muted">MongoDB Collections: Users, Farms, Crops, Soil, Alerts, Orders</div>
                    </div>
                    <span className="badge bg-primary">Connected</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="agri-card p-4 h-100">
                <h5 className="fw-bold mb-3">🌾 System Health &amp; Audit Status</h5>
                <div className="p-3 bg-light rounded-3 mb-3 small">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Role-Based JWT Security:</span>
                    <strong className="text-success">Enabled (bcrypt + Bearer Token)</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span>API Response Status:</span>
                    <strong className="text-success">200 OK</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Active Session:</span>
                    <strong>{user?.name} ({user?.email})</strong>
                  </div>
                </div>

                <div className="alert alert-info border-0 small mb-0">
                  <i className="bi bi-info-circle-fill me-1"></i> As an administrator, your responses in the Community Forum
                  will automatically receive the <strong>Verified Expert Advisory</strong> green badge.
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {/* Broadcast Alert Modal */}
      {showAlertModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-danger">🚨 Broadcast Pest / Weather Warning</h5>
                <button type="button" className="btn-close" onClick={() => setShowAlertModal(false)}></button>
              </div>
              <form onSubmit={handleBroadcastAlert}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Alert Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Locust Swarm Warning or Aphid Outbreak"
                      value={alertForm.title}
                      onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Alert Category</label>
                      <select
                        className="form-select"
                        value={alertForm.alertType}
                        onChange={(e) => setAlertForm({ ...alertForm, alertType: e.target.value })}
                      >
                        <option value="Pest Outbreak">Pest Outbreak</option>
                        <option value="Fungal Infection">Fungal Infection</option>
                        <option value="Weather Warning">Weather Warning</option>
                        <option value="Harvest Advisory">Harvest Advisory</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Severity</label>
                      <select
                        className="form-select"
                        value={alertForm.severity}
                        onChange={(e) => setAlertForm({ ...alertForm, severity: e.target.value })}
                      >
                        <option value="Low">Low</option>
                        <option value="Moderate">Moderate</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Affected Crops (comma separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Wheat, Tomato, Mustard"
                      value={alertForm.affectedCrops}
                      onChange={(e) => setAlertForm({ ...alertForm, affectedCrops: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Actionable Preventive Advisory</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Immediate measures for farmers to mitigate crop loss..."
                      value={alertForm.preventiveAction}
                      onChange={(e) => setAlertForm({ ...alertForm, preventiveAction: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Recommended Remedy / Chemical</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Neem Oil 10,000 PPM or Chlorpyriphos 20% EC"
                      value={alertForm.recommendedPesticideOrRemedy}
                      onChange={(e) => setAlertForm({ ...alertForm, recommendedPesticideOrRemedy: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light rounded-pill" onClick={() => setShowAlertModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-danger rounded-pill px-4">
                    Emit Warning to Platform
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
