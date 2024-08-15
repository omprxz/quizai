"use client"
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import useLogout from "@/utils/logout";

export default function DeleteAccountPage() {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const logOut = useLogout();

  const handleDelete = () => {
    setLoading(true);
    axios.delete('/api/user/delete-account')
      .then((response) => {
        toast.success(response.data.message);
        setShowModal(false)
        logOut();
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || err?.message || 'Failed to delete account');
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
                className={`btn btn-error ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}