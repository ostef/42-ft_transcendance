import * as VueRouter from 'vue-router';

import AxiosTest from '../views/AxiosTest.vue';
import Login from '../views/Login.vue';
import Chat from '../views/Chat.vue';

const routes: VueRouter.RouteRecordRaw[] = [
	{
		path: '/',
		redirect: {
			name: 'chat'
		}
	},
	{
		path: '/login',
		name: 'login',
		component: Login
	},
	{
		path: '/chat',
		name: 'chat',
		component: Chat
	},
];

const router: VueRouter.Router = VueRouter.createRouter ({
	history: VueRouter.createWebHashHistory (),
	routes: routes
});

export default router;
