import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { pedidoService } from '../services/pedidoService';

export default function PedidoScreen({navigation}) {
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);

    // 💡 Recarga los pedidos cada vez que el usuario abre esta pestaña
    useFocusEffect(
        useCallback(() => {
            cargarHistorial();
        }, [])
    );

    const cargarHistorial = async () => {
        try {
            setCargando(true);
            const data = await pedidoService.obtenerMisPedidos();
            setPedidos(data);
        } catch (error) {
            console.error("No se pudieron cargar los pedidos");
        } finally {
            setCargando(false);
        }
    };

    // Función para darle un color distintivo según el estado del pedido
    const obtenerColorEstado = (estado) => {
        switch (estado) {
            case 'PENDIENTE': return '#ffc107'; // Amarillo
            case 'ENTREGADO': return '#28a745'; // Verde
            case 'CANCELADO': return '#dc3545'; // Rojo
            default: return '#6c757d'; // Gris
        }
    };

    // Formatear la fecha que viene de Spring Boot (ej. 2026-06-22T14:30:00) a algo legible
    const formatearFecha = (fechaString) => {
        if (!fechaString) return 'Fecha desconocida';
        const fecha = new Date(fechaString);
        return fecha.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' });
    };
const renderItem = ({ item }) => (
        
        <TouchableOpacity 
            style={styles.card} 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('DetallePedido', { pedido: item })}
        >
            <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                    <Ionicons name="receipt-outline" size={20} color="#0056b3" />
                    <Text style={styles.pedidoNumero}>{item.numeroPedido}</Text>
                </View>
                <View style={[styles.badgeEstado, { backgroundColor: obtenerColorEstado(item.estado) }]}>
                    <Text style={styles.textoEstado}>{item.estado}</Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <Text style={styles.label}>Fecha de Orden:</Text>
                <Text style={styles.valor}>{formatearFecha(item.fechaPedido)}</Text>

                <Text style={[styles.label, { marginTop: 8 }]}>Dirección de Envío:</Text>
                <Text style={styles.valor} numberOfLines={2}>{item.direccionEntrega}</Text>
            </View>

            <View style={styles.cardFooter}>
                <Text style={styles.totalTexto}>Total Pagado:</Text>
                <Text style={styles.totalMonto}>S/. {item.total?.toFixed(2)}</Text>
            </View>
        </TouchableOpacity>
    );

    if (cargando) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0056b3" />
                <Text style={{ marginTop: 10, color: '#666' }}>Cargando historial...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topBar}>
                <Text style={styles.topBarTitle}>Mis Pedidos</Text>
            </View>

            <FlatList
                data={pedidos}
                renderItem={renderItem}
                keyExtractor={(item) => item.idPedido.toString()}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="basket-outline" size={80} color="#ccc" />
                        <Text style={styles.emptyTitle}>No tienes pedidos</Text>
                        <Text style={styles.emptySub}>Aún no has realizado ninguna compra con nosotros.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    topBar: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e0e0e0', alignItems: 'center' },
    topBarTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    listContainer: { padding: 15, paddingBottom: 30 },
    
    // Diseño de la Tarjeta del Pedido
    card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#e9ecef', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, overflow: 'hidden' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa', padding: 12, borderBottomWidth: 1, borderColor: '#e9ecef' },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    pedidoNumero: { fontSize: 15, fontWeight: 'bold', color: '#0056b3' },
    badgeEstado: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    textoEstado: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
    
    cardBody: { padding: 15 },
    label: { fontSize: 12, color: '#666', fontWeight: '500' },
    valor: { fontSize: 14, color: '#333', marginTop: 2 },
    
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#fafbfc', borderTopWidth: 1, borderColor: '#e9ecef' },
    totalTexto: { fontSize: 14, fontWeight: 'bold', color: '#555' },
    totalMonto: { fontSize: 18, fontWeight: 'bold', color: '#0056b3' },

    // Estado Vacío
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 15 },
    emptySub: { fontSize: 14, color: '#777', marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }
});