@echo off
start /B "" node "%~dp0skills\feishu-evolver-wrapper\lifecycle.js" --loop > nul 2>&1
