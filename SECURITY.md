# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Features

### Data Protection
- **AES-256 Encryption**: All sensitive data encrypted before storage
- **Local Processing**: Policy analysis happens entirely on user's device
- **No Data Transmission**: No policy content sent to external servers
- **Secure Storage**: Chrome's secure storage APIs with encryption layer

### Input Validation
- **Schema Validation**: All inputs validated using Zod schemas
- **Content Sanitization**: HTML/script content sanitized using DOMPurify
- **Size Limits**: Content size limits to prevent memory exhaustion
- **URL Validation**: Strict URL validation and protocol checking

### Permission Model
- **Minimal Permissions**: Only essential Chrome permissions requested
- **Host Restrictions**: Limited to necessary domains where possible
- **Content Security Policy**: Strict CSP prevents code injection
- **Secure Communication**: All extension messaging validated and typed

### Error Handling
- **Graceful Degradation**: Secure fallbacks for all error conditions
- **Error Reporting**: Optional anonymous error reporting with user consent
- **No Sensitive Data**: Error reports never contain personal information
- **Rate Limiting**: Protection against abuse and excessive requests

## Reporting a Vulnerability

We take security vulnerabilities seriously. Please follow responsible disclosure:

### How to Report
1. **Email**: security@tcguard.com
2. **Subject**: "Security Vulnerability Report"
3. **Include**:
   - Detailed description of the vulnerability
   - Steps to reproduce
   - Potential impact assessment
   - Suggested fix (if available)

### What to Expect
- **Acknowledgment**: Within 24 hours
- **Initial Assessment**: Within 72 hours
- **Regular Updates**: Every 7 days until resolved
- **Resolution Timeline**: 30-90 days depending on severity

### Severity Levels

#### Critical (24-48 hours)
- Remote code execution
- Data exfiltration vulnerabilities
- Authentication bypass
- Privilege escalation

#### High (1-2 weeks)
- Cross-site scripting (XSS)
- Content injection
- Sensitive data exposure
- Denial of service

#### Medium (2-4 weeks)
- Information disclosure
- CSRF vulnerabilities
- Logic flaws
- Configuration issues

#### Low (1-3 months)
- Minor information leaks
- UI/UX security issues
- Documentation problems
- Non-security bugs

### Responsible Disclosure
- **No Public Disclosure**: Until fix is released
- **Coordinated Timeline**: Agreed upon disclosure date
- **Credit**: Security researchers credited (if desired)
- **Bug Bounty**: Currently not available

### Security Best Practices for Users

#### Installation
- Only install from official Chrome Web Store
- Verify publisher and permissions before installing
- Keep extension updated to latest version

#### Usage
- Review consent dialog carefully
- Use strong device passwords/encryption
- Regularly clear old analysis data
- Report suspicious behavior immediately

#### Privacy
- Understand what data is collected
- Adjust privacy settings as needed
- Export data before uninstalling
- Revoke consent if no longer needed

### Security Measures We've Implemented

#### Code Security
- **Static Analysis**: ESLint security rules
- **Dependency Scanning**: Regular vulnerability scans
- **Code Review**: All changes reviewed for security
- **Automated Testing**: Security-focused test cases

#### Runtime Security
- **Content Isolation**: Strict content script isolation
- **Message Validation**: All inter-component messages validated
- **Error Boundaries**: Prevent crashes from exposing data
- **Secure Defaults**: Security-first configuration

#### Data Security
- **Encryption at Rest**: All stored data encrypted
- **Key Management**: Secure key generation and storage
- **Data Minimization**: Collect only necessary data
- **Automatic Cleanup**: Regular deletion of old data

### Security Audit History

| Date | Auditor | Scope | Findings | Status |
|------|---------|-------|----------|--------|
| TBD  | Internal | Full Extension | TBD | Planned |

### Compliance

#### Standards
- **OWASP**: Following OWASP security guidelines
- **Chrome Security**: Adhering to Chrome extension security best practices
- **GDPR**: Privacy by design principles
- **SOC 2**: Security controls alignment

#### Certifications
- Currently pursuing security certifications
- Regular third-party security assessments planned
- Compliance with industry standards

### Contact Information

- **Security Team**: security@tcguard.com
- **General Contact**: support@tcguard.com
- **Emergency**: Use security email with "URGENT" prefix

---

This security policy is reviewed quarterly and updated as needed to reflect current threats and best practices.