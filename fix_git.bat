@echo off
cd d:\march-major
git checkout homepage
git rm -r --cached backend/node_modules
git commit -m "Remove tracked node_modules"
git checkout main
git merge homepage
git status
