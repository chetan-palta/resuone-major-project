const { spawn } = require('child_process');
const fs = require('fs');

async function check(name, cmd, args, cwd) {
    console.log(`Checking ${name}...`);
    const logFile = `${name}_debug.log`;
    const out = fs.openSync(logFile, 'w');
    const p = spawn(cmd, args, { cwd, shell: true, stdio: ['ignore', out, out] });
    
    return new Promise((resolve) => {
        setTimeout(() => {
            p.kill();
            resolve();
        }, 10000);
    });
}

async function main() {
    await check('backend', 'npm', ['run', 'dev'], './backend');
    await check('frontend', 'npm', ['run', 'dev'], './frontend');
    console.log('Checks complete. Read backend_debug.log and frontend_debug.log');
}

main();
