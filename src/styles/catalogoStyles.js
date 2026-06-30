// src/styles/catalogoStyles.js
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 10 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#333', textAlign: 'center' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, color: '#666' },
    
    card: {
        backgroundColor: '#fff',
        borderRadius: 10, 
        padding: 12, // 
        margin: 5, 
        borderWidth: 1, 
        borderColor: '#e0e0e0',
        flex: 1,   
        minHeight: 250, 
        justifyContent: 'space-between', 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.1, 
        shadowRadius: 4, 
        elevation: 3,
    },
    
    cardBody: {
        flex: 1,
        justifyContent: 'flex-start',
    },

    // Estilo para la imagen del producto
    cardImage: {
        width: '100%',
        height: 100, // Altura fija para todas las imágenes
        borderRadius: 8,
        marginBottom: 10,
        resizeMode: 'contain', // 'contain' evita que las monturas se corten o deformen
        backgroundColor: '#f8f9fa' // Un fondo sutil por si la imagen tiene fondo transparente
    },

    cardTitle: { 
        fontSize: 14, 
        fontWeight: 'bold', 
        color: '#0056b3', 
        marginBottom: 5,
        height: 40, //  UNIFORMIDAD
        textAlignVertical: 'center' 
    },
    
    cardSubtitle: { 
        fontSize: 11, 
        color: '#777', 
        marginBottom: 5 
    },
    
    cardPrice: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        color: '#333', 
        marginBottom: 10 
    },
    
    addButton: {
        backgroundColor: '#e6f0fa',
        padding: 10, 
        borderRadius: 6,
        alignItems: 'center',
    },
    
    addButtonText: { 
        color: '#0056b3', 
        fontSize: 14, 
        fontWeight: 'bold' 
    }
});