import api from './api';

export const pedidoService={

    crearPedido: async (payload) => {
        try {
            const response = await api.post('/pedidoCliente/crearPedido', payload);
            return response.data; // Retornamos solo la data (el mensaje y numeroPedido)
        } catch (error) {
            console.error("Error en pedidoService al crear pedido:", error);
            throw error; // Lanzamos el error para que la pantalla (Checkout) muestre la alerta
        }
    },

    obtenerMisPedidos: async () => {
        try {
            
            const response = await api.get('/pedidoCliente/misPedidos');
            return response.data;
        } catch (error) {
            console.error("Error al obtener el historial de pedidos:", error);
            throw error;
        }
    }
}