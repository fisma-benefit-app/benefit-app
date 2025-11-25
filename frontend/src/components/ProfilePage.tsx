import { useState } from "react";
import useAppUser from "../hooks/useAppUser";
import useTranslations from "../hooks/useTranslations";
import { useAlert } from "../context/AlertProvider";

export default function ProfilePage() {
  const { appUser } = useAppUser();
  const translation = useTranslations().profilePage;
  const alertTranslation = useTranslations().alert;
  const { showNotification } = useAlert();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (newPassword !== confirmPassword) {
      setError(translation.passwordsDoNotMatch);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      // TODO: Replace with actual API call when backend endpoint is ready
      // await updatePassword(sessionToken, currentPassword, newPassword);
      
      // Dummy success for now
      console.log("Password change requested:", {
        currentPassword: "***",
        newPassword: "***",
      });

      showNotification(
        alertTranslation.success,
        translation.passwordUpdated,
        "success",
        "password-update"
      );

      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Password change error:", err);
      showNotification(
        alertTranslation.error,
        translation.passwordUpdateFailed,
        "error",
        "password-update"
      );
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen pt-24 px-5 bg-gray-50">
      <div className="w-full max-w-2xl">
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-fisma-blue mb-6">
            {translation.header}
          </h1>

          {/* User Info Section */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {translation.username}
            </label>
            <div className="text-lg font-semibold text-gray-900">
              {appUser?.username}
            </div>
          </div>

          {/* Password Change Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {translation.changePassword}
            </h2>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              {error && (
                <div className="bg-fisma-red text-white p-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {translation.currentPassword}
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded p-3 focus:border-fisma-blue focus:outline-none"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {translation.newPassword}
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded p-3 focus:border-fisma-blue focus:outline-none"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {translation.confirmPassword}
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded p-3 focus:border-fisma-blue focus:outline-none"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-fisma-blue hover:bg-fisma-dark-blue text-white font-semibold py-3 px-6 rounded transition-colors"
              >
                {translation.updatePassword}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
