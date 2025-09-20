import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { HEADER_IMAGES, COLORS } from '../constants';
import { Logo } from './ui/Logo';

export const Header: React.FC = () => (
    <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
            <Logo size="large" />
        </View>
        <View style={styles.headerRight}>
            <Image
                source={{ uri: HEADER_IMAGES.PROFILE_ICON }}
                style={styles.profile}
                accessibilityLabel="Profile"
            />
        </View>
    </View>
);

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 48,
        paddingBottom: 24,
        paddingHorizontal: 24,
        backgroundColor: COLORS.BACKGROUND.HEADER,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: 40,
        height: 40,
        marginRight: 12,
        borderRadius: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.TEXT.PRIMARY,
        letterSpacing: 1,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profile: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.BACKGROUND.CARD,
    },
});
