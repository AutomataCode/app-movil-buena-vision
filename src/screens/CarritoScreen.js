import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native'; import { isWorkletFunction } from "react-native-worklets";
import { Ionicons } from "@expo/vector-icons";


// Datos de ejemplo para el carrito de compras
const COMPRAS_MOCK = [
    { id: '1', nombre: 'Montura Oxford Ejecutiva', codigo: 'M-0421', precio: 120.00, cantidad: 1 },
    { id: '2', nombre: 'Lentes Polarizados SunVision', codigo: 'M-0982', precio: 85.50, cantidad: 2 },
    { id: '3', nombre: 'Montura Titanium Flexible', codigo: 'M-0115', precio: 210.00, cantidad: 1 },
];

export default function CarritoScreen() {

    const [carrito, setCarrito] = React.useState(COMPRAS_MOCK);
    
        const cambiarCantidad = (id, incremento) => {
            setCarrito((carritoActual) => {
                return carritoActual.map((item) => {
                    if (item.id === id) {
                        const nuevaCantidad = item.cantidad + incremento;
                        return { ...item, cantidad: nuevaCantidad };
                    }
                    return item;
                })
                    .filter((item) => item.cantidad > 0) // Elimina items con cantidad 0
            });
        };
        //calculos reactivos para subtotal, descuento y total
        const subtotal = carrito.reduce((suma, item) => suma + (item.precio * item.cantidad), 0);
        const descuento = carrito.length > 0 ? 15.50 : 0; // Descuento estático de ejemplo
        const totalEstimado = Math.max(0, subtotal - descuento);

        const renderItem = ({ item }) => (
            <View style={styles.cartCard}>
                <View style={styles.itemImagePlaceholder}>
                    <Ionicons name="glasses" size={30} color="#0056b3" />
                </View>

                <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.nombre}</Text>
                    <Text style={styles.itemCode}>Código: {item.codigo}</Text>
                    <Text style={styles.itemPrice}>Precio: S/. {item.precio.toFixed(2)}</Text>
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



        return (
           <SafeAreaView style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Ionicons name="cart" size={28} color="#0056b3" />
        <Text style={styles.headerTitle}>Mi Carrito ({carrito.length})</Text>
      </View>

     
      <FlatList
        data={carrito}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Ionicons name="cart-outline" size={60} color="#ccc" />
            <Text style={{ color: '#777', marginTop: 10 }}>Tu carrito está vacío</Text>
          </View>
        }
      />

    
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


        <TouchableOpacity style={[styles.checkoutButton, carrito.length === 0 && { backgroundColor: '#ccc' }]} disabled={carrito.length === 0}>
          <Text style={styles.checkoutButtonText}>Proceder al Pago</Text>
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
  listContainer: { padding: 15 },
  
  // Tarjetas de productos
  cartCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e9ecef', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  itemImagePlaceholder: { width: 60, height: 60, backgroundColor: '#e6f0fa', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  itemInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  itemName: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  itemCode: { fontSize: 11, color: '#777', marginTop: 2 },
  itemPrice: { fontSize: 15, fontWeight: 'bold', color: '#0056b3', marginTop: 4 },
  
  // 🛠️ Diseño de los nuevos controles (- / +)
  quantityController: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f3f5', borderRadius: 8, borderWidth: 1, borderColor: '#dee2e6' },
  actionButton: { paddingHorizontal: 10, paddingVertical: 8, justifyContent: 'center', alignItems: 'center' },
  quantityText: { fontSize: 14, fontWeight: 'bold', color: '#333', minWidth: 20, textAlign: 'center' },

  // Resumen inferior
  summaryContainer: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, borderColor: '#e9ecef', shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 8 },
  summaryTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  summaryLabel: { fontSize: 14, color: '#666' },
  summaryValue: { fontSize: 14, fontWeight: '500', color: '#333' },
  divider: { height: 1, backgroundColor: '#e9ecef', marginVertical: 12 },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#0056b3' },
  checkoutButton: { flexDirection: 'row', backgroundColor: '#0056b3', padding: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 15, gap: 10 },
  checkoutButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
