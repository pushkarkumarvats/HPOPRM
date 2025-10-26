# Contributing to HPOPRM

Thank you for your interest in contributing to the Oilseed Hedging Platform! This document provides guidelines and instructions for contributing.

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) before contributing.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the behavior
- **Expected vs actual behavior**
- **Screenshots** if applicable
- **Environment details** (OS, Node version, browser, etc.)
- **Error logs** or stack traces

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **List any similar features** in other applications

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Add tests** for any new functionality
4. **Update documentation** as needed
5. **Ensure all tests pass** (`pnpm test`)
6. **Run linting** (`pnpm lint`)
7. **Commit with descriptive messages** following our commit conventions
8. **Push to your fork** and submit a pull request

## Development Setup

### Prerequisites

- Node.js 18+ and pnpm 8+
- Docker and Docker Compose
- PostgreSQL 14+
- Redis 7+
- Git

### Local Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/HPOPRM.git
cd HPOPRM

# Install dependencies
pnpm install

# Copy environment files
cp .env.example .env
# Edit .env with your local configuration

# Start services with Docker
docker-compose up -d

# Run database migrations
cd backend
pnpm prisma migrate dev
pnpm prisma db seed

# Start development servers
cd ..
pnpm dev
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test suites
pnpm test:backend
pnpm test:frontend
pnpm test:contracts

# Run with coverage
pnpm test:coverage

# Run e2e tests
pnpm test:e2e
```

## Coding Standards

### TypeScript/JavaScript

- Use **TypeScript** for all new code
- Follow **ESLint** and **Prettier** configurations
- Use **functional programming** patterns where appropriate
- Write **meaningful variable and function names**
- Add **JSDoc comments** for public APIs
- Keep functions **small and focused** (single responsibility)
- Avoid **magic numbers** - use named constants

### Code Style

```typescript
// Good
const calculateTotalPrice = (quantity: number, pricePerUnit: number): number => {
  return quantity * pricePerUnit;
};

// Bad
function calc(q, p) {
  return q * p;
}
```

### React Components

- Use **functional components** with hooks
- Keep components **small and reusable**
- Use **TypeScript interfaces** for props
- Follow the **composition pattern**
- Implement **error boundaries** for critical components
- Use **React.memo** for performance optimization when needed

```typescript
// Example component structure
interface PriceChartProps {
  data: PriceData[];
  commodity: string;
  timeframe: Timeframe;
}

export const PriceChart: React.FC<PriceChartProps> = ({ data, commodity, timeframe }) => {
  // Component logic
  return (
    // JSX
  );
};
```

### NestJS Backend

- Follow **NestJS best practices**
- Use **dependency injection**
- Implement **DTOs** for request/response validation
- Use **decorators** appropriately
- Create **custom exceptions** for error handling
- Write **unit tests** for services and controllers

```typescript
// Example service structure
@Injectable()
export class MarketService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getPriceHistory(commodity: string, from: Date, to: Date): Promise<PriceHistory[]> {
    // Service logic
  }
}
```

### Git Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

**Examples:**
```
feat(frontend): add price chart component
fix(backend): resolve order matching race condition
docs(api): update authentication endpoints
test(contracts): add contract settlement tests
```

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions/updates

## Testing Guidelines

### Unit Tests

- Test **business logic** thoroughly
- Use **mocks** for external dependencies
- Aim for **80%+ code coverage**
- Write **descriptive test names**

```typescript
describe('MarketService', () => {
  describe('getPriceHistory', () => {
    it('should return price history for valid commodity and date range', async () => {
      // Test implementation
    });

    it('should throw NotFoundException for invalid commodity', async () => {
      // Test implementation
    });
  });
});
```

### Integration Tests

- Test **API endpoints** end-to-end
- Use **test database** (not production)
- Clean up **test data** after each test
- Test **error scenarios**

### Smart Contract Tests

- Test **all contract functions**
- Test **access control**
- Test **edge cases** and **failure modes**
- Verify **events are emitted** correctly

## Documentation

### Code Documentation

- Add **JSDoc/TSDoc** comments for public APIs
- Document **complex logic** with inline comments
- Keep comments **up-to-date** with code changes
- Explain **why**, not just **what**

### API Documentation

- Update **OpenAPI/Swagger** specs for API changes
- Provide **request/response examples**
- Document **error responses**
- Update **Postman collection**

### User Documentation

- Update **README.md** for feature changes
- Keep **architecture diagrams** current
- Update **deployment guides** as needed
- Add **tutorials** for new features

## Security

### Security Best Practices

- **Never commit** secrets or API keys
- Use **environment variables** for configuration
- Implement **input validation** on all endpoints
- Follow **OWASP** security guidelines
- Use **parameterized queries** (Prisma handles this)
- Implement **rate limiting**
- Use **HTTPS** in production
- Hash **passwords** with argon2
- Validate **JWT tokens** properly

### Reporting Security Issues

**Do not** open public issues for security vulnerabilities. Instead:

1. Email security@hedgingplatform.com
2. Include detailed description and steps to reproduce
3. Wait for acknowledgment before public disclosure

## Review Process

### Pull Request Checklist

Before submitting a PR, ensure:

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] New tests added for new functionality
- [ ] Documentation updated
- [ ] No console.log or debugging code
- [ ] Commits follow conventional commits
- [ ] PR description explains the change
- [ ] Breaking changes are clearly noted

### Code Review Guidelines

Reviewers should check for:

- **Correctness**: Does the code do what it's supposed to?
- **Clarity**: Is the code easy to understand?
- **Security**: Are there any security concerns?
- **Performance**: Are there any performance issues?
- **Tests**: Are the tests adequate?
- **Documentation**: Is the documentation sufficient?

## Release Process

1. **Version bump** in package.json (semantic versioning)
2. **Update CHANGELOG.md**
3. **Create release branch** (`release/v1.x.x`)
4. **Run full test suite**
5. **Create release PR** to main
6. **Tag release** after merge
7. **Deploy to production**

## Getting Help

- **GitHub Discussions**: For questions and discussions
- **GitHub Issues**: For bugs and feature requests
- **Discord**: Join our community server
- **Email**: dev@hedgingplatform.com

## Recognition

Contributors will be:

- Listed in **CONTRIBUTORS.md**
- Mentioned in **release notes**
- Acknowledged on our **website** (for major contributions)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to HPOPRM! 🎉
