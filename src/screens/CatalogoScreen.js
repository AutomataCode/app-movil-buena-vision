import React, { useState, useEffect } from 'react';
import { DeviceEventEmitter, BackHandler, Button, View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';



const PRODUCTOS_MOCK = [
    { id: 1, nombre: 'Producto 1',  precio: 10.99, Codigo: 'P001' },
    { id: 2, nombre: 'Producto 2', precio: 19.99, Codigo: 'P002' },
    { id: 3, nombre: 'Producto 3',  precio: 5.99 ,Codigo: 'P003' },
    { id: 4, nombre: 'Producto 4',  precio: 12.99, Codigo: 'P004' },

];


export default function CatalogoScreen({ navigation }) {

    const [productos, setProductos]= useState([]);
    const [cargando, setCargando] = useState(true);

    const [carrito, setCarrito] = useState([]);

               


   useEffect(() => {
    obtenerProductos();
    cargarCarritoLocal();

   }, []); // arreglo vacio para ejecutar solo una vez al montar el componente

   

   const obtenerProductos = async () => {
    try {
        setCargando(true);
        setTimeout(() => {
            setProductos(PRODUCTOS_MOCK);
            setCargando(false);
        }, 1500); //latencia simulada de 1.5 segundos
    }catch (error) {
        console.error('Error al obtener productos:', error);
        setCargando(false);
    }
   };
   //Funcion para leer 
   const cargarCarritoLocal = async () => {
    try {

        const carritoGuardado = await AsyncStorage.getItem('carrito');
        if (carritoGuardado !== null) {
            setCarrito(JSON.parse(carritoGuardado));
        }
    }catch (error) {
        console.error('Error al cargar el carrito:', error);
    }
   };
   //Funcion para guardar el carrito
   const agregarAlCarrito = async (producto) => {
    try {
        const nuevoCarrito = [...carrito, producto];
        setCarrito(nuevoCarrito);
        await AsyncStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
        Alert.alert('Producto agregado', `${producto.nombre} ha sido agregado al carrito`);
    }catch (error) {
        console.error('Error al agregar al carrito:', error);
    }
  };         

   //funcion para renderizar cada producto en la lista
   const renderItem = ({ item }) => (
    <View style={styles.card}>
        <Text style={styles.cardTitle}>{item.nombre}</Text>
        <Text style={styles.cardSubtitle}>{item.Codigo}</Text>
        <Text style={styles.cardPrice}>S/.{item.precio.toFixed(2)}</Text>

        <TouchableOpacity style={styles.addButton} onPress={() => agregarAlCarrito(item)}>
            <Text style={styles.addButtonText}>Comprar</Text>
        </TouchableOpacity>
    </View>
   );

   
   if(cargando) {
   return (
    <View style={styles.center}>
        <ActivityIndicator size="large" color="#0056b3" />
        <Text style={styles.loadingText}>Cargando productos...</Text>
    </View>
    );
}

return (
    <View style={styles.container}>
  
      <Text style={styles.headerTitle}>Bienvenido al Catálogo</Text>
      <FlatList
        data={productos} //array de productos a mostrar
        renderItem={renderItem} //funcion para renderizar cada producto
        keyExtractor={(item) => item.id.toString()} //clave unica para cada item
        numColumns={2} //mostrar en 2 columnas
      />
    </View>
  );

}
const styles = StyleSheet.create({

    container: {flex: 1, backgroundColor: '#f5f5f5', padding: 10},
    headerTitle: {fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#333', textAlign: 'center'},
    center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    loadingText: {marginTop: 10, color: '#666'},

    cartIndicator: {
        padding: 10, 
        backgroundColor: '#0056b3',
         borderRadius: 8, 
         marginBottom: 10,
         alignItems: 'center'
    },     
    cartIndicatorText: {color: '#fff', fontWeight: 'bold'},

    card: {
        
        backgroundColor: '#fff',
         borderRadius: 10, 
         padding: 15, 
         margin: 5, 
         borderwidth: 1,
         borderColor: '#e0e0e0',
         flex: 1,   
         shadowColor: '#000', 
         shadowOffset: {width: 0, height: 2}, 
         shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
    },
    cardTitle: {fontSize: 16, fontWeight: 'bold', color: '#0056b3', marginBottom: 5},
    cardSubtitle: {fontSize: 12, color: '#777', marginVertical: 3},
    cardPrice: {fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5},
    addButton: {
        backgroundColor: '#e6f0fa',
        padding: 8, 
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 5
    },
    addButtonText: {color: '#0056b3', fontSize: 14, fontWeight: 'bold' }
    
});