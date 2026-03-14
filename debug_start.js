const { exec } = require('child_process');
const fs = require('fs');

function run(name, cmd, cwd) {
  const p = exec(cmd, { cwd });
  p.stdout.on('data', data => fs.appendFileSync(cwd + '/' + name + '.stdout.log', data));
  p.stderr.on('data', data => fs.appendFileSync(cwd + '/' + name + '.stderr.log', data));
  p.on('close', code => fs.appendFileSync(cwd + '/' + name + '.stderr.log', '\\nExited with code ' + code));
}

run('backend', 'npm run dev', './backend');
run('frontend', 'npm run dev', './frontend');
console.log('Started debug processes');
