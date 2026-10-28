import React, { useState, useEffect } from 'react';
import { ForumAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const CROP_CATEGORIES = ['All', 'Cereal Crops', 'Vegetable Crops', 'Pulses', 'Fruit Orchards', 'General Agriculture'];

const CommunityForum = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [posts, setPosts] = useState([]);
  const [selectedCat, setSelectedCat] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showAskModal, setShowAskModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [reportingPostId, setReportingPostId] = useState('');
  const [reportReason, setReportReason] = useState('');

  const [newPost, setNewPost] = useState({
    title: '',
    cropCategory: 'General Agriculture',
    question: '',
  });

  const [replyTextMap, setReplyTextMap] = useState({});

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await ForumAPI.getPosts(selectedCat === 'All' ? '' : selectedCat, search);
      setPosts(data || []);
      setLoadError('');
    } catch (err) {
      console.error(err);
      setPosts([]);
      setLoadError(err.response?.data?.message || 'Could not load discussions. Check that the API is available.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedCat]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPosts();
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      if (editingPost) await ForumAPI.updatePost(editingPost._id, newPost);
      else await ForumAPI.createPost(newPost);
      setShowAskModal(false);
      setEditingPost(null);
      setNewPost({ title: '', cropCategory: 'General Agriculture', question: '' });
      fetchPosts();
    } catch (err) {
      alert('Failed to post question: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeletePost = async (post) => {
    if (!window.confirm(`Delete “${post.title}”?`)) return;
    try { await ForumAPI.deletePost(post._id); await fetchPosts(); }
    catch (err) { alert(err.response?.data?.message || 'Could not delete discussion.'); }
  };

  const handleReportPost = async (event, postId) => {
    event.preventDefault();
    try {
      await ForumAPI.reportPost(postId, reportReason);
      setReportingPostId(''); setReportReason('');
      alert('Report sent to moderators.');
    } catch (err) { alert(err.response?.data?.message || 'Could not submit report.'); }
  };

  const handleReplySubmit = async (postId) => {
    const text = replyTextMap[postId];
    if (!text || !text.trim()) return;

    try {
      await ForumAPI.addReply(postId, text);
      setReplyTextMap({ ...replyTextMap, [postId]: '' });
      fetchPosts();
    } catch (err) {
      alert('Failed to submit reply');
    }
  };

  return (
    <div className="container py-4">
      {loadError && <div className="alert alert-danger" role="alert">{loadError}</div>}
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">💬 {t('community')}</h2>
          <p className="text-muted small mb-0">Ask agronomy queries, share pest remedies, and consult certified experts</p>
        </div>
        <button className="btn btn-success rounded-pill px-4 shadow-sm" onClick={() => { setEditingPost(null); setNewPost({ title: '', cropCategory: 'General Agriculture', question: '' }); setShowAskModal(true); }}>
          <i className="bi bi-question-circle me-1"></i> {t('createPost')}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="row g-2 mb-4">
        <div className="col-md-7 d-flex flex-wrap gap-2">
          {CROP_CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`btn btn-sm rounded-pill px-3 ${
                selectedCat === cat ? 'btn-success fw-bold' : 'btn-outline-secondary'
              }`}
              onClick={() => setSelectedCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="col-md-5">
          <form onSubmit={handleSearchSubmit} className="d-flex gap-2">
            <input
              type="text"
              className="form-control form-control-sm rounded-pill px-3"
              placeholder="Search topics, symptoms, diseases..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-outline-success btn-sm rounded-pill px-3">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="card text-center p-5 border-0 shadow-sm rounded-4">
          <h5>No discussion topics found</h5>
          <p className="text-muted small">Be the first to post a query to the farming community and agronomists.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {posts.map((post) => (
            <div key={post._id} className="agri-card p-4">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <span className="badge bg-success-subtle text-success border border-success-subtle mb-1">
                    {post.cropCategory}
                  </span>
                  <h5 className="fw-bold mb-1 text-dark">{post.title}</h5>
                  <small className="text-muted">
                    Posted by <strong>{post.authorName}</strong> • {new Date(post.createdAt || Date.now()).toLocaleDateString()}
                  </small>
                </div>
                <span className={`badge ${post.status === 'Resolved' ? 'bg-success' : 'bg-warning text-dark'} rounded-pill px-3 py-2`}>
                  {post.status}
                </span>
              </div>

              <p className="text-secondary mt-2 mb-3">{post.question}</p>

              <div className="d-flex flex-wrap gap-2">
                <button type="button" className="btn btn-sm btn-outline-success" onClick={async () => {
                  try { await ForumAPI.upvotePost(post._id); await fetchPosts(); }
                  catch (err) { alert(err.response?.data?.message || 'Could not update vote.'); }
                }}>Helpful · {post.upvotes || 0}</button>
                {(user?._id === String(post.userId?._id || post.userId) || user?.role === 'admin') && <>
                  <button type="button" className="btn btn-sm btn-outline-success" onClick={() => { setEditingPost(post); setNewPost({ title: post.title, cropCategory: post.cropCategory, question: post.question }); setShowAskModal(true); }}>Edit</button>
                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDeletePost(post)}>Delete</button>
                </>}
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => { setReportingPostId(reportingPostId === post._id ? '' : post._id); setReportReason(''); }}>Report</button>
              </div>
              {reportingPostId === post._id && <form className="mt-2 d-flex gap-2" onSubmit={(event) => handleReportPost(event, post._id)}>
                <label className="visually-hidden" htmlFor={`report-${post._id}`}>Reason for reporting this post</label>
                <input id={`report-${post._id}`} className="form-control form-control-sm" value={reportReason} onChange={(event) => setReportReason(event.target.value)} maxLength={500} placeholder="Why should moderators review this?" required />
                <button className="btn btn-sm btn-danger" type="submit">Send</button>
              </form>}

              {/* Replies Section */}
              <div className="mt-3 pt-3 border-top">
                <h6 className="fw-bold small text-muted mb-2">
                  <i className="bi bi-chat-left-text me-1"></i> {post.replies?.length || 0} Replies &amp; Advisories
                </h6>

                {post.replies?.map((rep, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-3 mb-2 small ${
                      rep.isExpertResponse
                        ? 'bg-success-subtle border border-success text-dark'
                        : 'bg-light text-dark'
                    }`}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <strong className="text-success">
                        {rep.authorName}{' '}
                        {rep.isExpertResponse && (
                          <span className="badge bg-success ms-1">
                            <i className="bi bi-patch-check-fill me-1"></i> Agronomist / Expert
                          </span>
                        )}
                      </strong>
                    </div>
                    <p className="mb-0">{rep.comment}</p>
                  </div>
                ))}

                {/* Reply Input */}
                <div className="d-flex gap-2 mt-3">
                  <input
                    type="text"
                    className="form-control form-control-sm rounded-pill px-3"
                    placeholder="Write a reply or farming advice..."
                    value={replyTextMap[post._id] || ''}
                    onChange={(e) =>
                      setReplyTextMap({ ...replyTextMap, [post._id]: e.target.value })
                    }
                  />
                  <button
                    className="btn btn-success btn-sm rounded-pill px-3"
                    onClick={() => handleReplySubmit(post._id)}
                  >
                    {t('postReply')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ask Question Modal */}
      {showAskModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-success">{editingPost ? 'Edit discussion' : t('askQuestion')}</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={() => { setShowAskModal(false); setEditingPost(null); }}></button>
              </div>
              <form onSubmit={handleCreatePost}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Crop Category</label>
                    <select
                      className="form-select"
                      value={newPost.cropCategory}
                      onChange={(e) => setNewPost({ ...newPost, cropCategory: e.target.value })}
                    >
                      {CROP_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Subject / Query Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Yellow leaves on flowering tomato plants"
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Detailed Description</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Describe symptoms, irrigation pattern, pest sightings, and questions for agronomists..."
                      value={newPost.question}
                      onChange={(e) => setNewPost({ ...newPost, question: e.target.value })}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light rounded-pill" onClick={() => { setShowAskModal(false); setEditingPost(null); }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success rounded-pill px-4">
                    {editingPost ? 'Save changes' : 'Post Question'}
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

export default CommunityForum;
