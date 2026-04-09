# Contributing to Whisper

Welcome to Whisper! We're excited to have you contribute to this decentralized confession platform. This project is part of the **FOSS Weekend**, designed for junior developers to learn Solana, Anchor, and Next.js development.

## Getting Started

1. **Fork the Repository**: Click the 'Fork' button at the top right of this page.
2. **Clone your Fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/whisper.git
   cd whisper
   ```
3. **Set Up the Environment**:
   - Follow the installation guide in the [README.md](./README.md) for Rust, Solana, and Anchor.

## Contribution Workflow

### 1. Choose an Issue
Check the **Roadmap** in the [README.md](./README.md) or the GitHub Issues tab. Issues are labeled by difficulty:
- Beginner: Ideal for first-time contributors. Focuses on basic Anchor instructions and documentation.
- Medium: Requires deeper understanding of PDAs, CPIs, or Next.js integration.

### 2. Create a Branch
Create a branch for your work using a descriptive name:
```bash
git checkout -b feat/your-feature-name
# OR
git checkout -b fix/your-fix-name
```

### 3. Implement Changes
- Write your code.
- If you're working on the **Solana Program**, the skeleton logic is already in `whisper/programs/whisper/src/lib.rs` with `TODO` comments.
- If you're working on the **Frontend**, the project is located in the `/frontend` directory.

### 4. Test your Changes
**Solana Program**:
```bash
cd whisper
anchor build
anchor test
```
**Frontend**:
```bash
cd frontend
npm run dev
```

### 5. Submit a Pull Request
- Push your branch to your fork.
- Open a Pull Request (PR) against the `main` branch of the original repository.
- Describe your changes clearly in the PR description.

## Coding Standards

- **Rust**: Run `cargo fmt` before committing.
- **JavaScript/TypeScript**: Run `npm run lint` if available.
- **Comments**: Keep your code well-commented, especially if you're implementing complex PDA logic.

## Diversity and Inclusion
We follow a Code of Conduct that ensures a welcoming environment for everyone. Please be respectful and helpful to your fellow contributors!

---
*Happy coding! Whisper your secrets to the blockchain.*
