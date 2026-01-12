# AfriVerse Admin Guide

> Complete guide for administrators managing AfriVerse's platform, content, and users.

---

## Table of Contents

1. [Admin Dashboard Overview](#admin-dashboard-overview)
2. [Storyteller Management](#storyteller-management)
3. [AfriPulse Index Management](#afripulse-index-management)
4. [Impact Score Administration](#impact-score-administration)
5. [Content Moderation](#content-moderation)
6. [User Management](#user-management)
7. [Analytics & Reporting](#analytics--reporting)
8. [System Settings](#system-settings)
9. [Security Best Practices](#security-best-practices)

---

## Admin Dashboard Overview

### Accessing the Admin Panel

1. Navigate to `https://afriverse.africa/admin`
2. Sign in with your admin credentials
3. Complete two-factor authentication (if enabled)

### Admin Roles

| Role | Permissions |
|------|-------------|
| **Super Admin** | Full access to all features and settings |
| **Admin** | Manage content, users, and features (no system settings) |
| **Editor** | Review content, manage comments, moderate discussions |
| **Moderator** | Limited moderation capabilities |

### Dashboard Home

The dashboard home displays:

- **Quick Stats**: Total users, articles, storytellers, pending reviews
- **Recent Activity**: Latest submissions, applications, reports
- **Alerts**: Items requiring immediate attention
- **Performance Metrics**: Traffic, engagement, impact scores

---

## Storyteller Management

### Accessing Storyteller Admin

Navigate to: **Admin → Storytellers**

### Reviewing Applications

#### Application Queue

The applications tab shows pending storyteller applications with:

- Applicant name and email
- Country and languages
- Submission date
- Portfolio links
- Application status

#### Review Process

1. **Click on an application** to view full details
2. **Review the portfolio** — Check linked articles and social profiles
3. **Evaluate criteria**:
   - Writing quality
   - African perspective
   - Publishing track record
   - Adherence to ethics
4. **Make a decision**:
   - ✅ **Approve** — Add to Verified Storyteller Network
   - ❌ **Reject** — Provide constructive feedback
   - ⏳ **Waitlist** — Hold for future consideration

#### Approval Actions

When approving, set:

- **Initial Badge**: Usually BRONZE for new storytellers
- **Welcome Message**: Personalized onboarding note
- **Featured Status**: Whether to feature on homepage

```
Example Approval Message:
"Welcome to the AfriVerse Storyteller Network, [Name]! We're excited 
to have your voice on our platform. Check your email for onboarding 
resources and publishing guidelines."
```

#### Rejection Actions

When rejecting, always:

- Provide specific, constructive feedback
- Suggest improvements
- Indicate if they can reapply

```
Example Rejection Feedback:
"Thank you for applying. While we appreciate your passion for 
African stories, we'd like to see more published work demonstrating 
your writing style. We encourage you to build your portfolio and 
reapply in 90 days."
```

### Managing Verified Storytellers

#### Storyteller Directory

View all verified storytellers with:

- Name and profile photo
- Badge level
- Trust score
- Article count
- Status (Active, Featured, Suspended)
- Last activity

#### Actions

| Action | Description | When to Use |
|--------|-------------|-------------|
| **View Profile** | See full storyteller details | Regular review |
| **Edit Badge** | Upgrade/downgrade badge level | Based on performance |
| **Feature** | Highlight on homepage | Exceptional storytellers |
| **Suspend** | Temporarily disable account | Policy violations |
| **Revoke** | Permanently remove verification | Serious violations |

#### Badge Management

**Upgrading Badges:**

1. Select storyteller from directory
2. Click "Edit Badge"
3. Select new badge level
4. Add upgrade reason (logged for records)
5. Save — Storyteller receives notification

**Badge Requirements Reference:**

| Badge | Articles | Impact Score | Special Requirements |
|-------|----------|--------------|---------------------|
| Bronze | 0+ | 0+ | New verification |
| Silver | 10+ | 500+ | — |
| Gold | 25+ | 2,000+ | — |
| Platinum | 50+ | 5,000+ | 5+ verified impacts |
| Ambassador | — | — | Editorial selection |

#### Handling Violations

**Suspension Process:**

1. Document the violation with evidence
2. Select "Suspend" from actions
3. Choose suspension duration (7, 30, 90 days, or indefinite)
4. Provide reason (shared with storyteller)
5. Confirm suspension

**Revocation Process:**

1. Ensure violation is severe (plagiarism, misinformation, harassment)
2. Consult with at least one other admin
3. Document thoroughly
4. Select "Revoke" from actions
5. Provide detailed reason
6. Confirm revocation (irreversible)

---

## AfriPulse Index Management

### Accessing AfriPulse Admin

Navigate to: **Admin → AfriPulse**

### Managing Country Indices

#### Viewing Countries

The main view shows all tracked countries with:

- Country name and flag
- Current sentiment scores (overall and by category)
- Trend indicator
- Last updated timestamp
- Quick actions

#### Adding a New Country

1. Click **"Add Country"**
2. Enter country details:
   - Country code (ISO 3166-1 alpha-2)
   - Country name
   - Flag emoji
3. Set initial sentiment scores:
   - Overall sentiment (0-100)
   - Economy sentiment
   - Politics sentiment
   - Social sentiment
   - Technology sentiment
4. Save

#### Editing Country Data

1. Click the **Edit** icon on a country card
2. Update sentiment scores as needed
3. Set trend indicator (Rising, Falling, Stable, Volatile)
4. Add update notes (optional)
5. Save changes

#### Sentiment Score Guidelines

| Score | Interpretation | Visual Indicator |
|-------|---------------|------------------|
| 80-100 | Very Positive | 🟢 Green |
| 60-79 | Positive | 🟢 Light Green |
| 40-59 | Neutral | 🟡 Yellow |
| 20-39 | Negative | 🟠 Orange |
| 0-19 | Very Negative | 🔴 Red |

#### Removing Countries

1. Click **Delete** icon on country card
2. Confirm deletion
3. Historical data is archived (not permanently deleted)

### Managing Trending Topics

#### Adding Topics

1. Navigate to **Topics** tab
2. Click **"Add Topic"**
3. Enter:
   - Topic name
   - Category (Sports, Politics, Economy, etc.)
   - Initial sentiment score
   - Volume estimate
   - Related countries
4. Save

#### Topic Categories

- Sports
- Politics
- Economy
- Technology
- Entertainment
- Social Issues
- Environment
- Health
- Education

#### Updating Topics

Topics should be updated based on:

- News developments
- Social media trends
- Reader engagement data
- Editorial judgment

### Data Sources

AfriPulse aggregates data from:

- AfriVerse article engagement
- Social media sentiment analysis
- News aggregation
- Community polls
- Partner data feeds

**Note:** While some data is automated, admin oversight ensures accuracy and context.

### AI Suggestions (Semi-Automated Updates)

AfriPulse includes an AI-powered suggestion system that analyzes published articles to recommend score updates.

#### Using AI Suggestions

1. Navigate to **Admin → AfriPulse**
2. Click the **"AI Suggestions"** button (purple, with sparkles icon)
3. Select the analysis period (7 days, 14 days, or 30 days)
4. Review the generated suggestions

#### Understanding Suggestions

Each suggestion card includes:

| Field | Description |
|-------|-------------|
| **Country** | The country being analyzed |
| **Current Scores** | Existing sentiment scores |
| **Suggested Scores** | AI-recommended new scores |
| **Confidence** | How confident the AI is (based on article count) |
| **Articles Analyzed** | Number of articles that mentioned this country |
| **Detected Topics** | Trending topics found in the articles |

#### Applying Suggestions

1. Review the suggested scores for each category
2. Click **"Apply"** to accept a suggestion
3. The scores will be updated automatically
4. You can also modify scores manually before saving

#### How AI Analysis Works

The system:
1. Scans recent published articles
2. Detects mentions of countries using keyword matching
3. Analyzes sentiment using positive/negative keyword scoring
4. Categorizes content (Economy, Politics, Social, Technology, etc.)
5. Calculates weighted average scores per country
6. Generates suggestions with confidence scores

**Important:** AI suggestions are recommendations, not automatic updates. Admin review ensures context and accuracy.

### Weekly Update Reminders

To ensure AfriPulse stays current, the system sends weekly reminders to admins.

#### How It Works

1. **Every Monday at 9:00 AM WAT** (8:00 AM UTC), a cron job runs
2. The system checks which countries haven't been updated in 7+ days
3. Notifications are sent to all Admin, Super Admin, and Editor users
4. Notifications appear in the admin dashboard

#### Notification Types

- **In-App Notifications** — Appear in the admin header bell icon
- **Optional Email** — Can be configured in settings

#### Viewing Notifications

1. Click the **bell icon** in the admin header
2. View all notifications
3. Click on a notification to go to the relevant page
4. Mark as read by clicking the check icon

#### Cron Job Setup (Vercel)

If using Vercel, the cron job is automatically configured via `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/afripulse-reminder",
    "schedule": "0 8 * * 1"
  }]
}
```

For other hosting platforms, set up an external cron service to call:
```
GET https://afriverse.africa/api/cron/afripulse-reminder
Authorization: Bearer YOUR_CRON_SECRET
```

---

## Impact Score Administration

### Accessing Impact Admin

Navigate to: **Admin → Impact Reports**

### Review Queue

Pending impact reports display:

- Article title and link
- Reporter information
- Impact type
- Description
- Evidence link (if provided)
- Submission date

### Verification Process

#### Step 1: Initial Review

- Read the impact claim carefully
- Check if it's plausible
- Verify the reporter isn't spam

#### Step 2: Evidence Verification

For each evidence type:

| Evidence Type | Verification Method |
|---------------|---------------------|
| Government policy | Check official government websites |
| Media citation | Verify the citing publication |
| Community action | Look for news coverage or social proof |
| Business impact | Research company announcements |
| Educational use | Verify institution or course |

#### Step 3: Making a Decision

**Approve (Verify):**
- Impact is real and attributable to the article
- Evidence is credible
- Add verification notes

**Reject:**
- Impact isn't verifiable
- Not attributable to the article
- Duplicate submission
- Provide reason to reporter

**Request More Info:**
- Impact seems real but needs more evidence
- Send message to reporter requesting specifics

### Impact Score Calculation

After verification, the system recalculates the article's impact score:

```
Total Score = (Engagement × 0.25) + (Shares × 0.25) + 
              (Citations × 0.20) + (Community Impacts × 0.30)
```

Verified impact reports heavily influence the Community Impact component.

### Reporting & Analytics

Access impact analytics:

- Total reports received
- Verification rate
- Impact by category
- Top-impact articles
- Storyteller impact rankings

---

## Content Moderation

### Comment Moderation

Navigate to: **Admin → Comments**

#### Moderation Queue

View flagged comments awaiting review:

- Comment content
- Article context
- Reporter reason
- User history

#### Actions

| Action | Description |
|--------|-------------|
| **Approve** | Comment is acceptable, remove flag |
| **Edit** | Modify problematic content |
| **Hide** | Remove from public view |
| **Delete** | Permanently remove |
| **Ban User** | Restrict user from commenting |

### Article Review

Navigate to: **Admin → Editorial**

Review submitted articles for:

- Factual accuracy
- Editorial standards
- Community guidelines compliance
- SEO optimization

### Moderation Guidelines

**Always Remove:**
- Hate speech or discrimination
- Harassment or threats
- Spam or promotional content
- Misinformation or fake news
- Personal information exposure

**Use Judgment:**
- Strong opinions (allow if not hateful)
- Off-topic discussions (warn, then remove)
- Self-promotion (allow if relevant)

---

## User Management

### Accessing User Admin

Navigate to: **Admin → Users**

### User Directory

Search and filter users by:

- Name or email
- Role
- Status (Active, Suspended, Banned)
- Registration date
- Last activity

### User Actions

| Action | Description | Permission Required |
|--------|-------------|---------------------|
| View Profile | See user details | Editor+ |
| Edit Role | Change user permissions | Admin+ |
| Reset Password | Send password reset | Admin+ |
| Suspend | Temporary account lock | Admin+ |
| Ban | Permanent account restriction | Super Admin |
| Delete | Remove account entirely | Super Admin |

### Role Assignment

When assigning roles, consider:

- User's responsibilities
- Trust level
- Training completed
- Need for access

**Principle of Least Privilege:** Only grant permissions necessary for the role.

---

## Analytics & Reporting

### Accessing Analytics

Navigate to: **Admin → Analytics**

### Available Reports

#### Traffic Analytics
- Page views by article, category, country
- User acquisition and retention
- Traffic sources
- Geographic distribution

#### Engagement Metrics
- Average time on page
- Comment rates
- Share statistics
- Newsletter signups

#### Impact Analytics
- Total impact score across platform
- Impact reports by category
- Top-impact articles
- Storyteller performance

#### AfriPulse Analytics
- Sentiment trends over time
- Country-level engagement
- Topic performance
- Data accuracy metrics

### Exporting Data

Reports can be exported as:
- CSV for spreadsheets
- PDF for presentations
- JSON for integrations

### Scheduled Reports

Set up automated reports:

1. Navigate to **Settings → Reports**
2. Click **"New Scheduled Report"**
3. Select report type and frequency
4. Add recipients
5. Save

---

## System Settings

### Accessing Settings

Navigate to: **Admin → Settings** (Super Admin only)

### General Settings

| Setting | Description |
|---------|-------------|
| Site Name | Platform display name |
| Admin Email | Primary contact for alerts |
| Timezone | Default timezone for displays |
| Language | Default platform language |

### Feature Toggles

Enable or disable features:

- Comments
- Newsletter signup
- Impact reporting
- AfriPulse display
- Social sharing

### Email Configuration

Configure email notifications for:

- New storyteller applications
- Impact report submissions
- User registrations
- Comment flags

### Security Settings

- Two-factor authentication requirements
- Session timeout duration
- Password policy
- IP allowlists

---

## Security Best Practices

### Account Security

1. **Use strong passwords** — 12+ characters, mixed case, numbers, symbols
2. **Enable 2FA** — Required for all admin accounts
3. **Don't share credentials** — Each admin should have unique login
4. **Log out when done** — Especially on shared computers

### Access Management

1. **Regular access reviews** — Quarterly audit of admin accounts
2. **Remove inactive accounts** — Disable accounts not used in 90 days
3. **Principle of least privilege** — Only grant necessary permissions
4. **Document access changes** — Log all role modifications

### Incident Response

If you notice suspicious activity:

1. **Don't panic** — Follow the process
2. **Document** — Screenshot and note what you observed
3. **Report** — Contact security@afriverse.africa immediately
4. **Preserve** — Don't delete or modify potential evidence
5. **Contain** — If authorized, suspend compromised accounts

### Data Protection

- Never share user data externally
- Use secure channels for sensitive communications
- Follow data retention policies
- Report any data breaches immediately

---

## Support & Resources

### Admin Support

- **Email**: admin-support@afriverse.africa
- **Emergency**: +234-XXX-XXX-XXXX (Super Admins only)

### Training Resources

- Admin onboarding video series
- Monthly admin webinars
- Policy documentation wiki

### Escalation Path

1. **Tier 1**: Moderators → Editors
2. **Tier 2**: Editors → Admins
3. **Tier 3**: Admins → Super Admins
4. **Critical**: Super Admins → Executive Team

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Jan 12, 2026 | Initial release |

---

*This document is confidential and intended for AfriVerse administrators only.*

*Last Updated: January 12, 2026*
