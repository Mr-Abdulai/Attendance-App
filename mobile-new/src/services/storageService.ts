import AsyncStorage from '@react-native-async-storage/async-storage';

const ARCHIVED_SESSIONS_KEY = '@archived_sessions';

export const storageService = {
    // Get all archived session IDs
    async getArchivedSessions(): Promise<string[]> {
        try {
            const jsonValue = await AsyncStorage.getItem(ARCHIVED_SESSIONS_KEY);
            return jsonValue != null ? JSON.parse(jsonValue) : [];
        } catch (e) {
            console.error('Failed to fetch archived sessions', e);
            return [];
        }
    },

    // Archive a session by ID
    async archiveSession(sessionId: string): Promise<void> {
        try {
            const current = await this.getArchivedSessions();
            if (!current.includes(sessionId)) {
                const updated = [...current, sessionId];
                await AsyncStorage.setItem(ARCHIVED_SESSIONS_KEY, JSON.stringify(updated));
            }
        } catch (e) {
            console.error('Failed to archive session', e);
        }
    },

    // Unarchive a session by ID
    async unarchiveSession(sessionId: string): Promise<void> {
        try {
            const current = await this.getArchivedSessions();
            const updated = current.filter((id) => id !== sessionId);
            await AsyncStorage.setItem(ARCHIVED_SESSIONS_KEY, JSON.stringify(updated));
        } catch (e) {
            console.error('Failed to unarchive session', e);
        }
    },
};
