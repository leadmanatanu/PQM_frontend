import * as React from 'react';
import * as ftpService from '@/services/ftp.service';

export function useFtp() {
  const [ftpDetails, setFtpDetails] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchFtpDetails = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ftpService.fetchFtpDetails();
      setFtpDetails(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch FTP details');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFtpDetails = async (aJson: any) => {
    setLoading(true);
    try {
      const result = await ftpService.updateFtpDetails(aJson);
      await fetchFtpDetails();
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to update FTP details');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const testFtpDetails = async (aJson: any) => {
    setLoading(true);
    try {
      const result = await ftpService.testFtpDetails(aJson);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to test FTP connection');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const importLocalCsv = async (deviceId: string | number) => {
    setLoading(true);
    try {
      const result = await ftpService.importLocalCsvFiles(deviceId);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to import CSV files');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchFtpDetails();
  }, [fetchFtpDetails]);

  return {
    ftpDetails,
    loading,
    error,
    reload: fetchFtpDetails,
    updateFtpDetails,
    testFtpDetails,
    importLocalCsv,
  };
}