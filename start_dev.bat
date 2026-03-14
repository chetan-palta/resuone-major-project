@echo off
cd d:\march-major\backend
start /b cmd /c "npm run dev > d:\march-major\backend.log 2>&1"
cd d:\march-major\frontend
start /b cmd /c "npm run dev > d:\march-major\frontend.log 2>&1"
