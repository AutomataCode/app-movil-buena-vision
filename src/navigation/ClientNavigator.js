import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';



// Pantallas  del cliente
import CatalogoScreen from '../screens/CatalogoScreen';
import PerfilScreen from '../screens/PerfilScreen';
import CarritoScreen from '../screens/CarritoScreen';
import SeguridadScreen from '../screens/SeguridadScreen';
import PedidoScreen from '../screens/PedidoScreen';
import NotificacionScreen from '../screens/NotificacionScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import DetallePedidoScreen from '../screens/DetallePedidoScreen';
import { useAuth } from '../hooks/useAuth';
import MisSucursalesScreen from '../screens/MisSucursalesScreen';
import FormularioSucursalScreen from '../screens/FormularioSucursalScreen';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();
// Pestañas inferiores del Cliente
function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ tabBarActiveTintColor: '#0056b3', tabBarInactiveTintColor: '#6c757d', headerShown: false }}>
      <Tab.Screen name="Catalogo" component={CatalogoScreen} options={{ title: 'Monturas', tabBarIcon: ({ color, size }) => <Ionicons name="glasses-outline" size={size} color={color} /> }} />
      <Tab.Screen name="Carrito" component={CarritoScreen} options={{ title: 'Carrito', tabBarIcon: ({ color, size }) => <Ionicons name="cart-outline" size={size} color={color} /> }} />
      <Tab.Screen name="Pedidos" component={PedidoScreen} options={{ title: 'Pedidos', tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" size={size} color={color} /> }} />
      <Tab.Screen name="Notificaciones" component={NotificacionScreen} options={{ title: 'Notificaciones', tabBarIcon: ({ color, size }) => <Ionicons name="notifications-outline" size={size} color={color} /> }} />
    </Tab.Navigator>
  );
}

// Menú lateral personalizado con botón de Cerrar Sesión
function CustomDrawerContent(props) {
  const { ejecutarLogout } = useAuth();
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerHeaderText}>Buena Visión</Text>
        </View>
        <DrawerItemList {...props} />
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={ejecutarLogout}>
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

// Contenedor Drawer Principal del Cliente
function ClientDrawer() {
  return (
    <Drawer.Navigator initialRouteName="Home" drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <Drawer.Screen name="Home" component={MainTabs} options={{ title: 'Inicio' }} />
      <Drawer.Screen name="Perfil" component={PerfilScreen} options={{ title: 'Mi Perfil' }} />
      <Drawer.Screen name="Seguridad" component={SeguridadScreen} options={{ title: 'Seguridad' }} />
      <Drawer.Screen name="Pedido" component={PedidoScreen} options={{ title: 'Mis Pedidos' }} />
      <Drawer.Screen name="MisSucursales" component={MisSucursalesScreen} options={{ title: 'Mis Tiendas' }} />
    </Drawer.Navigator>
  );
}

export default function ClientNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* El Drawer y los Tabs principales */}
      <Stack.Screen name="ClientDrawer" component={ClientDrawer} />
      
      {/* La pantalla de Checkout superpuesta */}
      <Stack.Screen name="Checkout" component={CheckoutScreen} />

      <Stack.Screen name="DetallePedido" component={DetallePedidoScreen} />
      <Stack.Screen name="FormularioSucursal" component={FormularioSucursalScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerHeader: { padding: 20, backgroundColor: '#f4f4f4', alignItems: 'center' },
  drawerHeaderText: { fontSize: 18, fontWeight: 'bold' },
  logoutButton: { padding: 15, backgroundColor: '#dc3545', margin: 10, borderRadius: 5, alignItems: 'center' },
  logoutButtonText: { color: 'white', fontWeight: 'bold' }
});
