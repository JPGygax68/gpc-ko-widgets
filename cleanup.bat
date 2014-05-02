@echo off

git add * --all
if %errorlevel% equ 0 git commit -m "Automatic commit (programmer forgot)"
if %errorlevel% equ 0 git remote update
if %errorlevel% equ 0 git pull origin
if %errorlevel% equ 0 git push origin --all

:end