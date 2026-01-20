# SUBTREE:ATLIBX

# Getting Started

## Setup
1. go to the root directory of your project
   ```bash
   cd /path/to/your/project
   ```
2. add remote (once)
   ```bash
   git remote add atlibx https://github.com/altaprimadev/atlibx.git
   ```
3. fetch (once)
   ```bash
   git fetch atlibx
   ```
4. subtree add (once)
   ```bash
   git subtree add --prefix=src/atlibx atlibx main --squash
   ```

## Sync
1. subtree pull
   ```bash
   git fetch atlibx && git subtree pull --prefix=src/atlibx atlibx main --squash
   ```
