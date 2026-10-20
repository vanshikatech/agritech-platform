import React, { useState, useEffect } from 'react';
import { FarmAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const FarmManagement = () => {
  const { t } = useLanguage();
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    farmName: '',
    totalAreaAcres: '',
    soilType: 'Black Soil',
    irrigationType: 'Drip Irrigation',
    state: 'Maharashtra',
    district: 'Pune',
    village: '',
    notes: '',
  });

  const fetchFarms = async () => {
    try {
      const data = await FarmAPI.getAll();
      setFarms(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateFarm = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        farmName: formData.farmName,
        totalAreaAcres: Number(formData.totalAreaAcres),
        soilType: formData.soilType,
        irrigationType: formData.irrigationType,
        location: {
          state: formData.state,
          district: formData.district,
          village: formData.village,
        },
        notes: formData.notes,
      };
      await FarmAPI.create(payload);
      setShowModal(false);
      setFormData({
        farmName: '',
        totalAreaAcres: '',
        soilType: 'Black Soil',
        irrigationType: 'Drip Irrigation',
        state: 'Maharashtra',
        district: 'Pune',
        village: '',
        notes: '',
      });
      fetchFarms();
    } catch (err) {
      alert('Error creating farm: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this farm? Associated crops will also be removed.')) {
      try {
        await FarmAPI.delete(id);
        fetchFarms();
      } catch (err) {
        alert('Failed to delete farm');
      }
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">🌾 {t('farms')}</h2>
          <p className="text-muted small mb-0">Configure your agricultural plots, soil classifications, and water infrastructure</p>
        </div>
        <button className="btn btn-success rounded-pill px-3 shadow-sm" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-circle me-1"></i> {t('addFarm')}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status"></div>
        </div>
      ) : farms.length === 0 ? (
        <div className="card text-center p-5 border-0 shadow-sm rounded-4">
          <div className="fs-1 mb-2">🚜</div>
          <h5 className="fw-bold">No Farm Profiles Registered</h5>
          <p className="text-muted small">Add your first farm plot to begin managing crops, soil, and weather advisories.</p>
          <div>
            <button className="btn btn-success rounded-pill" onClick={() => setShowModal(true)}>
              {t('addFarm')}
            </button>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {farms.map((farm) => (
            <div key={farm._id} className="col-md-6 col-lg-4">
              <div className="agri-card p-4 h-100 d-flex flex-column justify-content-between position-relative">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="fw-bold mb-0 text-success">{farm.farmName}</h5>
                    <button
                      className="btn btn-outline-danger btn-sm border-0"
                      onClick={() => handleDelete(farm._id)}
                      title="Delete Farm"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                  <div className="badge bg-light text-dark border mb-3">
                    📍 {farm.location?.village ? `${farm.location.village}, ` : ''}{farm.location?.district}, {farm.location?.state}
                  </div>

                  <div className="row g-2 mb-3 small">
                    <div className="col-6">
                      <div className="text-muted">Total Area:</div>
                      <div className="fw-bold fs-6">{farm.totalAreaAcres} Acres</div>
                    </div>
                    <div className="col-6">
                      <div className="text-muted">Soil Type:</div>
                      <div className="fw-semibold">{farm.soilType}</div>
                    </div>
                    <div className="col-12 mt-2">
                      <div className="text-muted">Irrigation Method:</div>
                      <div className="fw-semibold">💧 {farm.irrigationType}</div>
                    </div>
                  </div>

                  {farm.notes && (
                    <div className="p-2 bg-light rounded small text-secondary fst-italic">
                      "{farm.notes}"
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-top small text-muted d-flex justify-content-between">
                  <span>Registered: {new Date(farm.createdAt || Date.now()).toLocaleDateString()}</span>
                  <span className="text-success fw-bold">Active</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Farm Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-success">{t('addFarm')}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreateFarm}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Farm / Plot Name</label>
                    <input
                      type="text"
                      name="farmName"
                      className="form-control"
                      placeholder="e.g. Green Valley Plot A"
                      value={formData.farmName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Total Area (Acres)</label>
                      <input
                        type="number"
                        step="0.1"
                        name="totalAreaAcres"
                        className="form-control"
                        placeholder="e.g. 5.5"
                        value={formData.totalAreaAcres}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Soil Type</label>
                      <select name="soilType" className="form-select" value={formData.soilType} onChange={handleChange}>
                        <option value="Black Soil">Black Soil (Regur)</option>
                        <option value="Alluvial">Alluvial Soil</option>
                        <option value="Red Soil">Red Soil</option>
                        <option value="Sandy Loam">Sandy Loam</option>
                        <option value="Clay">Clay</option>
                        <option value="Laterite">Laterite</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Irrigation System</label>
                    <select name="irrigationType" className="form-select" value={formData.irrigationType} onChange={handleChange}>
                      <option value="Drip Irrigation">Drip Irrigation</option>
                      <option value="Sprinkler">Sprinkler System</option>
                      <option value="Canal">Canal Irrigation</option>
                      <option value="Borewell">Borewell</option>
                      <option value="Rainfed">Rainfed</option>
                    </select>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">District</label>
                      <input type="text" name="district" className="form-control" value={formData.district} onChange={handleChange} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Village / Taluka</label>
                      <input type="text" name="village" className="form-control" placeholder="Village" value={formData.village} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Special Farming Notes</label>
                    <textarea name="notes" className="form-control" rows="2" placeholder="e.g., Organic compost only, drip emitters every 30cm" value={formData.notes} onChange={handleChange}></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light rounded-pill" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-success rounded-pill px-4">Save Farm Profile</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmManagement;
