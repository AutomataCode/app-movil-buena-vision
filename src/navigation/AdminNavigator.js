import React from 'react';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Pantallas exclusivas del administrador
import AdminUsersScreen from '../screens/AdminUsersScreen';
import AdminPedidoScreen from '../screens/AdminPedidoScreen';
import AdminReporteScreen from '../screens/AdminDashboardScreen';

// Importamos la pantalla de Detalle de Pedido
import DetallePedidoScreen from '../screens/DetallePedidoScreen';

// Importamos las pantallas del CRUD de Productos
import AdminProductosScreen from '../screens/AdminProductoScreen';
import FormularioProductoScreen from '../screens/AdminProductoFormularioScreen'; 

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator(); 

// Sub-navegador para la pestaña de Pedidos
function PedidosStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}> 
      <Stack.Screen name="AdminPedidoLista" component={AdminPedidoScreen} />
      <Stack.Screen name="DetallePedido" component={DetallePedidoScreen} />
    </Stack.Navigator>
  );
}

//  Sub-navegador exclusivo para la pestaña de Productos
function ProductosStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminProductoLista" component={AdminProductosScreen} />
      <Stack.Screen name="FormularioProducto" component={FormularioProductoScreen} />
    </Stack.Navigator>
  );
}

export default function AdminNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="AdminUsers" 
        component={AdminUsersScreen} 
        options={{ 
          title: 'Usuarios', 
          tabBarIcon: ({ color, size }) => <FontAwesome5 name="users" size={size} color={color} /> 
        }}
      />
      
      {/*  ProductosStack */}
      <Tab.Screen 
        name="AdminProducto" 
        component={ProductosStack} 
        options={{ 
          title: 'Productos', 
          headerShown: false, 
          tabBarIcon: ({ color, size }) => <Ionicons name="glasses-outline" size={size} color={color} /> 
        }}
      />
      
      <Tab.Screen 
        name="AdminPedido" 
        component={PedidosStack} 
        options={{ 
          title: 'Pedidos', 
          headerShown: false, 
          tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" size={size} color={color} /> 
        }}
      />

      <Tab.Screen 
        name="AdminReporte" 
        component={AdminReporteScreen} 
        options={{ 
          title: 'Reportes', 
          tabBarIcon: ({ color, size }) => <Ionicons name="pie-chart-outline" size={size} color={color} /> 
        }}
      />
    </Tab.Navigator>
  );
}