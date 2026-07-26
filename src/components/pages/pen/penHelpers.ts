export const STORAGE_KEY = "pen.v1";

export const DEFAULT_HTML = `<div class="card">
  <div class="glow"></div>
  <h1 id="greeting">Hello!</h1>
  <p>Welcome to CodesRoom Web Pen. Create and test your HTML/CSS/JS snippets live.</p>
  <button id="action-btn">Change Gradient</button>
</div>
`;

export const DEFAULT_CSS = `* { box-sizing: border-box; }
body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #0f172a;
  font-family: system-ui, -apple-system, sans-serif;
  color: #f8fafc;
  overflow: hidden;
  transition: background 0.8s ease;
}
.card {
  position: relative;
  padding: 3rem 2.5rem;
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1.5rem;
  max-width: 420px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}
.glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 60%);
  pointer-events: none;
  transition: background 0.8s ease;
}
h1 {
  font-size: 2.2rem;
  margin: 0 0 1rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #a78bfa, #f43f5e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
p {
  font-size: 0.95rem;
  color: #94a3b8;
  line-height: 1.6;
  margin: 0 0 2rem;
}
button {
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: white;
  border: 0;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 0.75rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  transition: transform 0.2s, box-shadow 0.2s;
}
button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}
button:active {
  transform: translateY(0);
}
`;

export const DEFAULT_JS = `const btn = document.getElementById('action-btn');
const glow = document.querySelector('.glow');
const greeting = document.getElementById('greeting');

const gradients = [
  { bg: '#0f172a', glow: 'rgba(99, 102, 241, 0.15)' },
  { bg: '#090514', glow: 'rgba(236, 72, 153, 0.15)' },
  { bg: '#020f12', glow: 'rgba(20, 184, 166, 0.15)' },
  { bg: '#170c02', glow: 'rgba(249, 115, 22, 0.15)' }
];

const hours = new Date().getHours();
if (hours < 12) greeting.textContent = 'Good Morning!';
else if (hours < 18) greeting.textContent = 'Good Afternoon!';
else greeting.textContent = 'Good Evening!';

let currentIndex = 0;

btn.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % gradients.length;
  const theme = gradients[currentIndex];
  document.body.style.background = theme.bg;
  glow.style.background = \`radial-gradient(circle, \${theme.glow} 0%, transparent 60%)\`;
  console.log('Switched to background theme:', theme.bg);
});
`;

export type Tab = "html" | "css" | "js";
export type Viewport = "desktop" | "tablet" | "mobile";
export type ConsoleLine = { level: "log" | "info" | "warn" | "error" | "debug"; text: string };

export function buildDoc(html: string, css: string, js: string, cssLibs: string[] = [], jsLibs: string[] = []) {
  const bridge = `
    (function(){
      const send = (level, args) => {
        try { parent.postMessage({ __pen: true, level, args: args.map(a => {
          try {
            if (a instanceof Error) return a.stack || a.message;
            if (typeof a === 'function') return a.toString();
            if (typeof a === 'object' && a !== null) return JSON.stringify(a, null, 2);
            return String(a);
          } catch(e) { return String(a); }
        })}, '*'); } catch(e) {}
      };
      ['log','info','warn','error','debug'].forEach(k => {
        const orig = console[k].bind(console);
        console[k] = (...a) => { send(k, a); orig(...a); };
      });
      window.addEventListener('error', e => send('error', [e.message + ' (' + (e.filename||'') + ':' + e.lineno + ')']));
      window.addEventListener('unhandledrejection', e => send('error', ['Unhandled: ' + (e.reason && e.reason.message || e.reason)]));
    })();
  `;
  const cssLinks = cssLibs.filter(Boolean).map(u => `<link rel="stylesheet" href="${u}">`).join("");
  const jsScripts = jsLibs.filter(Boolean).map(u => `<script src="${u}"><\/script>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${cssLinks}<style>${css}</style></head><body>${html}${jsScripts}<script>${bridge}</script><script>try{${js}}catch(e){console.error(e);}</script></body></html>`;
}

export function isPreviewConsoleNoise(text: string) {
  return /browserbase keeping connection alive|\[(v3-piercer|lovable|vite)\]/i.test(text);
}
