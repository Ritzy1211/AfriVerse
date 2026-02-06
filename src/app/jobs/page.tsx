import { Metadata } from 'next';
import JobBoard from './JobBoard';

export const metadata: Metadata = {
  title: 'African Tech Jobs | AfriVerse Careers',
  description: 'Find the best tech jobs across Africa. Remote opportunities, startups, and established companies hiring in Nigeria, Kenya, South Africa, Ghana, and more.',
  keywords: ['African jobs', 'tech jobs Africa', 'remote jobs Africa', 'Nigeria jobs', 'Kenya jobs', 'startup jobs'],
};

export default function JobsPage() {
  return <JobBoard />;
}
