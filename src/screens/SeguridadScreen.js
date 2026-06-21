import React, {useState} from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Para almacenar el token de autenticación
import api from '../services/api'; 

export default function SeguridadScreen() {
    const [passwordActual, setPasswordActual] = useState('');
    const [passwordNueva, setPasswordNueva] = useState('');
    const [confirmacion, setConfirmacion] = useState('');
    const [guardando, setGuardando] = useState(false);

    const handleCambiarPassword = async () => {
        
        if( !passwordActual.trim() || !passwordNueva.trim() || !confirmacion.trim()){
            Alert.alert('Error', 'Por favor completa todos los campos');
            return;
        }
        if (passwordNueva !== confirmacion) {
            Alert.alert('Error', 'Las contraseñas nuevas no coinciden');
            return;
        }

        try {
            setGuardando(true);
            const token = await AsyncStorage.getItem('token_sesion');
            const datosModificados = {
                passwordActual: passwordActual,
                passwordNueva: passwordNueva,
                confirmacion: confirmacion
            };  
            const response = await api.put('/usuarios/cambiar-password', datosModificados, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if(response.status === 200){
                Alert.alert('Éxito', 'Contraseña cambiada correctamente');
                setPasswordActual('');
                setPasswordNueva('');
                setConfirmacion('');   
            }
        } catch (error) {
            console.error('Error al cambiar la contraseña:', error); 
            if (error.response && error.response.data) {
     const mensajeError = typeof error.response.data === 'object' ? error.response.data.message : error.response.data;
                Alert.alert('Error', mensajeError || 'Error al procesar la solicitud');
            } else {
                Alert.alert('Error de red', 'No se pudo conectar con el servidor central');
            }
        } finally {
            setGuardando(false);// Detener el indicador de carga
        }

    };

    return (

        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Cambiar Contraseña</Text>
            <Text style={styles.subtitle}>Asegura tu cuenta con una nueva contraseña</Text>

            <Text style={styles.label}>Contraseña Actual</Text>
            <TextInput style={styles.input} value={passwordActual} onChangeText={setPasswordActual} secureTextEntry={true} />
            <Text style={styles.label}>Nueva Contraseña</Text>
            <TextInput style={styles.input} value={passwordNueva} onChangeText={setPasswordNueva} secureTextEntry={true} />
            <Text style={styles.label}>Confirmar Nueva Contraseña</Text>
            <TextInput style={styles.input} value={confirmacion} onChangeText={setConfirmacion} secureTextEntry={true} />
         {guardando ? (
       <ActivityIndicator size="large" color="#0056b3" style={{ marginVertical: 20 }} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleCambiarPassword}>
          <Text style={styles.buttonText}>Actualizar Crendenciales</Text>
        </TouchableOpacity>
      )}
        </ScrollView>

    );
}
 const styles = StyleSheet.create({
    container: { padding: 25, backgroundColor: '#fff', flexGrow: 1, justifyContent: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#0056b3', marginBottom: 5, textAlign: 'center' },
    subtitle: { fontSize: 14, color: '#666', marginBottom: 25, textAlign: 'center' },
    label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 5 },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 20, borderRadius: 8, backgroundColor: '#f9f9f9' },
    button: { backgroundColor: '#0056b3', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});        