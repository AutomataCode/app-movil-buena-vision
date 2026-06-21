import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';

import {Text,StyleSheet, View, ActivityIndicator, DeviceEventEmitter, TouchableOpacity } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

// Navegación
import{NavigationContainer} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
//drawer
import {createDrawerNavigator, DrawerContentScrollView, DrawerItemList} from '@react-navigation/drawer';

import LoginScreen from './src/screens/LoginScreen';
import CatalogoScreen from './src/screens/CatalogoScreen';
import Registro from './src/screens/Registro';
import PerfilScreen from './src/screens/PerfilScreen';
import CarritoScreen from './src/screens/CarritoScreen';
import SeguridadScreen from './src/screens/SeguridadScreen';
import PedidoScreen from './src/screens/PedidoScreen';
import NotificacionScreen from './src/screens/NotificacionScreen';



import AdminUsersScreen from './src/screens/AdminUsersScreen';
import AdminPedidoScreen from './src/screens/AdminPedidoScreen';
import AdminReporteScreen from './src/screens/AdminReporteScreen';


import AsyncStorage from '@react-native-async-storage/async-storage'; // Para almacenar el token de autenticación



const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();


function MainTabsAdmin(){
  return  (
    <Tab.Navigator screenOptions={{

    }}>
      <Tab.Screen name="AdminUsers" 
      component={AdminUsersScreen}
      options={{
        title: 'Usuarios',
        tabBarIcon: ({ color, size }) => (
          <FontAwesome5 name="users" size={size} color={color} />
        ),
      }}
      />
      <Tab.Screen name="AdminPedido"
      component={AdminPedidoScreen}
      options={{
        title: 'Pedidos',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="receipt-outline" size={size} color={color} />
        ),
      }}
      />
      <Tab.Screen name="AdminReporte"
      component={AdminReporteScreen}
      options={{
        title: 'Reportes',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="pie-chart-outline" size={size} color={color} />
        ),
      }}
      />
    </Tab.Navigator>
  );


} 

function MainTabs(){
  return(
    <Tab.Navigator screenOptions={{
      tabBarActiveTintColor: '#0056b3',
      tabBarInactiveTintColor: '#6c757d',
      headerShown: false,
    }}>
    <Tab.Screen name="Catalogo" 
    component={CatalogoScreen} 
    options={{
      title: 'Monturas',
      tabBarIcon: ({ color, size }) => (
        <Ionicons name="glasses-outline" size={size} color={color} />
      ),
    }}
    />
   
    <Tab.Screen name="Carrito" 
    component={CarritoScreen} 
    options={{
      title: 'Carrito',
      tabBarIcon: ({ color, size }) => (
        <Ionicons name="cart-outline" size={size} color={color} />
      ),
    }}
    />
    <Tab.Screen name="Pedidos" 
    component={PedidoScreen} 
    options={{
      title: 'Pedidos',
      tabBarIcon: ({ color, size }) => (
        <Ionicons name="receipt-outline" size={size} color={color} />
      ),
    }}
    />
    <Tab.Screen name="Notificaciones" 
    component={NotificacionScreen} 
    options={{
      title: 'Notificaciones',
      tabBarIcon: ({ color, size }) => (
        <Ionicons name="notifications-outline" size={size} color={color} />
      ),
    }}
    />
    </Tab.Navigator>
  );
}

function CustomDrawerContent(props) {
   const ejecutarLogout = async () => {
        try {
            await AsyncStorage.removeItem('token_sesion'); // Elimina el token de sesión
             await AsyncStorage.removeItem('usuario');
             await AsyncStorage.removeItem('rol_usuario'); // Elimina el rol del usuario
            console.log('Token eliminado, cerrando sesión');
            DeviceEventEmitter.emit('SESION_EXPIRADA'); // Emitir evento para actualizar el estado de sesión
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    }
   return  (
    <DrawerContentScrollView {...props} contentContainerStyle={{flex: 1}}> 
    <View style={{flex: 1}}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerHeaderText}>Buena Visión</Text>
     
        </View>
      <DrawerItemList {...props} />
    </View>
    <TouchableOpacity style={styles.logoutButton} onPress={ejecutarLogout}> 
      <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>  
      </TouchableOpacity>
    </DrawerContentScrollView>

   )
  }
