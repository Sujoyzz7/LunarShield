#!/usr/bin/env python3
import subprocess
import sys
import time

def run_command(name, cmd):
    print(f"\n--- Running: {name} ({' '.join(cmd)}) ---")
    start = time.time()
    res = subprocess.run(cmd)
    duration = time.time() - start
    if res.returncode == 0:
        print(f"✅ {name} passed in {duration:.2f}s")
        return True
    else:
        print(f"❌ {name} failed with code {res.returncode} in {duration:.2f}s")
        return False

def main():
    print("=== Quality Checks & Test Runner Tool ===")
    steps = [
        ("Linting", ["pnpm", "lint"]),
        ("Typechecking", ["pnpm", "typecheck"]),
        ("Unit Tests", ["pnpm", "test:unit"]),
        ("Build", ["pnpm", "build"]),
        ("E2E Tests", ["pnpm", "test:e2e"])
    ]

    all_passed = True
    for name, cmd in steps:
        passed = run_command(name, cmd)
        if not passed:
            all_passed = False
            print(f"\nPipeline stopped due to failure in {name}.")
            break

    if all_passed:
        print("\n🎉 All quality checks passed successfully!")
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()
