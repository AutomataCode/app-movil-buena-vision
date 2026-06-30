import React, { useState, useEffect } from 'react';
import { DeviceEventEmitter, BackHandler, Button, View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import { productoService } from '../services/productoService';

import styles from '../styles/catalogoStyles';





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
        
        const data = await productoService.obtenerCatalog();
        setProductos(data);

    }catch (error) {
        Alert.alert('Error', 'Hubo un problema al cargar los productos de la tienda.');
       
    }finally{
        setCargando(false);
    }

   };
 
   const cargarCarritoLocal = async () => {
    try {
        const carritoGuardado = await AsyncStorage.getItem('carrito');
        if (carritoGuardado !== null) {
            const dataParseada = JSON.parse(carritoGuardado);
            // verificar si realmente es una lista. Si no lo es ponemos un arreglo vacío [].
            setCarrito(Array.isArray(dataParseada) ? dataParseada : []);
        }
    } catch (error) {
        console.error('Error al cargar el carrito:', error);
        setCarrito([]); // Si el JSON está roto, lo reseteamos a vacío
    }
   };


   const agregarAlCarrito = async (producto) => {
try {
        
        //version actualizada 
        const carritoGuardado = await AsyncStorage.getItem('carrito');
        let carritoActual = [];
        if (carritoGuardado !== null) {
            const dataParseada = JSON.parse(carritoGuardado);
            carritoActual = Array.isArray(dataParseada) ? dataParseada : [];
        }

        // buscar si el producto ya está en el carrito
        const indiceExistente = carritoActual.findIndex(item => item.id === producto.id);

        let nuevoCarrito;

        if (indiceExistente >= 0) {
            // Si ya existe, NO lo duplicamos. Solo le sumamos 1 a su cantidad.
            nuevoCarrito = [...carritoActual];
            nuevoCarrito[indiceExistente].cantidad = (nuevoCarrito[indiceExistente].cantidad || 1) + 1;
        } else {
            //si es nuevo de verdad, lo agregamos con cantidad 1
            nuevoCarrito = [...carritoActual, { ...producto, cantidad: 1 }];
        }

        setCarrito(nuevoCarrito); // Actualizamos la vista local
        await AsyncStorage.setItem('carrito', JSON.stringify(nuevoCarrito)); // Guardamos en el disco
        
        Alert.alert('¡Éxito!', `${producto.nombreProducto} agregado al carrito`);
    } catch (error) {
        console.error('Error crítico al agregar al carrito:', error);
        Alert.alert('Error', 'No pudimos agregar el producto.');
    }
  };      

   //funcion para renderizar cada producto en la lista
   const renderItem = ({ item }) => (
    <View style={styles.card}>
        <View style={styles.cardBody}>
            <Image source={{uri: item.imagen}}
                style={styles.cardImage}
            />
            

        <Text style={styles.cardTitle}>{item.nombreProducto}</Text>
        <Text style={styles.cardSubtitle}>{item.sku}</Text>
        <Text style={styles.cardPrice}>S/.{item.precioProducto.toFixed(2)}</Text>
        </View>
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
        ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 20}}>No hay productos disponibles por ahora.</Text>}
      />
    </View>
  );

}
