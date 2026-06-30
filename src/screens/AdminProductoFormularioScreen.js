import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { productoService } from '../services/productoAdminService'

export default function FormularioProductoScreen({ route, navigation }) {
    // Verificamos si recibimos un producto para editar desde la pantalla anterior
    const productoAEditar = route.params?.productoAEditar || null;
    const esEdicion = !!productoAEditar;

    const [procesando, setProcesando] = useState(false);

    // Estados del formulario inicializados vacios o con los datos del producto a editar
    const [sku, setSku] = useState(productoAEditar?.sku || '');
    const [nombre, setNombre] = useState(productoAEditar?.nombre || '');
    const [descripcion, setDescripcion] = useState(productoAEditar?.descripcion || '');
    
    // Enumeradores
    const [tipo, setTipo] = useState(productoAEditar?.tipo || 'MONTURA');
    const [genero, setGenero] = useState(productoAEditar?.genero || 'UNISEX');
    const [talla, setTalla] = useState(productoAEditar?.talla || 'MEDIANA');
    
    // Atributos fisicos
    const [color, setColor] = useState(productoAEditar?.color || '');
    const [modelo, setModelo] = useState(productoAEditar?.modelo || '');
    const [imagenUrl, setImagenUrl] = useState(productoAEditar?.imagenUrl || '');
    
    // Numericos (Se manejan como texto en el input y se convierten a numero al enviar)
    const [precioVenta, setPrecioVenta] = useState(productoAEditar?.precioVenta?.toString() || '');
    const [precioCosto, setPrecioCosto] = useState(productoAEditar?.precioCosto?.toString() || '');
    const [stockActual, setStockActual] = useState(productoAEditar?.stockActual?.toString() || '0');
    const [stockMinimo, setStockMinimo] = useState(productoAEditar?.stockMinimo?.toString() || '5');

    // Relaciones (Para simplificar en esta etapa, usaremos IDs quemados por defecto, 
    // idealmente deberias consumir un endpoint para traer las categorias y marcas)
    const [idCategoria, setIdCategoria] = useState(productoAEditar ? 1 : 1); 
    const [idMarca, setIdMarca] = useState(productoAEditar ? 1 : 1);
    const [idForma, setIdForma] = useState(productoAEditar ? 1 : 1);
    const [idMaterial, setIdMaterial] = useState(productoAEditar ? 1 : 1);

    const guardarProducto = async () => {
        // Validacion basica
        if (!sku || !nombre || !precioVenta) {
            Alert.alert('Error', 'El SKU, Nombre y Precio de Venta son obligatorios.');
            return;
        }

        try {
            setProcesando(true);

            // Construimos el DTO tal como lo espera Spring Boot
            const payload = {
                sku,
                nombre,
                descripcion,
                tipo,
                genero,
                talla,
                color,
                modelo,
                imagenUrl,
                precioVenta: parseFloat(precioVenta),
                precioCosto: parseFloat(precioCosto),
                stockActual: parseInt(stockActual, 10),
                stockMinimo: parseInt(stockMinimo, 10),
                idCategoria,
                idMarca,
                idForma,
                idMaterial
            };

            if (esEdicion) {
                await productoService.actualizarProducto(productoAEditar.idProducto, payload);
                Alert.alert('Exito', 'Producto actualizado correctamente.');
            } else {
                await productoService.crearProducto(payload);
                Alert.alert('Exito', 'Producto registrado correctamente.');
            }

            // Regresamos a la lista de productos
            navigation.goBack();
        } catch (error) {
            console.error("Error al guardar producto:", error);
            Alert.alert('Error', 'No se pudo guardar el producto. Verifica los datos.');
        } finally {
            setProcesando(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                
                <Text style={styles.sectionTitle}>Informacion Principal</Text>
                
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>SKU (Codigo Unico)*</Text>
                    <TextInput style={styles.input} value={sku} onChangeText={setSku} placeholder="Ej: RB-001" editable={!esEdicion} />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nombre del Producto*</Text>
                    <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Ej: Ray-Ban Aviator" />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Descripcion</Text>
                    <TextInput style={[styles.input, styles.textArea]} value={descripcion} onChangeText={setDescripcion} multiline numberOfLines={3} />
                </View>

                <Text style={styles.sectionTitle}>Clasificacion y Caracteristicas</Text>

                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                        <Text style={styles.label}>Tipo</Text>
                        <View style={styles.pickerContainer}>
                            <Picker selectedValue={tipo} onValueChange={(itemValue) => setTipo(itemValue)}>
                                <Picker.Item label="Montura" value="MONTURA" />
                                <Picker.Item label="Lentes de Sol" value="SOLAR" />
                                <Picker.Item label="Lente de Contacto" value="LENTE_CONTACTO" />
                                <Picker.Item label="Accesorio" value="ACCESORIO" />
                            </Picker>
                        </View>
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Genero</Text>
                        <View style={styles.pickerContainer}>
                            <Picker selectedValue={genero} onValueChange={(itemValue) => setGenero(itemValue)}>
                                <Picker.Item label="Unisex" value="UNISEX" />
                                <Picker.Item label="Hombre" value="HOMBRE" />
                                <Picker.Item label="Mujer" value="MUJER" />
                                <Picker.Item label="Kids" value="KIDS" />
                            </Picker>
                        </View>
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                        <Text style={styles.label}>Talla</Text>
                        <View style={styles.pickerContainer}>
                            <Picker selectedValue={talla} onValueChange={(itemValue) => setTalla(itemValue)}>
                                <Picker.Item label="Pequeña" value="PEQUEÑA" />
                                <Picker.Item label="Mediana" value="MEDIANA" />
                                <Picker.Item label="Grande" value="GRANDE" />
                            </Picker>
                        </View>
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Color</Text>
                        <TextInput style={styles.input} value={color} onChangeText={setColor} placeholder="Ej: Negro" />
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Precios e Inventario</Text>

                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                        <Text style={styles.label}>Precio Venta (S/.)*</Text>
                        <TextInput style={styles.input} value={precioVenta} onChangeText={setPrecioVenta} keyboardType="numeric" placeholder="0.00" />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Precio Costo (S/.)</Text>
                        <TextInput style={styles.input} value={precioCosto} onChangeText={setPrecioCosto} keyboardType="numeric" placeholder="0.00" />
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                        <Text style={styles.label}>Stock Actual</Text>
                        <TextInput style={styles.input} value={stockActual} onChangeText={setStockActual} keyboardType="numeric" />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Stock Minimo</Text>
                        <TextInput style={styles.input} value={stockMinimo} onChangeText={setStockMinimo} keyboardType="numeric" />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>URL de la Imagen</Text>
                    <TextInput style={styles.input} value={imagenUrl} onChangeText={setImagenUrl} placeholder="https://..." />
                </View>

                <TouchableOpacity 
                    style={[styles.btnGuardar, procesando && styles.btnDisabled]} 
                    onPress={guardarProducto}
                    disabled={procesando}
                >
                    {procesando ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.btnText}>{esEdicion ? 'Actualizar Producto' : 'Registrar Producto'}</Text>
                    )}
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f7fa' },
    scrollContainer: { padding: 20, paddingBottom: 40 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0056b3', marginTop: 10, marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#ddd', paddingBottom: 5 },
    inputGroup: { marginBottom: 15 },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    label: { fontSize: 13, color: '#333', fontWeight: 'bold', marginBottom: 5 },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 15, height: 45, fontSize: 15, color: '#333' },
    textArea: { height: 80, textAlignVertical: 'top', paddingTop: 10 },
    pickerContainer: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, overflow: 'hidden', height: 45, justifyContent: 'center' },
    btnGuardar: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
    btnDisabled: { backgroundColor: '#8bc34a' },
    btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});