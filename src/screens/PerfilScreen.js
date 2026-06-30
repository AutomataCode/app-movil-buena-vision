import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Image, Modal, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import api from '../services/api';

export default function PerfilScreen({navigation}) {    
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido]= useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);

    const [imagenPerfil, setImagenPerfil] = useState(null);
    const [mostrarCamara, setMostrarCamara] = useState(false);
    
    // NUEVO: Estado para verificar si la cámara terminó de cargar el hardware
    const [camaraLista, setCamaraLista] = useState(false); 
    
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef(null);

    useEffect(() => { 
        obtenerDatosUsuario();
    }, []); 

    const obtenerDatosUsuario = async () => {
        try {
            setCargando(true);
            const token = await AsyncStorage.getItem('token_sesion');
            
            const fotoGuardada = await AsyncStorage.getItem('foto_perfil_local');
            if (fotoGuardada) setImagenPerfil(fotoGuardada);

            const response = await api.get('/usuarios/perfil', {
                headers: { Authorization: `Bearer ${token}` },
            });  
            if (response.status === 200) {
                setNombre(response.data.nombre);
                setApellido(response.data.apellido);
                setTelefono(response.data.telefono);
                setDireccion(response.data.direccion);
            }
        } catch (error) {
            console.error(error); 
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

            const datosModificados = { nombre, apellido, telefono, direccion };

            const response = await api.put('/usuarios/actualizar', datosModificados, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.status === 200) {
                Alert.alert('Éxito', 'Perfil actualizado correctamente');
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo actualizar el perfil');
        } finally { 
            setGuardando(false); 
        }
    };

    const abrirCamara = async () => {
        if (!permission || !permission.granted) {
            const respuesta = await requestPermission();
            if (!respuesta.granted) {
                Alert.alert('Permiso Denegado', 'Necesitamos acceso a la cámara para cambiar tu foto.');
                return;
            }
        }
        setCamaraLista(false); // Reiniciamos el estado antes de abrir el modal
        setMostrarCamara(true);
    };

    const capturarFoto = async () => {
        // MODIFICADO: Bloqueamos la captura si la cámara no reporta estar lista
        if (cameraRef.current && camaraLista) {
            try {
                const foto = await cameraRef.current.takePictureAsync({ 
                    quality: 0.3, 
                    base64: true 
                });
                
                const base64Image = `data:image/jpeg;base64,${foto.base64}`;
                
                setImagenPerfil(base64Image); 
                setMostrarCamara(false); 
                
                await AsyncStorage.setItem('foto_perfil_local', base64Image);
            } catch (error) {
                Alert.alert('Error', 'No se pudo tomar la foto');
            }
        } else {
            Alert.alert('Espere', 'La cámara se está inicializando...');
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
        
        <View style={styles.avatarSeccion}>
            <TouchableOpacity style={styles.avatarContainer} onPress={abrirCamara}>
                {imagenPerfil ? (
                    <Image source={{ uri: imagenPerfil }} style={styles.avatarImage} />
                ) : (
                    <Ionicons name="person" size={60} color="#ccc" />
                )}
                <View style={styles.cameraBadge}>
                    <Ionicons name="camera" size={16} color="#fff" />
                </View>
            </TouchableOpacity>
            <Text style={styles.title}>Mi Perfil</Text>
        </View>

        <Text style={styles.label}>Nombres *</Text>
        <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />       
        <Text style={styles.label}>Apellidos *</Text>
        <TextInput style={styles.input} value={apellido} onChangeText={setApellido} />
        <Text style={styles.label}>Teléfono *</Text>
        <TextInput style={styles.input} value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" />
        <Text style={styles.label}>Dirección de Entrega *</Text>
        <TextInput style={styles.input} value={direccion} onChangeText={setDireccion} />
       
       {guardando ? (
           <ActivityIndicator size="large" color="#0056b3" style={{ marginVertical: 20 }} />
         ) : (
            <TouchableOpacity style={styles.button} onPress={handleActualizarPerfil}>
                <Text style={styles.buttonText}>Guardar Cambios</Text>
            </TouchableOpacity>
        )}

        <Modal visible={mostrarCamara} animationType="slide" transparent={false}>
            <View style={styles.cameraContainer}>
                
                {/* MODIFICADO: Agregamos onCameraReady para activar el botón de disparo */}
                <CameraView 
                    style={styles.cameraView} 
                    facing="front" 
                    ref={cameraRef}
                    onCameraReady={() => setCamaraLista(true)} 
                />
                
                <View style={styles.cameraOverlayAbsolute}>
                    <SafeAreaView style={styles.safeArea}>
                        <TouchableOpacity style={styles.closeCameraButton} onPress={() => setMostrarCamara(false)}>
                            <Ionicons name="close-circle" size={40} color="#fff" />
                        </TouchableOpacity>
                    </SafeAreaView>
                    
                    {/* MODIFICADO: Estilo visual opaco si no está lista */}
                    <TouchableOpacity 
                        style={[styles.shutterButton, !camaraLista && { opacity: 0.5 }]} 
                        onPress={capturarFoto}
                        disabled={!camaraLista}
                    >
                        <View style={styles.shutterButtonInner} />
                    </TouchableOpacity>
                </View>

            </View>
        </Modal>

       </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    avatarSeccion: { alignItems: 'center', marginBottom: 20 },
    avatarContainer: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#f1f3f5', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#0056b3', position: 'relative' },
    avatarImage: { width: '100%', height: '100%', borderRadius: 60 },
    cameraBadge: { position: 'absolute', bottom: 0, right: 5, backgroundColor: '#0056b3', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginTop: 15, color: '#0056b3' },
    label: { fontSize: 16, marginBottom: 5, color: '#333' },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 20, borderRadius: 5 },
    button: { backgroundColor: '#0056b3', padding: 15, borderRadius: 5, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: 'bold' },

    // ESTILOS DE LA CÁMARA COMPLETADOS Y CORREGIDOS
    cameraContainer: { flex: 1, backgroundColor: '#000' },
    cameraView: { flex: 1 },
    cameraOverlayAbsolute: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between', padding: 20 },
    safeArea: { alignmentSelf: 'flex-start' },
    closeCameraButton: { padding: 10 },
    shutterButton: { width: 70, height: 70, borderRadius: 35, borderWidth: 4, borderColor: '#fff', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 30 },
    shutterButtonInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#fff' }
});
