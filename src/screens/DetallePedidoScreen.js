import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api'; 

export default function DetallePedidoScreen({ route, navigation }) {
    // Recibimos el pedido básico desde la lista anterior
    const { pedido } = route.params;
    
    // El estado inicia con los datos básicos, y luego se llenará con el JSON completo de Spring Boot
    const [pedidoCompleto, setPedidoCompleto] = useState(pedido);
    const [cargando, setCargando] = useState(true);

    const [cancelando, setCancelando] = useState(false);

    useEffect(() => {
        obtenerDetalleDelBackend();
    }, []);



    const obtenerDetalleDelBackend = async () => {
        try {
            const token = await AsyncStorage.getItem('token_sesion');
            
            // 💡 Consumimos el endpoint que acabas de crear (por ID)
            const response = await api.get(`/pedidoCliente/detallePedido/${pedido.id || pedido.idPedido}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.status === 200) {
                // Aquí guardamos tu JSON completo (con el array de detalles)
                setPedidoCompleto(response.data);
            }
        } catch (error) {
            console.error("Error al traer el detalle:", error);
            Alert.alert("Aviso", "No se pudieron cargar los productos de este pedido.");
        } finally {
            setCargando(false);
        }
    };

    const handleCancelarPedido = () => {
        Alert.alert(
            "Cancelar Pedido",
            "¿Estás seguro de que deseas dar de baja este pedido? Esta acción no se puede deshacer.",
            [
                { text: "No, mantener", style: "cancel" },
                { text: "Sí, cancelar", style: "destructive", onPress: ejecutarCancelar }
            ]
        );
    };

    const ejecutarCancelar = async () => {
        try {
            setCancelando(true);
            const token = await AsyncStorage.getItem('token_sesion');
            
            // Llamamos al nuevo endpoint pasándole el ID del pedido
            const idPed = pedidoCompleto.id || pedidoCompleto.idPedido;
            const response = await api.put(`/pedidoCliente/${idPed}/cancelar`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                Alert.alert("Éxito", "El pedido ha sido cancelado.");
                // Actualizamos el estado localmente para que la interfaz cambie de inmediato
                setPedidoCompleto({ ...pedidoCompleto, estado: 'CANCELADO' });
            }
        } catch (error) {
            const mensajeError = error.response?.data?.message || "No se pudo procesar la cancelación.";
            Alert.alert("Error", mensajeError);
        } finally {
            setCancelando(false);
        }
    };

    const obtenerColorEstado = (estado) => {
        switch (estado) {
            case 'PENDIENTE': return '#ffc107';
            case 'ENTREGADO': return '#28a745';
            case 'CANCELADO': return '#dc3545';
            default: return '#6c757d';
        }
    };

    const formatearFecha = (fechaString) => {
        if (!fechaString) return '';
        const fecha = new Date(fechaString);
        return fecha.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' });
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Barra Superior */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.topBarTitle}>Detalle del Pedido</Text>
                <View style={{ width: 40 }} />
            </View>

            {cargando ? (
                // Pantalla de carga mientras trae los detalles
                <View style={styles.centerLoading}>
                    <ActivityIndicator size="large" color="#0056b3" />
                    <Text style={{ marginTop: 15, color: '#666', fontWeight: '500' }}>Cargando tus monturas...</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    
                    {/* Tarjeta de Información General */}
                    <View style={styles.card}>
                        <View style={styles.headerRow}>
                            <Text style={styles.numeroPedido}>{pedidoCompleto.numeroPedido}</Text>
                            <View style={[styles.badge, { backgroundColor: obtenerColorEstado(pedidoCompleto.estado) }]}>
                                <Text style={styles.badgeText}>{pedidoCompleto.estado}</Text>
                            </View>
                        </View>
                        <Text style={styles.fechaText}>Registrado el: {formatearFecha(pedidoCompleto.fechaPedido)}</Text>
                        
                        <View style={styles.divider} />
                        
                        <View style={styles.infoRow}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="location" size={18} color="#0056b3" />
                            </View>
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.label}>Dirección de Entrega:</Text>
                                <Text style={styles.value}>{pedidoCompleto.direccionEntrega || 'No especificada'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Lista de Productos */}
                    <Text style={styles.sectionTitle}>Productos Solicitados</Text>
                    <View style={styles.cardProductos}>
                        
                        {/* Iteramos sobre tu array "detalles" del JSON */}
                        {pedidoCompleto.detalles && pedidoCompleto.detalles.length > 0 ? (
                            pedidoCompleto.detalles.map((detalle, index) => {
                                // Obtenemos los datos desde tu estructura JSON
                                const productoInfo = detalle.producto;
                                const urlImagen = productoInfo?.imagen;

                                return (
                                    <View key={index} style={styles.productoRow}>
                                        
                                        {/* Imagen del Producto */}
                                        <View style={styles.itemImageContainer}>
                                            {urlImagen ? (
                                                <Image source={{ uri: urlImagen }} style={styles.productImage} />
                                            ) : (
                                                <Ionicons name="glasses-outline" size={28} color="#ccc" />
                                            )}
                                        </View>
                                        
                                        {/* Nombre y Cantidad */}
                                        <View style={styles.productoDetails}>
                                            <Text style={styles.nombreProducto} numberOfLines={2}>
                                                {productoInfo?.nombre || 'Montura Buena Visión'}
                                            </Text>
                                            <Text style={styles.cantidadText}>Cantidad: {detalle.cantidad}</Text>
                                        </View>
                                        
                                        {/* Cálculos de Precio */}
                                        <View style={styles.precioContainer}>
                                            <Text style={styles.precioUnitario}>c/u S/. {detalle.precioUnitario?.toFixed(2)}</Text>
                                            <Text style={styles.precioProducto}>
                                                S/. {(detalle.precioUnitario * detalle.cantidad).toFixed(2)}
                                            </Text>
                                        </View>

                                    </View>
                                );
                            })
                        ) : (
                            <Text style={styles.emptyText}>No hay detalles de productos disponibles.</Text>
                        )}
                    </View>

                    {/*  Tarjeta de Totales */}
                    <View style={styles.summaryContainer}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>S/. {pedidoCompleto.subtotal?.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>IGV (18%)</Text>
                            <Text style={styles.summaryValue}>S/. {pedidoCompleto.igv?.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Costo de Envío</Text>
                            <Text style={[styles.summaryValue, { color: '#28a745' }]}>Gratis</Text>
                        </View>
                        
                        <View style={[styles.divider, { borderStyle: 'dashed', borderColor: '#ccc' }]} />
                        
                        <View style={styles.summaryRow}>
                            <Text style={styles.totalLabel}>Total Pagado</Text>
                            <Text style={styles.totalValue}>S/. {pedidoCompleto.total?.toFixed(2)}</Text>
                        </View>
                    </View>

                    {/* BOTÓN DE CANCELACIÓN CONDICIONAL */}
                    {pedidoCompleto.estado === 'PENDIENTE' && (
                        <TouchableOpacity 
                            style={[styles.cancelButton, cancelando && { backgroundColor: '#fab1a0' }]} 
                            onPress={handleCancelarPedido}
                            disabled={cancelando}
                        >
                            {cancelando ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="close-circle-outline" size={22} color="#fff" />
                                    <Text style={styles.cancelButtonText}>Cancelar Pedido</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}

                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f7fa' },
    centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e0e0e0', elevation: 2 },
    backButton: { padding: 5 },
    topBarTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    
    scrollContainer: { padding: 15, paddingBottom: 40 },
    
    // Tarjeta General
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 3 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
    numeroPedido: { fontSize: 18, fontWeight: '900', color: '#0056b3' },
    badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5 },
    fechaText: { fontSize: 13, color: '#7f8c8d', marginBottom: 10 },
    
    divider: { height: 1, backgroundColor: '#f1f2f6', marginVertical: 12 },
    
    infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
    iconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e6f0fa', justifyContent: 'center', alignItems: 'center' },
    infoTextContainer: { flex: 1, marginLeft: 12 },
    label: { fontSize: 12, color: '#7f8c8d', fontWeight: 'bold', textTransform: 'uppercase' },
    value: { fontSize: 15, color: '#2c3e50', marginTop: 2, fontWeight: '500' },
    
    // Lista de Productos 
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#34495e', marginBottom: 12, paddingLeft: 5, textTransform: 'uppercase', letterSpacing: 0.5 },
    cardProductos: { backgroundColor: '#fff', borderRadius: 16, padding: 15, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 3 },
    
    productoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#f1f2f6' },
    itemImageContainer: { width: 65, height: 65, borderRadius: 12, backgroundColor: '#f8f9fa', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 1, borderColor: '#f1f2f6' },
    productImage: { width: '100%', height: '100%', resizeMode: 'contain' },
    
    productoDetails: { flex: 1, paddingHorizontal: 12, justifyContent: 'center' },
    nombreProducto: { fontSize: 15, fontWeight: '600', color: '#2c3e50', marginBottom: 4 },
    cantidadText: { fontSize: 13, color: '#7f8c8d', fontWeight: '500' },
    
    precioContainer: { alignItems: 'flex-end', justifyContent: 'center' },
    precioUnitario: { fontSize: 11, color: '#95a5a6', marginBottom: 2 },
    precioProducto: { fontSize: 16, fontWeight: 'bold', color: '#0056b3' },
    
    emptyText: { textAlign: 'center', color: '#95a5a6', fontStyle: 'italic', paddingVertical: 15 },
    
    // Tarjeta de Totales
    summaryContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 5 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 6 },
    summaryLabel: { fontSize: 14, color: '#7f8c8d', fontWeight: '500' },
    summaryValue: { fontSize: 15, fontWeight: '600', color: '#2c3e50' },
    totalLabel: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
    totalValue: { fontSize: 24, fontWeight: '900', color: '#0056b3' },
    cancelButton: { flexDirection: 'row', backgroundColor: '#dc3545', padding: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 25, gap: 10, shadowColor: '#dc3545', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 4 },
    cancelButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});