import { defineConfig } from 'vite';
import UnoCSS from 'unocss/vite';

export default defineConfig({
    plugins: [UnoCSS()],
    server: {
        watch: {
            usePolling: false, // Set to true if file changes aren't detected
        },
    },
});
