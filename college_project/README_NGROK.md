# Ngrok tunnel and local server

Quick instructions to expose your local Django dev server with ngrok.

Prerequisites:
- Python virtualenv (project has `.venv` and `pyngrok` installed)
- ngrok account and `authtoken` (free tier) — required by modern ngrok

Steps:

1) Set your authtoken in environment (PowerShell):

```powershell
$env:NGROK_AUTHTOKEN = "<YOUR_AUTHTOKEN>"
```

2) Start the Django dev server (recommended from project root):

```powershell
C:/hackathon-template/college_project/.venv/Scripts/python.exe manage.py runserver 127.0.0.1:8000
```

3) Start tunnel (option A — Python helper):

```powershell
C:/hackathon-template/college_project/.venv/Scripts/python.exe scripts/start_tunnel.py
```

Or (option B — PowerShell helper, prints public url):

```powershell
.\scripts\start_with_tunnel.ps1 -authtoken $env:NGROK_AUTHTOKEN
```

Notes:
- The ngrok authtoken is required; follow https://dashboard.ngrok.com/get-started/your-authtoken
- Keep ngrok process running while you need the public URL.
