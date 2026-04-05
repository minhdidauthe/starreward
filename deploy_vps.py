
import paramiko
import sys
import time
import os

# Fix Windows console encoding
os.environ["PYTHONIOENCODING"] = "utf-8"
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

def deploy(host, port, user, key_path, password):
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        print(f"Connecting to {host}:{port} as {user}...")
        try:
            k = paramiko.Ed25519Key.from_private_key_file(key_path)
            ssh.connect(host, port=port, username=user, pkey=k, timeout=10)
            print("Connected using SSH Key.")
        except Exception as e:
            print(f"Key auth failed ({e}), trying password...")
            ssh.connect(host, port=port, username=user, password=password, timeout=10)
            print("Connected using Password.")

        # Commands to run
        commands = [
            "cd /home/pecc1/starreward",
            "git pull origin main",
            "npm install",
            "pm2 restart star-reward"
        ]

        full_command = "export LANG=en_US.UTF-8 && export LC_ALL=en_US.UTF-8 && " + " && ".join(commands)

        print(f"Running deployment...")
        stdin, stdout, stderr = ssh.exec_command(full_command, environment={"LANG": "en_US.UTF-8", "LC_ALL": "en_US.UTF-8"})

        while not stdout.channel.exit_status_ready():
            if stdout.channel.recv_ready():
                data = stdout.channel.recv(4096).decode('utf-8', errors='replace')
                print(data, end='')
            if stderr.channel.recv_ready():
                data = stderr.channel.recv(4096).decode('utf-8', errors='replace')
                print(data, end='')
            time.sleep(0.1)

        print(stdout.read().decode('utf-8', errors='replace'), end='')
        print(stderr.read().decode('utf-8', errors='replace'), end='')

        exit_status = stdout.channel.recv_exit_status()
        if exit_status == 0:
            print("\nDeployment Successful!")
        else:
            print(f"\nDeployment Failed with Exit Code: {exit_status}")

    except Exception as e:
        print(f"ERROR: {e}")
    finally:
        ssh.close()

if __name__ == "__main__":
    VPS_HOST = "118.70.216.1"
    VPS_PORT = 2222
    VPS_USER = "pecc1"
    VPS_KEY = "E:\\Developer\\Projects\\id_ed25519"
    VPS_PASS = "Pecc1$2026"

    deploy(VPS_HOST, VPS_PORT, VPS_USER, VPS_KEY, VPS_PASS)
