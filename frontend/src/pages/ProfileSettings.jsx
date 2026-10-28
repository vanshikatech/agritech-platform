import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const ProfileSettings = () => {
  const { user, updateProfile } = useAuth();
  const { lang, changeLanguage } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', state: '', district: '', village: '', language: lang, password: '' });

  useEffect(() => {
    setForm({
      name: user?.name || '',
      phone: user?.phone || '',
      state: user?.location?.state || '',
      district: user?.location?.district || '',
      village: user?.location?.village || '',
      language: user?.language || lang,
      password: '',
    });
  }, [user, lang]);

  const setField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    const { password, state, district, village, ...profile } = form;
    const result = await updateProfile({
      ...profile,
      location: { state, district, village },
      ...(password ? { password } : {}),
    });
    setSaving(false);
    if (result.success) {
      changeLanguage(form.language);
      setForm((current) => ({ ...current, password: '' }));
      setMessage({ type: 'success', text: 'Your profile settings were saved.' });
    } else {
      setMessage({ type: 'danger', text: result.message });
    }
  };

  return (
    <div className="container py-4 py-lg-5" style={{ maxWidth: 900 }}>
      <header className="mb-4">
        <h1 className="h2 fw-bold mb-1">Profile &amp; settings</h1>
        <p className="text-muted mb-0">Update your contact details, farm location, language, or password.</p>
      </header>
      {message && <div className={`alert alert-${message.type}`} role="status">{message.text}</div>}
      <form className="agri-card p-4 p-md-5" onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label" htmlFor="profile-name">Full name</label>
            <input id="profile-name" name="name" className="form-control" value={form.name} onChange={setField} maxLength={80} required autoComplete="name" />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="profile-email">Email</label>
            <input id="profile-email" className="form-control" value={user?.email || ''} disabled readOnly />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="profile-phone">Phone</label>
            <input id="profile-phone" name="phone" className="form-control" value={form.phone} onChange={setField} maxLength={24} autoComplete="tel" />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="profile-language">Language</label>
            <select id="profile-language" name="language" className="form-select" value={form.language} onChange={setField}>
              <option value="en">English</option><option value="hi">हिंदी</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="profile-state">State</label>
            <input id="profile-state" name="state" className="form-control" value={form.state} onChange={setField} maxLength={80} />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="profile-district">District</label>
            <input id="profile-district" name="district" className="form-control" value={form.district} onChange={setField} maxLength={80} />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="profile-village">Village / town</label>
            <input id="profile-village" name="village" className="form-control" value={form.village} onChange={setField} maxLength={80} />
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="profile-password">New password <span className="text-muted fw-normal">(leave blank to keep current)</span></label>
            <input id="profile-password" name="password" type="password" className="form-control" value={form.password} onChange={setField} minLength={8} autoComplete="new-password" />
          </div>
        </div>
        <div className="d-flex justify-content-end mt-4">
          <button className="btn btn-success rounded-pill px-4" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
