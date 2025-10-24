# Contributing to MCQ Competition Portal

Thank you for your interest in contributing to the MCQ Competition Portal! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Examples of unacceptable behavior include:

- The use of sexualized language or imagery
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate in a professional setting

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Firebase CLI
- Docker (optional, for containerized development)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/mcq-competition-portal.git
   cd mcq-competition-portal
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/original-owner/mcq-competition-portal.git
   ```

## Development Setup

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install

# Install test dependencies
cd ../tests && npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp env.example .env

# Edit with your Firebase project details
nano .env
```

### 3. Firebase Setup

```bash
# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init

# Start Firebase emulators
firebase emulators:start
```

### 4. Start Development Servers

```bash
# Start all services
npm run dev

# Or start individually
npm run dev:frontend  # Frontend on http://localhost:5173
npm run dev:backend   # Backend on http://localhost:5001
```

## Contributing Guidelines

### Types of Contributions

We welcome several types of contributions:

- **Bug Reports**: Report bugs and issues
- **Feature Requests**: Suggest new features or improvements
- **Code Contributions**: Submit bug fixes or new features
- **Documentation**: Improve or add documentation
- **Testing**: Add or improve tests
- **Security**: Report security vulnerabilities

### Before You Start

1. **Check existing issues**: Look for existing issues or discussions
2. **Create an issue**: For significant changes, create an issue first
3. **Discuss**: Engage in discussion before starting work
4. **Fork**: Fork the repository and create a feature branch

### Branch Naming

Use descriptive branch names:

- `feature/add-new-question-type`
- `bugfix/fix-timer-issue`
- `docs/update-api-documentation`
- `refactor/improve-security-measures`

## Pull Request Process

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Write clean, readable code
- Follow the coding standards
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Check code quality
npm run lint
npm run type-check
```

### 4. Commit Your Changes

Use conventional commit messages:

```bash
git add .
git commit -m "feat: add new question type support"
git commit -m "fix: resolve timer synchronization issue"
git commit -m "docs: update API documentation"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub with:

- Clear title and description
- Reference related issues
- Screenshots for UI changes
- Test results

### 6. Review Process

- Maintainers will review your PR
- Address feedback and make requested changes
- Ensure all checks pass
- Wait for approval before merging

## Issue Reporting

### Bug Reports

When reporting bugs, include:

1. **Clear title**: Brief description of the issue
2. **Environment**: OS, browser, Node.js version
3. **Steps to reproduce**: Detailed steps
4. **Expected behavior**: What should happen
5. **Actual behavior**: What actually happens
6. **Screenshots**: If applicable
7. **Logs**: Error messages or console output

### Feature Requests

For feature requests, include:

1. **Clear title**: Brief description of the feature
2. **Use case**: Why is this feature needed?
3. **Proposed solution**: How should it work?
4. **Alternatives**: Other solutions considered
5. **Additional context**: Any other relevant information

## Coding Standards

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Prefer const over let, avoid var

```typescript
/**
 * Creates a new contest with the specified parameters
 * @param contestData - The contest configuration
 * @returns Promise resolving to the created contest ID
 */
async function createContest(contestData: CreateContestRequest): Promise<string> {
  // Implementation
}
```

### React Components

- Use functional components with hooks
- Use TypeScript interfaces for props
- Follow component naming conventions
- Keep components focused and reusable

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size: 'sm' | 'md' | 'lg';
  onClick: () => void;
  children: React.ReactNode;
}

export function Button({ variant, size, onClick, children }: ButtonProps) {
  // Implementation
}
```

### CSS/Styling

- Use Tailwind CSS classes
- Follow mobile-first approach
- Use semantic class names
- Avoid inline styles

### File Organization

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── services/           # API and external services
├── store/              # State management
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── test/               # Test files
```

## Testing

### Test Requirements

- All new features must have tests
- Maintain or improve test coverage
- Write meaningful test descriptions
- Use proper test data and mocks

### Test Types

1. **Unit Tests**: Test individual functions and components
2. **Integration Tests**: Test component interactions
3. **E2E Tests**: Test complete user workflows

### Writing Tests

```typescript
describe('ContestService', () => {
  it('should create contest with valid data', async () => {
    const contestData = {
      title: 'Test Quiz',
      duration: 3600,
      questions: []
    };

    const result = await contestService.createContest(contestData);
    
    expect(result.success).toBe(true);
    expect(result.data?.contestId).toBeDefined();
  });
});
```

## Documentation

### Code Documentation

- Add JSDoc comments for functions and classes
- Document complex algorithms and business logic
- Keep README files updated
- Update API documentation for changes

### User Documentation

- Update user guides for new features
- Add screenshots for UI changes
- Keep deployment instructions current
- Document configuration options

## Security

### Security Guidelines

- Never commit secrets or API keys
- Use environment variables for configuration
- Validate all user inputs
- Follow security best practices
- Report security vulnerabilities privately

### Reporting Security Issues

For security vulnerabilities:

1. **DO NOT** create public issues
2. Email security concerns to: security@example.com
3. Include detailed information about the vulnerability
4. Allow time for response before public disclosure

## Performance

### Performance Guidelines

- Optimize for performance from the start
- Use lazy loading where appropriate
- Minimize bundle size
- Optimize database queries
- Monitor performance metrics

## Accessibility

### Accessibility Guidelines

- Follow WCAG 2.1 AA standards
- Use semantic HTML elements
- Provide alternative text for images
- Ensure keyboard navigation works
- Test with screen readers

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version bumped
- [ ] Security review completed
- [ ] Performance tested

## Getting Help

### Resources

- **Documentation**: Check the `/docs` folder
- **Issues**: Search existing issues
- **Discussions**: Use GitHub Discussions
- **Community**: Join our community channels

### Contact

- **Maintainers**: @maintainer1, @maintainer2
- **Email**: maintainers@example.com
- **Discord**: [Join our Discord server](https://discord.gg/example)

## Recognition

Contributors will be recognized in:

- CONTRIBUTORS.md file
- Release notes
- Project documentation
- Community acknowledgments

Thank you for contributing to the MCQ Competition Portal! 🎉
