import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Image } from 'react-native'; 
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native'; // 💡 IMPORTANTE para recargar al cambiar de pestaña

export default function CarritoScreen( {navigation}) {
    //  Estado inicial vacío
    const [carrito, setCarrito] = useState([]);

    //Leer la memoria cada vez que se entra a la pantalla "Carrito"
    useFocusEffect(
        useCallback(() => {
            cargarCarritoLocal();
        }, [])
    );

    const cargarCarritoLocal = async () => {
        try {
            const carritoGuardado = await AsyncStorage.getItem('carrito');
            if (carritoGuardado !== null) {
                const dataParseada = JSON.parse(carritoGuardado);
                
                // Aseguramos que sea un arreglo y le asignamos cantidad 1 por defecto a los nuevos
                const carritoValido = (Array.isArray(dataParseada) ? dataParseada : []).map(item => ({
                    ...item,
                    // Si el item ya tenía cantidad, la mantiene, si no, le pone 1
                    cantidad: item.cantidad ? item.cantidad : 1 
                }));
                
                setCarrito(carritoValido);
            } else {
                setCarrito([]); // Carrito vacío
            }
        } catch (error) {
            console.error('Error al cargar el carrito:', error);
            setCarrito([]);
        }
    };

    // Modificar cantidad y GUARDAR en memoria simultáneamente
    const cambiarCantidad = async (id, incremento) => {
        try {
            // Calculamos el nuevo arreglo
            const nuevoCarrito = carrito.map((item) => {
                if (item.id === id) {
                    return { ...item, cantidad: item.cantidad + incremento };
                }
                return item;
            }).filter((item) => item.cantidad > 0); // Elimina items con cantidad 0

            // Actualizamos la pantalla
            setCarrito(nuevoCarrito);
            
            await AsyncStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
            
        } catch (error) {
            console.error("Error al actualizar la cantidad:", error);
        }
    };

    // 💡 4. Cálculos reactivos con las variables de tu Base de Datos
    const subtotal = carrito.reduce((suma, item) => suma + ((item.precioProducto || 0) * item.cantidad), 0);
    const descuento = carrito.length > 0 ? subtotal*0.15 : 0; 
    const totalEstimado = Math.max(0, subtotal - descuento);

    // 💡 5. Renderizado con las variables correctas (nombreProducto, sku, precioProducto)
    const renderItem = ({ item }) => {
        const urlImagen = item.imagen ? item.imagen : 'https://cdn-icons-png.flaticon.com/512/2873/2873215.png';

        return (
            <View style={styles.cartCard}>
                <View style={styles.itemImagePlaceholder}>
                    <Image source={{ uri: urlImagen }} style={styles.cardImage} />
                </View>

                <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.nombreProducto}</Text>
                    <Text style={styles.itemCode}>Código: {item.sku}</Text>
                    <Text style={styles.itemPrice}>S/. {item.precioProducto?.toFixed(2)}</Text>
                </View>
                
                <View style={styles.quantityController}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => cambiarCantidad(item.id, -1)}>
                        <Ionicons name="remove" size={18} color={item.cantidad === 1 ? "#dc3545" : "#0056b3"} />
                    </TouchableOpacity>

                    <Text style={styles.quantityText}>{item.cantidad}</Text>

                    <TouchableOpacity style={styles.actionButton} onPress={() => cambiarCantidad(item.id, 1)}>
                        <Ionicons name="add" size={18} color="#0056b3" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Encabezado */}
            <View style={styles.header}>
                <Ionicons name="cart" size={28} color="#0056b3" />
                <Text style={styles.headerTitle}>Mi Carrito ({carrito.length})</Text>
            </View>

            {/* FlatList con componente de Carrito Vacío incluido */}
            <FlatList
                data={carrito}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
               
                ListEmptyComponent={
                    <View style={styles.emptyCartContainer}>
                        <Ionicons name="cart-outline" size={80} color="#ccc" />
                        <Text style={styles.emptyCartTitle}>Tu carrito está vacío</Text>
                        <Text style={styles.emptyCartSub}>Explora nuestro catálogo y agrega las mejores monturas.</Text>
                    </View>
                }
            />

            {/* Resumen - Solo se muestra de forma normal si hay items */}
            <View style={styles.summaryContainer}>
                <Text style={styles.summaryTitle}>Resumen de Pedido</Text>
                
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>S/. {subtotal.toFixed(2)}</Text>
                </View>

                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Descuento Mayorista</Text>
                    <Text style={[styles.summaryValue, { color: '#28a745' }]}>
                        - S/. {descuento.toFixed(2)}
                    </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.summaryRow}>
                    <Text style={styles.totalLabel}>Total Estimado</Text>
                    <Text style={styles.totalValue}>S/. {totalEstimado.toFixed(2)}</Text>
                </View>

                <TouchableOpacity 
                    style={[styles.checkoutButton, carrito.length === 0 && { backgroundColor: '#ccc' }]} 
                    disabled={carrito.length === 0}
                    onPress={() => {
        console.log("¡Botón presionado! Intentando navegar...");
        navigation.navigate('Checkout');
    }}
                >
                    <Text style={styles.checkoutButtonText}>Continuar</Text>
                    <Ionicons name="arrow-forward-outline" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e9ecef', gap: 10 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    listContainer: { padding: 15, flexGrow: 1 }, 
    
    // Tarjetas
    cartCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e9ecef', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
    itemImagePlaceholder: { width: 60, height: 60, backgroundColor: '#f8f9fa', borderRadius: 8, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    cardImage: { width: '100%', height: '100%', resizeMode: 'contain' },
    itemInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
    itemName: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    itemCode: { fontSize: 11, color: '#777', marginTop: 2 },
    itemPrice: { fontSize: 15, fontWeight: 'bold', color: '#0056b3', marginTop: 4 },
    
    // Controles
    quantityController: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f3f5', borderRadius: 8, borderWidth: 1, borderColor: '#dee2e6' },
    actionButton: { paddingHorizontal: 10, paddingVertical: 8, justifyContent: 'center', alignItems: 'center' },
    quantityText: { fontSize: 14, fontWeight: 'bold', color: '#333', minWidth: 20, textAlign: 'center' },

    // Resumen
    summaryContainer: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, borderColor: '#e9ecef', shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 8 },
    summaryTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
    summaryLabel: { fontSize: 14, color: '#666' },
    summaryValue: { fontSize: 14, fontWeight: '500', color: '#333' },
    divider: { height: 1, backgroundColor: '#e9ecef', marginVertical: 12 },
    totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    totalValue: { fontSize: 18, fontWeight: 'bold', color: '#0056b3' },
    checkoutButton: { flexDirection: 'row', backgroundColor: '#0056b3', padding: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 15, gap: 10 },
    checkoutButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    //  Estilos del Carrito Vacío
    emptyCartContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 },
    emptyCartTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 15 },
    emptyCartSub: { fontSize: 14, color: '#777', marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }
});