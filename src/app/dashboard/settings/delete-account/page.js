"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';
import showToast from '@/components/showToast'
import { useRouter } from 'next/navigation';
import useLogout from "@/utils/logout";

export default function DeleteAccountPage() {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const { logOut, loggingOut } = useLogout();
  
  useEffect(() => {
    if (loggingOut) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [loggingOut]);

  const handleDelete = () => {
    setLoading(true);
    axios.delete('/api/user/delete-account')
      .then((response) => {
        showToast.success(response.data.message);
        setShowModal(false)
        logOut();
      })
      .catch((err) => {
        showToast.error(err?.response?.data?.message || err?.message || 'Failed to delete account');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-base-200 flex justify-center pt-8 items-start">
      <div className="w-full max-w-xs p-6 space-y-4 bg-base-100 rounded-lg shadow-md">
        <h1 className="text-xl font-semibold text-center text-base-content">Delete Account</h1>
        <p className="text-sm text-red-600 font-medium">
          Warning: Deleting your account is permanent and cannot be undone. All your data will be lost.
        </p>
        <button
          onClick={() => setShowModal(true)}
          className={`btn btn-error w-full text-white`}
          disabled={loading}
        >
          {loading ? 'Deleting...' : 'Delete Account'}
        </button>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-lg font-semibold text-base-content">Confirm Deletion</h3>
            <p className="text-sm text-base-content mt-2">
              Are you sure you want to delete your account? This action is permanent and cannot be undone.
            </p>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className={`btn btn-error disabled:bg-error`}
                disabled={loading}
              >
                <span className={`${loading ? 'loading' : ''}`}>
                {loading ? 'Deleting...' : 'Delete'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {loggingOut && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-30">
          <div className="text-center">
            <div className="loading loading-ring loading-lg"></div>
            <p className="mt-4 text-lg font-medium text-white">Signing you out, please wait...</p>
          </div>
        </div>
      )}
    </div>
  );
}