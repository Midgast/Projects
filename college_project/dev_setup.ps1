<#
Simple development setup for Windows PowerShell.
Usage: Right-click -> Run with PowerShell, or in terminal:
  .\dev_setup.ps1
#>

Write-Host "== AL TAMIMI College: Dev setup script =="

if (-Not (Test-Path -Path .venv)) {
    Write-Host "Creating virtual environment .venv..."
    python -m venv .venv
} else {
    Write-Host "Virtual environment .venv already exists."
}

Write-Host "Activating .venv..."
& .\.venv\Scripts\Activate.ps1

Write-Host "Upgrading pip and installing requirements..."
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

Write-Host "Making migrations and applying them..."
python manage.py makemigrations
python manage.py migrate

# Create superuser if env vars set
if ($env:DJANGO_SUPERUSER_USERNAME -and $env:DJANGO_SUPERUSER_EMAIL -and $env:DJANGO_SUPERUSER_PASSWORD) {
    Write-Host "Creating superuser from environment variables..."
    $user = $env:DJANGO_SUPERUSER_USERNAME
    $email = $env:DJANGO_SUPERUSER_EMAIL
    $pass = $env:DJANGO_SUPERUSER_PASSWORD
    $py = @"
import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'college_config.settings')
django.setup()
from apps.accounts.models import CustomUser
u = r'{0}'
e = r'{1}'
p = r'{2}'
if not CustomUser.objects.filter(username=u).exists():
    CustomUser.objects.create_superuser(u, e, p)
"@ -f $user, $email, $pass

    $tmp = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), ([System.Guid]::NewGuid().ToString() + '.py'))
    Set-Content -Path $tmp -Value $py -Encoding UTF8
    try {
        python $tmp
    } finally {
        Remove-Item $tmp -ErrorAction SilentlyContinue
    }
} else {
    Write-Host "DJANGO_SUPERUSER_USERNAME/EMAIL/PASSWORD not set — skip auto-creation."
}

Write-Host "Dev setup finished. To run the server: .\run_dev.ps1"
