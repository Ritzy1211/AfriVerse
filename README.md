# AfriVerse

**Where Stories Connect** - A modern, multi-category blog platform built with Next.js 14, inspired by Billboard and Entrepreneur.

## 🚀 Features

### Core Features
- ✅ **Multi-Category Content** - Tech, Culture, Business, Sports, Politics, Lifestyle
- ✅ **Billboard-Style Design** - Bold typography, full-width heroes, trending content
- ✅ **Entrepreneur-Style Organization** - Clean grids, clear hierarchy, resource sections
- ✅ **Urban Pulse Index (UPI)** - Proprietary real-time trending topics tracker
- ✅ **Zero-Registration Experience** - Full access without signup
- ✅ **Cookie-Based Personalization** - Smart content recommendations
- ✅ **Dark Mode** - Seamless theme switching
- ✅ **SEO Optimized** - Next.js 14 with App Router, metadata API
- ✅ **Mobile-First Responsive** - Perfect on all devices
- ✅ **Strategic Ad Placements** - Non-intrusive monetization ready

### User Experience
- **Trending Ticker** - Real-time hot topics scrolling banner
- **Smart Content Discovery** - Personalized without account
- **Reading Time Indicators** - Know before you click
- **Save for Later** - Local storage bookmarking
- **Social Sharing** - One-click share to all platforms
- **Related Articles** - Keep readers engaged

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Fonts:** Inter + Poppins
- **Icons:** Lucide React
- **State:** React Hooks + Cookie storage
- **Performance:** Image optimization, lazy loading, code splitting

## 📁 Project Structure

```
urban-grid/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── [category]/          # Dynamic category pages
│   │   │   ├── [slug]/          # Dynamic article pages
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Homepage
│   │   └── globals.css          # Global styles
│   ├── components/              # React components
│   │   ├── Header.tsx           # Main navigation
│   │   ├── Footer.tsx           # Footer with links
│   │   ├── TrendingTicker.tsx   # Hot topics banner
│   │   ├── ArticleCard.tsx      # Article preview cards
│   │   ├── UrbanPulseIndex.tsx  # UPI widget
│   │   └── AdPlacement.tsx      # Ad slots
│   ├── data/                    # Mock data (replace with CMS)
│   │   ├── articles.ts          # Article data
│   │   └── categories.ts        # Category definitions
│   ├── lib/                     # Utilities
│   │   ├── utils.ts             # Helper functions
│   │   └── preferences.ts       # Cookie management
│   └── types/                   # TypeScript types
│       └── index.ts
├── public/                      # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies:**
```powershell
npm install
```

2. **Run development server:**
```powershell
npm run dev
```

3. **Open browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```powershell
npm run build
npm start
```

## 🎨 Design System

### Colors
- **Primary:** `#1A1A2E` (Deep Urban Blue)
- **Secondary:** `#F39C12` (Energetic Amber)
- **Accent:** `#00D9FF` (Electric Cyan)
- **Dark:** `#0F0F0F` (Dark mode background)

### Typography
- **Headlines:** Poppins (600-900 weight)
- **Body:** Inter (300-900 weight)

### Components
- Billboard-inspired: Full-width heroes, bold typography, trending indicators
- Entrepreneur-inspired: Clean cards, organized grids, resource sections

## 📈 SEO Features

- ✅ Semantic HTML structure
- ✅ Dynamic meta tags
- ✅ Open Graph protocol
- ✅ Twitter Cards
- ✅ Structured data (JSON-LD)
- ✅ Optimized images (WebP, AVIF)
- ✅ Fast Core Web Vitals
- ✅ Mobile-friendly
- ✅ Sitemap ready

## 💰 Monetization Ready

### Ad Slots Integrated
- Header banner (970×90)
- Sidebar ads (300×250)
- In-article ads (728×90)
- Mobile sticky footer (320×50)

### Future Revenue Streams
- Sponsored content
- Affiliate marketing
- Premium subscriptions
- Newsletter sponsorships
- Events and webinars

## 🔧 Configuration

### Environment Variables (Create `.env.local`)
```env
NEXT_PUBLIC_SITE_URL=https://afriverse.ng
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

### Update Site Metadata
Edit `src/app/layout.tsx` to customize:
- Site title and description
- Social media handles
- Verification codes

## 📊 Urban Pulse Index (UPI)

The UPI is AfriVerse's proprietary trending system that measures:
- Social velocity (mentions across platforms)
- Street credibility (on-ground verification)
- Economic impact (real-world effects)
- Cultural relevance (meme spread, slang adoption)
- Geographic spread (city penetration)

Update UPI data in `src/components/UrbanPulseIndex.tsx`

## 🔄 Content Management

Currently uses mock data. To integrate a CMS:

### Option 1: Headless CMS
- Strapi
- Contentful
- Sanity

### Option 2: Database
- PostgreSQL + Prisma
- MongoDB + Mongoose
- Supabase

### Option 3: Markdown/MDX
- Local files
- Git-based workflow
- Build-time generation

## 🎯 Roadmap

### Phase 1 (Current)
- [x] Core blog functionality
- [x] Responsive design
- [x] SEO optimization
- [x] Cookie-based personalization

### Phase 2 (Next)
- [ ] Search functionality
- [ ] Comment system
- [ ] User accounts (optional)
- [ ] Newsletter integration
- [ ] Analytics dashboard

### Phase 3 (Future)
- [ ] Mobile app (PWA)
- [ ] Video content
- [ ] Podcasts integration
- [ ] Live streaming
- [ ] API for third parties

## 🤝 Contributing

This is a proprietary project for AfriVerse. Internal contributions welcome.

## 📄 License

Proprietary - © 2025 AfriVerse. All rights reserved.

## 🆘 Support

For questions or issues, contact the development team.

---

**Built with ❤️ in Lagos, Nigeria** 🇳🇬
