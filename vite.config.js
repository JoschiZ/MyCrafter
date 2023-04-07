import { sveltekit } from '@sveltejs/kit/vite';
import { nodeLoaderPlugin } from "@vavite/node-loader/plugin"

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [
		sveltekit(),
	    nodeLoaderPlugin()
],

	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},

	css: {
		preprocessorOptions: {
			scss: {
				additionalData: '@use "src/variables.scss" as *;'
			}
		}
	}
};

export default config;
