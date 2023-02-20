import * as Vue from 'vue';
import './style.css';

import App from './App.vue';
import router from './plugins/router';

import axios from 'axios';
import VueAxios from 'vue-axios';


const app = Vue.createApp (App);
app.use (router);
app.use (VueAxios, axios);

// axios.defaults.baseURL = 'http://' + location.hostname + ':3000';
axios.defaults.baseURL = 'http://jsonplaceholder.typicode.com';
axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('token');

app.mount ('#app');
