import api from './api';

export const productoService={

    obtenerCatalog: async()=>{
        try{
            const response= await api.get('/public/producto');
            return response.data;
        }catch(error){
            console.error("Error al cargar los productos:" , error);
            throw error;
        }
    }
}