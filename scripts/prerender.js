import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, '../dist');
const INDEX_HTML_PATH = path.join(DIST_DIR, 'index.html');

const ROUTES_SEO = [
  {
    path: '/',
    title: 'CodesRoom | Collaborative Code Editor & Compiler',
    description: 'CodesRoom is a free online collaborative code editor and IDE. Run and execute code instantly in 15+ programming languages, format JSON, and pair program in real-time.',
    keywords: 'collaborative coding, online compiler, live code editor, pair programming, codesroom, json formatter, www.codesroom.in'
  },
  {
    path: '/online-compiler',
    title: 'Online Compiler & Code Editor | CodesRoom',
    description: 'Free online code compiler and IDE playground. Write, run, and execute code instantly in your browser in Python, JavaScript, C++, Java, Go, Rust, and 15+ languages.',
    keywords: 'online IDE, online code runner, online compiler, python online editor, javascript playground, codesroom playground'
  },
  {
    path: '/json-formatter',
    title: 'JSON Formatter & Validator | CodesRoom',
    description: 'Best free online JSON formatter, validator, and editor. Beautify, validate, minify, and parse JSON instantly. Convert JSON to XML, YAML, and interactive tree view.',
    keywords: 'json formatter, json parser, json validator, json to yaml, json to xml, beautify json, codesroom json'
  },
  {
    path: '/web-pen',
    title: 'CodesRoom | Online Front-End Editor',
    description: 'Free online HTML, CSS, and JavaScript editor with instant live preview. Code, test, and prototype front-end designs side-by-side in your browser.',
    keywords: 'codepen alternative, online html editor, live html preview, html css js compiler, front-end editor, codesroom pen'
  },
  {
    path: '/auth',
    title: 'Login & Sign Up | CodesRoom Workspace',
    description: 'Log in or create a CodesRoom account to save your code playgrounds, manage real-time collaborative coding rooms, and pair program with your team.',
    keywords: 'codesroom login, codesroom sign up, codesroom authentication'
  }
];

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function prerender() {
  console.log('Starting SEO pre-rendering...');

  if (!fs.existsSync(INDEX_HTML_PATH)) {
    console.error(`Error: build output index.html not found at ${INDEX_HTML_PATH}. Make sure to build the project first.`);
    process.exit(1);
  }

  const originalHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf8');

  for (const route of ROUTES_SEO) {
    const { path: routePath, title, description, keywords } = route;
    const fullUrl = `https://codesroom.in${routePath === '/' ? '' : routePath}`;

    let updatedHtml = originalHtml;

    // Regex replacement patterns matching structure in index.html (including line breaks)
    const titleRegex = /<title>[\s\S]*?<\/title>/gi;
    const descRegex = /<meta\s+name="description"[\s\S]*?content="[\s\S]*?"\s*\/?>/gi;
    const keywordsRegex = /<meta\s+name="keywords"[\s\S]*?content="[\s\S]*?"\s*\/?>/gi;
    
    const ogTitleRegex = /<meta\s+property="og:title"[\s\S]*?content="[\s\S]*?"\s*\/?>/gi;
    const ogDescRegex = /<meta\s+property="og:description"[\s\S]*?content="[\s\S]*?"\s*\/?>/gi;
    const ogUrlRegex = /<meta\s+property="og:url"[\s\S]*?content="[\s\S]*?"\s*\/?>/gi;
    
    const twitterTitleRegex = /<meta\s+name="twitter:title"[\s\S]*?content="[\s\S]*?"\s*\/?>/gi;
    const twitterDescRegex = /<meta\s+name="twitter:description"[\s\S]*?content="[\s\S]*?"\s*\/?>/gi;
    const twitterUrlRegex = /<meta\s+name="twitter:url"[\s\S]*?content="[\s\S]*?"\s*\/?>/gi;

    // Apply replacements
    updatedHtml = updatedHtml.replace(titleRegex, `<title>${escapeHtml(title)}</title>`);
    updatedHtml = updatedHtml.replace(descRegex, `<meta name="description" content="${escapeHtml(description)}" />`);
    updatedHtml = updatedHtml.replace(keywordsRegex, `<meta name="keywords" content="${escapeHtml(keywords)}" />`);
    
    updatedHtml = updatedHtml.replace(ogTitleRegex, `<meta property="og:title" content="${escapeHtml(title)}" />`);
    updatedHtml = updatedHtml.replace(ogDescRegex, `<meta property="og:description" content="${escapeHtml(description)}" />`);
    updatedHtml = updatedHtml.replace(ogUrlRegex, `<meta property="og:url" content="${escapeHtml(fullUrl)}" />`);
    
    updatedHtml = updatedHtml.replace(twitterTitleRegex, `<meta name="twitter:title" content="${escapeHtml(title)}" />`);
    updatedHtml = updatedHtml.replace(twitterDescRegex, `<meta name="twitter:description" content="${escapeHtml(description)}" />`);
    updatedHtml = updatedHtml.replace(twitterUrlRegex, `<meta name="twitter:url" content="${escapeHtml(fullUrl)}" />`);

    if (routePath === '/') {
      // Overwrite the main index.html in the root of dist
      fs.writeFileSync(INDEX_HTML_PATH, updatedHtml, 'utf8');
      console.log(`Successfully pre-rendered root path /`);
    } else {
      // Create subdirectory in dist and write index.html there
      const targetDir = path.join(DIST_DIR, routePath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      const targetFile = path.join(targetDir, 'index.html');
      fs.writeFileSync(targetFile, updatedHtml, 'utf8');
      console.log(`Successfully pre-rendered route ${routePath} to ${targetFile}`);
    }
  }

  console.log('SEO pre-rendering finished successfully!');
}

prerender();
