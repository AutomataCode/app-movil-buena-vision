import React, { useState, useEffect } from 'react';
import { DeviceEventEmitter, StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '../services/api';

export default function AdminUsersScreen() {
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [procesandoId, setProcesandoId] = useState(null); 

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        try {
            setCargando(true);
            const token = await AsyncStorage.getItem('token_sesion');
            const response = await api.get('/admin/usuarios', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsuarios(response.data);
        } catch (error) {
            console.error("Error al cargar usuarios:", error);
            Alert.alert("Error", "No se pudo obtener la lista de usuarios.");
        } finally {
            setCargando(false);
        }
    };

    const handleRestablecer = async (id, nombre, dni) => {
        Alert.alert(
            'Restablecer Contraseña',
            `¿Estás seguro de restablecer la clave de ${nombre}? Se cambiará por defecto a su DNI: ${dni}`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sí, Restablecer',
                    onPress: async () => {
                        try {
                            setProcesandoId(id);
                            const token = await AsyncStorage.getItem('token_sesion');
                            
                            const response = await api.put(`/admin/usuarios/${id}/restablecer-password`, {}, { // No se envían datos adicionales, solo el ID en la URL
                                headers: { Authorization: `Bearer ${token}` }
                            });

                            if (response.status === 200) {
                                Alert.alert('Éxito', `La contraseña se restableció correctamente al DNI.`);
                            }
                        } catch (error) {
                            console.error(error);
                            Alert.alert('Error', 'No se pudo completar la operación.');
                        } finally {
                            setProcesandoId(null);
                        }
                    }
                }
            ]
        );
    };

    const handlePromover = async (id, nombre) => {
        Alert.alert(
            'Promover a Administrador',
            `¿Darle acceso total al sistema a ${nombre}? Esta acción no se puede deshacer desde la app.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sí, Promover',
                    onPress: async () => {
                        try {
                            setProcesandoId(id);
                            const token = await AsyncStorage.getItem('token_sesion');
                            
                            const response = await api.put(`/admin/usuarios/${id}/promover`, {}, {
                                headers: { Authorization: `Bearer ${token}` }
                            });

                            if (response.status === 200) {
                                Alert.alert('Éxito', response.data.message);
                                // Recargamos la lista para reflejar cualquier cambio visual
                                cargarUsuarios(); 
                            }
                        } catch (error) {
                            // Capturamos el mensaje de error personalizado (ej. "Ya es admin")
                            const msg = error.response?.data?.message || 'Error al procesar la solicitud.';
                            Alert.alert('Aviso', msg);
                        } finally {
                            setProcesandoId(null);
                        }
                    }
                }
            ]
        );
    };
    const handleLogout = async () => {
        await AsyncStorage.removeItem('token_sesion');
        await AsyncStorage.removeItem('rol_usuario');
        await AsyncStorage.removeItem('usuario'); // Limpiar el nombre de usuario almacenado
        DeviceEventEmitter.emit('SESION_EXPIRADA'); // Emitir evento para actualizar el estado de sesión en toda la app
    };

    

    const renderItem = ({ item }) => (
        <View style={styles.userCard}>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.nombre} {item.apellido}</Text>
                <Text style={styles.userDni}>DNI: {item.numeroDocumento}</Text>
                <Text style={styles.userEmail}>Usuario: {item.email || 'No registrado'}</Text>
            </View>
            
            {procesandoId === item.id ? (
                <ActivityIndicator size="small" color="#0056b3" style={{ marginHorizontal: 20 }} />
            ) : (
                
                <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity 
                        style={styles.resetButton} 
                        onPress={() => handleRestablecer(item.id, item.nombre, item.numeroDocumento)}
                    >
                        <Text style={styles.resetButtonText}> Restablecer Clave</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.adminButton} 
                        onPress={() => handlePromover(item.id, item.nombre)}
                    >
                        <Text style={styles.adminButtonText}>Promover Admin</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    if (cargando) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0056b3" />
                <Text style={{ marginTop: 10 }}>Cargando panel de administración...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.adminHeader}>
                <Text style={styles.adminTitle}>Panel de Control Admin</Text>
                <TouchableOpacity style={styles.logoutTopButton} onPress={handleLogout}>
                    <Text style={styles.logoutTopButtonText}>Salir</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.sectionSubtitle}>Lista de Usuarios y Clientes del Sistema</Text>

            <FlatList 
                data={usuarios}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    adminHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0056b3', padding: 15, borderRadius: 10, marginBottom: 15 },
    adminTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    logoutTopButton: { backgroundColor: '#dc3545', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 6 },
    logoutTopButtonText: { color: '#fff', fontWeight: 'bold' },
    sectionSubtitle: { fontSize: 14, color: '#666', marginBottom: 15, fontWeight: '500' },
    userCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#e0e0e0', elevation: 2 },
    userInfo: { flex: 1, paddingRight: 10 },
    userName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    userDni: { fontSize: 13, color: '#0056b3', marginTop: 3, fontWeight: '600' },
    userEmail: { fontSize: 12, color: '#777', marginTop: 2 },
    
    // Estilos de los botones agrupados
    actionButtonsContainer: { flexDirection: 'column', gap: 8 },
    resetButton: { backgroundColor: '#e6f0fa', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#0056b3', alignItems: 'center' },
    resetButtonText: { color: '#0056b3', fontSize: 12, fontWeight: 'bold' },
    adminButton: { backgroundColor: '#fff3cd', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ffc107', alignItems: 'center' },
    adminButtonText: { color: '#856404', fontSize: 12, fontWeight: 'bold' }
});