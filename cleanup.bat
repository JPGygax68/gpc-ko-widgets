@echo off

git add *
if %errorlevel% equ 0 git commit -m "Automatic commit (programmer forgot)"
if %errorlevel% equ 0 git pull origin --all
if %errorlevel% equ 0 git push origin --all

:end