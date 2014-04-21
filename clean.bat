@echo off

DEL /F /Q /S dist\*
for /D %%i in ("dist\*") do RD /S /Q "%%i"

DEL /F /Q /S testbed\*
for /D %%i in ("testbed\*") do RD /S /Q "%%i"