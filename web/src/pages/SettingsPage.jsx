import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
  const navigate = useNavigate();
  
  // STATE MANAGEMENT
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [offPeriod, setOffPeriod] = useState(null);
  const [tempStart, setTempStart] = useState("");
  const [tempEnd, setTempEnd] = useState("");
  const [resetStatus, setResetStatus] = useState(null);
  const [resetMessage, setResetMessage] = useState("");
  const [deleteStatus, setDeleteStatus] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { token } = useAuth();

  const [user, setUser] = useState({
    name: "User Name",
    email: "user@example.com"
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const loggedInUser = { 
        name: "User_Name", 
        email: "email_address" 
      }; 
      setUser(loggedInUser);
    };
    fetchUserData();
  }, []);

  // HANDLERS
  const handleSaveOffMode = async () => {
    if (!tempStart || !tempEnd) {
      alert("Please select both dates!");
      return;
    }

    setIsSaving(true);
    try {
      await apiRequest('/api/auth/focus-off-mode', {
        method: 'PUT',
        token,
        body: {
          enabled: true,
          startDate: tempStart,
          endDate: tempEnd,
        },
      });
      setOffPeriod({ start: tempStart, end: tempEnd });
      setIsModalOpen(false);
      setTempStart("");
      setTempEnd("");
    } catch (err) {
      alert("Failed to save off mode: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async () => {
    setResetStatus('sending');
    setResetMessage('');

    try {
      const data = await apiRequest('/api/auth/request-password-reset', {
        method: 'POST',
        token,
      });
      setResetStatus('sent');
      setResetMessage(data.email
        ? `Reset link sent to ${data.email}`
        : 'Password reset link has been sent to your email.'
      );

      setTimeout(() => {
        setResetStatus(null);
        setResetMessage('');
      }, 8000);
    } catch (err) {
      setResetStatus('error');
      setResetMessage(err.message || 'Failed to send reset link.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      alert("Please enter your password");
      return;
    }

    setDeleteStatus('deleting');
    setDeleteMessage('');

    try {
      await apiRequest('/api/auth/account', {
        method: 'DELETE',
        token,
        body: { password: deletePassword },
      });

      setDeleteStatus(null);
      alert("Account deleted successfully. Redirecting...");
      
      localStorage.removeItem("authToken");
      setTimeout(() => {
        navigate("/signin");
      }, 1500);
    } catch (err) {
      setDeleteStatus('error');
      setDeleteMessage(err.message || 'Failed to delete account.');
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', fontFamily: 'sans-serif', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#1f2937' }}>Settings</h1>
      
      {/* SECTION 1: USER PROFILE */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>User Profile</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '64px', height: '64px', backgroundColor: '#f3e8ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7e22ce', fontSize: '24px', fontWeight: 'bold' }}>
            {user.name.charAt(0)}
          </div>
          <div>
            <p style={{ fontWeight: '600', color: '#111827', margin: 0 }}>{user.name}</p>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>{user.email}</p>
          </div>
        </div>
      </div>

      {/* SECTION 2: APP PREFERENCES */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>App Preferences</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
          <span style={{ color: '#4b5563' }}>Dark Mode</span>
          <span style={{ color: '#9ca3af', fontSize: '14px' }}>Coming Soon</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
          <span style={{ color: '#4b5563' }}>Email Notifications</span>
          <span style={{ color: '#10b981', fontSize: '14px', fontWeight: '600' }}>Enabled</span>
        </div>
      </div>

      {/* SECTION 3: MOOD & FOCUS (OFF MODE) */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>Mood & Focus</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>🌴 Off Mode</p>
            {offPeriod ? (
              <p style={{ fontSize: '13px', color: '#4f46e5', fontWeight: 'bold', margin: 0 }}>
                Active: {offPeriod.start} to {offPeriod.end}
              </p>
            ) : (
              <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Pause streaks and hide habits while you rest.</p>
            )}
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            style={{ padding: '8px 16px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#374151' }}
          >
            {offPeriod ? "Edit Days" : "Set Off Days"}
          </button>
        </div>
      </div>

      {/* SECTION 4: ACCOUNT SECURITY */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>Account Security</h2>

        {resetStatus === 'sent' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 16px', marginBottom: '16px', borderRadius: '10px',
            backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0',
            animation: 'resetNotifSlideIn 0.3s ease-out'
          }}>
            <span style={{ fontSize: '18px' }}>✅</span>
            <span style={{ color: '#166534', fontSize: '14px', fontWeight: '500' }}>{resetMessage}</span>
          </div>
        )}
        
        {resetStatus === 'error' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 16px', marginBottom: '16px', borderRadius: '10px',
            backgroundColor: '#fef2f2', border: '1px solid #fecaca'
          }}>
            <span style={{ fontSize: '18px' }}>❌</span>
            <span style={{ color: '#991b1b', fontSize: '14px', fontWeight: '500' }}>{resetMessage}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <div>
            <p style={{ fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>🔒 Reset Password</p>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>We'll send a reset link to your registered email address.</p>
          </div>
          <button
            onClick={handleResetPassword}
            disabled={resetStatus === 'sending'}
            style={{
              padding: '8px 20px',
              backgroundColor: resetStatus === 'sending' ? '#d1d5db' : '#7c5cff',
              border: 'none',
              borderRadius: '8px',
              cursor: resetStatus === 'sending' ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              color: 'white',
              transition: 'background-color 0.2s ease'
            }}
          >
            {resetStatus === 'sending' ? 'Sending…' : 'Reset Password'}
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px' }}>
          <div>
            <p style={{ fontWeight: '600', color: '#dc2626', margin: '0 0 4px 0' }}>🗑️ Delete Account</p>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Permanently delete your account and all associated data.</p>
          </div>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            style={{
              padding: '8px 20px',
              backgroundColor: '#dc2626',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              color: 'white',
              transition: 'background-color 0.2s ease'
            }}
          >
            Delete Account
          </button>
        </div>
      </div>

      <style>{`
        @keyframes resetNotifSlideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* MODAL: SET OFF DAYS */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#1f1f1f', color: 'white', padding: '24px', borderRadius: '16px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>🌴 Set Vacation Timeline</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '20px' }}>×</button>
            </div>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '8px' }}>START DATE</label>
                <input 
                  type="date" 
                  value={tempStart}
                  onChange={(e) => setTempStart(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #374151', backgroundColor: '#2d2d2d', color: 'white', boxSizing: 'border-box' }} 
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '8px' }}>END DATE</label>
                <input 
                  type="date" 
                  value={tempEnd}
                  onChange={(e) => setTempEnd(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #374151', backgroundColor: '#2d2d2d', color: 'white', boxSizing: 'border-box' }} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#374151', color: 'white', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveOffMode} disabled={isSaving} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: isSaving ? '#6b7280' : '#4f46e5', color: 'white', cursor: isSaving ? 'not-allowed' : 'pointer', fontWeight: '600' }}>
                {isSaving ? 'Saving…' : 'Save Timeline'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE ACCOUNT */}
      {isDeleteModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#1f1f1f', color: 'white', padding: '24px', borderRadius: '16px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#dc2626' }}>⚠️ Delete Account</h3>
              <button onClick={() => setIsDeleteModalOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '20px' }}>×</button>
            </div>
            
            <p style={{ color: '#d1d5db', marginBottom: '16px', fontSize: '14px' }}>
              This action cannot be undone. All your habits, notes, and account data will be permanently deleted.
            </p>

            {deleteStatus === 'error' && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 16px', marginBottom: '16px', borderRadius: '10px',
                backgroundColor: '#fef2f2', border: '1px solid #fecaca'
              }}>
                <span style={{ fontSize: '18px' }}>❌</span>
                <span style={{ color: '#991b1b', fontSize: '14px', fontWeight: '500' }}>{deleteMessage}</span>
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '8px' }}>ENTER YOUR PASSWORD</label>
              <input 
                type="password" 
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Your password"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #374151', backgroundColor: '#2d2d2d', color: 'white', boxSizing: 'border-box' }} 
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setIsDeleteModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#374151', color: 'white', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleDeleteAccount} disabled={deleteStatus === 'deleting'} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: deleteStatus === 'deleting' ? '#9f1239' : '#dc2626', color: 'white', cursor: deleteStatus === 'deleting' ? 'not-allowed' : 'pointer', fontWeight: '600' }}>
                {deleteStatus === 'deleting' ? 'Deleting…' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
