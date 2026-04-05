const { execSync } = require('child_process');
console.log(execSync('npm install tailwindcss postcss autoprefixer --legacy-peer-deps', { encoding: 'utf8' }));
