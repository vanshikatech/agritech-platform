import React, { useState, useEffect } from 'react';
import { SoilAPI, FarmAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const SoilAnalysis = () => {
  const { t } = useLanguage();
  const [reports, setReports] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Interactive Live Analyzer State
  const [previewData, setPreviewData] = useState({
    phLevel: 6.8,
    nitrogenKgHa: 260,
    phosphorusKgHa: 18,
    potassiumKgHa: 220,
    moisturePercent: 38,
  });

  const [instantAdvice, setInstantAdvice] = useState(null);
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [sampleName, setSampleName] = useState('North Field Core Sample');

  const loadData = async () => {
    try {
      const [soilRes, farmRes] = await Promise.all([SoilAPI.getAll(), FarmAPI.getAll()]);
      setReports(soilRes || []);
      setFarms(farmRes || []);
      if (farmRes && farmRes.length > 0) {
        setSelectedFarmId(farmRes[0]._id);
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

  // Compute live instant agronomic recommendations
  useEffect(() => {
    const runAnalysis = async () => {
      try {
        const res = await SoilAPI.analyzePreview(previewData);
        setInstantAdvice(res);
      } catch (e) {
        console.error(e);
      }
    };
    runAnalysis();
  }, [previewData]);

  const handleSliderChange = (e) => {
    setPreviewData({
      ...previewData,
      [e.target.name]: Number(e.target.value),
    });
  };

  const handleSaveReport = async (e) => {
    e.preventDefault();
    if (!selectedFarmId) {
      alert('Please select a farm first');
      return;
    }

    try {
      await SoilAPI.create({
        farmId: selectedFarmId,
        sampleName,
        ...previewData,
      });
      alert('Soil Test Report saved successfully!');
      loadData();
    } catch (err) {
      alert('Failed to save soil test report');
    }
  };

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">🧪 {t('soilHealth')}</h2>
        <p className="text-muted small mb-0">
          Automated Soil Chemical Analysis, N-P-K nutrient profiling, and agronomist fertilizer recommendations
        </p>
      </div>

      <div className="row g-4 mb-5">
        {/* Interactive Soil Testing Lab Simulator */}
        <div className="col-lg-7">
          <div className="agri-card p-4 h-100">
            <h5 className="fw-bold mb-3 text-success">
              <i className="bi bi-sliders2 me-2"></i> Interactive Soil Nutrient Simulator
            </h5>
            <p className="small text-muted mb-4">
              Adjust chemical values to simulate field conditions and immediately generate automated
              fertilizer dosage advisories.
            </p>

            {/* pH Slider */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="fw-bold small">{t('phLevel')}</label>
                <span className="badge bg-primary fs-6 px-3">{previewData.phLevel} pH</span>
              </div>
              <input
                type="range"
                className="form-range"
                min="4.0"
                max="9.5"
                step="0.1"
                name="phLevel"
                value={previewData.phLevel}
                onChange={handleSliderChange}
              />
              <div className="d-flex justify-content-between small text-muted">
                <span>4.0 (Highly Acidic)</span>
                <span>6.5 - 7.5 (Optimal)</span>
                <span>9.5 (Highly Alkaline)</span>
              </div>
            </div>

            {/* Nitrogen Slider */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="fw-bold small">{t('nitrogen')} (N)</label>
                <span className="badge bg-success fs-6 px-3">{previewData.nitrogenKgHa} kg/ha</span>
              </div>
              <input
                type="range"
                className="form-range"
                min="100"
                max="650"
                step="10"
                name="nitrogenKgHa"
                value={previewData.nitrogenKgHa}
                onChange={handleSliderChange}
              />
              <div className="d-flex justify-content-between small text-muted">
                <span>&lt;280 (Deficient)</span>
                <span>280 - 560 (Medium)</span>
                <span>&gt;560 (Excess)</span>
              </div>
            </div>

            {/* Phosphorus Slider */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="fw-bold small">{t('phosphorus')} (P)</label>
                <span className="badge bg-warning text-dark fs-6 px-3">{previewData.phosphorusKgHa} kg/ha</span>
              </div>
              <input
                type="range"
                className="form-range"
                min="5"
                max="45"
                step="1"
                name="phosphorusKgHa"
                value={previewData.phosphorusKgHa}
                onChange={handleSliderChange}
              />
              <div className="d-flex justify-content-between small text-muted">
                <span>&lt;10 (Deficient)</span>
                <span>10 - 25 (Sufficient)</span>
                <span>&gt;25 (Surplus)</span>
              </div>
            </div>

            {/* Potassium Slider */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="fw-bold small">{t('potassium')} (K)</label>
                <span className="badge bg-info text-dark fs-6 px-3">{previewData.potassiumKgHa} kg/ha</span>
              </div>
              <input
                type="range"
                className="form-range"
                min="50"
                max="350"
                step="5"
                name="potassiumKgHa"
                value={previewData.potassiumKgHa}
                onChange={handleSliderChange}
              />
              <div className="d-flex justify-content-between small text-muted">
                <span>&lt;110 (Low)</span>
                <span>110 - 280 (Medium)</span>
                <span>&gt;280 (High)</span>
              </div>
            </div>

            {/* Save to Database Form */}
            <form onSubmit={handleSaveReport} className="mt-4 pt-3 border-top">
              <h6 className="fw-bold mb-2">Save This Soil Profile to Farm</h6>
              <div className="row g-2 mb-2">
                <div className="col-md-6">
                  <select
                    className="form-select form-select-sm"
                    value={selectedFarmId}
                    onChange={(e) => setSelectedFarmId(e.target.value)}
                    required
                  >
                    {farms.length === 0 && <option value="">No farms available</option>}
                    {farms.map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.farmName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Sample Name (e.g. South Sector B)"
                    value={sampleName}
                    onChange={(e) => setSampleName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-success btn-sm rounded-pill px-4"
                disabled={farms.length === 0}
              >
                💾 Save Test to Farm History
              </button>
            </form>
          </div>
        </div>

        {/* Live Advisory Panel */}
        <div className="col-lg-5">
          <div className="agri-card p-4 h-100 bg-white border">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">🌿 Automated Advisory</h5>
              <span
                className={`badge ${
                  instantAdvice?.healthGrade === 'Optimal'
                    ? 'bg-success'
                    : instantAdvice?.healthGrade === 'Deficient'
                    ? 'bg-warning text-dark'
                    : 'bg-danger'
                } px-3 py-2 rounded-pill`}
              >
                Grade: {instantAdvice?.healthGrade || 'Calculating...'}
              </span>
            </div>

            <div className="p-3 bg-light rounded-3 mb-3">
              <h6 className="fw-bold small text-muted mb-2">NUTRIENT STATUS SUMMARY</h6>
              <ul className="list-unstyled mb-0 small">
                <li className="mb-1">
                  <strong>pH:</strong>{' '}
                  {previewData.phLevel < 6.0
                    ? 'Acidic (Needs Lime)'
                    : previewData.phLevel > 7.5
                    ? 'Alkaline (Needs Gypsum)'
                    : 'Neutral / Balanced'}
                </li>
                <li className="mb-1">
                  <strong>Nitrogen:</strong>{' '}
                  {previewData.nitrogenKgHa < 280 ? '⚠️ Low (Vegetative lag risk)' : '✅ Healthy'}
                </li>
                <li className="mb-1">
                  <strong>Phosphorus:</strong>{' '}
                  {previewData.phosphorusKgHa < 10 ? '⚠️ Low (Poor root vigor)' : '✅ Sufficient'}
                </li>
                <li>
                  <strong>Potassium:</strong>{' '}
                  {previewData.potassiumKgHa < 110 ? '⚠️ Low (Susceptible to lodging)' : '✅ Optimal'}
                </li>
              </ul>
            </div>

            <h6 className="fw-bold small text-muted mb-2">ACTIONABLE DOSAGE ADVISORIES</h6>
            <div className="d-flex flex-column gap-2">
              {instantAdvice?.recommendations?.map((rec, i) => (
                <div key={i} className="p-2 border rounded bg-white small d-flex gap-2">
                  <span className="text-success fs-6">👉</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Historical Soil Reports Log */}
      <div className="agri-card p-4">
        <h5 className="fw-bold mb-3">📑 Soil Test History</h5>
        {loading ? (
          <p className="text-muted small">Loading history...</p>
        ) : reports.length === 0 ? (
          <p className="text-muted small mb-0">No past reports saved yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small">
                <tr>
                  <th>Sample Name</th>
                  <th>Farm Plot</th>
                  <th>pH</th>
                  <th>N (kg/ha)</th>
                  <th>P (kg/ha)</th>
                  <th>K (kg/ha)</th>
                  <th>Health Status</th>
                  <th>Date Tested</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r._id}>
                    <td className="fw-bold">{r.sampleName}</td>
                    <td>{r.farmId?.farmName || 'Primary Farm'}</td>
                    <td><span className="badge bg-primary">{r.phLevel}</span></td>
                    <td>{r.nitrogenKgHa}</td>
                    <td>{r.phosphorusKgHa}</td>
                    <td>{r.potassiumKgHa}</td>
                    <td>
                      <span className="badge bg-secondary">{r.healthGrade}</span>
                    </td>
                    <td className="small text-muted">{new Date(r.testedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SoilAnalysis;
