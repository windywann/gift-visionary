import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
      base: '/gift-visionary/',
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api/deepseek': {
            target: 'https://api.deepseek.com',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/deepseek/, ''),
          },
          '/api/zhidemai': {
            target: 'https://openapi.smzdm.com',
            changeOrigin: true,
            secure: false, // 忽略SSL证书错误
            rewrite: (path) => path.replace(/^\/api\/zhidemai/, ''),
          },
          '/api/imgsearch': {
            target: 'https://cn.apihz.cn',
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/api\/imgsearch/, ''),
          },
        }
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.DEEPSEEK_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.DEEPSEEK_API_KEY': JSON.stringify(env.DEEPSEEK_API_KEY),
        'process.env.ZHIDEMAI_API_KEY': JSON.stringify(env.ZHIDEMAI_API_KEY),
        'process.env.IMAGE_SEARCH_ID': JSON.stringify(env.IMAGE_SEARCH_ID),
        'process.env.IMAGE_SEARCH_KEY': JSON.stringify(env.IMAGE_SEARCH_KEY),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
