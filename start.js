const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Clean up old logs
if (fs.existsSync('backend.log')) fs.unlinkSync('backend.log');
if (fs.existsSync('frontend.log')) fs.unlinkSync('frontend.log');

const backendLog = fs.createWriteStream(path.join(__dirname, 'backend.log'), { flags: 'a' });
const frontendLog = fs.createWriteStream(path.join(__dirname, 'frontend.log'), { flags: 'a' });

console.log('🚀 Starting ResuOne Development Environment...');

function startProcess(name, command, args, cwd, logStream) {
  const proc = spawn(command, args, { cwd, shell: true });

  proc.stdout.on('data', (data) => {
    logStream.write(data);
    const line = data.toString().trim();
    if (line) console.log(`[\x1b[36m${name}\x1b[0m] ${line}`);
  });

  proc.stderr.on('data', (data) => {
    logStream.write(data);
    const line = data.toString().trim();
    if (line) console.error(`[\x1b[31m${name} ERROR\x1b[0m] ${line}`);
  });

  proc.on('error', (err) => {
    console.error(`[\x1b[31m${name} SPAWN ERROR\x1b[0m] ${err.message}`);
    logStream.write(`\nSpawn error: ${err.message}\n`);
  });

  proc.on('close', (code) => {
    console.log(`[\x1b[33m${name}\x1b[0m] Process exited with code ${code}`);
  });

  return proc;
}

const backend = startProcess('Backend', 'npm.cmd', ['run', 'dev'], './backend', backendLog);
const frontend = startProcess('Frontend', 'npm.cmd', ['run', 'dev'], './frontend', frontendLog);

console.log(`✅ Both servers are initializing (PIDs: ${backend.pid}, ${frontend.pid})`);
console.log('💡 Press Ctrl+C to stop both servers.');

// Handle gracefull shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...');
  backend.kill('SIGINT');
  frontend.kill('SIGINT');
  
  // Give them a second to clean up
  setTimeout(() => {
    console.log('👋 Goodbye!');
    process.exit();
  }, 1000);
});
