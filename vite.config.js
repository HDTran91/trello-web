import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  base: '/', // ✅ Make sure this is a string, not an object
  plugins: [react(), svgr()],
  resolve: {
    alias: [
      { find: '~', replacement: '/src' }
    ]
  }
})
