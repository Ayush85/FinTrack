import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants';
import Icon from 'react-native-vector-icons/FontAwesome';

interface LogoProps {
    size?: 'small' | 'medium' | 'large';
}

export const Logo: React.FC<LogoProps> = ({ size = 'medium' }) => {
    const getSize = () => {
        switch (size) {
            case 'small':
                return { icon: 20, text: 16 };
            case 'large':
                return { icon: 32, text: 28 };
            default:
                return { icon: 24, text: 20 };
        }
    };

    const sizeValues = getSize();

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Icon 
                    name="line-chart"
                    size={sizeValues.icon}
                    color={COLORS.ACCENT}
                    style={styles.icon}
                />
                <View style={[styles.dot, { width: sizeValues.icon / 4, height: sizeValues.icon / 4 }]} />
            </View>
            <Text style={[styles.text, { fontSize: sizeValues.text }]}>
                Fin<Text style={styles.highlight}>Track</Text>
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        position: 'relative',
        marginRight: 8,
    },
    icon: {
        transform: [{ rotate: '-15deg' }],
    },
    dot: {
        position: 'absolute',
        backgroundColor: COLORS.ACCENT,
        borderRadius: 100,
        right: -2,
        top: 0,
    },
    text: {
        fontWeight: '700',
        color: COLORS.TEXT.PRIMARY,
        letterSpacing: 0.5,
    },
    highlight: {
        color: COLORS.ACCENT,
    },
});