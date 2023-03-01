import * as Vue from 'vue';
import './style.css';

import App from './App.vue';
import router from './plugins/router';

import axios from 'axios';
import VueAxios from 'vue-axios';

axios.defaults.baseURL = 'http://' + location.hostname + ':3000';
axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('token');

const app = Vue.createApp (App);
app.use (router);
app.use (VueAxios, axios);
app.mount ('#app');
