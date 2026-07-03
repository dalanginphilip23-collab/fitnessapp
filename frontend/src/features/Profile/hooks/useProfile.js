// hooks/useProfile.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../config/port';
import { useAuth } from '../../../hooks/useAuth';
import { getAvatarUrl } from '../utils/avatar';

export const useProfile = () => {
  const navigate = useNavigate();
  const { user, loading, logout, setUser, refreshAuth } = useAuth();
  const USER_ID = user?.id || null;

  const [isLoading,      setIsLoading]      = useState(true);
  const [isSaving,       setIsSaving]       = useState(false);
  const [isEditing,      setIsEditing]      = useState(false);
  const [toastVisible,   setToastVisible]   = useState(false);
  const [toastMessage,   setToastMessage]   = useState('');
  const [toastVariant,   setToastVariant]   = useState('success');
  const [sessions,       setSessions]       = useState([]);
  const [isDirty,        setIsDirty]        = useState(false);

  const [dailyStats, setDailyStats] = useState({
    calories_burned: 0,
    steps: 0,
    workout_duration_mins: 0,
  });

  const [formData, setFormData] = useState({
    fullName: '',
    email:    '',
    contact:  '',
    bio:      '',
    // FIX: height_cm / weight_kg are still part of formData so they can be
    // displayed, but they are READ-ONLY here — they're only ever written
    // by the BMI page (POST /api/bmi/:userId). No handler in this hook
    // mutates them.
    height_cm: '',
    weight_kg: '',
  });
  const [savedData,      setSavedData]      = useState({ ...formData });
  const [avatarSrc,      setAvatarSrc]      = useState(null);
  const [savedAvatarSrc, setSavedAvatarSrc] = useState(null);
  const [pendingAvatar,  setPendingAvatar]  = useState(null);

  const showToast = (message, variant = 'success') => {
    setToastMessage(message);
    setToastVariant(variant);
    setToastVisible(true);
  };

  // ── Auth guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [loading, user, navigate]);

  // ── Fetch sessions ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!USER_ID) return;
    const fetchSessions = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/security`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to fetch sessions');
        setSessions(await res.json());
      } catch (err) {
        console.error('Security fetch error:', err);
      }
    };
    fetchSessions();
  }, [USER_ID]);

  // ── Fetch today's activity stats ──────────────────────────────────────────
  useEffect(() => {
    if (!USER_ID) return;
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/stats/daily/${USER_ID}`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to fetch daily stats');
        setDailyStats(await res.json());
      } catch (err) {
        console.error('Daily stats fetch error:', err);
      }
    };
    fetchStats();
  }, [USER_ID]);

  // ── Fetch profile ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!USER_ID) {
      if (!loading) setIsLoading(false);
      return;
    }
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/profile/${USER_ID}`, {
          credentials: 'include',
        });
        if (res.ok) {
          const dbData = await res.json();

          const mapped = {
            fullName:  dbData.fullName || user?.name  || '',
            email:     dbData.email    || user?.email || '',
            contact:   dbData.contact  || '',
            bio:       dbData.bio      || user?.goal  || '',
            height_cm: dbData.height_cm ?? '',
            weight_kg: dbData.weight_kg ?? '',
          };
          setFormData(mapped);
          setSavedData(mapped);

          const src = dbData.avatar_url || user?.avatar || getAvatarUrl(USER_ID);
          setAvatarSrc(src);
          setSavedAvatarSrc(src);
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [USER_ID, loading, user]);

  // ── Track dirty state ──────────────────────────────────────────────────────
  // FIX: height_cm / weight_kg removed from the dirty check — they're
  // read-only on this page now and can never differ from savedData here.
  useEffect(() => {
    const formChanged =
      formData.fullName !== savedData.fullName ||
      formData.contact  !== savedData.contact  ||
      formData.bio      !== savedData.bio;
    setIsDirty(formChanged || !!pendingAvatar);
  }, [formData, savedData, pendingAvatar]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleInputChange = (e, field) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (!isEditing) setIsEditing(true);
  };

  const handleDiscard = () => {
    if (isDirty && !window.confirm('Discard unsaved changes?')) return;
    setFormData({ ...savedData });
    setPendingAvatar(null);
    setAvatarSrc(savedAvatarSrc);
    setIsEditing(false);
    setIsDirty(false);
  };

  const handleRevoke = async (sessionId) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    try {
      await fetch(`${API_BASE_URL}/api/security/${sessionId}`, {
        method:      'DELETE',
        credentials: 'include',
      });
      showToast('Session revoked');
    } catch (err) {
      console.error('Revoke session error:', err);
      const res = await fetch(`${API_BASE_URL}/api/security`, { credentials: 'include' });
      if (res.ok) setSessions(await res.json());
      showToast('Failed to revoke session', 'error');
    }
  };

  const handleSave = async () => {
    if (!USER_ID) return;
    setIsSaving(true);
    try {
      const avatarToSave = pendingAvatar
        ? pendingAvatar.value
        : (avatarSrc || savedAvatarSrc || null);

      // FIX: height_cm / weight_kg intentionally NOT included in this
      // request anymore — they're read-only on this page and are owned
      // by the BMI page. Sending them here (even unchanged) is unnecessary
      // now that the backend route no longer accepts/updates them.
      const body = {
        fullName:   formData.fullName,
        contact:    formData.contact,
        bio:        formData.bio,
        avatar_url: avatarToSave,
      };

      const res = await fetch(`${API_BASE_URL}/api/profile/update`, {
        method:      'PUT',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setSavedData({ ...formData });
      setSavedAvatarSrc(avatarToSave);
      setPendingAvatar(null);
      setIsEditing(false);
      setIsDirty(false);

      setUser(prev => ({
        ...prev,
        name:       formData.fullName,
        avatar:     avatarToSave,
        avatar_url: avatarToSave,
      }));

      await refreshAuth();

      showToast('Profile saved');
    } catch (err) {
      console.error('Save error:', err);
      showToast('Save failed — check your connection', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return {
    user, loading, USER_ID,
    isLoading, isSaving, isEditing, isDirty,
    toastVisible, toastMessage, toastVariant,
    sessions,
    dailyStats,
    formData, avatarSrc, pendingAvatar,
    setToastVisible, setAvatarSrc, setPendingAvatar, setIsEditing,
    handleInputChange, handleDiscard, handleRevoke, handleSave, handleLogout,
    showToast,
  };
};