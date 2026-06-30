import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';
import api from '../services/api';

const screenWidth = Dimensions.get("window").width;

export default function AdminDashboardScreen() {
    const [dashboardData, setDashboardData] = useState(null);
    const [cargando, setCargando] = useState(true);

    useFocusEffect(
        useCallback(() => {
            cargarDatosDashboard();
        }, [])
    );

    const cargarDatosDashboard = async () => {
        setCargando(true);
        try {
            const token = await AsyncStorage.getItem('token_sesion');
            const response = await api.get('/admin/estadisticas', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDashboardData(response.data);
        } catch (error) {
            console.error("Error al cargar dashboard:", error);
        } finally {
            setCargando(false);
        }
    };

    if (cargando || !dashboardData) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0056b3" />
                <Text style={styles.loadingText}>Procesando métricas de ventas...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topBar}>
                <Text style={styles.topBarTitle}>Dashboard Gerencial</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                
                {/*  TARJETAS DE INDICADORES CLAVE (KPIs) */}
                <View style={styles.kpiContainer}>
                    <View style={styles.kpiCard}>
                        <View style={styles.kpiIconWrapper}>
                            <Ionicons name="cash-outline" size={24} color="#28a745" />
                        </View>
                        <Text style={styles.kpiLabel}>Ingresos Totales</Text>
                        <Text style={styles.kpiValue}>
                            S/. {dashboardData.ingresosTotales?.toFixed(2) || '0.00'}
                        </Text>
                    </View>

                    <View style={styles.kpiCard}>
                        <View style={[styles.kpiIconWrapper, { backgroundColor: '#e6f0fa' }]}>
                            <Ionicons name="cart-outline" size={24} color="#0056b3" />
                        </View>
                        <Text style={styles.kpiLabel}>Ventas Concretadas</Text>
                        <Text style={[styles.kpiValue, { color: '#0056b3' }]}>
                            {dashboardData.cantidadVentas}
                        </Text>
                    </View>
                </View>

                {/*  GRÁFICO ESTADÍSTICO */}
                <View style={styles.chartCard}>
                    <Text style={styles.chartTitle}>Ingresos Anuales (S/.)</Text>
                    <LineChart
                        data={{
                            // Mostramos los primeros 6 meses para que se vea estético en la pantalla
                            labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
                            datasets: [
                                {
                                    // Tomamos los primeros 6 meses del arreglo que envió Spring Boot
                                    data: dashboardData.ingresosPorMes.slice(0, 6)
                                }
                            ]
                        }}
                        width={screenWidth - 60} // Ajuste dinámico a la pantalla
                        height={220}
                        yAxisLabel="S/."
                        chartConfig={{
                            backgroundColor: "#ffffff",
                            backgroundGradientFrom: "#ffffff",
                            backgroundGradientTo: "#ffffff",
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(0, 86, 179, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
                            style: { borderRadius: 16 },
                            propsForDots: { r: "6", strokeWidth: "2", stroke: "#0056b3" }
                        }}
                        bezier // Hace la curva de la línea redondeada
                        style={styles.chartStyle}
                    />
                </View>

                {/*  SECCIÓN INFORMATIVA */}
                <View style={styles.infoCard}>
                    <Ionicons name="information-circle-outline" size={24} color="#666" />
                    <Text style={styles.infoText}>
                        Estas métricas se calculan exclusivamente a partir de las órdenes cuyo estado ha avanzado a "ENTREGADO" y que han generado una Venta formal y un ticket de salida en el inventario.
                    </Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f7fa' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 15, color: '#666', fontWeight: '500' },
    topBar: { paddingHorizontal: 20, paddingVertical: 18, backgroundColor: '#0056b3', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
    topBarTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
    scrollContainer: { padding: 15, paddingBottom: 40 },
    
    kpiContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    kpiCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 15, marginHorizontal: 5, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
    kpiIconWrapper: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    kpiLabel: { fontSize: 13, color: '#7f8c8d', fontWeight: '600', marginBottom: 5 },
    kpiValue: { fontSize: 22, fontWeight: '900', color: '#28a745' },
    
    chartCard: { backgroundColor: '#fff', borderRadius: 16, padding: 15, marginBottom: 20, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, alignItems: 'center' },
    chartTitle: { fontSize: 16, fontWeight: 'bold', color: '#34495e', alignSelf: 'flex-start', marginBottom: 15 },
    chartStyle: { marginVertical: 8, borderRadius: 16 },
    
    infoCard: { flexDirection: 'row', backgroundColor: '#e9ecef', borderRadius: 12, padding: 15, alignItems: 'center', gap: 10 },
    infoText: { flex: 1, fontSize: 13, color: '#555', fontStyle: 'italic', lineHeight: 20 }
});