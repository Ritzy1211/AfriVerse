# AfriVerse API Documentation

> Complete API reference for AfriVerse's unique features: Impact Score™, AfriPulse Index™, and Verified Storyteller Network.

**Base URL:** `https://afriverse.africa/api` (Production) | `http://localhost:3000/api` (Development)

**Authentication:** Most endpoints require NextAuth.js session authentication. Admin endpoints require `ADMIN` or `SUPER_ADMIN` role.

---

## Table of Contents

1. [Impact Score™ API](#impact-score-api)
2. [AfriPulse Index™ API](#afripulse-index-api)
3. [Verified Storyteller Network API](#verified-storyteller-network-api)
4. [Admin APIs](#admin-apis)
5. [Error Handling](#error-handling)

---

## Impact Score™ API

The Impact Score™ measures the real-world influence of articles based on community engagement, shares, citations, and reported outcomes.

### Get Impact Score

Retrieve the impact score for a specific article.

```
GET /api/impact?articleId={articleId}
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `articleId` | string | Yes | The unique identifier of the article |

**Response (200 OK):**

```json
{
  "id": "clx1234567890",
  "articleId": "clx0987654321",
  "totalScore": 85,
  "engagementScore": 78,
  "shareScore": 92,
  "citationScore": 65,
  "communityScore": 88,
  "reportsCount": 12,
  "verifiedReports": 8,
  "lastCalculated": "2026-01-12T10:30:00.000Z",
  "breakdown": {
    "reads": 15420,
    "shares": 1250,
    "comments": 342,
    "citations": 18,
    "communityImpacts": 8
  }
}
```

**Response (404 Not Found):**

```json
{
  "error": "Impact score not found for this article"
}
```

---

### Submit Impact Report

Allow readers to report real-world impact of an article (e.g., policy changes, community actions).

```
POST /api/impact/report
```

**Request Body:**

```json
{
  "articleId": "clx0987654321",
  "impactType": "POLICY_CHANGE",
  "description": "This article influenced the Lagos State Government to review their waste management policy.",
  "evidenceLink": "https://lagosstate.gov.ng/press-release/waste-policy-2026",
  "reporterContact": "john@example.com"
}
```

**Impact Types:**

| Type | Description |
|------|-------------|
| `POLICY_CHANGE` | Article influenced government or organizational policy |
| `COMMUNITY_ACTION` | Article sparked community initiatives or movements |
| `BUSINESS_IMPACT` | Article affected business decisions or market changes |
| `EDUCATION` | Article was used for educational purposes |
| `MEDIA_CITATION` | Article was cited by other media outlets |
| `OTHER` | Other forms of real-world impact |

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Impact report submitted successfully",
  "report": {
    "id": "clx5555555555",
    "status": "PENDING",
    "submittedAt": "2026-01-12T11:00:00.000Z"
  }
}
```

---

## AfriPulse Index™ API

The AfriPulse Index™ tracks sentiment and trending topics across African nations in real-time.

### Get AfriPulse Data

Retrieve sentiment indices for all tracked countries.

```
GET /api/afripulse
```

**Response (200 OK):**

```json
{
  "indices": [
    {
      "id": "clx1111111111",
      "countryCode": "NG",
      "countryName": "Nigeria",
      "flag": "🇳🇬",
      "overallSentiment": 72,
      "economySentiment": 68,
      "politicsSentiment": 55,
      "socialSentiment": 78,
      "techSentiment": 85,
      "trend": "RISING",
      "change24h": 3.2,
      "lastUpdated": "2026-01-12T12:00:00.000Z"
    },
    {
      "id": "clx2222222222",
      "countryCode": "KE",
      "countryName": "Kenya",
      "flag": "🇰🇪",
      "overallSentiment": 65,
      "economySentiment": 70,
      "politicsSentiment": 60,
      "socialSentiment": 68,
      "techSentiment": 82,
      "trend": "STABLE",
      "change24h": 0.5,
      "lastUpdated": "2026-01-12T12:00:00.000Z"
    }
  ],
  "topics": [
    {
      "id": "clx3333333333",
      "name": "AFCON 2025",
      "category": "SPORTS",
      "sentiment": 88,
      "volume": 125000,
      "trend": "RISING",
      "countries": ["NG", "GH", "CI", "SN"]
    }
  ],
  "lastUpdated": "2026-01-12T12:00:00.000Z"
}
```

### Get Single Country Pulse

```
GET /api/afripulse/{countryCode}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `countryCode` | string | ISO 3166-1 alpha-2 country code (e.g., NG, KE, ZA) |

**Response (200 OK):**

```json
{
  "id": "clx1111111111",
  "countryCode": "NG",
  "countryName": "Nigeria",
  "flag": "🇳🇬",
  "overallSentiment": 72,
  "sentimentBreakdown": {
    "economy": 68,
    "politics": 55,
    "social": 78,
    "technology": 85,
    "sports": 90,
    "entertainment": 82
  },
  "trend": "RISING",
  "change24h": 3.2,
  "change7d": 8.5,
  "historicalData": [
    { "date": "2026-01-11", "sentiment": 69 },
    { "date": "2026-01-10", "sentiment": 67 },
    { "date": "2026-01-09", "sentiment": 65 }
  ],
  "topTopics": [
    { "name": "Naira Exchange Rate", "sentiment": 45, "volume": 85000 },
    { "name": "AFCON 2025", "sentiment": 92, "volume": 120000 }
  ],
  "lastUpdated": "2026-01-12T12:00:00.000Z"
}
```

---

## Verified Storyteller Network API

The Verified Storyteller Network connects readers with trusted, verified African journalists and content creators.

### Get Featured Storytellers

Retrieve a list of featured verified storytellers.

```
GET /api/storytellers?featured=true
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `featured` | boolean | No | Filter for featured storytellers only |
| `country` | string | No | Filter by country |
| `expertise` | string | No | Filter by expertise area |
| `limit` | number | No | Number of results (default: 10, max: 50) |
| `page` | number | No | Page number for pagination |

**Response (200 OK):**

```json
{
  "storytellers": [
    {
      "id": "clx4444444444",
      "displayName": "Amara Okonkwo",
      "bio": "Award-winning journalist covering technology and innovation across Africa.",
      "avatar": "https://cloudinary.com/afriverse/avatars/amara.jpg",
      "badgeLevel": "PLATINUM",
      "trustScore": 98,
      "expertise": ["Technology & Innovation", "Business & Economy"],
      "languages": ["English", "Igbo", "French"],
      "country": "Nigeria",
      "articlesCount": 156,
      "totalImpactScore": 12500,
      "socialProof": {
        "twitter": { "verified": true, "followers": 45000 },
        "linkedin": { "verified": true }
      },
      "featuredWork": [
        {
          "title": "How African Startups Raised $500M in 2024",
          "slug": "african-startups-500m-2024",
          "impactScore": 92
        }
      ]
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

### Get Storyteller Profile

```
GET /api/storytellers/{id}
```

**Response (200 OK):**

```json
{
  "id": "clx4444444444",
  "displayName": "Amara Okonkwo",
  "bio": "Award-winning journalist covering technology and innovation across Africa. Former BBC Africa correspondent with 10+ years experience.",
  "avatar": "https://cloudinary.com/afriverse/avatars/amara.jpg",
  "coverImage": "https://cloudinary.com/afriverse/covers/amara-cover.jpg",
  "badgeLevel": "PLATINUM",
  "trustScore": 98,
  "status": "FEATURED",
  "verifiedAt": "2025-06-15T00:00:00.000Z",
  "expertise": ["Technology & Innovation", "Business & Economy", "Social Issues"],
  "languages": ["English", "Igbo", "French"],
  "country": "Nigeria",
  "region": "South East",
  "city": "Lagos",
  "articlesCount": 156,
  "totalImpactScore": 12500,
  "averageImpactScore": 80,
  "socialLinks": {
    "twitter": "https://twitter.com/amarawrites",
    "linkedin": "https://linkedin.com/in/amaraokonkwo",
    "website": "https://amaraokonkwo.com"
  },
  "socialProof": {
    "twitter": { "verified": true, "followers": 45000 },
    "linkedin": { "verified": true }
  },
  "achievements": [
    { "title": "Impact Champion", "description": "10+ verified impact reports", "earnedAt": "2025-12-01" },
    { "title": "Trending Voice", "description": "Article reached 100K+ readers", "earnedAt": "2025-11-15" }
  ],
  "recentArticles": [
    {
      "id": "clx6666666666",
      "title": "How African Startups Raised $500M in 2024",
      "slug": "african-startups-500m-2024",
      "excerpt": "A deep dive into the African tech funding landscape...",
      "publishedAt": "2026-01-10T09:00:00.000Z",
      "impactScore": 92,
      "category": "Technology"
    }
  ]
}
```

### Apply to Become a Storyteller

```
POST /api/storytellers/apply
```

**Request Body:**

```json
{
  "name": "Kwame Mensah",
  "email": "kwame@example.com",
  "country": "Ghana",
  "bio": "Freelance journalist with 5 years of experience covering West African politics and economics.",
  "whyJoin": "I want to share authentic African stories with a global audience and connect with like-minded journalists.",
  "portfolioLinks": [
    "https://medium.com/@kwamemensah",
    "https://guardian.ng/author/kwame"
  ],
  "socialLinks": {
    "twitter": "https://twitter.com/kwamewrites",
    "linkedin": "https://linkedin.com/in/kwamemensah"
  },
  "expertise": ["Politics", "Economics", "Social Issues"],
  "languages": ["English", "Twi", "French"]
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Application submitted successfully",
  "application": {
    "id": "clx7777777777",
    "status": "PENDING",
    "submittedAt": "2026-01-12T14:00:00.000Z",
    "estimatedReviewTime": "3-5 business days"
  }
}
```

### Check Application Status

```
GET /api/storytellers/apply
```

**Headers:**

```
Authorization: Bearer {session_token}
```

**Response (200 OK):**

```json
{
  "hasApplication": true,
  "application": {
    "id": "clx7777777777",
    "status": "PENDING",
    "submittedAt": "2026-01-12T14:00:00.000Z",
    "reviewedAt": null,
    "feedback": null
  }
}
```

**Application Statuses:**

| Status | Description |
|--------|-------------|
| `PENDING` | Application is awaiting review |
| `UNDER_REVIEW` | Application is being reviewed by the editorial team |
| `APPROVED` | Application approved, user is now a verified storyteller |
| `REJECTED` | Application was not approved (feedback provided) |
| `WAITLISTED` | Application is on the waitlist for future consideration |

---

## Admin APIs

These endpoints require authentication with `ADMIN` or `SUPER_ADMIN` role.

### Storyteller Management

#### Get All Applications

```
GET /api/admin/storytellers/applications
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status (PENDING, APPROVED, REJECTED) |
| `page` | number | Page number |
| `limit` | number | Results per page |

#### Review Application

```
PUT /api/admin/storytellers/applications/{id}
```

**Request Body:**

```json
{
  "action": "APPROVE",
  "feedback": "Welcome to the AfriVerse Storyteller Network!",
  "initialBadge": "BRONZE"
}
```

**Actions:** `APPROVE`, `REJECT`, `WAITLIST`

#### Update Storyteller Badge

```
PATCH /api/admin/storytellers/{id}
```

**Request Body:**

```json
{
  "action": "UPDATE_BADGE",
  "badgeLevel": "GOLD"
}
```

**Badge Levels:**

| Badge | Requirements |
|-------|--------------|
| `BRONZE` | New verified storyteller |
| `SILVER` | 10+ articles, 500+ total impact score |
| `GOLD` | 25+ articles, 2000+ total impact score |
| `PLATINUM` | 50+ articles, 5000+ total impact score, 5+ verified impact reports |
| `AMBASSADOR` | Exceptional contribution, selected by editorial team |

#### Suspend/Revoke Storyteller

```
PATCH /api/admin/storytellers/{id}
```

**Request Body (Suspend):**

```json
{
  "action": "SUSPEND",
  "reason": "Violation of community guidelines"
}
```

**Request Body (Revoke):**

```json
{
  "action": "REVOKE",
  "reason": "Repeated policy violations"
}
```

---

### AfriPulse Management

#### Get All Country Indices

```
GET /api/admin/afripulse
```

#### Create Country Index

```
POST /api/admin/afripulse
```

**Request Body:**

```json
{
  "countryCode": "TZ",
  "countryName": "Tanzania",
  "flag": "🇹🇿",
  "overallSentiment": 70,
  "economySentiment": 65,
  "politicsSentiment": 68,
  "socialSentiment": 72,
  "techSentiment": 75
}
```

#### Update Country Index

```
PUT /api/admin/afripulse/{id}
```

**Request Body:**

```json
{
  "overallSentiment": 75,
  "economySentiment": 70,
  "trend": "RISING"
}
```

#### Delete Country Index

```
DELETE /api/admin/afripulse/{id}
```

---

### Impact Report Management

#### Get Pending Reports

```
GET /api/admin/impact/reports?status=PENDING
```

#### Verify/Reject Report

```
PATCH /api/admin/impact/reports/{id}
```

**Request Body:**

```json
{
  "action": "VERIFY",
  "verificationNotes": "Confirmed with Lagos State Government press office"
}
```

---

## Error Handling

All API errors follow a consistent format:

```json
{
  "error": "Error message describing what went wrong",
  "code": "ERROR_CODE",
  "details": {}
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `201` | Created successfully |
| `400` | Bad request - Invalid input |
| `401` | Unauthorized - Authentication required |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not found |
| `409` | Conflict - Resource already exists |
| `429` | Too many requests - Rate limited |
| `500` | Internal server error |

### Common Error Codes

| Code | Description |
|------|-------------|
| `INVALID_INPUT` | Request body validation failed |
| `UNAUTHORIZED` | Missing or invalid authentication |
| `FORBIDDEN` | User lacks required permissions |
| `NOT_FOUND` | Requested resource doesn't exist |
| `ALREADY_EXISTS` | Resource with same identifier exists |
| `RATE_LIMITED` | Too many requests, try again later |

---

## Rate Limiting

API requests are rate limited to ensure fair usage:

| Endpoint Type | Limit |
|---------------|-------|
| Public endpoints | 100 requests/minute |
| Authenticated endpoints | 200 requests/minute |
| Admin endpoints | 500 requests/minute |

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704979200
```

---

## Webhooks (Coming Soon)

AfriVerse will support webhooks for real-time notifications:

- `storyteller.verified` - When a storyteller application is approved
- `impact.reported` - When a new impact report is submitted
- `afripulse.updated` - When country sentiment data is updated

---

## SDKs & Libraries

Official SDKs are planned for:

- JavaScript/TypeScript (npm)
- Python (pip)
- Go (go modules)

---

## Support

For API support, contact:
- Email: api-support@afriverse.africa
- Developer Portal: https://developers.afriverse.africa

---

*Last Updated: January 12, 2026*
*API Version: 1.0.0*
