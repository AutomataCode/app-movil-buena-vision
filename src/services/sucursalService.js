import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Función de ayuda para obtener el token en cada petición
const getHeaders = async () => {
    const token = await AsyncStorage.getItem('token_sesion');
    return {
        headers: { Authorization: `Bearer ${token}` }
    };
};

export const sucursalService = {

    obtenerMisSucursales: async () => {
        const config = await getHeaders();
        const response = await api.get('/sucursales', config);
        return response.data;
    },

    crearSucursal: async (datosSucursal) => {
        const config = await getHeaders();
        const response = await api.post('/sucursales', datosSucursal, config);
        return response.data;
    },

    actualizarSucursal: async (id, datosSucursal) => {
        const config = await getHeaders();
        const response = await api.put(`/sucursales/${id}`, datosSucursal, config);
        return response.data;
    },

    eliminarSucursal: async (id) => {
        const config = await getHeaders();
        const response = await api.delete(`/sucursales/${id}`, config);
        return response.data;
    }
};