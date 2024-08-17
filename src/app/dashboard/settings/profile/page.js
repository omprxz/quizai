"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { CgSpinnerTwo } from "react-icons/cg";

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingUP, setLoadingUP] = useState(false);
  const [loadingCP, setLoadingCP] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  useEffect(() => {
    axios.get('/api/user')
      .then((response) => {
        const { name, email } = response.data.data;
        setName(name);
        setEmail(email);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load user data');
        setLoading(false);
      });
  }, []);

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleUpdateProfile = () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (!isValidEmail(email)) {
      toast.error('Invalid email address');
      return;
    }
    setLoadingUP(true)
    axios.post('/api/user', { name, email })
      .then((response) => {
        setLoadingUP(false)
        toast.success(response.data.message);
      })
      .catch((err) => {
        setLoadingUP(false)
        toast.error(err.response.data.message);
      }).finally(()=>{
        setLoadingUP(false)
      });
  };

  const handleChangePassword = () => {
    if (!currentPassword) {
      toast.error('Current password is required');
      return;
    }

    if (!newPassword) {
      toast.error('New password is required');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setLoadingCP(true)
    axios.post('/api/password/modify', {
      password: currentPassword,
      newPassword: newPassword,
    })
      .then((response) => {
        setLoadingCP(false)
        toast.success(response.data.message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      })
      .catch((err) => {
        setLoadingCP(false)
        toast.error(err.response.data.message);
      }).finally(() => {
        setLoadingCP(false)
      });
  };

  const togglePasswordVisibility = (setPasswordVisibility) => {
    setPasswordVisibility(prevState => !prevState);
  };

  if (loading) {
    return <div className="min-h-screen flex flex-col gap-3 items-center justify-center">
    <CgSpinnerTwo className='animate-spin text-2xl' />
    Please wait</div>;
  }

  return (
    <div className="min-h-screen bg-base-200 flex justify-center pt-8 items-start">
      <div className="w-full max-w-xs p-6 space-y-8 bg-base-100 rounded-lg shadow-md">
        <div className="space-y-4">
          <h1 className="text-xl font-semibold text-center text-base-content">Profile</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-base-content">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-base-content">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>
            <button
              onClick={handleUpdateProfile}
              className="btn btn-primary w-full"
              disabled={loadingUP}
            >
            {
              loadingUP ? (<><CgSpinnerTwo className='animate-spin' /> Updating</>) : (<>Update Profile</>)
            }
            </button>
          </div>
        </div>
        <hr />
        <div className="space-y-4">
          <h1 className="text-xl font-semibold text-center text-base-content">Change Password</h1>
          <div className="space-y-4">
            <div className="relative flex items-center gap-x-2.5">
              <label className="block text-sm font-medium text-base-content">Current</label>
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input input-bordered w-full"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-3 text-sm text-gray-600"
                onClick={() => togglePasswordVisibility(setShowCurrentPassword)}
              >
                {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className="relative flex items-center gap-x-2.5">
              <label className="block text-sm font-medium text-base-content">New Pass</label>
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input input-bordered w-full"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-3 text-sm text-gray-600"
                onClick={() => togglePasswordVisibility(setShowNewPassword)}
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className="relative flex items-center gap-x-2.5">
              <label className="block text-sm font-medium text-base-content">Confirm</label>
              <input
                type={showConfirmNewPassword ? 'text' : 'password'}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="input input-bordered w-full"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-3 text-sm text-gray-600"
                onClick={() => togglePasswordVisibility(setShowConfirmNewPassword)}
              >
                {showConfirmNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <button
              onClick={handleChangePassword}
              className="btn btn-primary w-full"
              disabled={loadingCP}
            >
              {
              loadingCP ? (<><CgSpinnerTwo className='animate-spin' /> Wait</>) : (<>Change Password</>)
            }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}