#!/usr/bin/env python3
import json
import subprocess
import sys

def main():
    print("=== Package Inspector Tool ===")
    try:
        with open("package.json", "r") as f:
            pkg = json.load(f)
        deps = pkg.get("dependencies", {})
        dev_deps = pkg.get("devDependencies", {})
        print(f"Direct dependencies: {len(deps)}")
        print(f"Dev dependencies: {len(dev_deps)}")

        print("\nChecking outdated packages...")
        res = subprocess.run(["pnpm", "outdated"], capture_output=True, text=True)
        if res.stdout.strip():
            print(res.stdout)
        else:
            print("No outdated packages found.")
            if res.stderr:
                print("Stderr:", res.stderr)
    except Exception as e:
        print(f"Error inspecting packages: {e}", file=sys.stderr)

if __name__ == "__main__":
    main()
