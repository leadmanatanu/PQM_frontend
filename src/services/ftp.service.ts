import { apiClient, ApiResponse } from './api-client';

// Fetch FTP details
export const fetchFtpDetails = async (): Promise<any | null> => {
    try {
        const { data } = await apiClient.get<ApiResponse>('/ftp');
        return data.data;
    } catch (error) {
        console.error("Error fetching FTP details:", error);
        return null;
    }
};

// Update FTP details
export const updateFtpDetails = async (aJson: any): Promise<any | undefined> => {
    try {
        const { data } = await apiClient.put<ApiResponse>('/ftp', aJson);
        return data.data;
    } catch (error) {
        console.error('Error updating FTP details:', error);
        return undefined;
    }
};

// Test FTP connection
export const testFtpDetails = async (aJson: any): Promise<any | undefined> => {
    try {
        const response = await apiClient.get<ApiResponse>('/ftp/ftpconnectiontest', {
            params: {
                ftphost: aJson.ftpHost,
                username: aJson.userName,
                password: aJson.password,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error testing FTP connection:', error);
        return undefined;
    }
};

// Import local CSV files from PQM.Server/CSVFiles directory
export const importLocalCsvFiles = async (deviceId: string | number): Promise<any | undefined> => {
    try {
        const { data } = await apiClient.post<ApiResponse>('/ftp/ImportLocalCSV', null, {
            params: { deviceId }
        });
        return data;
    } catch (error) {
        console.error('Error importing local CSV files:', error);
        return undefined;
    }
};