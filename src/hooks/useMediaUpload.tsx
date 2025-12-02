import { useState } from 'react';
import { useAuth } from './useAuth';

export interface UploadedMedia {
  id: string;
  url: string;
  publicUrl: string;
  type: 'image' | 'video';
  name: string;
  size: number;
}

export function useMediaUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();

  const uploadMedia = async (
    file: File,
    bucket: string = 'media'
  ): Promise<{ data?: UploadedMedia; error: Error | null }> => {
    if (!user) {
      return { data: undefined, error: new Error('Not authenticated') };
    }

    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setProgress(percentComplete);
        }
      });

      // Send request
      const response = await new Promise<any>((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            let errorMsg = 'Upload failed';
            try {
              const errorData = JSON.parse(xhr.responseText);
              errorMsg = errorData.error || errorData.message || xhr.statusText || errorMsg;
            } catch {
              errorMsg = xhr.statusText || errorMsg;
            }
            reject(new Error(`${errorMsg} (Status: ${xhr.status})`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload aborted'));
        });

        xhr.open('POST', `${import.meta.env.VITE_API_URL}/upload/single`);
        
        // Add auth token
        const token = localStorage.getItem('auth_token');
        console.log('[Upload] Token exists:', !!token, 'Length:', token?.length || 0);
        if (!token) {
          reject(new Error('No authentication token found. Please login again.'));
          return;
        }
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);

        xhr.send(formData);
      });

      const media: UploadedMedia = {
        id: response.file.id,
        url: response.file.url,
        publicUrl: response.file.url,
        type: response.file.type,
        name: response.file.name,
        size: response.file.size,
      };

      setUploading(false);
      setProgress(100);
      return { data: media, error: null };
    } catch (error: any) {
      setUploading(false);
      setProgress(0);
      return { data: undefined, error };
    }
  };

  const uploadMultiple = async (files: File[]): Promise<{ data?: UploadedMedia[]; error: Error | null }> => {
    if (!user) {
      return { data: undefined, error: new Error('Not authenticated') };
    }

    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setProgress(percentComplete);
        }
      });

      // Send request
      const response = await new Promise<any>((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            let errorMsg = 'Upload failed';
            try {
              const errorData = JSON.parse(xhr.responseText);
              errorMsg = errorData.error || errorData.message || xhr.statusText || errorMsg;
            } catch {
              errorMsg = xhr.statusText || errorMsg;
            }
            reject(new Error(`${errorMsg} (Status: ${xhr.status})`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload aborted'));
        });

        xhr.open('POST', `${import.meta.env.VITE_API_URL}/upload/multiple`);
        
        // Add auth token
        const token = localStorage.getItem('auth_token');
        console.log('[Upload Multiple] Token exists:', !!token, 'Length:', token?.length || 0);
        if (!token) {
          reject(new Error('No authentication token found. Please login again.'));
          return;
        }
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);

        xhr.send(formData);
      });

      const mediaFiles: UploadedMedia[] = response.files.map((file: any) => ({
        id: file.id,
        url: file.url,
        publicUrl: file.url,
        type: file.type,
        name: file.name,
        size: file.size,
      }));

      setUploading(false);
      setProgress(100);
      return { data: mediaFiles, error: null };
    } catch (error: any) {
      setUploading(false);
      setProgress(0);
      return { data: undefined, error };
    }
  };

  const deleteMedia = async (mediaId: string): Promise<{ error: Error | null }> => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload/media/${mediaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete media');
      }

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const uploadFromUrl = async (url: string): Promise<{ data?: UploadedMedia; error: Error | null }> => {
    if (!user) {
      return { data: undefined, error: new Error('Not authenticated') };
    }

    setUploading(true);
    setProgress(50); // Show progress

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload/from-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload from URL');
      }

      const data = await response.json();

      const media: UploadedMedia = {
        id: data.file.id,
        url: data.file.url,
        publicUrl: data.file.url,
        type: data.file.type,
        name: data.file.name,
        size: data.file.size,
      };

      setUploading(false);
      setProgress(100);
      return { data: media, error: null };
    } catch (error: any) {
      setUploading(false);
      setProgress(0);
      return { data: undefined, error };
    }
  };

  const uploadFromUrls = async (urls: string[]): Promise<{ data?: UploadedMedia[]; error: Error | null }> => {
    if (!user) {
      return { data: undefined, error: new Error('Not authenticated') };
    }

    setUploading(true);
    setProgress(50);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload/from-urls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ urls }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload from URLs');
      }

      const data = await response.json();

      const mediaFiles: UploadedMedia[] = data.files.map((file: any) => ({
        id: file.id,
        url: file.url,
        publicUrl: file.url,
        type: file.type,
        name: file.name,
        size: file.size,
      }));

      setUploading(false);
      setProgress(100);
      return { data: mediaFiles, error: null };
    } catch (error: any) {
      setUploading(false);
      setProgress(0);
      return { data: undefined, error };
    }
  };

  return {
    uploadMedia,
    uploadMultiple,
    deleteMedia,
    uploadFromUrl,
    uploadFromUrls,
    uploading,
    progress,
  };
}
