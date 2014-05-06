@echo off

:: Any of these commands may fail
:: "push" will fail if someone else has pushed commits
:: TODO: is there a way to make sure the user will see the problem ?

git add * --all
git commit -m "Automatic commit (programmer forgot)"
git push origin --all

:end