const fs = require('fs');
const path = require('path');

// Cargar variables de entorno desde .env si existe (para desarrollo local)
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      process.env[key.trim()] = value;
    }
  });
}

// Configuración de variables con valores por defecto
const IS_NETLIFY = process.env.NETLIFY === 'true';
let API_BASE_URL = process.env.API_BASE_URL;

if (!API_BASE_URL) {
  if (IS_NETLIFY) {
    console.error('❌ ERROR: La variable API_BASE_URL no está definida en Netlify.');
    console.error('   Por favor, ve a Site Settings > Build & deploy > Environment variables y agrégala.');
    process.exit(1);
  }
  API_BASE_URL = 'http://localhost:3000';
}

const INSPECTOR_MODE = process.env.INSPECTOR_MODE || 'false';

// Normalizar la URL para evitar double slashes (//)
API_BASE_URL = API_BASE_URL.replace(/\/+$/, '');

const content = `const CONFIG = {
  API_BASE_URL: '${API_BASE_URL}',
  INSPECTOR_MODE: ${INSPECTOR_MODE}
};
export default CONFIG;
`;

const outputPath = path.join(__dirname, '../src/config.js');
fs.writeFileSync(outputPath, content);

console.log('✅ config.js generated successfully:');
console.log(`   API_BASE_URL: ${API_BASE_URL}`);
console.log(`   INSPECTOR_MODE: ${INSPECTOR_MODE}`);
