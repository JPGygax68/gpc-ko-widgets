@echo off

git add * --all
git commit -m "Automatic commit (programmer forgot)"
git pull origin
git push origin --all

:end