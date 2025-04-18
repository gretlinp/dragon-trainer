import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
	plugins: [vue()],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
		extensions: [".js", ".ts", ".jsx", ".tsx", ".json"],
	},
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: `@import "vuetify/styles"`,
			},
		},
	},
});
