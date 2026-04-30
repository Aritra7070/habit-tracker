import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
  // 1. STATE MANAGEMENT
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [offPeriod, setOffPeriod] = useState(null);
  const [tempStart, setTempStart] = useState("");
  const [tempEnd, setTempEnd] = useState("");
  const [resetStatus, setResetStatus] = useState(null); // null | 'sending' | 'sent' | 'error'
  const [resetMessage, setResetMessage] = useState("");
  const [resetDevUrl, setResetDevUrl] = useState("");
  const { token } = useAuth();

  // Change the initial state
const [user, setUser] = useState({
  name: "User Name",
  email: "user@example.com"
});

// Update the simulated fetch
useEffect(() => {
  const fetchUserData = async () => {
    // This is where you put the data you want to see for now
    const loggedInUser = { 
      name: "User_Name", 
      email: "email_address" 
    }; 
    setUser(loggedInUser);
  };
  fetchUserData();
}, []);

  // 3. HANDLERS
  const handleSaveOffMode = () => {
    if (tempStart && tempEnd) {
      setOffPeriod({ start: tempStart, end: tempEnd });
      setIsModalOpen(false);
    } else {
      alert("Please select both dates!");
    }
  };

  // 4. RESET PASSWORD HANDLER
  const handleResetPassword = async () => {
    setResetStatus('sending');
    setResetMessage('');
    setResetDevUrl('');

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
      setResetDevUrl(data.resetUrl || '');

      // Auto-dismiss after 8 seconds
      if (!data.resetUrl) {
        setTimeout(() => {
          setResetStatus(null);
          setResetMessage('');
        }, 8000);
      }
    } catch (err) {
      setResetStatus('error');
      setResetMessage(err.message || 'Failed to send reset link.');
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
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
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

        {/* Reset password notification */}
        {resetStatus === 'sent' && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '10px',
            padding: '12px 16px', marginBottom: '16px', borderRadius: '10px',
            backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0',
            animation: 'resetNotifSlideIn 0.3s ease-out'
          }}>
            <span style={{ fontSize: '18px' }}>✅</span>
            <div>
              <span style={{ color: '#166534', fontSize: '14px', fontWeight: '500' }}>{resetMessage}</span>
              {resetDevUrl && (
                <div style={{ marginTop: '8px' }}>
                  <p style={{ color: '#166534', fontSize: '13px', margin: '0 0 4px 0' }}>
                    Email is not configured locally. Use this development reset link:
                  </p>
                  <a href={resetDevUrl} style={{ color: '#4f46e5', fontSize: '13px', wordBreak: 'break-all' }}>
                    {resetDevUrl}
                  </a>
                </div>
              )}
            </div>
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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                  onChange={(e) => setTempStart(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #374151', backgroundColor: '#2d2d2d', color: 'white' }} 
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '8px' }}>END DATE</label>
                <input 
                  type="date" 
                  onChange={(e) => setTempEnd(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #374151', backgroundColor: '#2d2d2d', color: 'white' }} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#374151', color: 'white', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveOffMode} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#4f46e5', color: 'white', cursor: 'pointer', fontWeight: '600' }}>Save Timeline</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
