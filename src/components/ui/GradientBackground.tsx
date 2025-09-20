import React from 'react';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../constants';

interface GradientBackgroundProps {
    children: React.ReactNode;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({ children }) => (
    <LinearGradient
        colors={[COLORS.GRADIENT.START, COLORS.GRADIENT.END]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
    >
        {children}
    </LinearGradient>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.GRADIENT.START,
    },
});
