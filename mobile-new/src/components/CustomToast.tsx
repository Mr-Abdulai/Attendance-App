import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import Toast, { BaseToastProps } from 'react-native-toast-message';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const CustomToast = ({
    text1,
    text2,
    type,
}: {
    text1?: string;
    text2?: string;
    type: 'success' | 'error' | 'info';
}) => {
    const isSuccess = type === 'success';
    const isError = type === 'error';

    // Vibrant colors for modern look
    const accentColor = isSuccess ? '#00C853' : isError ? '#FF3D00' : '#2962FF';
    const iconName = isSuccess
        ? 'check-circle'
        : isError
            ? 'alert-circle'
            : 'information';
    const backgroundColor = '#FFFFFF';

    return (
        <Surface style={[styles.container, { borderLeftColor: accentColor }]}>
            <View style={[styles.iconContainer, { backgroundColor: accentColor + '15' }]}>
                <MaterialCommunityIcons name={iconName} size={28} color={accentColor} />
            </View>
            <View style={styles.textContainer}>
                {text1 && (
                    <Text variant="titleMedium" style={styles.title}>
                        {text1}
                    </Text>
                )}
                {text2 && (
                    <Text variant="bodySmall" style={styles.message}>
                        {text2}
                    </Text>
                )}
            </View>
        </Surface>
    );
};

export const toastConfig = {
    success: (props: BaseToastProps) => (
        <CustomToast
            text1={props.text1}
            text2={props.text2}
            type="success"
        />
    ),
    error: (props: BaseToastProps) => (
        <CustomToast
            text1={props.text1}
            text2={props.text2}
            type="error"
        />
    ),
    info: (props: BaseToastProps) => (
        <CustomToast
            text1={props.text1}
            text2={props.text2}
            type="info"
        />
    ),
};

const styles = StyleSheet.create({
    container: {
        width: width * 0.9,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        borderLeftWidth: 6,
        elevation: 6, // Heavy shadow for pop-out effect
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        marginTop: 10,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#1a1a1a',
    },
    message: {
        color: '#666666',
        lineHeight: 18,
    },
});
