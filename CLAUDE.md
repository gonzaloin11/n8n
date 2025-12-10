# CLAUDE.md - AI Assistant Guide for n8n Repository

> **Last Updated:** 2025-12-10
> **Repository Status:** Initial setup phase

## Overview

This is the n8n repository, currently in its initial setup phase. This document serves as a comprehensive guide for AI assistants (like Claude) working with this codebase.

### Repository Purpose

This repository is related to n8n, a fair-code licensed workflow automation platform. As the codebase develops, this document will be updated to reflect the actual structure and conventions.

## Current Repository State

**Status:** Initial/Empty repository
**Tracked Files:** README.md
**Branch Structure:** Feature branches following `claude/` prefix pattern

### What We Know So Far

- Repository name: `n8n`
- Initial commit only
- No source code structure yet
- No build configuration files present

## Development Workflows

### Git Branch Strategy

**Important:** All development work should be done on feature branches following this pattern:
- Branch naming: `claude/claude-md-{session-id}`
- Always develop on designated feature branches
- Never push directly to main/master without explicit permission

### Git Operations Best Practices

#### Pushing Changes
```bash
# Always use -u flag for new branches
git push -u origin <branch-name>

# Retry on network errors (up to 4 times with exponential backoff: 2s, 4s, 8s, 16s)
```

#### Fetching/Pulling
```bash
# Prefer specific branch fetches
git fetch origin <branch-name>

# For pulls
git pull origin <branch-name>

# Apply same retry logic on network failures
```

### Commit Standards

- Write clear, descriptive commit messages
- Follow conventional commit format when applicable
- Never skip hooks (--no-verify) unless explicitly requested
- Never force push to main/master
- Avoid `git commit --amend` unless:
  1. User explicitly requests it, OR
  2. Adding edits from pre-commit hooks

## Codebase Structure (To Be Developed)

As the repository grows, this section will document:
- Directory structure and organization
- Module/package architecture
- Key entry points
- Configuration file locations
- Build and deployment artifacts

## Development Conventions

### General Principles

1. **Avoid Over-Engineering**
   - Only make changes that are directly requested or clearly necessary
   - Keep solutions simple and focused
   - Don't add features beyond what was asked
   - Don't add unnecessary error handling for impossible scenarios

2. **Code Quality**
   - Be careful about security vulnerabilities (XSS, SQL injection, command injection, etc.)
   - Follow OWASP top 10 best practices
   - If insecure code is discovered, fix it immediately

3. **File Operations**
   - ALWAYS prefer editing existing files over creating new ones
   - Never create files unless absolutely necessary
   - Avoid creating unnecessary documentation files

4. **Backwards Compatibility**
   - Avoid backwards-compatibility hacks
   - If something is unused, delete it completely
   - No renaming of unused variables or adding `// removed` comments

### When This Repository Is n8n-Related

If this repository is for developing n8n workflows, nodes, or integrations:

#### n8n-Specific Concepts
- **Nodes:** Reusable building blocks that perform specific actions
- **Workflows:** Connected sequences of nodes
- **Credentials:** Secure authentication configurations
- **Expressions:** JavaScript-based data manipulation
- **Webhooks:** HTTP endpoints for triggering workflows

#### Common n8n Development Tasks
- Creating custom nodes
- Developing workflow templates
- Building integrations with external services
- Extending n8n functionality

## Tools and Environment

### Available Tools

AI assistants working with this repository have access to:
- File operations (Read, Write, Edit)
- Search tools (Glob, Grep)
- Bash command execution
- Git operations
- Web search and fetch capabilities
- Task management tools

### Tool Usage Guidelines

1. **Use specialized tools** instead of bash when possible
   - Use `Read` instead of `cat`
   - Use `Edit` instead of `sed/awk`
   - Use `Write` instead of `echo >` or heredocs

2. **Parallel operations** when possible
   - Make independent tool calls in parallel
   - Sequential only when dependencies exist

3. **Search operations**
   - Use `Glob` for file pattern matching
   - Use `Grep` for content search
   - Use `Task` tool for complex multi-step searches

## Key Reminders for AI Assistants

### Critical Rules

1. **Never** push to undesignated branches without permission
2. **Always** read files before modifying them
3. **Never** propose changes to code you haven't read
4. **Always** use clear, concise communication
5. **Never** use emojis unless explicitly requested
6. **Always** track tasks using TodoWrite for complex operations

### Communication Style

- Be concise and direct
- Output is displayed in CLI/terminal format
- Support GitHub-flavored markdown
- Focus on technical accuracy over validation
- Provide objective guidance, even when it disagrees with user assumptions

### Security Considerations

- Authorized security testing is acceptable
- Refuse destructive techniques, DoS attacks, mass targeting
- Require clear authorization context for dual-use security tools
- Don't commit files with secrets (.env, credentials.json, etc.)

## Testing and Quality Assurance

As the project develops, document:
- Testing frameworks and strategies
- How to run tests
- Code coverage expectations
- Linting and formatting standards
- CI/CD pipeline information

## Build and Deployment (To Be Documented)

Future sections will cover:
- Build commands and processes
- Environment configuration
- Deployment procedures
- Environment variables and secrets management
- Production vs development differences

## Common Tasks and Workflows

### Starting Development

```bash
# Ensure you're on the correct branch
git checkout <feature-branch>

# Check status
git status

# Make changes...

# Stage and commit
git add .
git commit -m "descriptive message"

# Push changes
git push -u origin <feature-branch>
```

### Creating a Pull Request

When ready for review:
1. Ensure all changes are committed and pushed
2. Verify tests pass (when applicable)
3. Create PR with clear title and description
4. Include summary and test plan

## Future Development

As this repository evolves, update this document with:
- Actual codebase architecture
- Package structure and dependencies
- API documentation
- Integration patterns
- Performance considerations
- Troubleshooting guides

## Resources

### n8n Resources (if applicable)
- [n8n Official Documentation](https://docs.n8n.io/)
- [n8n Community Forum](https://community.n8n.io/)
- [n8n GitHub Repository](https://github.com/n8n-io/n8n)

### General Development Resources
- Conventional Commits: https://www.conventionalcommits.org/
- OWASP Top 10: https://owasp.org/www-project-top-ten/

## Changelog

### 2025-12-10
- Initial CLAUDE.md creation
- Repository in initial setup phase
- Basic git workflow guidelines established
- Development conventions documented

---

**Note:** This document should be updated regularly as the repository evolves and new patterns, conventions, and structures are established.
