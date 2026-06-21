import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DeviceEventEmitter, Alert} from 'react-native';

const API_URL = '192.168.1.11'
const api = axios.create({
  baseURL: `http://${API_URL}:8051/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});
api.interceptors.response.use(
    (response) => {
       
        return response;
    },
    async (error) => {
        // Si la respuesta es un error, verifica si es un error de autenticación (Token Expirado)
        if (error.response) {
        const { status } = error.response;
        
        // Si el código es 401, significa que el token expiró o es inválido
      if (status === 401) {
        Alert.alert(
          'Sesión Expirada',
          'Tu sesión ha caducado por motivos de seguridad. Por favor, inicia sesión nuevamente.'
        );
        await AsyncStorage.removeItem('token_sesion'); // Elimina el token de sesión
        await AsyncStorage.removeItem('usuario');

        DeviceEventEmitter.emit('SESION_EXPIRADA'); // Emitir evento para actualizar el estado de sesión
    }}
        return Promise.reject(error);
    }
);

export default api;