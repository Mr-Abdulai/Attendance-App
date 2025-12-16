import { Modal, Portal, Text, Button, Surface, Avatar, Switch, useTheme, TextInput } from 'react-native-paper';
import { User, Attendance } from '../types';
import { View, StyleSheet, Alert } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { useContext, useState } from 'react';
import { authService } from '../services/authService';

// ... imports

interface ProfileSheetProps {
    visible: boolean;
    onDismiss: () => void;
    user: User;
    attendance: Attendance[];
    onUpdateUser: (user: User) => void;
}

export default function ProfileSheet({
    visible,
    onDismiss,
    user,
    attendance,
    onUpdateUser,
}: ProfileSheetProps) {
    const { isDark, toggleTheme } = useContext(ThemeContext);
    const theme = useTheme();

    const [isEditing, setIsEditing] = useState(false);
    const [studentId, setStudentId] = useState(user.studentId || '');
    const [idError, setIdError] = useState('');
    const [saving, setSaving] = useState(false);

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

    const total = attendance.length;
    const valid = attendance.filter((a) => a.status === 'VALID').length;
    const rate = total > 0 ? Math.round((valid / total) * 100) : 0;


    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={styles.container}
            >
                <Surface style={[styles.card, { backgroundColor: theme.colors.elevation.level2 }]}>
                    <View style={styles.header}>
                        <Avatar.Text size={80} label={initials} style={styles.avatar} />
                        <Text variant="headlineSmall" style={styles.name}>{user.name}</Text>
                        <Text variant="bodyMedium" style={styles.email}>{user.email}</Text>

                        <View style={styles.themeToggle}>
                            <Text variant="bodyMedium">Dark Mode</Text>
                            <Switch value={isDark} onValueChange={toggleTheme} />
                        </View>
                    </View>

                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text variant="headlineMedium" style={styles.statValue}>{total}</Text>
                            <Text variant="bodySmall" style={styles.statLabel}>Total</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text variant="headlineMedium" style={[styles.statValue, { color: '#4caf50' }]}>
                                {rate}%
                            </Text>
                            <Text variant="bodySmall" style={styles.statLabel}>Success Rate</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text variant="headlineMedium" style={styles.statValue}>{valid}</Text>
                            <Text variant="bodySmall" style={styles.statLabel}>Verified</Text>
                        </View>
                    </View>

                    <View style={{ marginBottom: 24 }}>
                        <Text variant="titleMedium" style={{ marginBottom: 8, fontWeight: 'bold' }}>Student ID</Text>
                        <TextInput
                            mode="outlined"
                            label="Enter Student ID"
                            value={studentId}
                            onChangeText={handleIdChange}
                            placeholder="e.g. s12345"
                            error={!!idError}
                            disabled={isEditing && !idError ? false : (!!user.studentId && !isEditing)}
                            right={user.studentId && !isEditing ? <TextInput.Icon icon="pencil" onPress={() => setIsEditing(true)} /> : null}
                            style={{ backgroundColor: 'transparent' }}
                        />
                        {idError ? (
                            <Text style={{ color: theme.colors.error, marginTop: 4, fontSize: 12 }}>
                                {idError}
                            </Text>
                        ) : null}
                        {isEditing && (
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, gap: 8 }}>
                                <Button onPress={() => { setIsEditing(false); setStudentId(user.studentId || ''); setIdError(''); }}>Cancel</Button>
                                <Button mode="contained" onPress={handleSaveId} loading={saving} disabled={saving || !!idError || !studentId}>
                                    Save
                                </Button>
                            </View>
                        )}
                    </View>



                    <Button mode="outlined" onPress={onDismiss} style={styles.closeButton}>
                        Close Profile
                    </Button>
                </Surface>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        justifyContent: 'center',
    },
    card: {
        borderRadius: 24,
        backgroundColor: '#fff',
        padding: 24,
        elevation: 4,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
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
        color: '#666',
        marginBottom: 12,
    },
    roleBadge: {
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    roleText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#666',
    },
    themeToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        gap: 12,
        backgroundColor: 'rgba(0,0,0,0.05)',
        padding: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0,0,0,0.03)', // Subtle background
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(128,128,128,0.2)', // Adaptive divider
    },
    statValue: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        color: '#666', // This should technically be themed too, but transparency works
        opacity: 0.7,
    },
    closeButton: {
        borderRadius: 12,
    },
});
