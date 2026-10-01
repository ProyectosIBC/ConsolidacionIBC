/**
 * Google Drive Service for fetching church media files from proyectosibc26@gmail.com
 */

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  thumbnailLink?: string;
  webContentLink?: string;
}

declare global {
  interface Window {
    google?: any;
  }
}

/**
 * Solicita un token de acceso OAuth de Google de forma automática mediante Google Identity Services popup
 */
export function requestGoogleAccessToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    // Usar el Client ID configurado en el proyecto OAuth de Google Workspace
    const clientId = '1031696037941-0394969385.apps.googleusercontent.com';

    const executeTokenClient = () => {
      try {
        if (!window.google?.accounts?.oauth2) {
          reject(new Error('Google Identity Services no está disponible'));
          return;
        }
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/drive.readonly',
          callback: (response: any) => {
            if (response.error) {
              reject(new Error(response.error_description || response.error));
            } else {
              resolve(response.access_token);
            }
          },
        });
        client.requestAccessToken();
      } catch (err: any) {
        reject(err);
      }
    };

    if (!window.google?.accounts?.oauth2) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = executeTokenClient;
      script.onerror = () => reject(new Error('Error al cargar la librería de autenticación de Google'));
      document.body.appendChild(script);
    } else {
      executeTokenClient();
    }
  });
}

// Cliente para consultar archivos de Google Drive
export async function listChurchDriveFiles(accessToken: string): Promise<{ success: boolean; files?: DriveFileItem[]; message?: string }> {
  if (!accessToken) {
    return { success: false, message: 'Token de acceso de Google Drive no proporcionado' };
  }

  try {
    const query = encodeURIComponent("mimeType contains 'video/' or mimeType contains 'image/' or mimeType = 'application/pdf'");
    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,webViewLink,thumbnailLink,webContentLink)&pageSize=50`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Error al consultar Google Drive API');
    }

    return {
      success: true,
      files: data.files || [],
    };
  } catch (error: any) {
    return { success: false, message: error.message || 'Error de conexión con Google Drive' };
  }
}
