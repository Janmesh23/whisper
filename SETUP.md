# Whisper: Junior Developer Setup Guide

Welcome to the **Whisper** project! We're excited to have you on board for FOSS Weekend. Setting up a blockchain development environment can be tricky, but this guide will walk you through it step-by-step.

---

## Choose Your Operating System

- **Mac / Linux**: You're ready to go! Follow the instructions below.
- **Windows**: **STOP!** Do not install these tools directly on Windows. You **must** use **WSL (Windows Subsystem for Linux)**. 
  - [Follow this guide to install WSL](https://learn.microsoft.com/en-us/windows/wsl/install) (we recommend the Ubuntu distribution). 
  - Once WSL is installed, open your Ubuntu terminal and continue with this guide.

---

## Step 1: Install Rust
Rust is the language used to write Solana programs. It's fast, safe, and powerful.

1. Run the following command:
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```
2. When prompted, press `1` and `Enter` for the default installation.
3. Restart your terminal or run: `source $HOME/.cargo/env`
4. **Verify**: `rustc --version` (You should see something like `rustc 1.xx.x`)

---

## Step 2: Install Solana CLI
The Solana Command Line Interface (CLI) allows you to interact with the blockchain, deploy programs, and manage wallets.

1. Run the installer:
   ```bash
   sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
   ```
2. Restart your terminal.
3. **Verify**: `solana --version`
4. **Config**: Set your CLI to use the "Devnet" (Solana's test playground):
   ```bash
   solana config set --url devnet
   ```

---

## Step 3: Install Anchor (AVM)
Anchor is a framework that makes writing Solana programs much easier. We use **AVM (Anchor Version Manager)** to manage different versions of Anchor.

1. Install AVM:
   ```bash
   cargo install --git https://github.com/coral-xyz/anchor avm --force
   ```
2. Install the latest Anchor version:
   ```bash
   avm install latest
   avm use latest
   ```
3. **Verify**: `anchor --version`

---

## Step 4: Install Node.js & Yarn
We use Node.js to run the frontend and write tests for our smart contract.

1. We recommend using **nvm** (Node Version Manager):
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   ```
2. Restart your terminal and install Node 20:
   ```bash
   nvm install 20
   nvm use 20
   ```
3. Install Yarn (common for Solana projects):
   ```bash
   npm install --global yarn
   ```

---

## Step 5: Setup the Project

1. **Clone the Repo**:
   ```bash
   git clone https://github.com/janmesh23/whisper.git
   cd whisper
   ```
2. **Setup the Program**:
   ```bash
   cd whisper
   npm install
   anchor build
   ```
3. **Setup the Frontend**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

---

## Where to Learn & Get Help

If you get stuck (which is totally normal!), check out these resources:

### Learning Material
- **[The Anchor Book](https://www.anchor-lang.com/book)**: The "Bible" of Anchor development.
- **[Solana Cookbook](https://solanacookbook.com/)**: Great "recipes" for common tasks.
- **[Solana Developers YouTube](https://www.youtube.com/@SolanaDevelopers)**: Excellent video tutorials.

### Troubleshooting
- **[Solana StackExchange](https://solana.stackexchange.com/)**: Like StackOverflow, but specifically for Solana.
- **[Anchor Discord](https://discord.gg/anchor-lang)**: The best place to ask quick questions to experts.
- **Ask your Mentors**: We are here to help! Don't spend more than 15 minutes stuck on an error without asking someone.

---
*Good luck, and Happy Coding! Whisper your secrets to the blockchain.*
