
import subprocess
import os
import time

repo_path = r"c:\Users\Francisco\Desktop\Órdenes de servicio para taller mecánico"
os.chdir(repo_path)

def run_git(args):
    print(f"Running: git {' '.join(args)}")
    result = subprocess.run(["git"] + args, capture_output=True, text=True)
    print(f"STDOUT: {result.stdout}")
    print(f"STDERR: {result.stderr}")
    return result

# Remove lock if exists (retrying)
lock_file = os.path.join(repo_path, ".git", "index.lock")
for i in range(10):
    if os.path.exists(lock_file):
        try:
            os.remove(lock_file)
            print("Lock removed.")
            break
        except Exception as e:
            print(f"Wait {i}... {e}")
            time.sleep(1)
    else:
        print("No lock.")
        break

run_git(["config", "user.email", "francisco@example.com"])
run_git(["config", "user.name", "Francisco R. Diaz"])
run_git(["add", "."])
run_git(["commit", "-m", "initial commit"])
run_git(["branch", "-M", "master"])
run_git(["remote", "add", "origin", "https://github.com/francisco-inger/taller-mecanico.git"])
# Pushing might hang if no auth, so we skip it here and will ask user to do it or try one last time
print("Ready to push.")
