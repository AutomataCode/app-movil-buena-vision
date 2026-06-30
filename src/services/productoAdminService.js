import api from './api';

export const productoService = {
    
    obtenerProductosAdmin: async () => {
        try {
            const response = await api.get('/admin/productos');
            return response.data;
        } catch (error) {
            console.error("Error al obtener productos:", error);
            throw error;
        }
    },

    crearProducto: async (datosProducto) => {
        try {
            const response = await api.post('/admin/productos', datosProducto);
            return response.data;
        } catch (error) {
            console.error("Error al crear producto:", error);
            throw error;
        }
    },

    actualizarProducto: async (id, datosProducto) => {
        try {
            const response = await api.put(`/admin/productos/${id}`, datosProducto);
            return response.data;
        } catch (error) {
            console.error("Error al actualizar producto:", error);
            throw error;
        }
    },

    eliminarProducto: async (id) => {
        try {
            const response = await api.delete(`/admin/productos/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error al eliminar producto:", error);
            throw error;
        }
    }
};