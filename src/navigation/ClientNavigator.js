import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';

// Pantallas  del cliente
import CatalogoScreen from '../screens/CatalogoScreen';
import PerfilScreen from '../screens/PerfilScreen';
import CarritoScreen from '../screens/CarritoScreen';
import SeguridadScreen from '../screens/SeguridadScreen';
import PedidoScreen from '../screens/PedidoScreen';
import NotificacionScreen from '../screens/NotificacionScreen';

import { useAuth } from '../hooks/useAuth';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

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
export default function ClientNavigator() {
  return (
    <Drawer.Navigator initialRouteName="Home" drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <Drawer.Screen name="Home" component={MainTabs} options={{ title: 'Inicio' }} />
      <Drawer.Screen name="Perfil" component={PerfilScreen} options={{ title: 'Mi Perfil' }} />
      <Drawer.Screen name="Seguridad" component={SeguridadScreen} options={{ title: 'Seguridad' }} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerHeader: { padding: 20, backgroundColor: '#f4f4f4', alignItems: 'center' },
  drawerHeaderText: { fontSize: 18, fontWeight: 'bold' },
  logoutButton: { padding: 15, backgroundColor: '#dc3545', margin: 10, borderRadius: 5, alignItems: 'center' },
  logoutButtonText: { color: 'white', fontWeight: 'bold' }
});
