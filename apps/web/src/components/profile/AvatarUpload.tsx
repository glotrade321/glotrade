"use client";
import { useState, useRef, useEffect } from "react";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { toast } from "@/components/common/Toast";
import { apiPost, apiDelete } from "@/utils/api";
import { authHeader } from "@/utils/auth";
import { translate, Locale } from "@/utils/i18n";

interface AvatarUploadProps {
  currentAvatar?: string | null;
  onAvatarChange: (avatarUrl: string) => void;
  userId: string;
  editing?: boolean;
  locale: Locale;
}

export default function AvatarUpload({ currentAvatar, onAvatarChange, userId, editing = false, locale }: AvatarUploadProps) {
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate presigned URL for avatar display
  const getPresignedUrl = async (avatarUrl: string) => {
    try {
      const result = await apiPost<{ data: { presignedUrl: string } }>("/api/v1/avatars/presigned-url", { avatarUrl });
      return result.data.presignedUrl;
    } catch (error) {
      console.error('Failed to get presigned URL:', error);
    }
    return avatarUrl; // Fallback to original URL
  };

  // Update avatar display with presigned URL
  useEffect(() => {
    let isMounted = true;

    if (currentAvatar) {
      getPresignedUrl(currentAvatar).then(url => {
        if (isMounted) {
          setCurrentAvatarUrl(url);
        }
      });
    } else {
      setCurrentAvatarUrl(null);
    }

    return () => {
      isMounted = false;
    };
  }, [currentAvatar]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast(translate(locale, "profile.avatar.invalidType"), 'error');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast(translate(locale, "profile.avatar.tooLarge"), 'error');
      return;
    }

    await uploadAvatar(file);
  };

  const uploadAvatar = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const result = await apiPost<{ status: string; data: { avatar: { url: string } }; message?: string }>("/api/v1/avatars/upload", formData);

      if (result.status === 'success') {
        onAvatarChange(result.data.avatar.url);
        toast(translate(locale, "profile.avatar.updated"), 'success');
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast(translate(locale, "profile.avatar.uploadError"), 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!currentAvatar) return;

    setIsDeleting(true);
    setShowDeleteConfirm(false);

    try {
      const result = await apiDelete<{ status: string; message?: string }>("/api/v1/avatars/delete");

      if (result.status === 'success') {
        onAvatarChange('');
        toast(translate(locale, "profile.avatar.removed"), 'success');
      } else {
        throw new Error(result.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Avatar delete error:', error);
      toast(translate(locale, "profile.avatar.removeError"), 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Avatar Display */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-neutral-100 dark:bg-neutral-800 border-4 border-white dark:border-neutral-700 shadow-lg">
          {currentAvatarUrl ? (
            <img
              src={currentAvatarUrl}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                // If presigned URL fails, try to get a fresh one
                console.log('Avatar load failed, refreshing presigned URL...');
                if (currentAvatar) {
                  getPresignedUrl(currentAvatar).then(setCurrentAvatarUrl);
                }
              }}
            />
          ) : null}
          {!currentAvatar && (
            <div className="w-full h-full flex items-center justify-center bg-neutral-200 dark:bg-neutral-700">
              <Camera className="w-8 h-8 text-neutral-500" />
            </div>
          )}
        </div>

        {/* Upload/Delete Buttons - Only show when editing */}
        {editing && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {currentAvatar ? (
              <button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors disabled:opacity-50"
                title={translate(locale, "profile.avatar.remove")}
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <X className="w-4 h-4" />
                )}
              </button>
            ) : null}

            <button
              onClick={triggerFileSelect}
              disabled={isUploading}
              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-colors disabled:opacity-50"
              title="Upload avatar"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Status */}
      {isUploading && (
        <div className="text-sm text-blue-600 dark:text-blue-400 flex items-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Uploading avatar...</span>
        </div>
      )}

      {/* Help Text - Only show when editing */}
      {editing && (
        <div className="text-xs text-neutral-500 text-center max-w-xs">
          Click the upload button to change your profile picture.
          <br />
          Supported formats: JPEG, PNG, WebP, GIF (max 5MB)
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={cancelDelete} />
          <div className="relative bg-white dark:bg-neutral-900 rounded-2xl p-4 sm:p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">{translate(locale, "profile.avatar.deleteConfirm")}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              {translate(locale, "profile.avatar.deleteDesc")}
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 rounded-full border px-4 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                {translate(locale, "common.cancel")}
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
              >
                {translate(locale, "profile.avatar.remove")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 