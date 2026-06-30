import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { sucursalService } from '../services/sucursalService';


export default function MisSucursalesScreen({ navigation }) {
    const [sucursales, setSucursales] = useState([]);
    const [cargando, setCargando] = useState(true);

    // useFocusEffect recarga la lista cada vez que entras a esta pantalla
    // (ideal para cuando regresas después de crear una nueva sucursal)
    useFocusEffect(
        useCallback(() => {
            cargarSucursales();
        }, [])
    );

    const cargarSucursales = async () => {
        setCargando(true);
        try {
            const data = await sucursalService.obtenerMisSucursales();
            setSucursales(data);
        } catch (error) {
            Alert.alert("Error", "No se pudieron cargar tus sucursales.");
        } finally {
            setCargando(false);
        }
    };

    const confirmarEliminacion = (id) => {
        Alert.alert(
            "Eliminar Sucursal",
            "¿Estás seguro de que deseas eliminar esta dirección de envío?",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Eliminar", style: "destructive", onPress: () => ejecutarEliminacion(id) }
            ]
        );
    };

    const ejecutarEliminacion = async (id) => {
        try {
            await sucursalService.eliminarSucursal(id);
            Alert.alert("Éxito", "Sucursal eliminada correctamente.");
            cargarSucursales(); // Recargamos la lista
        } catch (error) {
            Alert.alert("Error", "No se pudo eliminar la sucursal.");
        }
    };

    // Diseño de cada tarjeta
    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.headerTitleContainer}>
                    <Ionicons name="storefront" size={22} color="#0056b3" />
                    <Text style={styles.cardTitle}>{item.nombreSucursal}</Text>
                </View>
                <View style={styles.actionButtons}>
                    {/* Botón Editar: Viajaremos al formulario pasándole los datos actuales */}
                    <TouchableOpacity 
                        style={styles.iconButton} 
                        onPress={() => navigation.navigate('FormularioSucursal', { sucursalAEditar: item })}
                    >
                        <Ionicons name="pencil" size={20} color="#28a745" />
                    </TouchableOpacity>
                    
                    {/* Botón Eliminar */}
                    <TouchableOpacity style={styles.iconButton} onPress={() => confirmarEliminacion(item.idSucursal)}>
                        <Ionicons name="trash" size={20} color="#dc3545" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.infoText}>{item.direccion}</Text>
                </View>
                {item.nombreEncargado ? (
                    <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={16} color="#666" />
                        <Text style={styles.infoText}>{item.nombreEncargado} ({item.telefonoEncargado})</Text>
                    </View>
                ) : null}
                {item.horarioRecepcion ? (
                    <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={16} color="#666" />
                        <Text style={styles.infoText}>{item.horarioRecepcion}</Text>
                    </View>
                ) : null}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {cargando ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#0056b3" />
                </View>
            ) : (
                <FlatList
                    data={sucursales}
                    keyExtractor={(item) => item.idSucursal.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No tienes sucursales registradas aún.</Text>
                    }
                />
            )}

            {/* 💡 Botón Flotante para agregar nueva sucursal */}
            <TouchableOpacity 
                style={styles.fab} 
                onPress={() => navigation.navigate('FormularioSucursal')}
            >
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f7fa' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContainer: { padding: 15, paddingBottom: 80 },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 10, marginBottom: 10 },
    headerTitleContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginLeft: 8, flexShrink: 1 },
    actionButtons: { flexDirection: 'row', gap: 15 },
    iconButton: { padding: 5 },
    cardBody: { gap: 8 },
    infoRow: { flexDirection: 'row', alignItems: 'center' },
    infoText: { fontSize: 14, color: '#555', marginLeft: 8, flex: 1 },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#888' },
    fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: '#0056b3', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }
});