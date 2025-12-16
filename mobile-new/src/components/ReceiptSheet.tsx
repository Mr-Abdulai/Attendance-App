import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, Text, Button, Surface, ActivityIndicator, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Assuming Expo
import { format } from 'date-fns';
import { Attendance } from '../types';

interface ReceiptSheetProps {
    visible: boolean;
    onDismiss: () => void;
    attendance: Attendance | null;
}

export default function ReceiptSheet({ visible, onDismiss, attendance }: ReceiptSheetProps) {
    const theme = useTheme();

    if (!attendance) return null;

    const isManual = attendance.type === 'MANUAL';
    // Use primary blue (#3B82F6) for manual attendance to match header
    const statusColor = isManual ? (theme.colors.primary || '#3B82F6') : (theme.colors.success || '#4caf50');
    const statusIcon = isManual ? 'account-check' : 'check-circle';
    const statusTitle = isManual ? 'Manually Verified' : 'Attendance Verified';

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={styles.container}
            >
                <Surface style={[styles.card, { backgroundColor: theme.colors.elevation.level2 }]}>
                    <View style={styles.iconContainer}>
                        <MaterialCommunityIcons name={statusIcon} size={80} color={statusColor} />
                    </View>

                    <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
                        {statusTitle}
                    </Text>

                    <View style={styles.detailsContainer}>
                        {isManual && (
                            <View style={[styles.row, { justifyContent: 'center', marginBottom: 8 }]}>
                                <Text style={{ color: statusColor, fontWeight: 'bold' }}>
                                    Added by Lecturer
                                </Text>
                            </View>
                        )}
                        <View style={styles.row}>
                            <Text variant="bodyLarge" style={{ color: theme.colors.secondary }}>Session</Text>
                            <Text variant="bodyLarge" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>
                                {attendance.session?.name}
                            </Text>
                        </View>
                        {attendance.session?.course && (
                            <View style={styles.row}>
                                <Text variant="bodyLarge" style={{ color: theme.colors.secondary }}>Course</Text>
                                <Text variant="bodyLarge" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>
                                    {attendance.session.course.code}
                                </Text>
                            </View>
                        )}
                        <View style={styles.divider} />
                        <View style={styles.row}>
                            <Text variant="bodyLarge" style={{ color: theme.colors.secondary }}>Time</Text>
                            <Text variant="bodyLarge" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>
                                {format(new Date(attendance.scannedAt), 'h:mm a')}
                            </Text>
                        </View>
                        <View style={styles.row}>
                            <Text variant="bodyLarge" style={{ color: theme.colors.secondary }}>Status</Text>
                            <Text variant="bodyLarge" style={{ fontWeight: 'bold', color: statusColor }}>
                                {isManual ? 'MARKED PRESENT' : 'ON TIME'}
                            </Text>
                        </View>
                        {attendance.distance !== undefined && (
                            <View style={styles.row}>
                                <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>Distance</Text>
                                <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
                                    {Math.round(attendance.distance)}m
                                </Text>
                            </View>
                        )}
                    </View>

                    <Button
                        mode="contained"
                        onPress={onDismiss}
                        style={styles.button}
                        contentStyle={{ paddingVertical: 8 }}
                    >
                        Done
                    </Button>
                </Surface>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        justifyContent: 'flex-end', // Bottom sheet feel
        marginBottom: 20, // Lift slightly
    },
    card: {
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        elevation: 5,
    },
    iconContainer: {
        marginBottom: 16,
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 32,
        textAlign: 'center',
    },
    detailsContainer: {
        width: '100%',
        gap: 12,
        marginBottom: 32,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(128,128,128,0.2)',
        marginVertical: 8,
    },
    button: {
        width: '100%',
        borderRadius: 12,
    }
});
