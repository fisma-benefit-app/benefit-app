import { useState } from "react";
import useAppUser from "../hooks/useAppUser";
import useTranslations from "../hooks/useTranslations";
import { useAlert } from "../context/AlertProvider";
import { changePassword, updateAppUser, deleteAppUser } from "../api/profile";
import { useNavigate } from "react-router";
import ConfirmModal from "./ConfirmModal";

export default function ProfilePage() {
  const { appUser, sessionToken, logout } = useAppUser();
  const translation = useTranslations().profilePage;
  const alertTranslation = useTranslations().alert;
  const { showNotification } = useAlert();
  const navigate = useNavigate();

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Username update state
  const [newUsername, setNewUsername] = useState("");
  const [passwordForUsername, setPasswordForUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");

  // Delete account state
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    // Validation
    if (newPassword !== confirmPassword) {
      setPasswordError(translation.passwordsDoNotMatch);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(translation.passwordMinLength);
      return;
    }

    try {
      // Call the API endpoint
      await changePassword(sessionToken, newPassword);

      showNotification(
        alertTranslation.success,
        translation.passwordUpdated,
        "success",
        "password-update",
      );

      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (err instanceof Error && err.message === "Unauthorized!") {
        logout();
      }
      console.error("Password change error:", err);
      showNotification(
        alertTranslation.error,
        translation.passwordUpdateFailed,
        "error",
        "password-update",
      );
    }
  };

  const handleUsernameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError("");

    // Validation
    if (!newUsername.trim()) {
      setUsernameError(translation.usernameEmpty);
      return;
    }

    if (!passwordForUsername) {
      setUsernameError(translation.usernamePasswordRequired);
      return;
    }

    if (!appUser?.id) {
      setUsernameError(translation.userIdNotFound);
      return;
    }

    try {
      await updateAppUser(sessionToken, appUser.id, {
        username: newUsername,
        password: passwordForUsername,
      });

      showNotification(
        alertTranslation.success,
        translation.usernameUpdated,
        "success",
        "username-update",
      );

      // Clear form
      setNewUsername("");
      setPasswordForUsername("");

      // Update will require re-login, so logout
      setTimeout(() => {
        logout();
        navigate("/login");
      }, 2000);
    } catch (err) {
      if (err instanceof Error && err.message === "Unauthorized!") {
        logout();
      }
      console.error("Username update error:", err);
      setUsernameError(
        err instanceof Error ? err.message : "Failed to update username",
      );
      showNotification(
        alertTranslation.error,
        translation.usernameUpdateFailed,
        "error",
        "username-update",
      );
    }
  };

  const handleDeleteAccount = async () => {
    if (!appUser?.id) {
      showNotification(
        alertTranslation.error,
        translation.accountDeleteFailed,
        "error",
        "account-delete",
      );
      return;
    }

    try {
      await deleteAppUser(sessionToken, appUser.id);

      showNotification(
        alertTranslation.success,
        translation.accountDeleted,
        "success",
        "account-delete",
      );

      // Logout and redirect after successful deletion
      setTimeout(() => {
        logout();
        navigate("/login");
      }, 2000);
    } catch (err) {
      if (err instanceof Error && err.message === "Unauthorized!") {
        logout();
      }
      console.error("Account deletion error:", err);
      showNotification(
        alertTranslation.error,
        translation.accountDeleteFailed,
        "error",
        "account-delete",
      );
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen pt-24 px-5 bg-gray-50">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold text-fisma-blue mb-6">
            {translation.header}
          </h1>

          {/* User Info Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {translation.username}
            </label>
            <div className="text-lg font-semibold text-gray-900">
              {appUser?.username}
            </div>
          </div>
        </div>

        {/* Password Change Section */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {translation.changePassword}
          </h2>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            {passwordError && (
              <div className="bg-fisma-red text-white p-3 rounded">
                {passwordError}
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

        {/* Delete Account Section */}
        {appUser?.id && (
          <div className="bg-white shadow-md rounded-lg p-6 border-2 border-fisma-red">
            <h2 className="text-xl font-semibold text-fisma-red mb-4">
              {translation.deleteAccount}
            </h2>
            <p className="text-gray-700 mb-4">
              {translation.deleteAccountDangerZone}
            </p>
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="w-full bg-fisma-red hover:brightness-110 text-white font-semibold py-3 px-6 rounded transition-colors"
            >
              {translation.deleteAccountButton}
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        message={translation.deleteAccountWarning}
        open={isDeleteModalOpen}
        setOpen={setDeleteModalOpen}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
}
