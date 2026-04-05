const { execSync } = require('child_process');
try {
  console.log(execSync('git checkout homepage', { encoding: 'utf-8' }));
} catch (e) {
  console.log(e.stdout);
  console.log(e.stderr);
}
