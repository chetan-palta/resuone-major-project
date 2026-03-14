mkdir backend
cd backend
call npm init -y
call npm i express cors dotenv mysql2 compromise puppeteer
call npm i -D typescript @types/node @types/express @types/cors ts-node nodemon
cd ..
call npx -y create-vite@latest frontend --template react-ts
