import React from 'react';
import { View, StyleSheet, Linking, Platform } from 'react-native';
import { Modal, Portal, Text, Button, Surface, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Attendance } from '../types';

interface AttendanceDetailModalProps {
    visible: boolean;
    onDismiss: () => void;
    attendance: Attendance | null;
}

export default function AttendanceDetailModal({
    visible,
    onDismiss,
    attendance,
}: AttendanceDetailModalProps) {
    if (!attendance) return null;

    const openMaps = () => {
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${attendance.latitude},${attendance.longitude}`;
        const label = `${attendance.session.name} Location`;
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`,
        });

        if (url) {
            Linking.openURL(url);
        }
    };

    const isManual = attendance.type === 'MANUAL';
    const isSuccess = attendance.status === 'VALID';

    // Determine color and icon
    let color = isSuccess ? '#4caf50' : '#ff9800';
    let icon = isSuccess ? 'check-decagram' : 'alert-circle-outline';
    let title = isSuccess ? 'Attendance Verified' : 'Attendance Issue';

    if (isManual) {
        color = '#3B82F6'; // Royal Blue to match Header
        icon = 'account-check';
        title = 'Manually Verified';
    }

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={styles.container}
            >
                <Surface style={styles.card}>
                    <View style={[styles.header, { backgroundColor: color }]}>
                        <MaterialCommunityIcons
                            name={icon}
                            size={48}
                            color="#fff"
                        />
                        <Text variant="headlineSmall" style={styles.headerTitle}>
                            {title}
                        </Text>
                        <Text variant="bodyMedium" style={styles.headerSubtitle}>
                            {format(new Date(attendance.scannedAt), 'PPP')}
                        </Text>
                    </View>

                    <View style={styles.content}>
                        <View style={styles.row}>
                            <Text variant="bodyMedium" style={styles.label}>Course</Text>
                            <Text variant="bodyLarge" style={styles.value}>
                                {attendance.session.course
                                    ? `${attendance.session.course.code} - ${attendance.session.course.name}`
                                    : '-'}
                            </Text>
                        </View>
                        <Divider style={styles.divider} />

                        <View style={styles.row}>
                            <Text variant="bodyMedium" style={styles.label}>Session</Text>
                            <Text variant="bodyLarge" style={styles.value}>{attendance.session.name}</Text>
                        </View>
                        <Divider style={styles.divider} />

                        <View style={styles.row}>
                            <Text variant="bodyMedium" style={styles.label}>Time</Text>
                            <Text variant="bodyLarge" style={styles.value}>
                                {format(new Date(attendance.scannedAt), 'h:mm:ss a')}
                            </Text>
                        </View>
                        <Divider style={styles.divider} />

                        <View style={styles.row}>
                            <Text variant="bodyMedium" style={styles.label}>Status</Text>
                            <View style={[styles.badge, { backgroundColor: color + '20' }]}>
                                <Text style={[styles.badgeText, { color: color }]}>
                                    {attendance.status}
                                </Text>
                            </View>
                        </View>
                        <Divider style={styles.divider} />

                        <View style={styles.row}>
                            <Text variant="bodyMedium" style={styles.label}>Location Status</Text>
                            <Text variant="bodyLarge" style={styles.value}>
                                {attendance.distance !== undefined
                                    ? (attendance.distance < 100 ? 'On Site' : `${attendance.distance.toFixed(0)}m Away`)
                                    : 'N/A'}
                            </Text>
                        </View>

                        <Button
                            mode="contained"
                            icon="map-marker"
                            style={styles.mapButton}
                            buttonColor={color}
                            onPress={openMaps}
                        >
                            View Location
                        </Button>

                        <Button mode="text" onPress={onDismiss} style={styles.closeButton}>
                            Close Receipt
                        </Button>
                    </View>
                </Surface>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        width: '100%',
        borderRadius: 24,
        backgroundColor: '#fff',
        overflow: 'hidden',
        elevation: 5,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 20,
    },
    headerTitle: {
        color: '#fff',
        fontWeight: 'bold',
        marginTop: 12,
    },
    headerSubtitle: {
        color: 'rgba(255, 255, 255, 0.9)',
        marginTop: 4,
    },
    content: {
        padding: 24,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    label: {
        color: '#666',
    },
    value: {
        fontWeight: '600',
        color: '#1a1a1a',
        textAlign: 'right',
        flex: 1,
        marginLeft: 16,
    },
    divider: {
        backgroundColor: '#f0f0f0',
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    badgeText: {
        fontWeight: 'bold',
        fontSize: 12,
    },
    mapButton: {
        marginTop: 24,
        borderRadius: 12,
    },
    closeButton: {
        marginTop: 8,
    },
});
