import { NextResponse } from 'next/server';

// Generate a professionally designed HTML media kit that renders beautifully when downloaded
export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://afriverse.africa';
  const logoUrl = 'https://res.cloudinary.com/dnlmfuwst/image/upload/afriverse/Afriverse-logo.png';
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AfriVerse Media Kit 2026</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@600;700;800&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #ffffff;
      color: #1a1a2e;
      line-height: 1.6;
    }
    
    .page {
      max-width: 900px;
      margin: 0 auto;
      padding: 60px 40px;
      background: #ffffff;
    }
    
    /* Cover Page */
    .cover {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
      color: white;
      padding: 80px 60px;
      border-radius: 24px;
      text-align: center;
      margin-bottom: 60px;
      position: relative;
      overflow: hidden;
    }
    
    .cover::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23F39C12' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      opacity: 0.5;
    }
    
    .cover-content {
      position: relative;
      z-index: 1;
    }
    
    .logo {
      width: 180px;
      height: auto;
      margin-bottom: 30px;
    }
    
    .cover h1 {
      font-family: 'Poppins', sans-serif;
      font-size: 48px;
      font-weight: 800;
      margin-bottom: 15px;
      letter-spacing: -1px;
    }
    
    .cover h1 span {
      color: #F39C12;
    }
    
    .cover .tagline {
      font-size: 20px;
      color: #9ca3af;
      margin-bottom: 30px;
    }
    
    .cover .year-badge {
      display: inline-block;
      background: linear-gradient(135deg, #F39C12 0%, #e67e22 100%);
      color: #1a1a2e;
      padding: 12px 30px;
      border-radius: 50px;
      font-weight: 700;
      font-size: 16px;
    }
    
    /* Section Headers */
    .section {
      margin-bottom: 50px;
    }
    
    .section-header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 3px solid #F39C12;
    }
    
    .section-icon {
      width: 45px;
      height: 45px;
      background: linear-gradient(135deg, #F39C12 0%, #e67e22 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
    }
    
    .section-title {
      font-family: 'Poppins', sans-serif;
      font-size: 28px;
      font-weight: 700;
      color: #1a1a2e;
    }
    
    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .stat-card {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-radius: 16px;
      padding: 25px;
      text-align: center;
      border: 1px solid #e2e8f0;
    }
    
    .stat-value {
      font-family: 'Poppins', sans-serif;
      font-size: 36px;
      font-weight: 800;
      color: #F39C12;
      margin-bottom: 5px;
    }
    
    .stat-label {
      font-size: 14px;
      color: #64748b;
      font-weight: 500;
    }
    
    .stat-growth {
      font-size: 12px;
      color: #22c55e;
      font-weight: 600;
      margin-top: 5px;
    }
    
    /* Demographics */
    .demo-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 25px;
    }
    
    .demo-card {
      background: #ffffff;
      border: 2px solid #e2e8f0;
      border-radius: 16px;
      padding: 25px;
    }
    
    .demo-card h4 {
      font-size: 16px;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .demo-card h4 span {
      color: #F39C12;
    }
    
    .bar-item {
      margin-bottom: 15px;
    }
    
    .bar-label {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      margin-bottom: 6px;
    }
    
    .bar-label span:first-child {
      color: #64748b;
    }
    
    .bar-label span:last-child {
      font-weight: 600;
      color: #1a1a2e;
    }
    
    .bar {
      height: 10px;
      background: #e2e8f0;
      border-radius: 5px;
      overflow: hidden;
    }
    
    .bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #F39C12 0%, #e67e22 100%);
      border-radius: 5px;
    }
    
    /* Ad Formats Table */
    .formats-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    
    .formats-table th {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: white;
      padding: 15px 20px;
      text-align: left;
      font-weight: 600;
      font-size: 14px;
    }
    
    .formats-table th:first-child {
      border-radius: 12px 0 0 0;
    }
    
    .formats-table th:last-child {
      border-radius: 0 12px 0 0;
    }
    
    .formats-table td {
      padding: 15px 20px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 14px;
      color: #475569;
    }
    
    .formats-table tr:last-child td:first-child {
      border-radius: 0 0 0 12px;
    }
    
    .formats-table tr:last-child td:last-child {
      border-radius: 0 0 12px 0;
    }
    
    .formats-table tr:hover td {
      background: #f8fafc;
    }
    
    .format-name {
      font-weight: 600;
      color: #1a1a2e;
    }
    
    .format-price {
      color: #F39C12;
      font-weight: 700;
    }
    
    /* Packages */
    .packages-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    
    .package-card {
      background: #ffffff;
      border: 2px solid #e2e8f0;
      border-radius: 20px;
      padding: 30px;
      text-align: center;
      transition: all 0.3s ease;
    }
    
    .package-card.featured {
      border-color: #F39C12;
      background: linear-gradient(180deg, #fffbeb 0%, #ffffff 100%);
      transform: scale(1.02);
    }
    
    .package-card.featured::before {
      content: 'POPULAR';
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #F39C12 0%, #e67e22 100%);
      color: white;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
    }
    
    .package-name {
      font-family: 'Poppins', sans-serif;
      font-size: 20px;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 10px;
    }
    
    .package-price {
      font-family: 'Poppins', sans-serif;
      font-size: 36px;
      font-weight: 800;
      color: #F39C12;
      margin-bottom: 20px;
    }
    
    .package-features {
      list-style: none;
      text-align: left;
    }
    
    .package-features li {
      padding: 10px 0;
      border-bottom: 1px solid #f1f5f9;
      font-size: 14px;
      color: #475569;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .package-features li::before {
      content: '✓';
      color: #22c55e;
      font-weight: 700;
    }
    
    /* Contact Section */
    .contact-section {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border-radius: 24px;
      padding: 50px;
      color: white;
      text-align: center;
    }
    
    .contact-section h2 {
      font-family: 'Poppins', sans-serif;
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 15px;
    }
    
    .contact-section p {
      color: #9ca3af;
      margin-bottom: 30px;
      font-size: 16px;
    }
    
    .contact-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 30px;
      margin-top: 30px;
    }
    
    .contact-item {
      text-align: center;
    }
    
    .contact-icon {
      width: 50px;
      height: 50px;
      background: rgba(243, 156, 18, 0.2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 15px;
      font-size: 24px;
    }
    
    .contact-label {
      font-size: 12px;
      color: #9ca3af;
      margin-bottom: 5px;
    }
    
    .contact-value {
      font-weight: 600;
      color: white;
      font-size: 16px;
    }
    
    .contact-value a {
      color: #F39C12;
      text-decoration: none;
    }
    
    /* Footer */
    .footer {
      text-align: center;
      margin-top: 50px;
      padding-top: 30px;
      border-top: 1px solid #e2e8f0;
      color: #9ca3af;
      font-size: 14px;
    }
    
    .footer a {
      color: #F39C12;
      text-decoration: none;
    }
    
    /* Print Styles */
    @media print {
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .page {
        padding: 40px 30px;
      }
      
      .cover {
        padding: 60px 40px;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Cover Section -->
    <div class="cover">
      <div class="cover-content">
        <img src="${logoUrl}" alt="AfriVerse" class="logo" />
        <h1>Media <span>Kit</span></h1>
        <p class="tagline">Africa's Premier Digital Publication</p>
        <div class="year-badge">📊 2026 Edition</div>
      </div>
    </div>
    
    <!-- About Section -->
    <div class="section">
      <div class="section-header">
        <div class="section-icon">🌍</div>
        <h2 class="section-title">About AfriVerse</h2>
      </div>
      <p style="font-size: 16px; color: #475569; line-height: 1.8; margin-bottom: 20px;">
        AfriVerse is Africa's leading digital publication, delivering premium content across technology, business, entertainment, politics, sports, and lifestyle. We reach millions of engaged readers across the continent and diaspora, providing authentic African perspectives on stories that matter.
      </p>
      <p style="font-size: 16px; color: #475569; line-height: 1.8;">
        Our audience represents Africa's most influential consumers, decision-makers, and trendsetters—professionals with high purchasing power who trust AfriVerse as their primary source for quality journalism.
      </p>
    </div>
    
    <!-- Traffic Stats -->
    <div class="section">
      <div class="section-header">
        <div class="section-icon">📈</div>
        <h2 class="section-title">Traffic & Engagement</h2>
      </div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">2.4M+</div>
          <div class="stat-label">Monthly Unique Visitors</div>
          <div class="stat-growth">↑ 18% YoY</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">8.5M+</div>
          <div class="stat-label">Monthly Page Views</div>
          <div class="stat-growth">↑ 24% YoY</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">3:45</div>
          <div class="stat-label">Avg. Time on Site</div>
          <div class="stat-growth">↑ 12% YoY</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">4.2</div>
          <div class="stat-label">Pages per Session</div>
          <div class="stat-growth">↑ 8% YoY</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">72%</div>
          <div class="stat-label">Mobile Traffic</div>
          <div class="stat-growth">↑ 5% YoY</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">120+</div>
          <div class="stat-label">Countries Reached</div>
          <div class="stat-growth">Global Reach</div>
        </div>
      </div>
    </div>
    
    <!-- Demographics -->
    <div class="section">
      <div class="section-header">
        <div class="section-icon">👥</div>
        <h2 class="section-title">Audience Demographics</h2>
      </div>
      <div class="demo-grid">
        <div class="demo-card">
          <h4><span>📊</span> Age Distribution</h4>
          <div class="bar-item">
            <div class="bar-label"><span>18-24</span><span>28%</span></div>
            <div class="bar"><div class="bar-fill" style="width: 28%"></div></div>
          </div>
          <div class="bar-item">
            <div class="bar-label"><span>25-34</span><span>37%</span></div>
            <div class="bar"><div class="bar-fill" style="width: 37%"></div></div>
          </div>
          <div class="bar-item">
            <div class="bar-label"><span>35-44</span><span>22%</span></div>
            <div class="bar"><div class="bar-fill" style="width: 22%"></div></div>
          </div>
          <div class="bar-item">
            <div class="bar-label"><span>45+</span><span>13%</span></div>
            <div class="bar"><div class="bar-fill" style="width: 13%"></div></div>
          </div>
        </div>
        <div class="demo-card">
          <h4><span>🌍</span> Geographic Distribution</h4>
          <div class="bar-item">
            <div class="bar-label"><span>Nigeria</span><span>45%</span></div>
            <div class="bar"><div class="bar-fill" style="width: 45%"></div></div>
          </div>
          <div class="bar-item">
            <div class="bar-label"><span>Ghana</span><span>15%</span></div>
            <div class="bar"><div class="bar-fill" style="width: 15%"></div></div>
          </div>
          <div class="bar-item">
            <div class="bar-label"><span>Kenya</span><span>12%</span></div>
            <div class="bar"><div class="bar-fill" style="width: 12%"></div></div>
          </div>
          <div class="bar-item">
            <div class="bar-label"><span>South Africa</span><span>10%</span></div>
            <div class="bar"><div class="bar-fill" style="width: 10%"></div></div>
          </div>
          <div class="bar-item">
            <div class="bar-label"><span>Other Africa</span><span>10%</span></div>
            <div class="bar"><div class="bar-fill" style="width: 10%"></div></div>
          </div>
          <div class="bar-item">
            <div class="bar-label"><span>Diaspora</span><span>8%</span></div>
            <div class="bar"><div class="bar-fill" style="width: 8%"></div></div>
          </div>
        </div>
        <div class="demo-card">
          <h4><span>👤</span> Gender Split</h4>
          <div style="display: flex; justify-content: center; gap: 40px; padding: 20px 0;">
            <div style="text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">👨</div>
              <div style="font-size: 28px; font-weight: 800; color: #F39C12;">52%</div>
              <div style="font-size: 14px; color: #64748b;">Male</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">👩</div>
              <div style="font-size: 28px; font-weight: 800; color: #F39C12;">48%</div>
              <div style="font-size: 14px; color: #64748b;">Female</div>
            </div>
          </div>
        </div>
        <div class="demo-card">
          <h4><span>🎯</span> Key Interests</h4>
          <ul style="list-style: none; padding: 0;">
            <li style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #475569;">✓ Technology & Innovation</li>
            <li style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #475569;">✓ Business & Finance</li>
            <li style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #475569;">✓ Entertainment & Culture</li>
            <li style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #475569;">✓ Politics & Current Affairs</li>
            <li style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #475569;">✓ Sports</li>
            <li style="padding: 8px 0; color: #475569;">✓ Lifestyle & Fashion</li>
          </ul>
        </div>
      </div>
    </div>
    
    <!-- Ad Formats -->
    <div class="section">
      <div class="section-header">
        <div class="section-icon">📐</div>
        <h2 class="section-title">Advertising Formats & Pricing</h2>
      </div>
      <table class="formats-table">
        <thead>
          <tr>
            <th>Format</th>
            <th>Dimensions</th>
            <th>Placement</th>
            <th>CPM Rate</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="format-name">Billboard</td>
            <td>970×250</td>
            <td>Top of page, maximum visibility</td>
            <td class="format-price">$12-18</td>
          </tr>
          <tr>
            <td class="format-name">Leaderboard</td>
            <td>728×90</td>
            <td>Header & in-content</td>
            <td class="format-price">$8-12</td>
          </tr>
          <tr>
            <td class="format-name">Medium Rectangle</td>
            <td>300×250</td>
            <td>Sidebar, high engagement</td>
            <td class="format-price">$10-15</td>
          </tr>
          <tr>
            <td class="format-name">Half Page</td>
            <td>300×600</td>
            <td>Sticky sidebar</td>
            <td class="format-price">$15-22</td>
          </tr>
          <tr>
            <td class="format-name">In-Article</td>
            <td>728×90 / Responsive</td>
            <td>Within article content</td>
            <td class="format-price">$10-14</td>
          </tr>
          <tr>
            <td class="format-name">Mobile Banner</td>
            <td>320×50</td>
            <td>Mobile header/footer</td>
            <td class="format-price">$6-10</td>
          </tr>
          <tr>
            <td class="format-name">Native Content</td>
            <td>Custom</td>
            <td>Integrated with editorial</td>
            <td class="format-price">Custom</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Sponsored Content Packages -->
    <div class="section">
      <div class="section-header">
        <div class="section-icon">📦</div>
        <h2 class="section-title">Sponsored Content Packages</h2>
      </div>
      <div class="packages-grid">
        <div class="package-card">
          <div class="package-name">Sponsored Article</div>
          <div class="package-price">$499</div>
          <ul class="package-features">
            <li>Full-length branded article</li>
            <li>Homepage feature (24 hours)</li>
            <li>Social media promotion (3 posts)</li>
            <li>Newsletter inclusion</li>
            <li>30-day hosting</li>
          </ul>
        </div>
        <div class="package-card featured" style="position: relative;">
          <div class="package-name">Content Series</div>
          <div class="package-price">$1,999</div>
          <ul class="package-features">
            <li>4 sponsored articles</li>
            <li>Dedicated landing page</li>
            <li>Category page feature</li>
            <li>Social campaign (12 posts)</li>
            <li>Newsletter spotlight</li>
            <li>90-day hosting</li>
          </ul>
        </div>
        <div class="package-card">
          <div class="package-name">Brand Takeover</div>
          <div class="package-price">$4,999</div>
          <ul class="package-features">
            <li>Homepage takeover (1 week)</li>
            <li>6 sponsored articles</li>
            <li>Custom content hub</li>
            <li>Video integration</li>
            <li>Full social campaign</li>
            <li>Dedicated account manager</li>
          </ul>
        </div>
      </div>
    </div>
    
    <!-- Why Advertise -->
    <div class="section">
      <div class="section-header">
        <div class="section-icon">⭐</div>
        <h2 class="section-title">Why Advertise with AfriVerse?</h2>
      </div>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
        <div style="background: #f8fafc; border-radius: 16px; padding: 25px;">
          <h4 style="color: #1a1a2e; font-weight: 700; margin-bottom: 10px; display: flex; align-items: center; gap: 10px;">
            <span style="color: #F39C12;">🎯</span> Premium Audience
          </h4>
          <p style="color: #64748b; font-size: 14px;">Reach Africa's most influential professionals, entrepreneurs, and decision-makers.</p>
        </div>
        <div style="background: #f8fafc; border-radius: 16px; padding: 25px;">
          <h4 style="color: #1a1a2e; font-weight: 700; margin-bottom: 10px; display: flex; align-items: center; gap: 10px;">
            <span style="color: #F39C12;">📊</span> Brand Safe Environment
          </h4>
          <p style="color: #64748b; font-size: 14px;">Quality editorial standards ensure your brand appears alongside trusted content.</p>
        </div>
        <div style="background: #f8fafc; border-radius: 16px; padding: 25px;">
          <h4 style="color: #1a1a2e; font-weight: 700; margin-bottom: 10px; display: flex; align-items: center; gap: 10px;">
            <span style="color: #F39C12;">📱</span> Multi-Platform Reach
          </h4>
          <p style="color: #64748b; font-size: 14px;">Web, mobile, social media, and newsletter—reach your audience wherever they are.</p>
        </div>
        <div style="background: #f8fafc; border-radius: 16px; padding: 25px;">
          <h4 style="color: #1a1a2e; font-weight: 700; margin-bottom: 10px; display: flex; align-items: center; gap: 10px;">
            <span style="color: #F39C12;">🤝</span> Dedicated Support
          </h4>
          <p style="color: #64748b; font-size: 14px;">Personal account manager and full campaign optimization for all partnerships.</p>
        </div>
      </div>
    </div>
    
    <!-- Contact Section -->
    <div class="contact-section">
      <h2>Ready to Partner with AfriVerse?</h2>
      <p>Our advertising team is ready to help you create a customized campaign that meets your objectives.</p>
      <div class="contact-grid">
        <div class="contact-item">
          <div class="contact-icon">✉️</div>
          <div class="contact-label">Email</div>
          <div class="contact-value"><a href="mailto:advertise@afriverse.africa">advertise@afriverse.africa</a></div>
        </div>
        <div class="contact-item">
          <div class="contact-icon">📞</div>
          <div class="contact-label">Phone</div>
          <div class="contact-value"><a href="tel:+2349122719293">+234 91 227 19293</a></div>
        </div>
        <div class="contact-item">
          <div class="contact-icon">🌐</div>
          <div class="contact-label">Website</div>
          <div class="contact-value"><a href="${siteUrl}">${siteUrl.replace('https://', '')}</a></div>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p>© ${new Date().getFullYear()} AfriVerse. All rights reserved.</p>
      <p style="margin-top: 5px;"><a href="${siteUrl}">${siteUrl}</a></p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': 'attachment; filename="AfriVerse-MediaKit-2026.html"',
    },
  });
}
