import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { HEADER_IMAGES, COLORS } from '../constants';

export const Header: React.FC = () => (
    <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
            <View style={styles.headerInfo}>
                <Image
                    source={{ uri: HEADER_IMAGES.CURRENCY_ICON }}
                    resizeMode="stretch"
                    style={styles.headerIcon}
                />
                <Text style={styles.headerText}>NPR</Text>
            </View>
            <Image
                source={{ uri: HEADER_IMAGES.PROFILE_ICON }}
                resizeMode="stretch"
                style={styles.headerImage}
            />
        </View>
        <Image
            source={{ uri: HEADER_IMAGES.LOGO }}
            resizeMode="stretch"
            style={styles.headerLogo}
        />
    </View>
);

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingTop: 64,
        paddingBottom: 24,
        paddingHorizontal: 24,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.BACKGROUND.HEADER,
        borderRadius: 20,
        padding: 12,
    },
    headerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 3,
        marginRight: 12,
    },
    headerIcon: {
        width: 24,
        height: 24,
        marginRight: 8,
    },
    headerText: {
        color: COLORS.TEXT.PRIMARY,
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerImage: {
        borderRadius: 20,
        width: 20,
        height: 20,
    },
    headerLogo: {
        width: 48,
        height: 48,
    },
});
