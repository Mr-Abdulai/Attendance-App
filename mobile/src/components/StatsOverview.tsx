import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Attendance } from '../types';

interface StatsOverviewProps {
    attendance: Attendance[];
}

export default function StatsOverview({ attendance }: StatsOverviewProps) {
    const theme = useTheme();
    const total = attendance.length;
    const valid = attendance.filter((a) => a.status === 'VALID').length;

    return (
        <View style={styles.container}>
            {/* Total Scans Card */}
            <Surface style={[styles.card, { backgroundColor: theme.colors.elevation.level1 }]} elevation={2}>
                <View style={[styles.iconContainer, { backgroundColor: theme.dark ? '#1f6feb' : '#e3f2fd' }]}>
                    <MaterialCommunityIcons name="qrcode-scan" size={24} color={theme.dark ? '#fff' : '#2196f3'} />
                </View>
                <View>
                    <Text variant="titleLarge" style={styles.count}>
                        {total}
                    </Text>
                    <Text variant="bodySmall" style={styles.label}>
                        Total Scans
                    </Text>
                </View>
            </Surface>

            {/* Valid Scans Card */}
            <Surface style={[styles.card, { backgroundColor: theme.colors.elevation.level1 }]} elevation={2}>
                <View style={[styles.iconContainer, { backgroundColor: theme.dark ? '#2ea043' : '#e8f5e9' }]}>
                    <MaterialCommunityIcons name="check-decagram" size={24} color={theme.dark ? '#fff' : '#4caf50'} />
                </View>
                <View>
                    <Text variant="titleLarge" style={styles.count}>
                        {valid}
                    </Text>
                    <Text variant="bodySmall" style={styles.label}>
                        Successful
                    </Text>
                </View>
            </Surface>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 24,
        gap: 16,
    },
    card: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    count: {
        fontWeight: 'bold',
    },
    label: {
        opacity: 0.7,
    },
});
