import React, { useState, useEffect } from 'react';
import { CropAPI, FarmAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const STAGES = ['Sowing', 'Germination', 'Vegetative', 'Flowering', 'Maturity', 'Harvesting'];

const CropMonitoring = () => {
  const { t } = useLanguage();
  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);

  const [formData, setFormData] = useState({
    farmId: '',
    cropName: '',
    variety: 'Standard Hybrid',
    areaCultivatedAcres: 1,
    sowingDate: new Date().toISOString().split('T')[0],
    expectedHarvestDate: '',
    growthStage: 'Sowing',
    healthStatus: 'Healthy',
    expectedYieldKg: 1000,
    notes: '',
  });

  const loadData = async () => {
    try {
      const [cropRes, farmRes] = await Promise.all([CropAPI.getAll(), FarmAPI.getAll()]);
      setCrops(cropRes || []);
      setFarms(farmRes || []);
      if (farmRes && farmRes.length > 0 && !formData.farmId) {
        setFormData((prev) => ({ ...prev, farmId: farmRes[0]._id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddCrop = async (e) => {
    e.preventDefault();
    try {
      await CropAPI.create(formData);
      setShowAddModal(false);
      loadData();
    } catch (err) {
      alert('Error logging crop: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateStage = async (cropId, newStage, newHealth) => {
    try {
      await CropAPI.update(cropId, { growthStage: newStage, healthStatus: newHealth });
      loadData();
      setSelectedCrop(null);
    } catch (err) {
      alert('Failed to update crop');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this crop record?')) {
      await CropAPI.delete(id);
      loadData();
    }
  };

  const getStagePercentage = (stage) => {
    const idx = STAGES.indexOf(stage);
    return Math.round(((idx + 1) / STAGES.length) * 100);
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">🌱 {t('crops')}</h2>
          <p className="text-muted small mb-0">Monitor crop phenology, stage progression, and health warnings in real-time</p>
        </div>
        <button
          className="btn btn-success rounded-pill px-3 shadow-sm"
          onClick={() => setShowAddModal(true)}
          disabled={farms.length === 0}
        >
          <i className="bi bi-plus-circle me-1"></i> {t('addCrop')}
        </button>
      </div>

      {farms.length === 0 && (
        <div className="alert alert-warning">
          Please add a Farm Profile in "My Farms" first before registering crops.
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status"></div>
        </div>
      ) : crops.length === 0 ? (
        <div className="card text-center p-5 border-0 shadow-sm rounded-4">
          <div className="fs-1 mb-2">🌾</div>
          <h5 className="fw-bold">No Crops Logged Yet</h5>
          <p className="text-muted small">Record your planted crops to track their vegetative timeline and harvest dates.</p>
        </div>
      ) : (
        <div className="row g-4">
          {crops.map((crop) => {
            const progress = getStagePercentage(crop.growthStage);
            return (
              <div key={crop._id} className="col-lg-6">
                <div className="agri-card p-4 h-100">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h4 className="fw-bold mb-0 text-success">{crop.cropName}</h4>
                      <small className="text-muted">
                        Variety: <strong>{crop.variety}</strong> | Farm:{' '}
                        <strong>{crop.farmId?.farmName || 'Primary Plot'}</strong>
                      </small>
                    </div>
                    <span
                      className={`badge ${
                        crop.healthStatus === 'Healthy' || crop.healthStatus === 'Excellent'
                          ? 'bg-success'
                          : crop.healthStatus === 'Moderate'
                          ? 'bg-warning text-dark'
                          : 'bg-danger'
                      } px-3 py-2 rounded-pill`}
                    >
                      {crop.healthStatus}
                    </span>
                  </div>

                  {/* Growth Progress Bar */}
                  <div className="my-3">
                    <div className="d-flex justify-content-between small fw-semibold mb-1">
                      <span>{t('cropStage')}: <strong className="text-success">{crop.growthStage}</strong></span>
                      <span>{progress}% Lifecycle Completed</span>
                    </div>
                    <div className="progress growth-progress-bar bg-light border">
                      <div
                        className="progress-bar bg-success progress-bar-striped progress-bar-animated"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Stage Flow Indicator */}
                  <div className="d-flex justify-content-between text-center small text-muted my-3 px-1">
                    {STAGES.map((s, i) => (
                      <span
                        key={s}
                        className={`${crop.growthStage === s ? 'fw-bold text-success' : 'opacity-50'}`}
                        style={{ fontSize: '0.72rem' }}
                      >
                        {i + 1}. {s}
                      </span>
                    ))}
                  </div>

                  <div className="row g-2 p-3 bg-light rounded-3 my-2 small">
                    <div className="col-4">
                      <span className="text-muted d-block">Sown On:</span>
                      <strong>{new Date(crop.sowingDate).toLocaleDateString()}</strong>
                    </div>
                    <div className="col-4">
                      <span className="text-muted d-block">Est. Harvest:</span>
                      <strong>{new Date(crop.expectedHarvestDate).toLocaleDateString()}</strong>
                    </div>
                    <div className="col-4">
                      <span className="text-muted d-block">Area / Yield:</span>
                      <strong>{crop.areaCultivatedAcres} Ac / {crop.expectedYieldKg} kg</strong>
                    </div>
                  </div>

                  {crop.notes && (
                    <p className="small text-muted mt-2 mb-3">
                      <strong>Agronomic notes:</strong> {crop.notes}
                    </p>
                  )}

                  <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                    <button
                      className="btn btn-sm btn-outline-success rounded-pill px-3"
                      onClick={() => setSelectedCrop(crop)}
                    >
                      <i className="bi bi-pencil-square me-1"></i> Update Stage &amp; Health
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger border-0"
                      onClick={() => handleDelete(crop._id)}
                    >
                      <i className="bi bi-trash"></i> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Crop Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-success">{t('addCrop')}</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleAddCrop}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Select Farm Plot</label>
                    <select name="farmId" className="form-select" value={formData.farmId} onChange={handleChange} required>
                      {farms.map((f) => (
                        <option key={f._id} value={f._id}>
                          {f.farmName} ({f.totalAreaAcres} Acres)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Crop Name</label>
                      <input
                        type="text"
                        name="cropName"
                        className="form-control"
                        placeholder="e.g. Wheat, Tomato"
                        value={formData.cropName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Variety</label>
                      <input
                        type="text"
                        name="variety"
                        className="form-control"
                        placeholder="e.g. Sharbati HD-2967"
                        value={formData.variety}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Sowing Date</label>
                      <input
                        type="date"
                        name="sowingDate"
                        className="form-control"
                        value={formData.sowingDate}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Expected Harvest Date</label>
                      <input
                        type="date"
                        name="expectedHarvestDate"
                        className="form-control"
                        value={formData.expectedHarvestDate}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Acreage Cultivated</label>
                      <input
                        type="number"
                        step="0.1"
                        name="areaCultivatedAcres"
                        className="form-control"
                        value={formData.areaCultivatedAcres}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Expected Yield (kg)</label>
                      <input
                        type="number"
                        name="expectedYieldKg"
                        className="form-control"
                        value={formData.expectedYieldKg}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Field Observations / Notes</label>
                    <textarea
                      name="notes"
                      className="form-control"
                      rows="2"
                      placeholder="e.g. Basal DAP applied at sowing, seed treated with fungicide"
                      value={formData.notes}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light rounded-pill" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success rounded-pill px-4">
                    Save Crop Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Update Stage & Health Modal */}
      {selectedCrop && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold text-success">Update {selectedCrop.cropName}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedCrop(null)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Current Growth Stage</label>
                  <select
                    id="updateStageSelect"
                    className="form-select"
                    defaultValue={selectedCrop.growthStage}
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Health Condition</label>
                  <select
                    id="updateHealthSelect"
                    className="form-select"
                    defaultValue={selectedCrop.healthStatus}
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Healthy">Healthy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="At Risk">At Risk</option>
                    <option value="Pest Attack">Pest Attack</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-light rounded-pill" onClick={() => setSelectedCrop(null)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success rounded-pill px-4"
                  onClick={() => {
                    const st = document.getElementById('updateStageSelect').value;
                    const hl = document.getElementById('updateHealthSelect').value;
                    handleUpdateStage(selectedCrop._id, st, hl);
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropMonitoring;
