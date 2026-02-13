@echo off
echo ====================================
echo CCLDI Manager - GitHub Push Script
echo ====================================
echo.

set /p username="Enter your GitHub username: "

echo.
echo Setting up remote repository...
git remote add origin https://github.com/%username%/CCLDI-Manager.git

echo.
echo Renaming branch to main...
git branch -M main

echo.
echo Pushing to GitHub...
git push -u origin main

echo.
echo ====================================
echo Done! Your repository is now on GitHub
echo Visit: https://github.com/%username%/CCLDI-Manager
echo ====================================
pause
