import React, { useState} from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity,Alert } from 'react-native';

import api from '../services/api'; // Asegúrate de tener un archivo api.js configurado para manejar las solicitudes al backend
export default function Registro({ navigation }) {
    //variables
    const [usuario, setUsuario] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');   
    const [tipoDocumento, setTipoDocumento] = useState('DNI'); //valor por defecto
    const [numeroDocumento, setNumeroDocumento] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');

    const [enviando, setEnviando] = useState(false); //controlar boton carga

    const handleEnviarRegistro = async () => {
        if(usuario === '' || email === '' || password === '' || confirmPassword === '' || nombre === '' || apellido === '' || numeroDocumento === ''){
        Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
        return; //detener       
        };
        if(password !== confirmPassword){
        Alert.alert('Error', 'Las contraseñas no coinciden');
        return; //detener
        }

        try {
            setEnviando(true);
            //Aqui se enviaria la informacion al backend para crear la cuenta
            const datosRegistro = {
                username: usuario,
                email: email,
                password: password,
                confirmPassword: confirmPassword,
                nombre: nombre,
                apellido: apellido,
                tipoDocumento: tipoDocumento || 'DNI', //valor por defecto
                numeroDocumento: numeroDocumento,
                telefono: telefono,
                direccion: direccion,
            };

            const response = await api.post('/auth/registro', datosRegistro);
            setEnviando(false);
            if (response.status === 200 || response.status === 201) {
                Alert.alert('Registro exitoso', `Bienvenido ${nombre} ${apellido}, tu cuenta ha sido creada con el usuario: ${usuario}`);
                navigation.navigate('Login'); //redireccionar a login
            }

        } catch (error) {
            setEnviando(false); //detener carga
            if (error.response) {
                // Si el backend devuelve un mensaje de error específico, mostrarlo 
                Alert.alert('Error de registro', error.response.data.message || 'Ocurrió un error al registrar tu cuenta');
            } else {
                // Si no hay una respuesta del backend, mostrar un mensaje genérico
                Alert.alert('Error de registro', 'Ocurrió un error al registrar tu cuenta');
            }

        }

    };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>
    <Text style={styles.subtitle}>Datos de Acceso</Text>
      <TextInput style={styles.input} placeholder='Usuario *' value={usuario} onChangeText={setUsuario} />
      <TextInput style={styles.input} placeholder='Correo electrónico *' value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder='Contraseña *' secureTextEntry={true} value={password} onChangeText={setPassword} />
      <TextInput style={styles.input} placeholder='Confirmar contraseña *' secureTextEntry={true} value={confirmPassword} onChangeText={setConfirmPassword} />
    <Text style={styles.subtitle}>Datos Personales</Text>
      <TextInput style={styles.input} placeholder='Nombres *' value={nombre} onChangeText={setNombre} />
      <TextInput style={styles.input} placeholder='Apellidos *' value={apellido} onChangeText={setApellido} />
      <TextInput style={styles.input} placeholder='Número de Documento *' value={numeroDocumento} onChangeText={setNumeroDocumento} />
     <TextInput style={styles.input} placeholder='Teléfono ' value={telefono} onChangeText={setTelefono} />
     <TextInput style={styles.input} placeholder='Dirección' value={direccion} onChangeText={setDireccion} />    

     <TouchableOpacity style={styles.button} onPress={handleEnviarRegistro}>
        <Text style={styles.buttonText}>Registrarse</Text>
    </TouchableOpacity>   
    </View>
  );
}   
const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center', 

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
    title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0056b3',
    marginBottom: 5,
    paddingBottom: 20, // Espacio entre el título y el subtítulo
  },
    subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30, // Espacio entre el título y el formulario
  },
});     