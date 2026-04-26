import React, { useEffect, useMemo, useState } from 'react';
import { Save, UserCircle2, Mail, Phone, Pencil, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hook/useAuth';
import { getAllUsers, updateUserById } from '../api/api';

const defaultSettings = {
  fullname: '',
  email: '',
  address: '',
  phone: '',
};

const getUserKey = (item) => String(item?.userId ?? item?.user_id ?? item?.id ?? '');

function OrganizerSettings() {
  const { user } = useAuth();
  const currentUserKey = useMemo(() => getUserKey(user), [user]);

  const [settings, setSettings] = useState(defaultSettings);
  const [originalSettings, setOriginalSettings] = useState(defaultSettings);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await getAllUsers();
        const users = Array.isArray(response) ? response : response?.data ?? [];

        const match = users.find((item) => {
          const itemKey = getUserKey(item);
          const emailMatch = String(item?.email ?? '').trim().toLowerCase() === String(user?.email ?? '').trim().toLowerCase();
          const usernameMatch = String(item?.username ?? '').trim().toLowerCase() === String(user?.username ?? '').trim().toLowerCase();
          return (currentUserKey && itemKey && currentUserKey === itemKey) || emailMatch || usernameMatch;
        });

        if (!mounted) return;

        const profile = match ?? user ?? {};
        const loadedSettings = {
          fullname: profile?.fullname || profile?.name || profile?.username || '',
          email: profile?.email || '',
          address: profile?.address || profile?.location || '',
          phone: profile?.phone || profile?.tel || profile?.contactNo || '',
        };

        setUsername(profile?.username || user?.username || 'N/A');
        setUserId(getUserKey(profile));
        setSettings(loadedSettings);
        setOriginalSettings(loadedSettings);
      } catch (error) {
        if (!mounted) return;
        setMessage('Failed to load profile details.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      mounted = false;
    };
  }, [currentUserKey, user]);

  const updateField = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const hasChanges = useMemo(() => {
    return (
      settings.fullname !== originalSettings.fullname ||
      settings.email !== originalSettings.email ||
      settings.address !== originalSettings.address ||
      settings.phone !== originalSettings.phone
    );
  }, [settings, originalSettings]);

  const handleEdit = () => {
    setMessage('');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setSettings(originalSettings);
    setMessage('');
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!userId) {
      setMessage('User record not found.');
      window.setTimeout(() => setMessage(''), 2500);
      return;
    }

    if (!hasChanges) return;

    try {
      setSaving(true);
      setMessage('');

      const payload = {
        fullname: settings.fullname,
        name: settings.fullname,
        email: settings.email,
        address: settings.address,
        location: settings.address,
        phone: settings.phone,
        tel: settings.phone,
      };

      await updateUserById(userId, payload);

      const nextOriginal = { ...settings };
      setOriginalSettings(nextOriginal);
      setMessage('Profile updated successfully.');
      toast.success('Profile updated successfully.');
      setIsEditing(false);
      window.setTimeout(() => setMessage(''), 2500);
    } catch (error) {
      setMessage('Failed to update profile. Please try again.');
      toast.error('Failed to update profile.');
      window.setTimeout(() => setMessage(''), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="text-white">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-primary/80 p-6 shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
        <div className="mb-6 flex items-center gap-2 text-secondary">
          <UserCircle2 size={18} />
          <h1 className="text-2xl font-bold">Profile Details</h1>
        </div>

        {loading ? (
          <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">Loading profile...</p>
        ) : (
          <div className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm text-white/70">Username</span>
              <input
                value={username}
                disabled
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/70 outline-none disabled:cursor-not-allowed disabled:opacity-80"
                placeholder="Username"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-white/70">Full name</span>
              <input
                value={settings.fullname}
                onChange={(e) => updateField('fullname', e.target.value)}
                disabled={!isEditing}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-secondary/60 focus:bg-white/8 disabled:cursor-not-allowed disabled:opacity-70"
                placeholder="Your full name"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-3 flex items-center gap-2 text-white/80">
                  <Mail size={16} className="text-secondary" />
                  <span className="font-medium">Email</span>
                </div>
                <input
                  value={settings.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  disabled={!isEditing}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-secondary/60 disabled:cursor-not-allowed disabled:opacity-70"
                  placeholder="Email address"
                />
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-3 flex items-center gap-2 text-white/80">
                  <Phone size={16} className="text-secondary" />
                  <span className="font-medium">Phone</span>
                </div>
                <input
                  value={settings.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  disabled={!isEditing}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-secondary/60 disabled:cursor-not-allowed disabled:opacity-70"
                  placeholder="Phone number"
                />
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm text-white/70">Address</span>
              <textarea
                value={settings.address}
                onChange={(e) => updateField('address', e.target.value)}
                rows={4}
                disabled={!isEditing}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-secondary/60 disabled:cursor-not-allowed disabled:opacity-70"
                placeholder="Address"
              />
            </label>

           

            {message ? (
              <p className="mb-4 rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-100">
                {message}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={handleEdit}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-2xl border border-secondary/40 bg-secondary/10 px-5 py-3 font-semibold text-secondary transition hover:bg-secondary/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Pencil size={16} />
                  Edit
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || loading || !hasChanges}
                    className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-5 py-3 font-semibold text-primary transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save size={16} />
                    {saving ? 'Saving...' : 'Save changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-5 py-3 font-semibold text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrganizerSettings;