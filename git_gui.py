"""Tiny Git helper GUI with pull/push buttons."""
from pathlib import Path
import subprocess
import sys
import tkinter as tk
from tkinter import messagebox

# Resolve repo root whether running from source or frozen exe.
if getattr(sys, "frozen", False):
    REPO_DIR = Path(sys.executable).resolve().parent.parent
else:
    REPO_DIR = Path(__file__).resolve().parent


def run_git(command: list[str], action: str) -> None:
    """Run a git command in the repo and show the result."""
    result = subprocess.run(
        ["git", *command],
        cwd=REPO_DIR,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    if result.returncode == 0:
        messagebox.showinfo(f"{action} succeeded", result.stdout or "Done.")
    else:
        output = result.stderr or result.stdout or "No output."
        messagebox.showerror(f"{action} failed", output)


def main() -> None:
    root = tk.Tk()
    root.title("Tradecore Git Helper")
    root.geometry("260x180")
    root.resizable(False, False)

    title = tk.Label(root, text="Quick Git Actions", font=("Segoe UI", 12, "bold"))
    title.pack(pady=(12, 6))

    btn_pull = tk.Button(
        root,
        text="Pull",
        width=10,
        command=lambda: run_git(["pull"], "Pull"),
    )
    btn_pull.pack(pady=(4, 2))
    lbl_pull = tk.Label(root, text="Fetch and merge from origin/main.", font=("Segoe UI", 9))
    lbl_pull.pack()

    btn_push = tk.Button(
        root,
        text="Push",
        width=10,
        command=lambda: run_git(["push"], "Push"),
    )
    btn_push.pack(pady=(12, 2))
    lbl_push = tk.Label(root, text="Send local commits to origin/main.", font=("Segoe UI", 9))
    lbl_push.pack()

    root.mainloop()


if __name__ == "__main__":
    main()
