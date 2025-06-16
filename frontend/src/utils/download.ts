import apiClient from '../services/api'; // Adjust path as needed

export const triggerDownload = async (url: string, filename: string) => {
  try {
    const response = await apiClient.get(url, {
      responseType: 'blob', // Important for file downloads
    });

    const href = window.URL.createObjectURL(response.data);

    const link = document.createElement('a');
    link.href = href;
    link.setAttribute('download', filename); // Set the download attribute
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(href); // Clean up

  } catch (error) {
    console.error('Export error:', error);
    // Optionally: display a user-friendly error message
    alert('Failed to export data. Please try again.');
  }
};
