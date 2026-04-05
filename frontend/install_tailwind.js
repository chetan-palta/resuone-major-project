const { execSync } = require('child_process');
try {
  console.log(execSync('npm install -D tailwindcss postcss autoprefixer', { encoding: 'utf8', stdio: 'inherit' }));
} catch (e) {
  console.error(e);
}
