import { useState, useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useAuth() {
  const [cargando, setCargando] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [rol, setRol] = useState('');

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const token = await AsyncStorage.getItem('token_sesion');
        const rolUsuario = await AsyncStorage.getItem('rol_usuario');
        if (token !== null && rolUsuario !== null) {
          setIsLoggedIn(true);
          setRol(rolUsuario);
        }
      } catch (error) {
        console.error('Error al verificar la sesión:', error);
      } finally {
        setCargando(false);
      }
    };

    verificarSesion();

    const suscripcionLogin = DeviceEventEmitter.addListener('SESION_INICIADA', async () => {
      try {
        const rolRecienGuardado = await AsyncStorage.getItem('rol_usuario');
        setRol(rolRecienGuardado || 'CLIENTE');
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error al manejar el evento de sesión iniciada:', error);
      }
    });

    const suscripcionSewer = DeviceEventEmitter.addListener('SESION_EXPIRADA', () => {
      setIsLoggedIn(false);
      setRol('');
    });
    
    return () => {
      suscripcionSewer.remove();
      suscripcionLogin.remove();
    };
  }, []);

  const ejecutarLogout = async () => {
    try {
      await AsyncStorage.removeItem('token_sesion');
      await AsyncStorage.removeItem('usuario');
      await AsyncStorage.removeItem('rol_usuario');
      DeviceEventEmitter.emit('SESION_EXPIRADA');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return { cargando, isLoggedIn, rol, ejecutarLogout };
}
