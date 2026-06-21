import React, { useState} from 'react';
import { DeviceEventEmitter,StyleSheet, Text, View, TextInput, TouchableOpacity,Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Para almacenar el token de autenticación
import api from '../services/api'; 

export default function LoginScreen( {navigation} ) {
    //variables
    const [usuario, setUsuario] = useState('');
  
    const [password, setPassword] = useState('');
    const [cargando, setCargando] = useState(false); //controlar boton carga

    //funcion para manejar el login
    const handleLogin = async() => {
        if(usuario === ''||password === ''){
            Alert.alert('Error', 'Por favor ingresa tu correo electrónico y contraseña');
            return; //detener
        }
      try{
        setCargando(true); 
        const credenciales = {
            username: usuario,
            password: password,
        };
        const response = await api.post('/auth/login', credenciales);
        
         setCargando(false);
        if(response.status === 200|| response.status === 201){
          const tokenJwt= response.data.token; 
          await AsyncStorage.setItem('token_sesion', tokenJwt); // Almacena el token en AsyncStorage
          await AsyncStorage.setItem('usuario', usuario); // Almacena el nombre de usuario
          await AsyncStorage.setItem('rol_usuario', response.data.rol); // Almacena el rol del usuario
          setCargando(false);
          DeviceEventEmitter.emit('SESION_INICIADA'); // Emitir evento de sesión iniciada
  
        }else{
          setCargando(false);
          Alert.alert('Error de acceso', 'Respuesta inesperada del servidor. Por favor, intenta nuevamente más tarde.');
        }

      }catch(error){
        setCargando(false); 
        console.error('Error al iniciar sesión:', error);
        if (error.response) {
           Alert.alert('Error de acceso', 'Usuario o contraseña incorrectos.');
        } else {
            Alert.alert('Error de red', 'No se pudo conectar con el servidor central');
        }
      } 


    
    };
    const handleRegistro = () => {
        navigation.navigate('Registro');
    }
   

  return (
    //Estrucutra sistema flexbox para centrar el conotenido
    <View style={styles.container}>

      <Text style={styles.title}>Buena Visión</Text>
      <Text style={styles.subtitle}>Iniciar Sesión en tu cuenta</Text>
      <Text style={styles.label}>Usuario</Text>
        <TextInput style={styles.input} 
        placeholder="Ingresa tu usuario" 
        // estado del email
        value={usuario}
        onChangeText={setUsuario}
        autoCapitalize="none" />
      <Text style={styles.label}>Contraseña</Text>
        <TextInput style={styles.input} placeholder="**********" 
        //estado de la contraseña
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true} />

        
{cargando ? (
    <ActivityIndicator size="large" color="#0056b3" animating={true} />
    ) : (
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>  
    )}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Registro')}>
        <Text  style={styles.buttonText}> Regístrate</Text>
      </TouchableOpacity>


      <TouchableOpacity  onPress={() => Alert.alert('Olvidé mi contraseña', 'Comuniquese con el administrador del sistema')}>
        <Text >Olvidé mi contraseña</Text>
      </TouchableOpacity>
    
    
    
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ocupa toda la pantalla
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center', 
    
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0056b3',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30, // Espacio entre el título y el formulario
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    fontWeight: 'bold', // Agregado para resaltar el label
  
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8, //
    padding: 12,
    marginBottom: 15, // Espacio entre los campos
    backgroundColor: '#f9f9f9',
    },
    button: {
    backgroundColor: '#0056b3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10, // Espacio entre el botón y el último campo
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
