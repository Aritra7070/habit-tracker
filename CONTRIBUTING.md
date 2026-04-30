## Contributing to Habit-Tracker

Thank you for considering contributing to this project!

We welcome contributions from everyone, especially first-time contributors.

## How Can I Contribute?

### 1. Find existing `feature` Issues 
- Check existing issues in the [Issues](https://github.com/quantum2code/habit-tracker/issues) section with `feature` tag.
- Implement within the contrainsts of the Tech stack mentioned in README.md

### 2. Reporting Bugs

- Check if the bug is already reported in the [Issues](https://github.com/quantum2code/habit-tracker/issues) section.
- If not, create a new issue with:
  - Clear title
  - Detailed description
  - Steps to reproduce the bug
  - Expected vs actual behavior
  - Screenshots (if applicable)

### 3. Suggesting New Features

- Open an issue with the label `enhancement`
- Clearly describe the feature and why it would be useful

### 3. Making Changes (Code Contributions)

1. **Fork** the repository
2. Create a new branch for your feature:
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. Make your changes
Commit your changes with clear messages
    ```bash
    git commit -m "feat: add amazing feature"
    ```
4. Push to your branch
    ```bash
    git push origin feature/amazing-feature
    ```
5. Open a Pull Request to the main branch

## Pull Request Guidelines

- PR title should be clear and descriptive
- Describe what changes you made and why
- Link the related issue (if any) using [Fixes #123]()
- Ensure the project still works after your changes
- Add screenshots/GIFs for UI changes
- Update the README if needed

Development Setup
```bash
# Clone the repo
git clone https://github.com/quantum2code/habit-tracker

# Go into the project
cd habit-tracker

# Install dependencies for both backend and frontend
npm install
cd web && npm install && cd ..
cd server && npm install && cd ..
```

### Setting Up Google OAuth for Development

1. Create OAuth 2.0 credentials in [Google Cloud Console](https://console.cloud.google.com/)
2. Set authorized origins to `http://localhost:5173` and `http://localhost:3000`
3. Create `.env` files:

**server/.env:**
```env
GOOGLE_CLIENT_ID=your_client_id_here
# ... other variables
```

**web/.env:**
```env
VITE_GOOGLE_CLIENT_ID=your_client_id_here
VITE_API_URL=http://localhost:3000
```

- Then follow the instructions in README.md to run the project.