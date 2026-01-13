# Contributing to Parallax Intelligence Platform

Thank you for your interest in contributing to Parallax Intelligence Platform! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

This project adheres to the Contributor Covenant Code of Conduct. By participating, you are expected to uphold this code. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Rust** (latest stable)
- **Git**

### Setting Up Your Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork locally**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Parallax-OSINT-Platform.git
   cd Parallax-OSINT-Platform
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/discover-Austin/Parallax-OSINT-Platform.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   cd src-tauri
   cargo build
   cd ..
   ```

5. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

6. **Run the development server**:
   ```bash
   npm run tauri:dev
   ```

## Development Workflow

### Branching Strategy

We use a feature branch workflow:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates
- `refactor/*` - Code refactoring
- `test/*` - Test improvements

### Creating a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### Keeping Your Branch Updated

```bash
git fetch upstream
git rebase upstream/main
```

## Coding Standards

### TypeScript/JavaScript

- **Style Guide**: Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- **Formatting**: Use Prettier (configured in `.prettierrc`)
- **Linting**: Use ESLint (configured in `eslint.config.js`)
- **Type Safety**: Always use TypeScript with strict mode enabled

#### Best Practices

```typescript
// Good: Explicit types and clear naming
interface UserData {
  id: string;
  name: string;
  email: string;
}

const fetchUserData = async (userId: string): Promise<UserData> => {
  // Implementation
};

// Bad: Implicit types and unclear naming
const getData = async (id: any) => {
  // Implementation
};
```

### Rust

- **Style Guide**: Follow the [Rust Style Guide](https://doc.rust-lang.org/1.0.0/style/)
- **Formatting**: Use `rustfmt`
- **Linting**: Use `clippy`

#### Best Practices

```rust
// Good: Idiomatic Rust with proper error handling
pub fn process_data(input: &str) -> Result<String, Error> {
    let parsed = input.parse()?;
    Ok(format!("Processed: {}", parsed))
}

// Bad: Unwrapping and poor error handling
pub fn process_data(input: &str) -> String {
    let parsed = input.parse().unwrap();
    format!("Processed: {}", parsed)
}
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use TypeScript interfaces for props
- Implement proper error boundaries
- Follow the single responsibility principle

#### Component Structure

```typescript
import { useState, useEffect } from 'react';

interface ComponentProps {
  title: string;
  onAction: () => void;
}

export default function Component({ title, onAction }: ComponentProps) {
  const [state, setState] = useState<string>('');

  useEffect(() => {
    // Effect logic
  }, []);

  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no functional changes)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### Examples

```bash
# Feature
git commit -m "feat(voice): add Web Speech API integration"

# Bug fix
git commit -m "fix(terminal): resolve command execution timeout"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Breaking change
git commit -m "feat(api)!: change license validation endpoint

BREAKING CHANGE: License API now requires v2 authentication"
```

## Pull Request Process

### Before Submitting

1. **Update your branch**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests**:
   ```bash
   npm test
   npm run lint
   npm run type-check
   ```

3. **Build the project**:
   ```bash
   npm run build
   npm run tauri:build
   ```

### Creating a Pull Request

1. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a Pull Request** on GitHub with:
   - Clear title following commit conventions
   - Detailed description of changes
   - Screenshots/videos for UI changes
   - Reference to related issues
   - Checklist completion

3. **Fill out the PR template** completely

### PR Review Process

- At least one maintainer approval required
- All CI checks must pass
- Code coverage must not decrease
- Address all review comments
- Keep PR scope focused and small

### After Approval

- Squash commits if requested
- Maintainer will merge your PR
- Delete your feature branch after merge

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- VoiceCommands.test.tsx
```

### Writing Tests

- Write tests for all new features
- Maintain at least 80% code coverage
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

#### Example Test

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import VoiceCommands from './VoiceCommands';

describe('VoiceCommands', () => {
  it('should start listening when microphone button is clicked', () => {
    // Arrange
    const mockStart = vi.fn();

    // Act
    render(<VoiceCommands />);
    const micButton = screen.getByRole('button', { name: /start/i });
    fireEvent.click(micButton);

    // Assert
    expect(mockStart).toHaveBeenCalled();
  });
});
```

## Documentation

### Code Documentation

- Use JSDoc comments for functions and classes
- Document complex algorithms and business logic
- Keep comments up to date with code changes

```typescript
/**
 * Processes voice command and executes corresponding action
 * @param text - The transcribed voice command text
 * @returns void
 */
const processCommand = (text: string): void => {
  // Implementation
};
```

### README Updates

- Update README.md for significant changes
- Add new features to the features list
- Update installation steps if needed

### API Documentation

- Document all public APIs
- Include request/response examples
- Document error codes and handling

## Security

### Reporting Security Issues

DO NOT open public issues for security vulnerabilities. Instead:

1. Email security@parallax.app
2. Include detailed description
3. Provide steps to reproduce
4. Allow time for patch before disclosure

### Security Best Practices

- Never commit secrets or API keys
- Use environment variables for sensitive data
- Validate all user input
- Sanitize data before display
- Follow OWASP security guidelines

## Performance

### Guidelines

- Optimize for user experience
- Profile before optimizing
- Use lazy loading where appropriate
- Minimize bundle size
- Cache expensive operations

### Tools

```bash
# Analyze bundle size
npm run build -- --analyze

# Check performance
npm run lighthouse
```

## Accessibility

- Follow WCAG 2.1 AA standards
- Test with screen readers
- Ensure keyboard navigation
- Use semantic HTML
- Provide alt text for images

## Community

### Getting Help

- GitHub Discussions for questions
- GitHub Issues for bugs
- Discord community for real-time help
- Stack Overflow with `parallax-osint` tag

### Communication Channels

- **GitHub**: Primary development communication
- **Discord**: Real-time community chat
- **Twitter**: Updates and announcements
- **Blog**: Technical articles and tutorials

## Recognition

Contributors will be recognized in:

- CONTRIBUTORS.md file
- Release notes
- Project website
- Annual contributor spotlight

## License

By contributing to Parallax Intelligence Platform, you agree that your contributions will be licensed under the project's license as specified in the repository.

## Questions?

If you have questions about contributing, please:

1. Check existing documentation
2. Search closed issues
3. Ask in GitHub Discussions
4. Reach out on Discord

Thank you for contributing to Parallax Intelligence Platform!
