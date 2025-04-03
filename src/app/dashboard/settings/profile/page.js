"use client"
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import showToast from '@/components/showToast'
import { FaEye, FaEyeSlash, FaShare, FaCopy, FaCheck } from 'react-icons/fa';
import { CgSpinnerTwo } from "react-icons/cg";

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingUP, setLoadingUP] = useState(false);
  const [loadingCP, setLoadingCP] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const shareUrlRef = useRef(null);

  useEffect(() => {
    axios.get('/api/user')
      .then((response) => {
        const { name, email, _id } = response.data.data;
        setName(name);
        setEmail(email);
        setUserId(_id);
        setLoading(false);
      })
      .catch(() => {
        showToast.error('Failed to load user data');
        setLoading(false);
      });
  }, []);

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleUpdateProfile = () => {
    if (!name.trim()) {
      showToast.error('Name is required');
      return;
    }

    if (!isValidEmail(email)) {
      showToast.error('Invalid email address');
      return;
    }
    setLoadingUP(true)
    axios.post('/api/user', { name, email })
      .then((response) => {
        setLoadingUP(false)
        showToast.success(response.data.message);
      })
      .catch((err) => {
        setLoadingUP(false)
        showToast.error(err.response.data.message);
      }).finally(()=>{
        setLoadingUP(false)
      });
  };

  const handleChangePassword = () => {
    if (!currentPassword) {
      showToast.error('Current password is required');
      return;
    }

    if (!newPassword) {
      showToast.error('New password is required');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showToast.error('New passwords do not match');
      return;
    }
    setLoadingCP(true)
    axios.post('/api/password/modify', {
      password: currentPassword,
      newPassword: newPassword,
    })
      .then((response) => {
        setLoadingCP(false)
        showToast.success(response.data.message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      })
      .catch((err) => {
        setLoadingCP(false)
        showToast.error(err.response.data.message);
      }).finally(() => {
        setLoadingCP(false)
      });
  };

  const togglePasswordVisibility = (setPasswordVisibility) => {
    setPasswordVisibility(prevState => !prevState);
  };

  const getProfileUrl = () => {
    // Use APP_URL from environment if available, otherwise use current window location
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    return `${baseUrl}/dashboard/user/${userId}`;
  };

  const copyToClipboard = () => {
    const profileUrl = getProfileUrl();
    navigator.clipboard.writeText(profileUrl)
      .then(() => {
        setCopied(true);
        showToast.success('Profile URL copied to clipboard!');
        setTimeout(() => setCopied(false), 3000);
      })
      .catch((error) => {
        console.error('Failed to copy: ', error);
        showToast.error('Failed to copy URL');
      });
  };

  const openShareModal = () => {
    setShowShareModal(true);
  };

  const closeShareModal = () => {
    setShowShareModal(false);
    setCopied(false);
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

            {/* Share Profile Button */}
            <button
              onClick={openShareModal}
              className="btn btn-secondary w-full"
            >
              <FaShare className="mr-2" /> Share Profile
            </button>
          </div>
        </div>
        <hr />
        <div className="space-y-4">
          <h1 className="text-xl font-semibold text-center text-base-content">Change Password</h1>
          <div className="space-y-4">
            <div className="relative flex items-center gap-x-2.5">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder='Current Password'
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
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input input-bordered w-full"
                placeholder='New Password'
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
              <input
                type={showConfirmNewPassword ? 'text' : 'password'}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="input input-bordered w-full"
                placeholder='Confirm New Password'
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

      {/* Share Profile Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Share Your Profile</h3>
            <p className="text-sm mb-4">Share this link with others so they can view your public profile and quiz stats:</p>
            
            <div className="form-control">
              <div className="input-group">
                <input 
                  type="text" 
                  ref={shareUrlRef}
                  value={getProfileUrl()} 
                  readOnly 
                  className="input input-bordered flex-1"
                />
                <button 
                  className="btn btn-primary"
                  onClick={copyToClipboard}
                >
                  {copied ? <FaCheck /> : <FaCopy />}
                </button>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button onClick={closeShareModal} className="btn">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}