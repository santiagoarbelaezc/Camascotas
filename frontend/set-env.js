const fs = require('fs');
const path = require('path');
require('dotenv').config();

const envFile = `export const environment = {
  production: ${process.env.NODE_ENV === 'production' ? 'true' : 'false'},
  apiUrl: '${process.env.API_URL || 'http://localhost:8000'}'
};
`;

const dir = path.join(__dirname, 'src/environments');

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Generamos para ambos archivos
const targetPaths = [
  path.join(dir, 'environment.ts'),
  path.join(dir, 'environment.development.ts')
];

targetPaths.forEach(targetPath => {
  fs.writeFile(targetPath, envFile, (err) => {
    if (err) {
      console.error(`Error escribiendo en ${targetPath}:`, err);
    } else {
      console.log(`✅ Archivo generado satisfactoriamente: ${targetPath}`);
    }
  });
});
