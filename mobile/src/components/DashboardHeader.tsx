import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, IconButton, Surface, Avatar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { User } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface DashboardHeaderProps {
    user: User;
    attendanceCount: number;
    successCount: number;
    onLogout: () => void;
    onProfilePress: () => void;
    onArchivePress: () => void;
    onHistoryPress: () => void; // New prop
}

export default function DashboardHeader({
    user,
    attendanceCount,
    successCount,
    onLogout,
    onProfilePress,
    onArchivePress,
    onHistoryPress
}: DashboardHeaderProps) {

    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <View style={styles.container}>
            {/* LinearGradient Block ... */}
            <LinearGradient
                colors={['#2563EB', '#3B82F6']} // Blue gradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                {/* ... Header Row ... */}
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={onProfilePress} style={styles.profileRow}>
                        <View style={styles.avatarContainer}>
                            <Text style={styles.avatarText}>{initials}</Text>
                        </View>
                        <Text style={styles.userName} variant="titleLarge">
                            {user.name.split(' ')[0]}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* ... Stats Row ... */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="qrcode-scan" size={24} color="rgba(255,255,255,0.7)" />
                        <View>
                            <Text style={styles.statValue}>{attendanceCount}</Text>
                            <Text style={styles.statLabel}>Total Scans</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="check-decagram" size={24} color="#4ADE80" />
                        <View>
                            <Text style={styles.statValue}>{successCount}</Text>
                            <Text style={styles.statLabel}>Successful</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                    Recents
                </Text>
                <TouchableOpacity onPress={onHistoryPress}>
                    <Text variant="titleMedium" style={{ color: '#3B82F6', fontWeight: 'bold' }}>
                        History &gt;
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 10,
    },
    card: {
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    userName: {
        color: '#fff',
        fontWeight: 'bold',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    statValue: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        lineHeight: 24,
    },
    statLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
    },
    divider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    sectionTitle: {
        fontWeight: 'bold',
        color: '#A1A1AA', // Text Secondary
    },
});
