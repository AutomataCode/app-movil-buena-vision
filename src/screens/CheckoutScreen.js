import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert, ActivityIndicator, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker'; 
import * as Location from 'expo-location';

import { pedidoService } from '../services/pedidoService';
import { sucursalService } from '../services/sucursalService'; 

export default function CheckoutScreen({ navigation }) {
    const [carrito, setCarrito] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [procesando, setProcesando] = useState(false);
    
    const [direccion, setDireccion] = useState(''); 
    const [obteniendoGPS, setObteniendoGPS] = useState(false);

    //  La fecha inicia como un objeto Date nativo de JavaScript
    const [fechaEntrega, setFechaEntrega] = useState(new Date());
    const [mostrarCalendario, setMostrarCalendario] = useState(false);

    // Estados para las sucursales
    const [sucursales, setSucursales] = useState([]);
    const [idSucursalSeleccionada, setIdSucursalSeleccionada] = useState(null);

    useEffect(() => {
        cargarDatosCheckout();
    }, []);

    const cargarDatosCheckout = async () => {
        try {
            const carritoGuardado = await AsyncStorage.getItem('carrito');
            if (carritoGuardado !== null) {
                setCarrito(JSON.parse(carritoGuardado));
            }
            const dataSucursales = await sucursalService.obtenerMisSucursales();
            setSucursales(dataSucursales);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setCargando(false);
        }
    };

    // Lógica del Sensor GPS

   const obtenerMiUbicacion = async () => {
        try {
            setObteniendoGPS(true);
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permiso denegado', 'Necesitamos acceso a tu ubicación para autocompletar la dirección.');
                setObteniendoGPS(false);
                return;
            }

            let location = await Location.getLastKnownPositionAsync({});
            
            if (!location) {
                location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
            }

            let geocode = await Location.reverseGeocodeAsync(location.coords);
            console.log("Dirección decodificada:", geocode); 

            if (geocode.length > 0) {
                const lugar = geocode[0];
                
                //  Intentamos obtener el nombre de la calle real
                let calle = lugar.street;
                
                //  Si la calle es nula, intentamos usar el "name"
                if (!calle) {
                    // Si el name tiene un signo '+', es un código de Google, lo descartamos.
                    if (lugar.name && !lugar.name.includes('+')) {
                        calle = lugar.name;
                    } else {
                        // Si no hay nombre válido, usamos el distrito o un texto genérico amigable
                        calle = lugar.district || 'Ubicación GPS seleccionada';
                    }
                }

                // 3. Obtenemos la ciudad o región
                const ciudad = lugar.city || lugar.subregion || 'Ciudad desconocida';
                
                // 4. Juntamos todo en texto plano
                setDireccion(`${calle}, ${ciudad}`);
                setIdSucursalSeleccionada(null); 
            }
        } catch (error) {
            console.error("Error detallado del GPS:", error); 
            Alert.alert('Error GPS', 'No pudimos obtener tu ubicación. Verifica la consola de tu terminal.');
        } finally {
            setObteniendoGPS(false);
        }
    };

    const seleccionarSucursal = (sucursal) => {
        setIdSucursalSeleccionada(sucursal.idSucursal);
        setDireccion(`${sucursal.nombreSucursal} - ${sucursal.direccion}`);
    };

    // Al seleccionar un día en el calendario
    const alCambiarFecha = (event, fechaSeleccionada) => {
        // En Android, al cancelar el diálogo la fecha viene undefined
        setShowDatePickerPlatform();
        if (fechaSeleccionada) {
            setFechaEntrega(fechaSeleccionada);
        }
    };

    const setShowDatePickerPlatform = () => {
        // Oculta el calendario en Android inmediatamente tras seleccionar
        if (Platform.OS === 'android') {
            setMostrarCalendario(false);
        }
    };

   
    // Formato estético para mostrar al usuario (DD/MM/AAAA)
    const formatearFechaVista = (date) => {
        return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // Formato ISO estricto para tu base de datos de Spring Boot (YYYY-MM-DD)
    const formatearFechaBackend = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const subtotal = carrito.reduce((suma, item) => suma + ((item.precioProducto || 0) * (item.cantidad || 1)), 0);
    const impuestoIGV = subtotal * 0.18; 
    const cargoEntrega = 0.00; 
    const totalFinal = subtotal + impuestoIGV + cargoEntrega;

    const handleFinalizarPedido = async () => {
        if (direccion.trim() === '') {
            Alert.alert('Datos incompletos', 'Por favor ingresa una dirección de entrega.');
            return;
        }

        try {
            setProcesando(true);
            const payload = {
                direccionEntrega: direccion,
             
                fechaEntregaEstimada: formatearFechaBackend(fechaEntrega), 
                observacionesCliente: "Pedido web app móvil", 
                detalles: carrito.map(item => ({
                    idProducto: item.id || item.idProducto, 
                    cantidad: item.cantidad,
                    precioUnitario: item.precioProducto || item.precio
                }))
            };

            const dataRespuesta = await pedidoService.crearPedido(payload);
            await AsyncStorage.removeItem('carrito');

            Alert.alert(
                '¡Pedido Exitoso!',
                `Tu pedido ${dataRespuesta.numeroPedido} ha sido registrado.`,
                [{ text: 'Ver mis pedidos', onPress: () => navigation.navigate('ClientDrawer', { screen: 'Home', params: { screen: 'Pedidos' } }) }] 
            );
        } catch (error) {
             Alert.alert('Error', 'No se pudo procesar el pedido. Revisa tu conexión.');
        } finally {
            setProcesando(false);
        }
    };

    if (cargando) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0056b3" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.topBarTitle}>Finalizar Compra</Text>
                <View style={{ width: 40 }} /> 
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                
                {/* DIRECCIÓN DE ENVÍO */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="location-outline" size={20} color="#0056b3" />
                        <Text style={styles.cardTitle}>Dirección de Envío</Text>
                    </View>

                    {sucursales.length > 0 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
                            {sucursales.map((sucursal) => {
                                const isSelected = idSucursalSeleccionada === sucursal.idSucursal;
                                return (
                                    <TouchableOpacity 
                                        key={sucursal.idSucursal}
                                        style={[styles.sucursalCard, isSelected && styles.sucursalCardSelected]}
                                        onPress={() => seleccionarSucursal(sucursal)}
                                    >
                                        <Text style={[styles.sucursalNombre, isSelected && { color: '#0056b3' }]} numberOfLines={1}>
                                            {sucursal.nombreSucursal}
                                        </Text>
                                        <Text style={styles.sucursalDireccion} numberOfLines={2}>{sucursal.direccion}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    )}

                    <View style={styles.inputWrapperGps}>
                        <TextInput 
                            style={styles.textInputGps}
                            value={direccion}
                            onChangeText={(texto) => {
                                setDireccion(texto);
                                setIdSucursalSeleccionada(null);
                            }}
                            placeholder="Ej: Av. Los Olivos 123, Lima"
                        />
                        <TouchableOpacity style={styles.gpsButton} onPress={obtenerMiUbicacion} disabled={obteniendoGPS}>
                            {obteniendoGPS ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Ionicons name="navigate" size={20} color="#fff" />
                            )}
                        </TouchableOpacity>
                    </View>           
                </View>

                {/*  FECHA DE ENTREGA CON CALENDARIO INTERACTIVO */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="calendar-outline" size={20} color="#0056b3" />
                        <Text style={styles.cardTitle}>Fecha de Entrega Estimada</Text>
                    </View>
                    <Text style={styles.cardDescription}>Selecciona el día en el que deseas recibir tus monturas:</Text>
                    
                    {/* Botón interactivo que reemplaza al input manual */}
                    <TouchableOpacity 
                        style={styles.calendarSelectorButton} 
                        onPress={() => setMostrarCalendario(true)}
                    >
                        <Text style={styles.calendarSelectorText}>{formatearFechaVista(fechaEntrega)}</Text>
                        <Ionicons name="calendar" size={20} color="#0056b3" />
                    </TouchableOpacity>

                    {/* Componente del Calendario Flotante Nativo */}
                    {mostrarCalendario && (
                        <DateTimePicker
                            value={fechaEntrega}
                            mode="date"
                            display="default"
                            onChange={alCambiarFecha}
                            // 💡 VALIDACIÓN CRÍTICA: Bloquea todas las fechas anteriores al día de hoy
                            minimumDate={new Date()} 
                        />
                    )}
                </View>

                {/* MÉTODO DE PAGO */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="wallet-outline" size={20} color="#0056b3" />
                        <Text style={styles.cardTitle}>Método de Pago</Text>
                    </View>
                    <View style={styles.paymentOptionActive}>
                        <View style={styles.paymentOptionLeft}>
                            <Ionicons name="cash-outline" size={22} color="#0056b3" />
                            <Text style={styles.paymentTextActive}>Pago al Contado (Efectivo / Contraentrega)</Text>
                        </View>
                        <Ionicons name="checkmark-circle" size={22} color="#0056b3" />
                    </View>
                </View>

                {/* LISTA RESUMIDA DE PRODUCTOS */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="list-outline" size={20} color="#0056b3" />
                        <Text style={styles.cardTitle}>Productos a Solicitar ({carrito.length})</Text>
                    </View>
                    
                    {carrito.map((item, index) => (
                        <View key={item.id ? item.id.toString() : index.toString()} style={styles.productRow}>
                            <View style={styles.productRowLeft}>
                                <View style={styles.itemImagePlaceholder}>
                                    <Image source={{ uri:item.imagen }} style={styles.cardImage} />
                                </View>
                                <Text style={styles.productQuantity}>{item.cantidad}x</Text>
                                <Text style={styles.productName} numberOfLines={1}>{item.nombreProducto}</Text>
                            </View>
                            <Text style={styles.productPrice}>S/. {((item.precioProducto || 0) * (item.cantidad || 1)).toFixed(2)}</Text>
                        </View>
                    ))}
                </View>

                {/* RESUMEN DE LA ORDEN ORIGINAL */}
                <View style={styles.summaryContainer}>
                    <Text style={styles.summaryTitle}>Resumen de la Orden</Text>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal de productos</Text>
                        <Text style={styles.summaryValue}>S/. {subtotal.toFixed(2)}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Impuesto de Ley (IGV 18%)</Text>
                        <Text style={styles.summaryValue}>S/. {impuestoIGV.toFixed(2)}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Cargo por Entrega</Text>
                        <Text style={[styles.summaryValue, { color: '#28a745', fontWeight: 'bold' }]}>Gratis</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.summaryRow}>
                        <Text style={styles.totalLabel}>Total General</Text>
                        <Text style={styles.totalValue}>S/. {totalFinal.toFixed(2)}</Text>
                    </View>

                    <TouchableOpacity 
                        style={[styles.submitButton, procesando && { backgroundColor: '#80cfa0' }]} 
                        onPress={handleFinalizarPedido}
                        disabled={procesando}
                    >
                        {procesando ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.submitButtonText}>Confirmar y Enviar Pedido</Text>
                                <Ionicons name="checkmark-done-outline" size={22} color="#fff" />
                            </>
                        )}
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e0e0e0' },
    backButton: { padding: 5 },
    topBarTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    scrollContainer: { padding: 15, paddingBottom: 30 },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#e9ecef', elevation: 1 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
    cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#333' },
    cardDescription: { fontSize: 13, color: '#666', marginBottom: 12 },
    
    // Botón selector estético para abrir el calendario
    calendarSelectorButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: 8, borderWidth: 1, borderColor: '#dee2e6', paddingHorizontal: 15, height: 48 },
    calendarSelectorText: { fontSize: 15, color: '#333', fontWeight: '500' },

    sucursalCard: { width: 160, padding: 10, marginRight: 10, borderRadius: 8, borderWidth: 1, borderColor: '#dee2e6', backgroundColor: '#f8f9fa' },
    sucursalCardSelected: { borderColor: '#0056b3', backgroundColor: '#e6f0fa' },
    sucursalNombre: { fontSize: 13, fontWeight: 'bold', color: '#555', marginBottom: 4 },
    sucursalDireccion: { fontSize: 11, color: '#666' },

    inputWrapperGps: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: 8, borderWidth: 1, borderColor: '#dee2e6', paddingLeft: 12 },
    textInputGps: { flex: 1, height: 45, fontSize: 15, color: '#333' },
    gpsButton: { backgroundColor: '#0056b3', padding: 12, borderTopRightRadius: 8, borderBottomRightRadius: 8, justifyContent: 'center', alignItems: 'center' },

    paymentOptionActive: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#e6f0fa', borderWidth: 1, borderColor: '#0056b3', padding: 15, borderRadius: 8, marginTop: 5 },
    paymentOptionLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    paymentTextActive: { fontSize: 13, fontWeight: 'bold', color: '#0056b3', flex: 1 },

    productRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#f1f3f5' },
    productRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, paddingRight: 15 },
    productQuantity: { fontSize: 14, fontWeight: 'bold', color: '#0056b3', minWidth: 25 },
    productName: { fontSize: 14, color: '#444', flex: 1 },
    productPrice: { fontSize: 14, fontWeight: '600', color: '#333' },
    itemImagePlaceholder: { width: 60, height: 60, backgroundColor: '#f8f9fa', borderRadius: 8, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    cardImage: { width: '100%', height: '100%', resizeMode: 'contain' },

    summaryContainer: { padding: 20 },
    summaryTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
    summaryLabel: { fontSize: 13, color: '#666' },
    summaryValue: { fontSize: 14, fontWeight: '500', color: '#333' },
    divider: { height: 1, backgroundColor: '#e9ecef', marginVertical: 10 },
    totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    totalValue: { fontSize: 20, fontWeight: 'bold', color: '#0056b3' },
    submitButton: { flexDirection: 'row', backgroundColor: '#28a745', padding: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 15, gap: 10 },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});