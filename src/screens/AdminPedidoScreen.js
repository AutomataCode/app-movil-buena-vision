import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, SafeAreaView, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function AdminPedidosScreen({ navigation }) {
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);
    
    // Filtros
    const [busqueda, setBusqueda] = useState('');
    const [estadoActivo, setEstadoActivo] = useState(''); 

    //   NUEVOS ESTADOS PARA EL MODAL DE CAMBIO DE ESTADO
    const [modalVisible, setModalVisible] = useState(false);
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
    const [procesandoEstado, setProcesandoEstado] = useState(false);

    const ESTADOS = [
        { label: 'Todos', value: '' },
        { label: 'Pendientes', value: 'PENDIENTE' },
        { label: 'Entregados', value: 'ENTREGADO' },
        { label: 'Cancelados', value: 'CANCELADO' }
    ];

    useFocusEffect(
        useCallback(() => {
            cargarPedidosAdmin();
        }, [estadoActivo, busqueda]) 
    );

    const cargarPedidosAdmin = async () => {
        setCargando(true);
        try {
            const token = await AsyncStorage.getItem('token_sesion');
            let url = '/admin/pedidos?';
            if (estadoActivo !== '') url += `estado=${estadoActivo}&`;
            if (busqueda.trim() !== '') url += `busqueda=${busqueda}`;

            const response = await api.get(url, { headers: { Authorization: `Bearer ${token}` } });
            setPedidos(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setCargando(false);
        }
    };

    // FUNCIÓN PARA CAMBIAR EL ESTADO EN EL BACKEND
    const actualizarEstado = async (nuevoEstado) => {
        if (!pedidoSeleccionado) return;

        // Evitar llamadas innecesarias si presiona el mismo estado
        if (pedidoSeleccionado.estado === nuevoEstado) {
            setModalVisible(false);
            return;
        }

        try {
            setProcesandoEstado(true);
            const token = await AsyncStorage.getItem('token_sesion');
            
            const response = await api.put(
                `/admin/pedidos/${pedidoSeleccionado.id}/estado`, 
                { estado: nuevoEstado }, // Body con el nuevo estado
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 200) {
                Alert.alert("Éxito", response.data.message);
                setModalVisible(false);
                cargarPedidosAdmin(); // Recargar la lista para ver los cambios
            }
        } catch (error) {
            const mensajeError = error.response?.data?.message || "No se pudo actualizar el estado.";
            Alert.alert("Error Operativo", mensajeError);
        } finally {
            setProcesandoEstado(false);
        }
    };

    const formatearFecha = (fechaString) => {
        if (!fechaString) return '';
        return new Date(fechaString).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' });
    };

    const obtenerColorEstado = (estado) => {
        switch (estado) {
            case 'PENDIENTE': return '#ffc107';
            case 'ENTREGADO': return '#28a745';
            case 'CANCELADO': return '#dc3545';
            default: return '#6c757d';
        }
    };

    const renderFiltroChip = (item) => {
        const activo = estadoActivo === item.value;
        return (
            <TouchableOpacity key={item.value} style={[styles.chip, activo && styles.chipActivo]} onPress={() => setEstadoActivo(item.value)}>
                <Text style={[styles.chipText, activo && styles.chipTextActivo]}>{item.label}</Text>
            </TouchableOpacity>
        );
    };

   const renderPedido = ({ item }) => (
        <View style={styles.card}>
            {/* 💡 1. AL TOCAR EL CUERPO DE LA TARJETA, VAMOS AL DETALLE */}
            <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => navigation.navigate('DetallePedido', { pedido: item })}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.numeroPedido}>{item.numeroPedido}</Text>
                    <View style={[styles.badge, { backgroundColor: obtenerColorEstado(item.estado) }]}>
                        <Text style={styles.badgeText}>{item.estado}</Text>
                    </View>
                </View>
                
                <View style={styles.cardBody}>
                    <View style={styles.clienteRow}>
                        <Ionicons name="person-circle-outline" size={20} color="#555" />
                        <Text style={styles.clienteNombre}>{item.nombreCliente || 'Cliente no especificado'}</Text>
                    </View>
                    <Text style={styles.fechaText}>Registrado: {formatearFecha(item.fechaPedido)}</Text>
                </View>
            </TouchableOpacity>

            {/* 💡 2. EL FOOTER AHORA TIENE EL BOTÓN PARA ABRIR EL MODAL */}
            <View style={styles.cardFooter}>
                <View>
                    <Text style={styles.totalTexto}>Total a cobrar:</Text>
                    <Text style={styles.totalMonto}>S/. {item.total?.toFixed(2)}</Text>
                </View>

                <TouchableOpacity 
                    style={styles.btnGestionar}
                    onPress={() => {
                        setPedidoSeleccionado(item);
                        setModalVisible(true);
                    }}
                >
                    <Ionicons name="create-outline" size={16} color="#fff" />
                    <Text style={styles.btnGestionarText}>Estado</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topBar}>
                <Text style={styles.topBarTitle}>Gestión de Pedidos</Text>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar por #Pedido o Cliente..."
                    value={busqueda}
                    onChangeText={setBusqueda}
                />
            </View>

            <View style={styles.chipsWrapper}>
                <FlatList 
                    horizontal showsHorizontalScrollIndicator={false}
                    data={ESTADOS} keyExtractor={item => item.label}
                    renderItem={({item}) => renderFiltroChip(item)}
                    contentContainerStyle={styles.chipsContainer}
                />
            </View>

            {cargando ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#0056b3" />
                </View>
            ) : (
                <FlatList
                    data={pedidos}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderPedido}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron pedidos.</Text>}
                />
            )}

            {/*MODAL FLOTANTE PARA CAMBIAR EL ESTADO */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Gestionar Pedido</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        
                        <Text style={styles.modalSubtitle}>
                            Selecciona el nuevo estado para el pedido {pedidoSeleccionado?.numeroPedido}:
                        </Text>

                        {procesandoEstado ? (
                            <ActivityIndicator size="large" color="#0056b3" style={{ marginVertical: 20 }} />
                        ) : (
                            <View style={styles.modalButtons}>
                                {/* Botón Pendiente */}
                                <TouchableOpacity 
                                    style={[styles.statusButton, { backgroundColor: '#ffc107' }]} 
                                    onPress={() => actualizarEstado('PENDIENTE')}
                                >
                                    <Ionicons name="time-outline" size={20} color="#000" />
                                    <Text style={[styles.statusButtonText, { color: '#000' }]}>Marcar como PENDIENTE</Text>
                                </TouchableOpacity>

                                {/* Botón Entregado (Dispara tu método de crear Venta) */}
                                <TouchableOpacity 
                                    style={[styles.statusButton, { backgroundColor: '#28a745' }]} 
                                    onPress={() => actualizarEstado('ENTREGADO')}
                                >
                                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                                    <Text style={styles.statusButtonText}>Marcar como ENTREGADO</Text>
                                </TouchableOpacity>

                                {/* Botón Cancelado (Dispara tu método de reponer Stock) */}
                                <TouchableOpacity 
                                    style={[styles.statusButton, { backgroundColor: '#dc3545' }]} 
                                    onPress={() => actualizarEstado('CANCELADO')}
                                >
                                    <Ionicons name="close-circle-outline" size={20} color="#fff" />
                                    <Text style={styles.statusButtonText}>CANCELAR Pedido</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f7fa' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    topBar: { paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e0e0e0', elevation: 2 },
    topBarTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 15, marginBottom: 5, paddingHorizontal: 15, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', height: 45 },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, fontSize: 15, color: '#333' },
    chipsWrapper: { paddingVertical: 10 },
    chipsContainer: { paddingHorizontal: 15, gap: 10 },
    chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e9ecef', borderWidth: 1, borderColor: '#dee2e6' },
    chipActivo: { backgroundColor: '#0056b3', borderColor: '#0056b3' },
    chipText: { color: '#495057', fontSize: 13, fontWeight: '600' },
    chipTextActivo: { color: '#fff' },
    listContainer: { padding: 15, paddingBottom: 30 },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    numeroPedido: { fontSize: 16, fontWeight: 'bold', color: '#0056b3' },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 15 },
    badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
    cardBody: { borderBottomWidth: 1, borderColor: '#f1f2f6', paddingBottom: 10, marginBottom: 10 },
    clienteRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    clienteNombre: { fontSize: 15, fontWeight: '600', color: '#333' },
    fechaText: { fontSize: 13, color: '#7f8c8d', marginLeft: 26 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalTexto: { fontSize: 14, color: '#666', fontWeight: '500' },
    totalMonto: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
    emptyText: { textAlign: 'center', marginTop: 40, fontSize: 15, color: '#888', fontStyle: 'italic' },
       
    btnGestionar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0056b3', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 5 },
    btnGestionarText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },

    // Estilos del Modal Flotante
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 25, elevation: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: -5 } },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    modalSubtitle: { fontSize: 14, color: '#666', marginBottom: 20, lineHeight: 20 },
    modalButtons: { gap: 12, paddingBottom: 10 },
    statusButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 12, gap: 10 },
    statusButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' }
});