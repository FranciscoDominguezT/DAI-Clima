import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { fetchUrl } from '../api/api';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Modal } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';

export default function HomeScreen() {
    const [weather, setWeather] = useState({});
    const [errorMsg, setErrorMsg] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [selectedHour, setSelectedHour] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const theme = {
        bgWhite: (opacity) => `rgba(255, 255, 255, ${opacity})`,
    };

    const handleGesture = (event) => {
        if (event.nativeEvent.translationY > 50) { 
            setModalVisible(false);
        }
    };

    const translateConditionText = (conditionText) => {
        const conditionTranslations = {
            'Sunny': 'Soleado',
            'Cloudy': 'Nublado',
            'Rainy': 'Lluvioso',
            'Stormy': 'Tormentoso',
            'Snowy': 'Nevado',
            'Foggy': 'Neblinoso',
            'Windy': 'Ventoso',
            'Partly cloudy': 'Parcialmente nublado',
            'Clear': 'Despejado',
            'Light rain': 'Llovizna',
            'Light rain shower': 'Llovizna',
        };

        return conditionTranslations[conditionText] || conditionText;
    };

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Se requieren permisos de ubicación');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setUserLocation(location);

            fetchUrl({
                cityName: `${location.coords.latitude},${location.coords.longitude}`,
                days: '7'
            }).then(data => {
                setWeather(data);
            });
        })();
    }, []);

    const { current, location, forecast } = weather;

    return (
        <View className="flex-1 relative">
            <StatusBar style="light" />
            <Image blurRadius={60} source={require('../assets/bg.png')} className="absolute w-full h-full" />
            <View className="mx-4 flex justify-around mb-2">
                <Text className="text-white text-center text-3xl mt-16">
                    Mi Ubicación
                </Text>

                {userLocation && (
                    <View className="h-60 w-80 mt-4 rounded-xl overflow-hidden mx-auto">
                        <MapView
                            className="w-full h-full"
                            initialRegion={{
                                latitude: userLocation.coords.latitude,
                                longitude: userLocation.coords.longitude,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            }}
                        >
                            <Marker
                                coordinate={{
                                    latitude: userLocation.coords.latitude,
                                    longitude: userLocation.coords.longitude
                                }}
                                title="Mi ubicación"
                            />
                        </MapView>
                    </View>
                )}

                <Text className="text-white text-center text-2xl font-bold mt-1">
                    <Text className="text-base font-semibold text-gray-300">
                        {(location?.region || '').toUpperCase()}
                    </Text>
                </Text>

                <View className="space-y-1 mt-6">
                    <Text className="text-center text-white text-6xl mb-2">
                        {current?.temp_c?.toFixed(1)}°
                    </Text>
                    <Text className="text-center text-white text-2xl tracking-widest">
                        {translateConditionText(current?.condition?.text)}
                        {current?.condition?.icon && (
                            <Image
                                source={{ uri: 'https:' + current.condition.icon }}
                                className="w-10 h-10"
                            />
                        )}
                    </Text>
                    <Text className="text-center text-white text-xl tracking-widest">
                        Minima {forecast?.forecastday[0]?.day?.mintemp_c?.toFixed(1)}° /
                        Maxima {forecast?.forecastday[0]?.day?.maxtemp_c?.toFixed(1)}°
                    </Text>
                </View>

                <View className="flex-row justify-center mx-4 mt-7">
                    <View className="flex-row space-x-2 items-center mr-7">
                        <Image source={require('../assets/wind.png')} className="w-7 h-7" />
                        <Text className="text-white font-semibold text-base">
                            {current?.wind_kph}km/h
                        </Text>
                    </View>

                    <View className="flex-row space-x-2 items-center">
                        <Image source={require('../assets/drop.png')} className="w-7 h-7" />
                        <Text className="text-white font-semibold text-base">
                            {current?.humidity}%
                        </Text>
                    </View>
                </View>

                <View className="mt-10 mr-4 space-y-3">
                    <ScrollView
                        horizontal
                        contentContainerStyle={{ paddingHorizontal: 15 }}
                        showsHorizontalScrollIndicator={false}
                    >
                        {forecast?.forecastday[0]?.hour
                            ?.slice(0, 20)
                            .map((hourData, index) => {
                                const time = hourData.time.split(' ')[1];

                                return (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => {
                                            setSelectedHour(hourData);
                                            setModalVisible(true);
                                        }}
                                    >
                                        <View
                                            className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4"
                                            style={{
                                                backgroundColor: theme.bgWhite(0.15)
                                            }}
                                        >
                                            <Image
                                                source={{ uri: 'https:' + hourData.condition.icon }}
                                                className="w-11 h-11"
                                            />
                                            <Text className="text-white">{time}</Text>
                                            <Text className="text-white text-xl font-semibold">
                                                {hourData.temp_c.toFixed(1)}°
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                    </ScrollView>
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <TouchableOpacity
                            className="flex-1 justify-end"
                            activeOpacity={1}
                            onPress={() => setModalVisible(false)}
                        >
                            <PanGestureHandler onGestureEvent={handleGesture}>
                            <TouchableOpacity
                                activeOpacity={1}
                                className="bg-[#18181b]/95 backdrop-blur-md rounded-t-3xl p-6"
                            >
                                {selectedHour && (
                                    <>
                                        <View className="w-20 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

                                        <View className="flex-row items-center justify-between mb-6">
                                            <View>
                                                <Text className="text-white text-2xl font-semibold">
                                                    {selectedHour.time.split(' ')[1]}
                                                </Text>
                                                <Text className="text-gray-300">
                                                    {selectedHour.condition.text}
                                                </Text>
                                            </View>
                                            <View className="flex-row items-center space-x-2">
                                                <Image
                                                    source={{ uri: 'https:' + selectedHour.condition.icon }}
                                                    className="w-12 h-12"
                                                />
                                                <Text className="text-white text-3xl font-bold">
                                                    {selectedHour.temp_c.toFixed(1)}°
                                                </Text>
                                            </View>
                                        </View>

                                        <View className="flex-row flex-wrap justify-between">
                                            <View className="w-[48%] bg-white/10 rounded-2xl p-4 mb-4">
                                                <View className="flex-row items-center space-x-2">
                                                    <Text className="text-2xl">🌡️</Text>
                                                    <Text className="text-white font-medium">ST</Text>
                                                </View>
                                                <Text className="text-white text-xl font-semibold mt-2">
                                                    {selectedHour.feelslike_c}°C
                                                </Text>
                                            </View>

                                            <View className="w-[48%] bg-white/10 rounded-2xl p-4 mb-4">
                                                <View className="flex-row items-center space-x-2">
                                                    <Text className="text-2xl">💨</Text>
                                                    <Text className="text-white font-medium">Viento</Text>
                                                </View>
                                                <Text className="text-white text-xl font-semibold mt-2">
                                                    {selectedHour.wind_kph} km/h
                                                </Text>
                                                <Text className="text-gray-300">
                                                    {selectedHour.wind_dir}
                                                </Text>
                                            </View>

                                            <View className="w-[48%] bg-white/10 rounded-2xl p-4 mb-4">
                                                <View className="flex-row items-center space-x-2">
                                                    <Text className="text-2xl">💧</Text>
                                                    <Text className="text-white font-medium">Humedad</Text>
                                                </View>
                                                <Text className="text-white text-xl font-semibold mt-2">
                                                    {selectedHour.humidity}%
                                                </Text>
                                            </View>

                                            <View className="w-[48%] bg-white/10 rounded-2xl p-4 mb-4">
                                                <View className="flex-row items-center space-x-2">
                                                    <Text className="text-2xl">☔️</Text>
                                                    <Text className="text-white font-medium">Lluvia</Text>
                                                </View>
                                                <Text className="text-white text-xl font-semibold mt-2">
                                                    {selectedHour.chance_of_rain}%
                                                </Text>
                                            </View>

                                            <View className="w-[48%] bg-white/10 rounded-2xl p-4">
                                                <View className="flex-row items-center space-x-2">
                                                    <Text className="text-2xl">👁️</Text>
                                                    <Text className="text-white font-medium">Visibilidad</Text>
                                                </View>
                                                <Text className="text-white text-xl font-semibold mt-2">
                                                    {selectedHour.vis_km} km
                                                </Text>
                                            </View>

                                            <View className="w-[48%] bg-white/10 rounded-2xl p-4">
                                                <View className="flex-row items-center space-x-2">
                                                    <Text className="text-2xl">☁️</Text>
                                                    <Text className="text-white font-medium">Nubes</Text>
                                                </View>
                                                <Text className="text-white text-xl font-semibold mt-2">
                                                    {selectedHour.cloud}%
                                                </Text>
                                            </View>
                                        </View>
                                    </>
                                )}
                            </TouchableOpacity>
                            </PanGestureHandler>
                        </TouchableOpacity>
                    </Modal>
                </View>
            </View>
        </View>
    );
}
