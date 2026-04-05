const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'frontend', 'src');

function walk(dir) {
    fs.readdir(dir, (err, list) => {
        if (err) return console.error(err);
        list.forEach(file => {
            file = path.join(dir, file);
            fs.stat(file, (err, stat) => {
                if (stat && stat.isDirectory()) {
                    walk(file);
                } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                    fs.readFile(file, 'utf8', (err, data) => {
                        if (err) return console.error(err);
                        
                        let modified = data;
                        
                        // Replace exact match: 'http://localhost:5000
                        modified = modified.replace(/'http:\/\/localhost:5000([^']*)'/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}$1`");
                        // Replace template literal match: `http://localhost:5000
                        modified = modified.replace(/`http:\/\/localhost:5000([^`]*)`/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}$1`");
                        // Replace double quote match: "http://localhost:5000
                        modified = modified.replace(/"http:\/\/localhost:5000([^"]*)"/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}$1`");

                        if (data !== modified) {
                            fs.writeFile(file, modified, 'utf8', err => {
                                if (err) console.error(err);
                                else console.log('Updated ' + file);
                            });
                        }
                    });
                }
            });
        });
    });
}

walk(directory);
