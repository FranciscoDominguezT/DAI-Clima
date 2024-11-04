import axios from 'axios';
import { apiKey } from '../data/data';

const route = params => `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${params.cityName}&days=${params.days}&aqi=no&alerts=no`;
const locations = params => `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${params.cityName}`;

const apiCall = async (endpoint) => {
    const opc = {
        method : 'GET',
        url: endpoint
    };
    try {
        const response = await axios.request(opc);
        return response.data;
    } catch (error) {
        console.log('error', error);
        return null;
    }
}

export const fetchUrl = params => {
    return apiCall(route(params));
}

export const fetchLocation = params => {
    return apiCall(locations(params));
}