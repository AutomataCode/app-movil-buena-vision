import 'react-native-gesture-handler';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import AppNavigator from './src/navigation/AppNavigator';
import { useAuth } from './src/hooks/useAuth';



export default function App() {
  // Consumimos el estado global y de carga desde nuestro Custom Hook
  const { cargando, isLoggedIn, rol } = useAuth();

  // Si aún está leyendo el AsyncStorage, muestra el indicador de carga
  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#0056b3" />
      </View>
    );
  }

  // Una vez listo, renderiza el contenedor con el enrutador inteligente
  return (
    <NavigationContainer>
      <AppNavigator isLoggedIn={isLoggedIn} rol={rol} />
    </NavigationContainer>
  );
}
