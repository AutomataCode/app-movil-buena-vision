import React from "react";
import { View, Text, StyleSheet } from 'react-native';

export default function AdminReporteScreen(){
    return (
            <View style={styles.container}>
                <Text style={styles.title}>Reporte </Text>
                <Text style={styles.info}>Esta es la pantalla de reporte Admin.</Text>
            </View>
    );
}
const styles = StyleSheet.create({
        container: {
            flex: 1,
                padding: 20,
            backgroundColor: '#f5f5f5',
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 20,
            },
        info: {
            fontSize: 16,
            marginBottom: 10,
        },
    });