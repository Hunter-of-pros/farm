import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, ShieldCheck, User, Sprout, ShoppingBag, Loader2, Lock } from 'lucide-react';

const validatePassword = (pw) => {
  if (pw.length < 8) return 'Password must be at least 8 characters long.';
  if (!/[A-Z]/.test(pw)) return 'Password must contain at least one uppercase letter.';
  if (!/[a-z]/.test(pw)) return 'Password must contain at least one lowercase letter.';
  if (!/[0-9]/.test(pw)) return 'Password must contain at least one number.';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(pw)) return 'Password must contain at least one special character.';
  return null;
};

const AuthModal = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, sendOtp, verifyOtp, login, forgotPassword, resetPassword } = useAuth();
  
  const [activeTab, setActiveTab] = useState('login'); // 'login', 'register', or 'forgot'
  const [step, setStep] = useState(1); // 1: Form entry, 2: OTP verification (register only)
  
  // Form Inputs
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Consumer'); // Consumer or Farmer
  const [otp, setOtp] = useState('');
  
  // Forgot Password state
  const [identity, setIdentity] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState(1); // 1: enter email, 2: verify reset code & password
  

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [countdown, setCountdown] = useState(0);


  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setIsAuthModalOpen(false);
    // Reset state
    setStep(1);
    setActiveTab('login');
    setName('');
    setUsername('');
    setEmail('');
    setPassword('');
    setRole('Consumer');
    setOtp('');
    setIdentity('');
    setResetEmail('');
    setNewPassword('');
    setResetStep(1);

    setError('');
    setSuccessMsg('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return setError('Username and password are required.');
    
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await login(username, password);
      handleClose();
    } catch (err) {
      setError(err.message || 'Invalid username or password credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name || !username || !email || !password) return setError('All fields are required.');
    
    const pwError = validatePassword(password);
    if (pwError) return setError(pwError);
    
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const data = await sendOtp(username, email);
      setStep(2);
      setCountdown(30);
      if (data.consoleMode) {
        setSuccessMsg('Verification code generated! [Local Fallback: Please check your backend terminal console for the OTP code]');
      } else {
        setSuccessMsg('A 6-digit verification code has been dispatched to your Gmail!');
      }
    } catch (err) {
      setError(err.message || 'Failed to dispatch verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return setError('OTP verification code is required.');
    
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await verifyOtp(username, email, otp, name, password, role);
      handleClose();
    } catch (err) {
      setError(err.message || 'Verification failed. Please double check the OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const data = await sendOtp(username, email);
      setCountdown(30);
      if (data.consoleMode) {
        setSuccessMsg('Resent! [Local Fallback: Please check your backend terminal console for the OTP code]');
      } else {
        setSuccessMsg('New verification code sent to your Gmail!');
      }
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!identity) return setError('Username or Gmail address is required.');
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const data = await forgotPassword(identity);
      setResetEmail(data.fullEmail);
      setResetStep(2);
      setCountdown(30);
      if (data.consoleMode) {
        setSuccessMsg('Reset code generated! [Local Fallback: Please check your backend terminal console for the OTP code]');
      } else {
        setSuccessMsg(`A password reset code has been sent to your registered email: ${data.email}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to send reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) return setError('All fields are required.');
    
    const pwError = validatePassword(newPassword);
    if (pwError) return setError(pwError);

    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await resetPassword(resetEmail, otp, newPassword);
      setActiveTab('login');
      setStep(1);
      setOtp('');
      setNewPassword('');
      setError('');
      setSuccessMsg('Your password has been successfully reset. Please sign in with your new password!');
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please verify the OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetResend = async () => {
    if (countdown > 0) return;
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const data = await forgotPassword(identity);
      setCountdown(30);
      if (data.consoleMode) {
        setSuccessMsg('[Local Fallback: Please check your backend terminal console for the OTP code]');
      } else {
        setSuccessMsg(`New reset code sent to your registered email: ${data.email}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }}>
      <div className="modal-content auth-modal-content">
        <button className="modal-close" onClick={handleClose}>
          <X size={18} />
        </button>

        {/* Header Visual */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ 
            width: '56px', 
            height: '56px', 
            borderRadius: '50%', 
            background: 'var(--primary-soft)', 
            color: 'var(--primary)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 0.75rem auto',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <ShieldCheck size={28} />
          </div>
          <h2 style={{ fontFamily: 'Outfit', color: 'var(--primary-dark)', fontSize: '1.5rem' }}>Portal Gateway</h2>
          {step === 1 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.15rem' }}>
              Access the Farm Direct secure network
            </p>
          )}
        </div>

        {/* Tab Toggle (Only show on step 1 and when not on forgot password tab) */}
        {step === 1 && activeTab !== 'forgot' && (
          <div style={{ 
            display: 'flex', 
            background: 'var(--bg-main)', 
            borderRadius: 'var(--radius-md)', 
            padding: '0.25rem',
            marginBottom: '1.5rem',
            border: '1px solid var(--border-color)'
          }}>
            <button 
              style={{
                flex: 1,
                border: 'none',
                padding: '0.6rem',
                borderRadius: 'calc(var(--radius-md) - 2px)',
                background: activeTab === 'login' ? '#ffffff' : 'transparent',
                color: activeTab === 'login' ? 'var(--primary-dark)' : 'var(--text-muted)',
                fontWeight: activeTab === 'login' ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeTab === 'login' ? 'var(--shadow-sm)' : 'none',
                fontSize: '0.9rem'
              }}
              onClick={() => {
                setActiveTab('login');
                setError('');
                setSuccessMsg('');
              }}
            >
              Sign In
            </button>
            <button 
              style={{
                flex: 1,
                border: 'none',
                padding: '0.6rem',
                borderRadius: 'calc(var(--radius-md) - 2px)',
                background: activeTab === 'register' ? '#ffffff' : 'transparent',
                color: activeTab === 'register' ? 'var(--primary-dark)' : 'var(--text-muted)',
                fontWeight: activeTab === 'register' ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeTab === 'register' ? 'var(--shadow-sm)' : 'none',
                fontSize: '0.9rem'
              }}
              onClick={() => {
                setActiveTab('register');
                setError('');
                setSuccessMsg('');
              }}
            >
              Register
            </button>
          </div>
        )}

        {error && (
          <div style={{ 
            background: '#fff0f0', 
            color: '#d90429', 
            padding: '0.8rem 1rem', 
            borderRadius: 'var(--radius-sm)', 
            fontSize: '0.82rem',
            marginBottom: '1.25rem',
            borderLeft: '4px solid #d90429'
          }}>
            {error}
          </div>
        )}

        {successMsg && (
          <div style={{ 
            background: 'var(--primary-soft)', 
            color: 'var(--primary-dark)', 
            padding: '0.8rem 1rem', 
            borderRadius: 'var(--radius-sm)', 
            fontSize: '0.82rem',
            marginBottom: '1.25rem',
            borderLeft: '4px solid var(--primary)',
            lineHeight: '1.45'
          }}>
            {successMsg}
          </div>
        )}

        {step === 1 ? (
          activeTab === 'login' ? (
            /* Sign In form (Username & Password) */
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="auth-username">Username</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ 
                    position: 'absolute', 
                    left: '1rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'var(--text-muted)' 
                  }} />
                  <input
                    id="auth-username"
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '2.6rem' }}
                    placeholder="your_username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="auth-password">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ 
                    position: 'absolute', 
                    left: '1rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'var(--text-muted)' 
                  }} />
                  <input
                    id="auth-password"
                    type="password"
                    className="form-input"
                    style={{ paddingLeft: '2.6rem' }}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div style={{ textAlign: 'right', marginTop: '-0.5rem', marginBottom: '1.25rem' }}>
                <button
                  type="button"
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--primary)', 
                    fontSize: '0.82rem', 
                    cursor: 'pointer', 
                    textDecoration: 'underline',
                    padding: 0
                  }}
                  onClick={() => {
                    setActiveTab('forgot');
                    setResetStep(1);
                    setError('');
                    setSuccessMsg('');
                  }}
                >
                  Forgot Password?
                </button>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.85rem', marginTop: '1rem' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" style={{ marginRight: '6px' }} />
                    Signing In...
                  </>
                ) : 'Sign In'}
              </button>
            </form>
          ) : activeTab === 'register' ? (
            /* Registration form (Name, Username, Gmail, Password, Role) */
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="auth-name">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ 
                    position: 'absolute', 
                    left: '1rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'var(--text-muted)' 
                  }} />
                  <input
                    id="auth-name"
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '2.6rem' }}
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="auth-username">Username</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ 
                    position: 'absolute', 
                    left: '1rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'var(--text-muted)' 
                  }} />
                  <input
                    id="auth-username"
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '2.6rem' }}
                    placeholder="choose_username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="auth-email">Gmail Address (for OTP Delivery)</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ 
                    position: 'absolute', 
                    left: '1rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'var(--text-muted)' 
                  }} />
                  <input
                    id="auth-email"
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: '2.6rem' }}
                    placeholder="name@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="auth-password">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ 
                    position: 'absolute', 
                    left: '1rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'var(--text-muted)' 
                  }} />
                  <input
                    id="auth-password"
                    type="password"
                    className="form-input"
                    style={{ paddingLeft: '2.6rem' }}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Register As</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <div 
                    style={{
                      border: `2px solid ${role === 'Consumer' ? 'var(--accent)' : 'var(--border-color)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: role === 'Consumer' ? 'var(--accent-light)' : 'transparent',
                      color: role === 'Consumer' ? 'var(--accent-hover)' : 'var(--text-dark)',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                    onClick={() => setRole('Consumer')}
                  >
                    <ShoppingBag size={18} />
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Consumer</span>
                  </div>

                  <div 
                    style={{
                      border: `2px solid ${role === 'Farmer' ? 'var(--primary)' : 'var(--border-color)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: role === 'Farmer' ? 'var(--primary-soft)' : 'transparent',
                      color: role === 'Farmer' ? 'var(--primary-dark)' : 'var(--text-dark)',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                    onClick={() => setRole('Farmer')}
                  >
                    <Sprout size={18} />
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Farmer</span>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.85rem', marginTop: '1rem' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" style={{ marginRight: '6px' }} />
                    Requesting OTP...
                  </>
                ) : 'Request Verification OTP'}
              </button>
            </form>
          ) : (
            /* Forgot Password forms */
            resetStep === 1 ? (
              /* Step 1: Request Reset Code */
              <form onSubmit={handleForgotSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="auth-forgot-identity">Username or Gmail Address</label>
                  <div style={{ position: 'relative' }}>
                    <User size={15} style={{ 
                      position: 'absolute', 
                      left: '1rem', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      color: 'var(--text-muted)' 
                    }} />
                    <input
                      id="auth-forgot-identity"
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: '2.6rem' }}
                      placeholder="Enter username or email"
                      value={identity}
                      onChange={(e) => setIdentity(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '0.85rem', marginTop: '1rem' }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" style={{ marginRight: '6px' }} />
                      Sending Code...
                    </>
                  ) : 'Send Reset Code'}
                </button>

                <button
                  type="button"
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--text-muted)', 
                    cursor: 'pointer', 
                    textDecoration: 'underline', 
                    marginTop: '1.25rem', 
                    width: '100%', 
                    fontSize: '0.85rem' 
                  }}
                  onClick={() => {
                    setActiveTab('login');
                    setError('');
                    setSuccessMsg('');
                  }}
                  disabled={loading}
                >
                  Back to Sign In
                </button>
              </form>
            ) : (
              /* Step 2: Verify OTP and Set Password */
              <form onSubmit={handleResetSubmit}>
                <div style={{ 
                  textAlign: 'center', 
                  marginBottom: '1.5rem', 
                  background: 'rgba(0,0,0,0.02)', 
                  padding: '0.8rem', 
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  color: 'var(--text-muted)',
                  lineHeight: '1.4'
                }}>
                  Identity: <strong style={{ color: 'var(--primary-dark)' }}>{identity}</strong>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="auth-forgot-otp">6-Digit Verification Code</label>
                  <input
                    id="auth-forgot-otp"
                    type="text"
                    className="form-input"
                    style={{ 
                      textAlign: 'center', 
                      letterSpacing: '8px', 
                      fontSize: '1.3rem', 
                      fontWeight: 'bold',
                      fontFamily: 'monospace'
                    }}
                    maxLength={6}
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="auth-forgot-new-password">New Strong Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} style={{ 
                      position: 'absolute', 
                      left: '1rem', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      color: 'var(--text-muted)' 
                    }} />
                    <input
                      id="auth-forgot-new-password"
                      type="password"
                      className="form-input"
                      style={{ paddingLeft: '2.6rem' }}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '0.85rem', marginTop: '1.5rem' }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" style={{ marginRight: '6px' }} />
                      Resetting Password...
                    </>
                  ) : 'Reset Password'}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginTop: '1.25rem' }}>
                  <button 
                    type="button" 
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => {
                      setResetStep(1);
                      setOtp('');
                      setNewPassword('');
                      setError('');
                      setSuccessMsg('');
                    }}
                    disabled={loading}
                  >
                    Go Back
                  </button>

                  <button 
                    type="button" 
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: countdown > 0 ? 'var(--text-muted)' : 'var(--primary)', 
                      cursor: countdown > 0 ? 'not-allowed' : 'pointer', 
                      fontWeight: countdown > 0 ? 'normal' : 'bold' 
                    }}
                    onClick={handleResetResend}
                    disabled={countdown > 0 || loading}
                  >
                    {countdown > 0 ? `Resend Code (${countdown}s)` : 'Resend Code'}
                  </button>
                </div>
              </form>
            )
          )
        ) : (
          /* Step 2: OTP Verification for Registration */
          <form onSubmit={handleVerifyOtp}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.02)', padding: '0.8rem', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Confirm Sign Up:</span>
              <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--primary-dark)', marginTop: '0.2rem' }}>
                Name: {name} <br/>
                Username: {username} ({role}) <br/>
                Gmail: {email}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="auth-otp">6-Digit Verification OTP</label>
              <input
                id="auth-otp"
                type="text"
                className="form-input"
                style={{ 
                  textAlign: 'center', 
                  letterSpacing: '8px', 
                  fontSize: '1.3rem', 
                  fontWeight: 'bold',
                  fontFamily: 'monospace'
                }}
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                required
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.85rem', marginTop: '1.5rem' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" style={{ marginRight: '6px' }} />
                  Verifying Account...
                </>
              ) : 'Verify & Complete Signup'}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginTop: '1.25rem' }}>
              <button 
                type="button" 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => {
                  setStep(1);
                  setOtp('');
                  setError('');
                  setSuccessMsg('');
                }}
                disabled={loading}
              >
                Go Back
              </button>

              <button 
                type="button" 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: countdown > 0 ? 'var(--text-muted)' : 'var(--primary)', 
                  cursor: countdown > 0 ? 'not-allowed' : 'pointer', 
                  fontWeight: countdown > 0 ? 'normal' : 'bold' 
                }}
                onClick={handleResend}
                disabled={countdown > 0 || loading}
              >
                {countdown > 0 ? `Resend OTP (${countdown}s)` : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}


      </div>


    </div>
  );
};

export default AuthModal;
