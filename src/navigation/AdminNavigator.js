import React from 'react';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Pantallas exclusivas del administrador
import AdminUsersScreen from '../screens/AdminUsersScreen';
import AdminPedidoScreen from '../screens/AdminPedidoScreen';
import AdminReporteScreen from '../screens/AdminReporteScreen';

const Tab = createBottomTabNavigator();

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
      <Tab.Screen 
        name="AdminPedido" 
        component={AdminPedidoScreen} 
        options={{ 
          title: 'Pedidos', 
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
