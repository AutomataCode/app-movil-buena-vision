import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { sucursalService } from '../services/sucursalService';

export default function FormularioSucursalScreen({ route, navigation }) {
    // Verificamos si nos pasaron una sucursal para editar
    const sucursalAEditar = route.params?.sucursalAEditar || null;
    const esModoEdicion = !!sucursalAEditar;

    // Estados del formulario
    const [nombreSucursal, setNombreSucursal] = useState('');
    const [direccion, setDireccion] = useState('');
    const [nombreEncargado, setNombreEncargado] = useState('');
    const [telefonoEncargado, setTelefonoEncargado] = useState('');
    const [horarioRecepcion, setHorarioRecepcion] = useState('');
    const [latitud, setLatitud] = useState(null);
    const [longitud, setLongitud] = useState(null);

    // Estados de carga
    const [guardando, setGuardando] = useState(false);
    const [obteniendoGPS, setObteniendoGPS] = useState(false);

    // Si estamos en modo edición, llenamos las cajas de texto al abrir la pantalla
    useEffect(() => {
        if (esModoEdicion) {
            setNombreSucursal(sucursalAEditar.nombreSucursal);
            setDireccion(sucursalAEditar.direccion);
            setNombreEncargado(sucursalAEditar.nombreEncargado || '');
            setTelefonoEncargado(sucursalAEditar.telefonoEncargado || '');
            setHorarioRecepcion(sucursalAEditar.horarioRecepcion || '');
            setLatitud(sucursalAEditar.latitud);
            setLongitud(sucursalAEditar.longitud);
        }
    }, [sucursalAEditar]);

    // Lógica del Sensor GPS
    const obtenerMiUbicacion = async () => {
        try {
            setObteniendoGPS(true);
            let { status } = await Location.requestForegroundPermissionsAsync();
            
            if (status !== 'granted') {
                Alert.alert('Permiso denegado', 'Necesitamos acceso a tu ubicación para obtener las coordenadas.');
                setObteniendoGPS(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            setLatitud(location.coords.latitude);
            setLongitud(location.coords.longitude);

            let geocode = await Location.reverseGeocodeAsync(location.coords);
            if (geocode.length > 0) {
                const lugar = geocode[0];
                const direccionArmada = `${lugar.street || lugar.name}, ${lugar.city || lugar.subregion}`;
                setDireccion(direccionArmada);
            }
        } catch (error) {
            Alert.alert('Error GPS', 'No pudimos obtener tu ubicación. Verifica si tu GPS está encendido.');
        } finally {
            setObteniendoGPS(false);
        }
    };

    // 💾 Lógica para Guardar o Actualizar
    const handleGuardar = async () => {
        if (nombreSucursal.trim() === '' || direccion.trim() === '') {
            Alert.alert('Datos incompletos', 'El nombre de la sucursal y la dirección son obligatorios.');
            return;
        }

        try {
            setGuardando(true);
            const payload = {
                nombreSucursal,
                direccion,
                nombreEncargado,
                telefonoEncargado,
                horarioRecepcion,
                latitud,
                longitud
            };

            if (esModoEdicion) {
                // UPDATE
                await sucursalService.actualizarSucursal(sucursalAEditar.idSucursal, payload);
                Alert.alert('¡Actualizado!', 'La sucursal se modificó correctamente.');
            } else {
                // CREATE
                await sucursalService.crearSucursal(payload);
                Alert.alert('¡Registrado!', 'La nueva sucursal ha sido guardada.');
            }
            
            // Volvemos a la pantalla anterior (la lista se recargará sola gracias al useFocusEffect)
            navigation.goBack();

        } catch (error) {
            Alert.alert('Error', 'Hubo un problema al guardar la sucursal. Intenta nuevamente.');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.topBarTitle}>
                    {esModoEdicion ? 'Editar Sucursal' : 'Nueva Sucursal'}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Datos Principales</Text>

                    <Text style={styles.label}>Nombre del Local *</Text>
                    <TextInput 
                        style={styles.input}
                        value={nombreSucursal}
                        onChangeText={setNombreSucursal}
                        placeholder="Ej: Tienda Principal Miraflores"
                    />

                    <Text style={styles.label}>Dirección *</Text>
                    <View style={styles.inputWrapperGps}>
                        <TextInput 
                            style={styles.textInputGps}
                            value={direccion}
                            onChangeText={setDireccion}
                            placeholder="Ej: Av. Larco 1234"
                            multiline
                        />
                        <TouchableOpacity style={styles.gpsButton} onPress={obtenerMiUbicacion} disabled={obteniendoGPS}>
                            {obteniendoGPS ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Ionicons name="navigate" size={20} color="#fff" />
                            )}
                        </TouchableOpacity>
                    </View>
                    {latitud && longitud && (
                        <Text style={styles.coordText}>📍 Coordenadas capturadas: {latitud.toFixed(4)}, {longitud.toFixed(4)}</Text>
                    )}
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Datos Logísticos (Opcional)</Text>

                    <Text style={styles.label}>Nombre del Encargado</Text>
                    <TextInput 
                        style={styles.input}
                        value={nombreEncargado}
                        onChangeText={setNombreEncargado}
                        placeholder="Ej: Carlos Mendoza"
                    />

                    <Text style={styles.label}>Teléfono del Encargado</Text>
                    <TextInput 
                        style={styles.input}
                        value={telefonoEncargado}
                        onChangeText={setTelefonoEncargado}
                        placeholder="Ej: 987654321"
                        keyboardType="phone-pad"
                    />

                    <Text style={styles.label}>Horario de Recepción</Text>
                    <TextInput 
                        style={styles.input}
                        value={horarioRecepcion}
                        onChangeText={setHorarioRecepcion}
                        placeholder="Ej: Lun a Vie 9:00am - 5:00pm"
                    />
                </View>

                <TouchableOpacity 
                    style={[styles.submitButton, guardando && { backgroundColor: '#80cfa0' }]} 
                    onPress={handleGuardar}
                    disabled={guardando}
                >
                    {guardando ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="save-outline" size={22} color="#fff" />
                            <Text style={styles.submitButtonText}>
                                {esModoEdicion ? 'Guardar Cambios' : 'Registrar Sucursal'}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f7fa' },
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e0e0e0', elevation: 2 },
    backButton: { padding: 5 },
    topBarTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    scrollContainer: { padding: 15, paddingBottom: 40 },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0056b3', marginBottom: 15, borderBottomWidth: 1, borderColor: '#f1f2f6', paddingBottom: 5 },
    label: { fontSize: 14, color: '#555', marginBottom: 5, fontWeight: '500' },
    input: { backgroundColor: '#f8f9fa', borderRadius: 8, borderWidth: 1, borderColor: '#dee2e6', paddingHorizontal: 12, height: 45, fontSize: 15, color: '#333', marginBottom: 15 },
    inputWrapperGps: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: 8, borderWidth: 1, borderColor: '#dee2e6', paddingLeft: 12, marginBottom: 5 },
    textInputGps: { flex: 1, minHeight: 45, fontSize: 15, color: '#333', paddingVertical: 10 },
    gpsButton: { backgroundColor: '#0056b3', padding: 12, borderTopRightRadius: 8, borderBottomRightRadius: 8, justifyContent: 'center', alignItems: 'center' },
    coordText: { fontSize: 12, color: '#28a745', fontStyle: 'italic', marginBottom: 15 },
    submitButton: { flexDirection: 'row', backgroundColor: '#28a745', padding: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center', gap: 10, elevation: 3 },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});