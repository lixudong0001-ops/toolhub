@echo off
chcp 65001 >nul
cd /d "%~dp0.."
echo ToolHub 自动发现与更新（插件 + 网站）
python scripts/auto_update.py --mode full %*
pause
