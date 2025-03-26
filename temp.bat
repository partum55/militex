@echo off
setlocal

:: Define the target directory
set "TARGET=frontend\src\components"

:: Create the target directory if it doesn't exist
if not exist "%TARGET%" (
    mkdir "%TARGET%"
)

:: Change to the target directory
pushd "%TARGET%"

:: Create empty files
type nul > CarCard.jsx
type nul > CarCard.css
type nul > FilterSidebar.jsx
type nul > FilterSidebar.css

popd

echo Files created successfully!
pause
