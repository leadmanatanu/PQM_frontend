import { apiClient } from './api-client';

export interface ProfileItem {
    profileId: number;
    friendlyName: string;
    obisCode: string;
    category: string;
}

export const fetchProfiles = async (): Promise<ProfileItem[] | null> => {
    try {
        const { data } = await apiClient.get('/Profile');
        return data?.data ?? [];
    } catch (error) {
        console.error('Error fetching profiles:', error);
        return null;
    }
};
