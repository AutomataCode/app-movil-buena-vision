import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function PerfilScreen({navigation}) {    
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido]= useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => { // Ejecuta la función para obtener los datos del usuario al montar el componente
        obtenerDatosUsuario();
    }, []); //arreglo vacio para ejecutar solo una vez al montar el componente

    const obtenerDatosUsuario = async () => {
        try {
            setCargando(true);
            const token = await AsyncStorage.getItem('token_sesion');
            const response = await api.get('/usuarios/perfil', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });  
            if (response.status === 200) {
                setNombre(response.data.nombre);
                setApellido(response.data.apellido);
                setTelefono(response.data.telefono);
                setDireccion(response.data.direccion);
            }
        } catch (error) {
            console.error('Error al obtener los datos del perfil:', error); // Imprime el error en la consola para depuración
            Alert.alert('Error', 'No se pudieron cargar los datos del perfil');
        } finally {
            setCargando(false);
        }   
    };
    const handleActualizarPerfil = async () => {
        if(nombre === '' || apellido === '' || telefono === '' || direccion === ''){
            Alert.alert('Error', 'Por favor completa todos los campos');
            return; 
        } 
        try {
            setGuardando(true);
            const token = await AsyncStorage.getItem('token_sesion');

            const datosModificados = {
                nombre: nombre,
                apellido: apellido,
                telefono: telefono,
                direccion: direccion,
            };

            const response = await api.put('/usuarios/actualizar', datosModificados, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.status === 200) {
                Alert.alert('Éxito', 'Perfil actualizado correctamente');
            }
        } catch (error) {
            console.error('Error al actualizar el perfil:', error);
            Alert.alert('Error', 'No se pudo actualizar el perfil');
        } finally { // Siempre se ejecuta al finalizar la operación, ya sea exitosa o con error
            setGuardando(false); // Detiene la animación de carga del botón después de intentar guardar los cambios
        }
    };
    if (cargando) { 
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0056b3" />
                <Text style={{ marginTop: 10 }}>Cargando perfil...</Text>
            </View>
        );
    }
  
    return (
       <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Mi Perfil</Text>
        <Text style={styles.label}>Nombres *</Text>
        <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />       
        <Text style={styles.label}>Apellidos *</Text>
        <TextInput style={styles.input} value={apellido} onChangeText={setApellido} />
        <Text style={styles.label}>Teléfono *</Text>
        <TextInput style={styles.input} value={telefono} onChangeText={setTelefono} />
        <Text style={styles.label}>Dirección de Entrega *</Text>
        <TextInput style={styles.input} value={direccion} onChangeText={setDireccion} />
       
       {guardando ? (
       <ActivityIndicator size="large" color="#0056b3" animating={guardando} style={{ marginVertical: 20 }} />
         ) : (
            <TouchableOpacity style={styles.button} onPress={handleActualizarPerfil}>
                <Text style={styles.buttonText}>Guardar Cambios</Text>
            </TouchableOpacity>
    )}
       </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#0056b3' },
    label: { fontSize: 16, marginBottom: 5, color: '#333' },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 20, borderRadius: 5 },
    button: { backgroundColor: '#0056b3', padding: 15, borderRadius: 5, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: 'bold' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },

});