function MainDrawer(){
  return(
    <Drawer.Navigator initialRouteName="Home" 
    drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      
    <Drawer.Screen name="Home" component={MainTabs} options={{title: 'Inicio'}}/>
    <Drawer.Screen name="Perfil" component={PerfilScreen} options={{title: 'Mi Perfil'}}/>
    <Drawer.Screen name="Seguridad" component={SeguridadScreen} options={{title: 'Seguridad'}}/>
    </Drawer.Navigator>
  );
}

export default function App() {
  const [cargando, setCargando] = useState(true); // Estado para controlar la pantalla de carga
  const[isLoggedIn, setIsLoggedIn] = useState(false); // Estado para controlar si el usuario está logueado
  const [rol, setRol] = useState(''); // Estado para almacenar el rol del usuario

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const token = await AsyncStorage.getItem('token_sesion');
        const rolUsuario = await AsyncStorage.getItem('rol_usuario');
        if (token !== null && rolUsuario !== null) {
          setIsLoggedIn(true); // Si hay un token, el usuario está logueado
          setRol(rolUsuario); // Almacena el rol del usuario
        }
      } catch (error) {
        console.error('Error al verificar la sesión:', error);
      } finally {
        setCargando(false); // Termina la carga después de verificar la sesión
      }
    };
    verificarSesion();

    const suscripcionLogin = DeviceEventEmitter.addListener('SESION_INICIADA',  async() => {

      try{
      const rolRecienGuardado = await AsyncStorage.getItem('rol_usuario'); // Obtener el rol del usuario recién guardado
      setRol(rolRecienGuardado || 'CLIENTE'); // Establecer el rol en el estado (por defecto a 'CLIENTE' si no se encuentra)
      setIsLoggedIn(true); // Si la sesión se inicia, actualiza el estado para mostrar la aplicación principal
      console.log('ROL GUARDADO:', rolRecienGuardado);
      console.log('ROL ACTUAL:', rol);
      }catch(error){ 
        console.error('Error al manejar el evento de sesión iniciada:', error);
      }
    });

    const suscripcionSewer = DeviceEventEmitter.addListener('SESION_EXPIRADA', () => {
      setIsLoggedIn(false); // Si la sesión expira, actualiza el estado para mostrar el login
      setRol(''); // Limpiar el rol del usuario 
    });
    
    return () => {
      suscripcionSewer.remove(); // Limpia la suscripción al desmontar el componente
      suscripcionLogin.remove(); // Limpia la suscripción al desmontar el componente
    };
  }, []);

if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#0056b3" />
      </View>
    );
  }


  return (   

    <NavigationContainer>
      <Stack.Navigator>
      {isLoggedIn ? (
        rol === 'ADMIN' ? ( 
            <Stack.Screen name="AdminRoot" component={MainTabsAdmin} options={{ headerShown: false }} />
        ) : (   
        <Stack.Screen 
          name="RootApp" 
          component={MainDrawer} 
          options={{ headerShown: false }}
        />)
      ) : (
        <>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }}
          />   
          <Stack.Screen 
            name="Registro" 
            component={Registro} 
            options={{ title: 'Crear Cuenta' }}
          />
        </>
      )}
      </Stack.Navigator>
    </NavigationContainer>
);
}

const styles = StyleSheet.create({
  drawerHeader: {
    backgroundColor: '#0056b3',
    padding: 5,
    marginBottom: 10,
    justifyContent: 'center',
  },
  drawerHeaderText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  drawerHeaderSub: {
    color: '#e6f0fa',
    fontSize: 12,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
   