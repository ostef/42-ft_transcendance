import * as VueRouter from 'vue-router';

import Login from '../views/Login.vue';

const routes: VueRouter.RouteRecordRaw[] = [
	{
		path: '/',
		redirect: {
			name: 'login'
		}
	},
	{
		path: '/login',
		name: 'login',
		component: Login
	}
];

export const router: VueRouter.Router = VueRouter.createRouter ({
	history: VueRouter.createWebHashHistory (),
	routes: routes
});
