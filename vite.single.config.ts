import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

const INLINE_SVG_FAVICON =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="#241C16"/><circle cx="222" cy="222" r="106" fill="#F7F3EA" stroke="#C89342" stroke-width="20"/><path d="M298 298 L398 398" stroke="#9B2C2C" stroke-width="24" stroke-linecap="round"/><text x="222" y="254" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-style="italic" font-size="118" fill="#9B2C2C">SD</text></svg>'
  );

function inlineSingleFilePlugin(): Plugin {
  return {
    name: 'inline-single-file',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const htmlEntry = Object.entries(bundle).find(([fileName]) => fileName.endsWith('.html'));
      if (!htmlEntry) return;

      const [htmlKey, htmlAsset] = htmlEntry;
      if (htmlAsset.type !== 'asset') return;

      let html = String(htmlAsset.source);

      // Collect and inline CSS
      const cssKeys: string[] = [];
      let combinedCss = '';
      for (const [key, item] of Object.entries(bundle)) {
        if (key.endsWith('.css') && item.type === 'asset') {
          combinedCss += String(item.source) + '\n';
          cssKeys.push(key);
        }
      }

      // Collect and inline JS (IIFE bundle)
      const jsKeys: string[] = [];
      let combinedJs = '';
      for (const [key, item] of Object.entries(bundle)) {
        if (key.endsWith('.js') && item.type === 'chunk') {
          combinedJs += item.code + '\n';
          jsKeys.push(key);
        }
      }

      // Strip external stylesheet links & Google font links for 100% offline self-containment
      html = html.replace(/<link[^>]+rel=["']stylesheet["'][^>]*>\s*/gi, '');
      html = html.replace(/<link[^>]+rel=["']preconnect["'][^>]*>\s*/gi, '');
      html = html.replace(/<link[^>]+rel=["']apple-touch-icon["'][^>]*>\s*/gi, '');
      html = html.replace(
        /<link[^>]+rel=["']icon["'][^>]*>/gi,
        `<link rel="icon" type="image/svg+xml" href="${INLINE_SVG_FAVICON}" />`
      );

      // Strip module script tags and place inline IIFE script right before </body>
      html = html.replace(/<script[^>]*src=["'][^"']+["'][^>]*>\s*<\/script>\s*/gi, '');

      // Escape </script> inside bundled JS so HTML parser never terminates early
      const safeJs = combinedJs.replace(/<\/script>/gi, '<\\/script>');
      const safeCss = combinedCss.replace(/<\/style>/gi, '<\\/style>');

      html = html.replace('</head>', () => `  <style>${safeCss}</style>\n  </head>`);
      html = html.replace('</body>', () => `  <script>${safeJs}</script>\n  </body>`);

      // Remove separate JS/CSS bundle files and rename output to satz-detektiv.html
      for (const k of [...cssKeys, ...jsKeys]) {
        delete bundle[k];
      }
      delete bundle[htmlKey];

      this.emitFile({
        type: 'asset',
        fileName: 'satz-detektiv.html',
        source: html,
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), inlineSingleFilePlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist-single',
      emptyOutDir: true,
      copyPublicDir: false,
      cssCodeSplit: false,
      assetsInlineLimit: 100_000_000,
      rollupOptions: {
        output: {
          format: 'iife' as const,
          name: 'SatzDetektivApp',
          inlineDynamicImports: true,
        },
      },
    },
  };
});
