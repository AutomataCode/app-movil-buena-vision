import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importación de pantallas base de autenticación
import LoginScreen from '../screens/LoginScreen';
import Registro from '../screens/Registro';

// Importación de flujos de navegación modulares
import ClientNavigator from './ClientNavigator';
import AdminNavigator from './AdminNavigator'; // Tu nuevo flujo administrador

const Stack = createNativeStackNavigator();

export default function AppNavigator({ isLoggedIn, rol }) {
  return (
    <Stack.Navigator>
      {isLoggedIn ? (
        rol === 'ADMIN' ? (
          // Si es administrador, monta el flujo de administración
          <Stack.Screen name="AdminRoot" component={AdminNavigator} options={{ headerShown: false }} />
        ) : (
          // Si es cliente, monta el flujo de cliente (Tabs + Drawer)
          <Stack.Screen name="RootApp" component={ClientNavigator} options={{ headerShown: false }} />
        )
      ) : (
        // Flujo de usuarios no autenticados
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Registro" component={Registro} options={{ title: 'Crear Cuenta' }} />
        </>
      )}
    </Stack.Navigator>
  );
}
