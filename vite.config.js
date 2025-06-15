// vite.config.js

import { defineConfig } from 'vite';
import angular from '@vitejs/plugin-angular';

export default defineConfig({
  plugins: [angular()],
  server: {
    port: 4200,
    host: true, // Так Vite слушает все хосты
    allowedHosts: ['spitefully-adjusted-jabiru.cloudpub.ru'] // ✅ Разрешаем этот хост
  }
}); 