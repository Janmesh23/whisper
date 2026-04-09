# Whisper: Decentralized Confessions

Whisper is a decentralized confession platform built on **Solana** and **Arweave (Irys)**. Users can post secrets, secrets, and confessions anonymously to the blockchain, like other confessions, and engage in a truly censorship-resistant social feed.

This project is the official repository for the **FOSS Weekend** contributor event!

![architecture](image.png)

## High-Level Architecture

- **Blockchain Layer**: Solana (Anchor Framework) stores confession metadata and reaction counts.
- **Storage Layer**: Arweave (via Irys) stores the actual confession content (text/images).
- **Frontend**: Next.js with `@solana/wallet-adapter` and `@irys/web-upload` for direct browser-to-AR uploads.

---

## 1. Prerequisites (Setup your Environment)

Before you can contribute, you need to set up your Solana development environment. Follow these steps carefully:

### A. Install Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
rustc --version
```

### B. Install Solana CLI
```bash
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
# Verify after restarting terminal:
solana --version
```

### C. Install Anchor CLI (Version Manager)
```bash
cargo install --git https://github.com/coral-xyz/anchor avm --force
avm install latest
avm use latest
anchor --version
```

### D. Node.js & Dependencies
Ensure you have Node.js (v18+) installed. We recommend using `nvm`.

---

## 2. Local Development Setup

1. **Clone the Repo**:
   ```bash
   git clone https://github.com/YOUR_FORK/whisper.git
   cd whisper
   ```

2. **Build the Solana Program**:
   ```bash
   cd whisper
   anchor build
   ```

3. **Run Tests**:
   ```bash
   anchor test
   ```

4. **Launch Frontend**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

---

## 3. FOSS Weekend Roadmap (Issues to Solve)

We've prepared several issues for you to tackle! Look for `TODO` comments in `whisper/programs/whisper/src/lib.rs` for program tasks.

### Beginner (Good First Issues)
1. **`delete_confession`**: Implement the instruction to close an account and reclaim rent.
2. **`dislike_confession`**: Add logic to decrement `like_count`.
3. **URL Validation**: Use `require!` to ensure `content_uri` starts with `https://`.
4. **Global Platform Stats**: Initialize a `GlobalState` PDA to track total confessions site-wide.
5. **Categorization**: Add a `tag` field (e.g., "Love", "Regret") to the confession account.
6. **Error Testing**: Expand the test suite to cover all `WhisperError` cases.

### Medium (The Challenge)
7. **Multi-Confession Support**: Fix the PDA seeds using a `UserCounter` account to allow >1 confession per user.
8. **Time-Limited Edits**: Implement `edit_confession` but only allow it within 10 minutes of posting.
9. **Tipping System**: Add `tip_author` instruction to transfer SOL via CPI.
10. **Reputation (Karma)**: Increment a user's reputation counter when their confessions get liked.
11. **Frontend: Feed Gallery**: Fetch all `ConfessionAccount`s and render them beautifully in Next.js.
12. **Frontend: Wallet Profile**: Design a user dashboard showing their confessions and total reputation.

---

## Contribution Guidelines

Please read our [CONTRIBUTING.md](./CONTRIBUTING.md) before submitting your first Pull Request.

---
*Built with ❤️ for FOSS Weekend.*
