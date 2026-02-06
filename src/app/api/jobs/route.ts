import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Sample jobs for initial data (in production, these would come from database)
const sampleJobs = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    company: 'Paystack',
    location: 'Lagos, Nigeria',
    type: 'Full-time',
    remote: true,
    salary: '$80,000 - $120,000',
    description: 'Join Paystack to build the future of payments in Africa. We are looking for experienced engineers to work on our core payment infrastructure.',
    requirements: ['5+ years experience', 'Node.js/Python', 'Distributed systems', 'Fintech experience preferred'],
    category: 'Technology',
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://paystack.com/careers',
    logo: 'https://logo.clearbit.com/paystack.com',
    featured: true,
  },
  {
    id: '2',
    title: 'Product Designer',
    company: 'Flutterwave',
    location: 'Nairobi, Kenya',
    type: 'Full-time',
    remote: true,
    salary: '$60,000 - $90,000',
    description: 'Design beautiful, intuitive experiences for millions of users across Africa.',
    requirements: ['3+ years product design experience', 'Figma proficiency', 'Mobile-first design', 'User research skills'],
    category: 'Design',
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://flutterwave.com/careers',
    logo: 'https://logo.clearbit.com/flutterwave.com',
    featured: true,
  },
  {
    id: '3',
    title: 'Data Analyst',
    company: 'Jumia',
    location: 'Cairo, Egypt',
    type: 'Full-time',
    remote: false,
    salary: '$40,000 - $60,000',
    description: 'Analyze data to drive business decisions for Africa\'s leading e-commerce platform.',
    requirements: ['SQL expertise', 'Python/R', 'Tableau/Power BI', 'E-commerce experience'],
    category: 'Data',
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://jumia.com/careers',
    logo: 'https://logo.clearbit.com/jumia.com',
    featured: false,
  },
  {
    id: '4',
    title: 'Content Writer',
    company: 'TechCabal',
    location: 'Remote - Africa',
    type: 'Full-time',
    remote: true,
    salary: '$30,000 - $45,000',
    description: 'Write compelling stories about Africa\'s tech ecosystem for our growing audience.',
    requirements: ['Excellent writing skills', 'Tech industry knowledge', 'SEO basics', 'Social media savvy'],
    category: 'Media',
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://techcabal.com/careers',
    logo: 'https://logo.clearbit.com/techcabal.com',
    featured: false,
  },
  {
    id: '5',
    title: 'Mobile Developer (React Native)',
    company: 'Chipper Cash',
    location: 'Accra, Ghana',
    type: 'Full-time',
    remote: true,
    salary: '$70,000 - $100,000',
    description: 'Build mobile apps that enable seamless cross-border payments across Africa.',
    requirements: ['React Native experience', 'iOS/Android publishing', 'Payment integrations', 'Fintech background'],
    category: 'Technology',
    postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://chippercash.com/careers',
    logo: 'https://logo.clearbit.com/chippercash.com',
    featured: true,
  },
  {
    id: '6',
    title: 'Marketing Manager',
    company: 'Safaricom',
    location: 'Nairobi, Kenya',
    type: 'Full-time',
    remote: false,
    salary: '$50,000 - $70,000',
    description: 'Lead marketing campaigns for M-Pesa and other Safaricom products.',
    requirements: ['5+ years marketing experience', 'Telecom/fintech background', 'Team leadership', 'Campaign management'],
    category: 'Marketing',
    postedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://safaricom.co.ke/careers',
    logo: 'https://logo.clearbit.com/safaricom.co.ke',
    featured: false,
  },
  {
    id: '7',
    title: 'DevOps Engineer',
    company: 'Interswitch',
    location: 'Lagos, Nigeria',
    type: 'Full-time',
    remote: true,
    salary: '$60,000 - $85,000',
    description: 'Maintain and scale infrastructure for Africa\'s leading payment gateway.',
    requirements: ['AWS/GCP', 'Kubernetes', 'CI/CD pipelines', 'Security best practices'],
    category: 'Technology',
    postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://interswitchgroup.com/careers',
    logo: 'https://logo.clearbit.com/interswitchgroup.com',
    featured: false,
  },
  {
    id: '8',
    title: 'UX Researcher',
    company: 'Andela',
    location: 'Remote - Africa',
    type: 'Contract',
    remote: true,
    salary: '$45,000 - $65,000',
    description: 'Conduct user research to improve talent platform experience.',
    requirements: ['User research methods', 'Usability testing', 'Data analysis', 'Communication skills'],
    category: 'Design',
    postedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://andela.com/careers',
    logo: 'https://logo.clearbit.com/andela.com',
    featured: false,
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const remote = searchParams.get('remote');
  const search = searchParams.get('search');
  const featured = searchParams.get('featured');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  let filteredJobs = [...sampleJobs];

  // Apply filters
  if (category && category !== 'all') {
    filteredJobs = filteredJobs.filter(job => job.category.toLowerCase() === category.toLowerCase());
  }

  if (remote === 'true') {
    filteredJobs = filteredJobs.filter(job => job.remote);
  }

  if (featured === 'true') {
    filteredJobs = filteredJobs.filter(job => job.featured);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filteredJobs = filteredJobs.filter(job => 
      job.title.toLowerCase().includes(searchLower) ||
      job.company.toLowerCase().includes(searchLower) ||
      job.description.toLowerCase().includes(searchLower) ||
      job.location.toLowerCase().includes(searchLower)
    );
  }

  // Sort by date (newest first), featured jobs at top
  filteredJobs.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
  });

  // Pagination
  const total = filteredJobs.length;
  const paginatedJobs = filteredJobs.slice(offset, offset + limit);

  // Get categories for filter
  const categories = [...new Set(sampleJobs.map(job => job.category))];

  return NextResponse.json({
    success: true,
    jobs: paginatedJobs,
    total,
    limit,
    offset,
    categories,
    hasMore: offset + limit < total,
  });
}

// POST - Submit a new job (for admin/employers)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const required = ['title', 'company', 'location', 'type', 'description', 'category', 'applyUrl'];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // In production, save to database
    const newJob = {
      id: Date.now().toString(),
      ...body,
      postedAt: new Date().toISOString(),
      featured: false,
    };

    return NextResponse.json({
      success: true,
      job: newJob,
      message: 'Job submitted for review',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create job' },
      { status: 500 }
    );
  }
}
