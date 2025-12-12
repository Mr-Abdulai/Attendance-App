import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Text, useTheme, Button } from 'react-native-paper';
import { attendanceService } from '../services/attendanceService';
import { storageService } from '../services/storageService';
import { Attendance } from '../types';
import AttendanceList from '../components/AttendanceList';

export default function HistoryScreen({ route }: any) {
    const theme = useTheme();
    const [history, setHistory] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Filter mode: 'archived' or 'all' (default is 'archived' for the Tab, but flexible)
    const filter = route.params?.filter || 'archived';
    const isArchiveMode = filter === 'archived';

    const loadData = async () => {
        try {
            setLoading(true);
            const [allData, archivedIds] = await Promise.all([
                attendanceService.getAttendanceHistory(100), // Get plenty
                storageService.getArchivedSessions(),
            ]);

            if (isArchiveMode) {
                // Show ONLY archived
                setHistory(allData.attendance.filter(a => archivedIds.includes(a.id)));
            } else {
                // Show ALL (History View)
                setHistory(allData.attendance);
            }
        } catch (error) {
            console.error('Failed to load history', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [filter]) // Reload if filter changes
    );

    const handleUnarchive = async (item: Attendance) => {
        await storageService.unarchiveSession(item.id);
        loadData();
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.onBackground }}>
                    {isArchiveMode ? 'Archive' : 'History'}
                </Text>
            </View>

            {history.length === 0 && !loading ? (
                <View style={styles.emptyState}>
                    <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 16 }}>No records found.</Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 8 }}>
                        {isArchiveMode ? 'Archived items will appear here.' : 'Your attendance history will appear here.'}
                    </Text>
                </View>
            ) : (
                <AttendanceList
                    attendance={history}
                    loading={loading}
                    refreshing={refreshing}
                    onRefresh={loadData}
                    onItemPress={() => { }}
                    onArchive={isArchiveMode ? handleUnarchive : undefined}
                    archiveLabel={isArchiveMode ? "Restore" : undefined}
                    archiveIcon={isArchiveMode ? "archive-arrow-up" : undefined}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
    },
    header: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        opacity: 0.7,
    },
});
