import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, SafeAreaView, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { productoService } from '../services/productoAdminService';

export default function AdminProductosScreen({ navigation }) {
    const [productos, setProductos] = useState([]);
    const [productosFiltrados, setProductosFiltrados] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState('');

    // useFocusEffect recarga la lista automaticamente al volver a esta pantalla
    useFocusEffect(
        useCallback(() => {
            cargarProductos();
        }, [])
    );

const cargarProductos = async () => {
        setCargando(true);
        try {
            console.log("Iniciando peticion a /admin/productos...");
            const data = await productoService.obtenerProductosAdmin();
            
            setProductos(data);
            setProductosFiltrados(data);
        } catch (error) {
            console.error("Error exacto en Axios:", error.response ? error.response.data : error.message);
            Alert.alert("Error", "No se pudo cargar la lista de productos.");
        } finally {
            setCargando(false);
        }
    };

    // Funcion para filtrar la lista localmente mientras el usuario escribe
    const manejarBusqueda = (texto) => {
        setBusqueda(texto);
        if (texto.trim() === '') {
            setProductosFiltrados(productos);
        } else {
            const filtrado = productos.filter(prod => 
                prod.nombre.toLowerCase().includes(texto.toLowerCase()) || 
                prod.sku.toLowerCase().includes(texto.toLowerCase())
            );
            setProductosFiltrados(filtrado);
        }
    };

    // Logica de borrado logico
    const confirmarEliminacion = (idProducto, nombre) => {
        Alert.alert(
            "Inhabilitar Producto",
            `¿Estas seguro de que deseas inhabilitar el producto "${nombre}"?`,
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Inhabilitar", 
                    style: "destructive", 
                    onPress: () => ejecutarEliminacion(idProducto) 
                }
            ]
        );
    };

    const ejecutarEliminacion = async (idProducto) => {
        try {
            await productoService.eliminarProducto(idProducto);
            Alert.alert("Exito", "Producto inhabilitado correctamente.");
            cargarProductos();
        } catch (error) {
            Alert.alert("Error", "No se pudo inhabilitar el producto.");
        }
    };

    // Helper para definir colores segun el estado y el stock
    const obtenerColorEstado = (estado) => {
        if (estado === 'INACTIVO') return '#dc3545'; 
        return '#28a745'; 
    };

    const renderProducto = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.imageContainer}>
                {item.imagenUrl ? (
                    <Image source={{ uri: item.imagenUrl }} style={styles.productImage} />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Ionicons name="image-outline" size={30} color="#ccc" />
                    </View>
                )}
            </View>

            <View style={styles.infoContainer}>
                <View style={styles.headerRow}>
                    <Text style={styles.skuText}>SKU: {item.sku}</Text>
                    <View style={[styles.badge, { backgroundColor: obtenerColorEstado(item.estado) }]}>
                        <Text style={styles.badgeText}>{item.estado}</Text>
                    </View>
                </View>

                <Text style={styles.productName} numberOfLines={2}>{item.nombre}</Text>
                <Text style={styles.categoryText}>{item.nombreCategoria} | {item.nombreMarca}</Text>

                <View style={styles.priceStockRow}>
                    <Text style={styles.priceText}>S/. {item.precioVenta?.toFixed(2)}</Text>
                    {/* Alerta visual si el stock esta por debajo del minimo */}
                    <Text style={[
                        styles.stockText, 
                        item.stockActual <= item.stockMinimo && styles.stockWarning
                    ]}>
                        Stock: {item.stockActual}
                    </Text>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity 
                        style={[styles.btnAction, styles.btnEdit]}
                        onPress={() => navigation.navigate('FormularioProducto', { productoAEditar: item })}
                    >
                        <Ionicons name="pencil" size={16} color="#fff" />
                        <Text style={styles.btnActionText}>Editar</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.btnAction, styles.btnDelete]}
                        onPress={() => confirmarEliminacion(item.idProducto, item.nombre)}
                    >
                        <Ionicons name="trash-outline" size={16} color="#dc3545" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topBar}>
                <Text style={styles.topBarTitle}>Inventario de Productos</Text>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar por nombre o SKU..."
                    value={busqueda}
                    onChangeText={manejarBusqueda}
                />
                {busqueda !== '' && (
                    <TouchableOpacity onPress={() => manejarBusqueda('')}>
                        <Ionicons name="close-circle" size={20} color="#888" />
                    </TouchableOpacity>
                )}
            </View>

            {cargando ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#0056b3" />
                </View>
            ) : (
                <FlatList
                    data={productosFiltrados}
                    keyExtractor={(item) => item.idProducto.toString()}
                    renderItem={renderProducto}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No se encontraron productos.</Text>
                    }
                />
            )}

            {/* Boton Flotante para crear un nuevo producto */}
            <TouchableOpacity 
                style={styles.fab}
                onPress={() => navigation.navigate('FormularioProducto')}
            >
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
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
    
    listContainer: { padding: 15, paddingBottom: 80 },
    card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
    
    imageContainer: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#f8f9fa', overflow: 'hidden', marginRight: 12 },
    productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    
    infoContainer: { flex: 1, justifyContent: 'space-between' },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    skuText: { fontSize: 12, color: '#7f8c8d', fontWeight: 'bold' },
    badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    
    productName: { fontSize: 15, fontWeight: 'bold', color: '#2c3e50', marginBottom: 2 },
    categoryText: { fontSize: 12, color: '#95a5a6', marginBottom: 6 },
    
    priceStockRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    priceText: { fontSize: 16, fontWeight: 'bold', color: '#0056b3' },
    stockText: { fontSize: 13, color: '#555', fontWeight: '500' },
    stockWarning: { color: '#e67e22', fontWeight: 'bold' }, // Color naranja para alerta de stock bajo
    
    actionButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
    btnAction: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, gap: 5 },
    btnEdit: { backgroundColor: '#0056b3' },
    btnDelete: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#dc3545' },
    btnActionText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
    
    emptyText: { textAlign: 'center', marginTop: 40, fontSize: 15, color: '#888', fontStyle: 'italic' },
    
    fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: '#0056b3', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }
});