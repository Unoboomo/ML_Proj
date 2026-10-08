import adapterStatic from "@sveltejs/adapter-static";
import sveltePreprocess from "svelte-preprocess";
import autoprefixer from "autoprefixer";
import { preprocessMeltUI } from "@melt-ui/pp";
import sequence from "svelte-sequential-preprocessor";
import { vitePreprocess } from "@sveltejs/kit/vite";

const preprocess = sveltePreprocess({
	postcss: {
		plugins: [autoprefixer]
	}
});

const config = {
	preprocess: sequence([preprocess, vitePreprocess(), preprocessMeltUI()]),
	kit: {
		// fallback replaces GitHub Pages' default 404 page with your app
		adapter: adapterStatic({ fallback: "404.html" }),
		paths: {
			// "" while developing; "/<repo-name>" in the GitHub Action build.
			// Locally, test a Pages build by setting BASE_PATH first (see below).
			base: process.argv.includes("dev") ? "" : process.env.BASE_PATH,
			relative: false
		}
	},
	vitePlugin: {
		// experimental: {
		//  inspector: { holdMode: true },
		// }
	}
};

export default config;
