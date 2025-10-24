# Security Documentation

This document outlines the security measures implemented in the MCQ Competition Portal and provides guidelines for maintaining security in production environments.

## Security Overview

The MCQ Competition Portal implements multiple layers of security to protect against common threats and ensure exam integrity. However, it's important to understand the limitations of web-based security measures.

## ⚠️ Important Security Notice

**It is not possible to fully prevent screenshots or external camera capture from a web page.** The implemented measures (canvas rendering, watermark, kiosk mode) only deter casual copying. For high-stakes exams, consider using dedicated secure browsers or live proctoring.

## Implemented Security Measures

### 1. Authentication & Authorization

#### Firebase Authentication
- **Email/Password Authentication**: Secure user authentication
- **JWT Tokens**: Stateless authentication with expiration
- **Role-based Access Control**: Admin and Student roles with different permissions
- **Single Session Enforcement**: Prevents concurrent logins

#### Security Rules
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Admins can access all data
    match /contests/{contestId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### 2. Anti-Cheating Measures

#### Canvas Rendering
- Questions are rendered on HTML5 Canvas
- Prevents easy text selection and copying
- Makes automated scraping more difficult

#### Watermarking
- Per-screen watermark with username, contest ID, and timestamp
- Translucent overlay that's difficult to remove
- Helps identify leaked content

#### Window/Tab Monitoring
- Detects when students minimize or switch tabs
- 3-second grace period before logout
- Creates rejoin requests for admin approval

#### Input Restrictions
- Disabled right-click context menu
- Disabled keyboard shortcuts (F12, Ctrl+U, etc.)
- Disabled text selection during exams
- Disabled drag and drop

### 3. Session Management

#### Single Session Enforcement
```typescript
// Session validation on each request
const sessionDoc = await admin.firestore()
  .collection('sessions')
  .doc(sessionId)
  .get();

if (!sessionDoc.exists || !sessionDoc.data()?.isActive) {
  throw new Error('Session expired');
}
```

#### Session Timeout
- Automatic session cleanup after inactivity
- Configurable timeout periods
- Secure session invalidation

### 4. Data Protection

#### Encryption
- All data encrypted in transit (HTTPS/TLS)
- Sensitive data encrypted at rest in Firestore
- Environment variables for secrets

#### Input Validation
```typescript
// Server-side validation
const schema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(8).required(),
  email: Joi.string().email().required()
});
```

#### Rate Limiting
```typescript
// Express rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

## Security Limitations

### 1. Web Browser Limitations

#### Cannot Prevent:
- **Screenshots**: Operating system-level screen capture
- **External Cameras**: Physical cameras recording the screen
- **Screen Recording Software**: Third-party recording tools
- **Virtual Machines**: Running in isolated environments
- **Browser Extensions**: Malicious extensions
- **Developer Tools**: Advanced users can access DevTools

#### Can Only Deter:
- Casual copying and pasting
- Simple text selection
- Basic right-click actions
- Common keyboard shortcuts

### 2. Network Security

#### Potential Vulnerabilities:
- **Man-in-the-Middle Attacks**: If HTTPS is not properly configured
- **DNS Hijacking**: Malicious DNS servers
- **Network Monitoring**: Corporate or ISP monitoring
- **Proxy Servers**: Traffic interception

## Recommended Security Enhancements

### 1. For High-Stakes Exams

#### Secure Browser Solutions
- **Safe Exam Browser (SEB)**: Lockdown browser for exams
- **Respondus LockDown Browser**: Commercial exam browser
- **Custom Kiosk Mode**: Dedicated exam environment

#### Proctoring Solutions
- **Live Proctoring**: Human proctors monitoring via webcam
- **AI Proctoring**: Automated behavior detection
- **Biometric Verification**: Face recognition and ID verification

### 2. Infrastructure Security

#### Network Security
```bash
# Firewall rules
ufw allow 443/tcp  # HTTPS only
ufw allow 22/tcp   # SSH (restrict to admin IPs)
ufw deny 80/tcp    # Block HTTP
```

#### Server Hardening
- Regular security updates
- Intrusion detection systems
- Log monitoring and alerting
- Backup and disaster recovery

### 3. Application Security

#### Code Security
- Regular dependency updates
- Static code analysis
- Penetration testing
- Security code reviews

#### Data Security
- Database encryption
- Secure backup procedures
- Data retention policies
- GDPR compliance measures

## Threat Model

### 1. Threat Actors

#### Students
- **Casual Cheating**: Copy-paste, looking up answers
- **Collaboration**: Sharing answers with peers
- **Technical Bypass**: Using browser tools or extensions

#### External Attackers
- **Data Breach**: Stealing exam questions or answers
- **DDoS Attacks**: Disrupting exam sessions
- **Social Engineering**: Gaining unauthorized access

#### Insiders
- **Admin Abuse**: Unauthorized access to results
- **Data Leakage**: Accidental or intentional data exposure

### 2. Attack Vectors

#### Application Level
- SQL/NoSQL injection
- Cross-site scripting (XSS)
- Cross-site request forgery (CSRF)
- Authentication bypass

#### Network Level
- Man-in-the-middle attacks
- DNS hijacking
- SSL/TLS vulnerabilities
- DDoS attacks

#### Physical Level
- Shoulder surfing
- Camera recording
- Screen capture
- Device compromise

## Security Best Practices

### 1. For Administrators

#### Account Management
- Use strong, unique passwords
- Enable two-factor authentication
- Regular password rotation
- Monitor account activity

#### Exam Management
- Randomize question order
- Use question pools
- Set appropriate time limits
- Monitor for suspicious activity

#### Data Handling
- Encrypt sensitive data
- Implement access controls
- Regular security audits
- Incident response procedures

### 2. For Students

#### Account Security
- Use strong passwords
- Don't share credentials
- Log out after sessions
- Report suspicious activity

#### Exam Conduct
- Use only authorized devices
- Ensure stable internet connection
- Don't use external resources
- Follow exam guidelines

### 3. For Developers

#### Code Security
- Follow secure coding practices
- Regular security testing
- Dependency management
- Error handling

#### Deployment Security
- Secure configuration management
- Environment isolation
- Monitoring and logging
- Incident response

## Compliance and Regulations

### 1. Data Protection

#### GDPR Compliance
- Data minimization
- Consent management
- Right to erasure
- Data portability

#### FERPA Compliance (US Education)
- Student privacy protection
- Data access controls
- Audit trails
- Secure data handling

### 2. Accessibility

#### WCAG Compliance
- Screen reader compatibility
- Keyboard navigation
- Color contrast
- Alternative text

## Incident Response

### 1. Security Incident Types

#### Data Breach
1. Immediate containment
2. Assess scope and impact
3. Notify affected parties
4. Implement remediation
5. Post-incident review

#### System Compromise
1. Isolate affected systems
2. Preserve evidence
3. Restore from backups
4. Patch vulnerabilities
5. Monitor for recurrence

#### Exam Integrity Issues
1. Suspend affected sessions
2. Investigate incident
3. Notify administrators
4. Implement additional controls
5. Review procedures

### 2. Response Procedures

#### Immediate Response (0-1 hour)
- Assess and contain the incident
- Preserve evidence
- Notify key stakeholders
- Activate response team

#### Short-term Response (1-24 hours)
- Detailed investigation
- Implement temporary fixes
- Communicate with users
- Document findings

#### Long-term Response (1+ days)
- Implement permanent fixes
- Update security measures
- Conduct post-incident review
- Update procedures

## Security Monitoring

### 1. Logging

#### Application Logs
```typescript
// Security event logging
logger.info('User login', {
  userId: user.uid,
  ipAddress: req.ip,
  userAgent: req.get('User-Agent'),
  timestamp: new Date()
});
```

#### System Logs
- Authentication events
- Authorization failures
- Data access patterns
- Error conditions

### 2. Monitoring

#### Real-time Monitoring
- Failed login attempts
- Unusual access patterns
- System performance
- Error rates

#### Periodic Reviews
- Security audit logs
- User access reviews
- System vulnerability scans
- Compliance assessments

## Security Testing

### 1. Automated Testing

#### Static Analysis
```bash
# Code security scanning
npm audit
eslint --ext .ts,.tsx --config .eslintrc.security.js
```

#### Dynamic Testing
- Penetration testing
- Vulnerability scanning
- Load testing
- Security regression testing

### 2. Manual Testing

#### Security Reviews
- Code review for security issues
- Architecture security assessment
- Threat modeling
- Red team exercises

## Conclusion

While the MCQ Competition Portal implements comprehensive security measures, it's important to understand that web-based applications have inherent limitations. For high-stakes examinations, consider implementing additional security measures such as:

- Dedicated secure browsers
- Live proctoring
- Biometric verification
- Network-level security controls
- Physical security measures

Regular security assessments, updates, and monitoring are essential to maintain the security posture of the application.
