import React, { useContext, useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Text, Button, Surface, Avatar, Switch, useTheme, TextInput } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native'; // Correctly imported at top
import { User, Attendance } from '../types';
import { ThemeContext } from '../context/ThemeContext';
import { authService } from '../services/authService';
import { attendanceService } from '../services/attendanceService';

interface ProfileScreenProps {
    user: User;
    onUpdateUser: (user: User) => void;
    onLogout: () => void;
}

export default function ProfileScreen({
    user,
    onUpdateUser,
    onLogout
}: ProfileScreenProps) {
    const { isDark, toggleTheme } = useContext(ThemeContext);
    const theme = useTheme();

    const [isEditing, setIsEditing] = useState(false);
    const [studentId, setStudentId] = useState(user.studentId || '');
    const [idError, setIdError] = useState('');
    const [saving, setSaving] = useState(false);

    // Stats state
    const [stats, setStats] = useState({ total: 0, valid: 0 });

    useFocusEffect(
        React.useCallback(() => {
            loadStats();
        }, [])
    );

    const loadStats = async () => {
        try {
            const data = await attendanceService.getAttendanceHistory();
            const total = data.attendance.length;
            const valid = data.attendance.filter((a: Attendance) => a.status === 'VALID').length;
            setStats({ total, valid });
        } catch (error) {
            console.error('Failed to load profile stats', error);
        }
    };

    const handleIdChange = (text: string) => {
        setStudentId(text);
        if (text.length > 0) {
            if (!/^[a-z]/.test(text)) {
                setIdError('ID must start with a lowercase letter');
            } else if (text.length < 5) {
                setIdError('ID must be at least 5 characters');
            } else {
                setIdError('');
            }
        } else {
            setIdError('');
        }
    };

    const handleSaveId = async () => {
        if (!studentId || idError) return;
        setSaving(true);
        try {
            const response = await authService.updateProfile(studentId);
            onUpdateUser(response.user);
            setIsEditing(false);
            Alert.alert('Success', 'Student ID updated successfully');
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to update ID');
        } finally {
            setSaving(false);
        }
    };

    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const total = stats.total;
    const valid = stats.valid;
    const rate = total > 0 ? Math.round((valid / total) * 100) : 0;
    const verified = valid;

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Avatar.Text size={100} label={initials} style={styles.avatar} />
                    <Text variant="headlineMedium" style={[styles.name, { color: theme.colors.onBackground }]}>{user.name}</Text>
                    <Text variant="bodyLarge" style={[styles.email, { color: theme.colors.onSurfaceVariant }]}>{user.email}</Text>
                </View>

                <Surface style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text variant="headlineSmall" style={styles.statValue}>{total}</Text>
                            <Text variant="bodySmall" style={styles.statLabel}>Total</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text variant="headlineSmall" style={[styles.statValue, { color: theme.colors.primary }]}>
                                {rate}%
                            </Text>
                            <Text variant="bodySmall" style={styles.statLabel}>Success Rate</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text variant="headlineSmall" style={styles.statValue}>{verified}</Text>
                            <Text variant="bodySmall" style={styles.statLabel}>Verified</Text>
                        </View>
                    </View>
                </Surface>

                <Surface style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
                    <Text variant="titleMedium" style={{ marginBottom: 16, fontWeight: 'bold' }}>Student ID</Text>

                    <View style={styles.idContainer}>
                        <TextInput
                            mode="outlined"
                            label="Student ID"
                            value={studentId}
                            onChangeText={handleIdChange}
                            placeholder="e.g. s12345"
                            error={!!idError}
                            disabled={!isEditing}
                            right={!isEditing ? <TextInput.Icon icon="pencil" onPress={() => setIsEditing(true)} /> : null}
                            style={{ backgroundColor: 'transparent', flex: 1 }}
                        />
                    </View>

                    {idError ? (
                        <Text style={{ color: theme.colors.error, marginTop: 4, fontSize: 12 }}>
                            {idError}
                        </Text>
                    ) : null}

                    {isEditing && (
                        <View style={styles.actionButtons}>
                            <Button onPress={() => { setIsEditing(false); setStudentId(user.studentId || ''); setIdError(''); }}>Cancel</Button>
                            <Button mode="contained" onPress={handleSaveId} loading={saving} disabled={saving || !!idError || !studentId}>
                                Save
                            </Button>
                        </View>
                    )}
                </Surface>

                <Surface style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
                    <Text variant="titleMedium" style={{ marginBottom: 16, fontWeight: 'bold' }}>Settings</Text>

                    <View style={styles.settingRow}>
                        <Text variant="bodyLarge">Dark Mode</Text>
                        <Switch value={isDark} onValueChange={toggleTheme} color={theme.colors.primary} />
                    </View>
                </Surface>

                <Button
                    mode="outlined"
                    onPress={onLogout}
                    style={styles.logoutButton}
                    textColor={theme.colors.error}
                    icon="logout"
                >
                    Sign Out
                </Button>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
        paddingTop: 60, // Space for header
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatar: {
        backgroundColor: '#2196f3',
        marginBottom: 16,
    },
    name: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    email: {
        marginBottom: 12,
    },
    statsCard: {
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        elevation: 2,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(128,128,128,0.2)',
        height: '80%',
        alignSelf: 'center',
    },
    statValue: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        opacity: 0.7,
    },
    sectionCard: {
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        elevation: 2,
    },
    idContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
        gap: 8,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logoutButton: {
        marginTop: 8,
        borderColor: 'rgba(211, 47, 47, 0.5)',
    }
});
