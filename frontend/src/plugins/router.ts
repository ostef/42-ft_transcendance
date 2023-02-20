import * as VueRouter from 'vue-router';

import AxiosTest from '../views/AxiosTest.vue';
import Login from '../views/Login.vue';

const routes: VueRouter.RouteRecordRaw[] = [
	{
		path: '/',
		redirect: {
			name: 'axiostest'
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
];

const router: VueRouter.Router = VueRouter.createRouter ({
	history: VueRouter.createWebHashHistory (),
	routes: routes
});

export default router;
