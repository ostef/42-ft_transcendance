import * as VueRouter from 'vue-router';

import AxiosTest from '../views/AxiosTest.vue';
import Login from '../views/Login.vue';
import HomePage from '../views/HomePage.vue';
import GamePage from '../views/GamePage.vue';

const routes: VueRouter.RouteRecordRaw[] = [
	{
		path: '/',
		redirect: {
			name: 'homepage'
		}
	},
	{
		path: '/login',
		name: 'login',
		component: Login
	},
	{
		path: '/axiostest',
		name: 'axiostest',
		component: AxiosTest
	},
	{
		path: '/homepage',
		name: 'homepage',
		component: HomePage
	},
	{
		path: '/game',
		name: 'gamepage',
		component: GamePage
	},
];

const router: VueRouter.Router = VueRouter.createRouter ({
	history: VueRouter.createWebHashHistory (),
	routes: routes
});

export default router;
