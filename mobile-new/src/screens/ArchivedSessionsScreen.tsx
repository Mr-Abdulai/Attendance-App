import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import { attendanceService } from '../services/attendanceService';
import { storageService } from '../services/storageService';
import { Attendance } from '../types';
import AttendanceList from '../components/AttendanceList';

export default function ArchivedSessionsScreen({ navigation }: any) {
    const theme = useTheme();
    const [archivedSessions, setArchivedSessions] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Load ONLY archived items
    const loadArchived = async () => {
        try {
            setLoading(true);
            const [allAttendance, archivedIds] = await Promise.all([
                attendanceService.getAttendanceHistory(),
                storageService.getArchivedSessions(),
            ]);

            const filtered = allAttendance.attendance.filter((a) =>
                archivedIds.includes(a.id)
            );
            setArchivedSessions(filtered);
        } catch (error) {
            console.error('Failed to load archived sessions', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadArchived();
        }, [])
    );

    const handleUnarchive = async (item: Attendance) => {
        await storageService.unarchiveSession(item.id);
        loadArchived(); // Refresh list to remove unarchived item
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
                <IconButton icon="arrow-left" iconColor={theme.colors.surface} onPress={() => navigation.goBack()} />
                <Text variant="titleLarge" style={[styles.title, { color: theme.colors.surface }]}>Archived Sessions</Text>
            </View>

            <AttendanceList
                attendance={archivedSessions}
                loading={loading}
                refreshing={refreshing}
                onRefresh={loadArchived}
                onItemPress={() => { }} // No detail view for filtered atm, or add later
                onArchive={handleUnarchive} // Reuse swipe to unarchive
                archiveLabel="Restore"
                archiveIcon="archive-arrow-up"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        marginBottom: 8,
    },
    title: {
        fontWeight: 'bold',
    },
});
