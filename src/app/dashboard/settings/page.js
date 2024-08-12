import Link from 'next/link'

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-base-200 flex justify-center pt-8 items-start">
      <div className="w-full max-w-xs p-6 space-y-3 bg-base-100 rounded-lg shadow-md">
        <h1 className="text-xl font-semibold text-center text-base-content">Settings</h1>
        <div className="space-y-2">
          <Link
            href="/dashboard/settings/profile"
            className="block w-full px-3 py-2 text-md text-base-content bg-base-100 border rounded-md hover:bg-base-200"
          >
            My Profile
          </Link>
          <Link
            href="/dashboard/quiz/myresponses"
            className="block w-full px-3 py-2 text-md text-base-content bg-base-100 border rounded-md hover:bg-base-200"
          >
            My Responses
          </Link>
          <Link
            href="/dashboard/settings/delete-account"
            className="block w-full px-3 py-2 text-md text-error bg-base-100 border rounded-md hover:bg-error-focus"
          >
            Delete Account
          </Link>
        </div>
      </div>
    </div>
  );
}