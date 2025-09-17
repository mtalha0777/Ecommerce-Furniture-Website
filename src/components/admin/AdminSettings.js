import React, { useState, useEffect } from 'react';
import { supabase } from "../../utils/supabaseClient";
import toast from 'react-hot-toast';
import { FaUser, FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa';

const useWindowSize = () => {
  const [size, setSize] = useState({ width: window.innerWidth });
  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return size;
};

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState({ name: '', email: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: 'grey' });
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { width } = useWindowSize();
  const isMobile = width < 768;


  const theme = {
    background: '#F5EFE6', containerBackground: '#FFFFFF', primaryText: '#5D4037',
    secondaryText: '#8D6E63', accent: '#8D6E63', lightBorder: '#D7CCC8'
  };


  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("User not found!");
          return;
        }

        const { data: profile, error } = await supabase.from('profiles').select('name').eq('id', user.id).single();
        if (error) throw error;
        
        setAdminInfo({ name: profile.name, email: user.email });
      } catch (error) {
        toast.error("Failed to load your data.");
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);


  const checkPasswordStrength = (password) => {
    let score = 0;
    if (password.length > 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    let label = 'Very Weak'; let color = '#f44336';
    if (score > 2) { label = 'Weak'; color = '#ff9800'; }
    if (score > 3) { label = 'Good'; color = '#2196f3'; }
    if (score > 4) { label = 'Strong'; color = '#4caf50'; }

    setPasswordStrength({ score, label, color });
  };
  
  const handlePasswordChange = (e) => {
    const newPass = e.target.value;
    setNewPassword(newPass);
    checkPasswordStrength(newPass);
  };


  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
        toast.error("Password must be at least 8 characters long.");
        return;
    }
    if (newPassword !== confirmPassword) {
        toast.error("Passwords do not match!");
        return;
    }
    
    setIsUpdating(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
        toast.error(error.message);
    } else {
        toast.success("Password updated successfully!");
        setNewPassword('');
        setConfirmPassword('');
        setPasswordStrength({ score: 0, label: '', color: 'grey' });
    }
    setIsUpdating(false);
  };


  const styles = {
    page: { backgroundColor: theme.background, minHeight: 'calc(100vh - 85px)', padding: isMobile ? '15px' : '30px' },
    container: { maxWidth: '800px', margin: '0 auto' },
    card: { backgroundColor: theme.containerBackground, borderRadius: '15px', padding: isMobile ? '20px' : '30px', marginBottom: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
    title: { color: theme.primaryText, fontFamily: "'Playfair Display', serif", margin: '0 0 20px 0' },
    infoItem: { display: 'flex', alignItems: 'center', gap: '15px', color: theme.secondaryText, marginBottom: '15px', fontSize: '1.1rem' },
    inputGroup: { position: 'relative', marginBottom: '20px' },
    input: { width: '100%', padding: '15px 45px 15px 15px', border: `1px solid ${theme.lightBorder}`, borderRadius: '10px', fontSize: '1rem' },
    inputIcon: { position: 'absolute', top: '50%', right: '15px', transform: 'translateY(-50%)', color: theme.secondaryText, cursor: 'pointer' },
    button: { width: '100%', padding: '15px', backgroundColor: theme.accent, color: 'white', border: 'none', borderRadius: '10px', fontSize: '1.1rem', cursor: 'pointer' },
    strengthBarContainer: { display: 'flex', gap: '5px', height: '8px', borderRadius: '4px', overflow: 'hidden', marginTop: '10px' },
    strengthBarSegment: { flex: 1, backgroundColor: '#e0e0e0' },
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={{...styles.title, fontSize: isMobile ? '2rem' : '2.5rem'}}>Admin Account Settings</h1>
        
        <div style={styles.card}>
          <h2 style={styles.title}>Your Information</h2>
          <div style={styles.infoItem}><FaUser color={theme.accent} /> <span>{adminInfo.name}</span></div>
          <div style={styles.infoItem}><FaEnvelope color={theme.accent} /> <span>{adminInfo.email}</span></div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.title}>Update Your Password</h2>
          <form onSubmit={handlePasswordUpdate}>
            <div style={styles.inputGroup}>
              <input type={showPassword ? 'text' : 'password'} placeholder="New Password" value={newPassword} onChange={handlePasswordChange} required style={styles.input} />
              <span style={styles.inputIcon} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FaEyeSlash /> : <FaEye />}</span>
            </div>
            {newPassword && (
                <div style={{marginBottom: '20px'}}>
                    <div style={styles.strengthBarContainer}>
                        {[...Array(5)].map((_, i) => (
                            <div key={i} style={{...styles.strengthBarSegment, backgroundColor: i < passwordStrength.score ? passwordStrength.color : '#e0e0e0'}}></div>
                        ))}
                    </div>
                    <p style={{color: passwordStrength.color, fontWeight: 'bold', textAlign: 'right', margin: '5px 0 0 0'}}>{passwordStrength.label}</p>
                </div>
            )}
            <div style={styles.inputGroup}>
              <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={styles.input} />
            </div>
            <button type="submit" disabled={isUpdating} style={styles.button}>
              {isUpdating ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;