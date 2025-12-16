import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Animated } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper'; // Import useTheme
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Swipeable } from 'react-native-gesture-handler';
import { Attendance } from '../types';

interface AttendanceListProps {
    attendance: Attendance[];
    onRefresh: () => void;
    refreshing: boolean;
    loading: boolean;
    onItemPress: (item: Attendance) => void;
    onArchive?: (item: Attendance) => void;
    archiveLabel?: string;
    archiveIcon?: string;
}

export default function AttendanceList({
    attendance,
    onRefresh,
    refreshing,
    loading,
    onItemPress,
    onArchive,
    archiveLabel = 'Archive',
    archiveIcon = 'archive-arrow-down',
}: AttendanceListProps) {
    const theme = useTheme(); // Initialize theme
    const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>, item: Attendance) => {
        const trans = dragX.interpolate({
            inputRange: [0, 50, 100, 101],
            outputRange: [0, 0, 0, 1],
        });

        return (
            <TouchableOpacity onPress={() => onArchive && onArchive(item)} style={styles.actionContainer}>
                <View style={styles.rightAction}>
                    <MaterialCommunityIcons name={archiveIcon as any} size={24} color="#fff" />
                    <Text style={styles.actionText}>{archiveLabel}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderItem = ({ item }: { item: Attendance }) => {
        const isManual = item.type === 'MANUAL';
        const isValid = item.status === 'VALID';

        let iconName = isValid ? 'check-circle' : 'alert-circle';
        let iconColor = isValid ? '#4caf50' : '#ff9800';
        let badgeColor = isValid ? '#e8f5e9' : '#fff3e0';
        let badgeTextColor = isValid ? '#2e7d32' : '#ef6c00';
        let badgeText = item.status.replace('_', ' ');

        if (isManual) {
            iconName = 'account-edit';
            iconColor = '#3B82F6'; // Blue
            badgeColor = 'rgba(59, 130, 246, 0.1)';
            badgeTextColor = '#3B82F6';
            badgeText = 'MANUAL';
        } else if (isValid) {
            // override default green
            iconColor = '#4ADE80';
            badgeColor = 'rgba(74, 222, 128, 0.1)';
            badgeTextColor = '#4ADE80';
        }

        const date = new Date(item.scannedAt);

        const Content = (
            <TouchableOpacity onPress={() => onItemPress(item)} activeOpacity={0.7}>
                <Surface style={[styles.itemContainer, { backgroundColor: theme.colors.elevation.level1 }]} elevation={1}>
                    <View style={styles.leftContent}>
                        <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
                            <MaterialCommunityIcons name={iconName as any} size={24} color={iconColor} />
                        </View>
                        <View>
                            <Text variant="titleMedium" style={styles.sessionName}>
                                {item.session.course ? `${item.session.course.code} - ` : ''}{item.session.name}
                            </Text>
                            <Text variant="bodySmall" style={styles.date}>
                                {format(date, 'MMM d, h:mm a')}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.badge, { backgroundColor: badgeColor }]}>
                        <Text
                            style={[
                                styles.badgeText,
                                { color: badgeTextColor },
                            ]}
                        >
                            {badgeText}
                        </Text>
                    </View>
                </Surface>
            </TouchableOpacity>
        );

        if (onArchive) {
            return (
                <Swipeable renderRightActions={(p, d) => renderRightActions(p, d, item)}>
                    {Content}
                </Swipeable>
            );
        }

        return Content;
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={attendance}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                refreshing={refreshing}
                onRefresh={onRefresh}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <Text variant="bodyMedium" style={{ color: '#999' }}>
                                No records found.
                            </Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    listContent: {
        paddingBottom: 80, // Space for FAB
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        marginBottom: 12,
        borderRadius: 16,
        // Remove border, use elevation/color for depth
        borderWidth: 0,
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        flex: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16, // Softer square
        justifyContent: 'center',
        alignItems: 'center',
    },
    sessionName: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
        color: '#FFFFFF',
    },
    date: {
        color: '#A1A1AA',
        fontSize: 12,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12, // Pill shape
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    actionContainer: {
        marginBottom: 12,
        justifyContent: 'center',
        alignItems: 'flex-end',
        width: 100, // Width of swipe action
    },
    rightAction: {
        width: 80,
        height: '100%',
        backgroundColor: '#ef5350',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionText: {
        color: '#fff',
        fontSize: 10,
        marginTop: 4,
        fontWeight: 'bold',
    },
});
