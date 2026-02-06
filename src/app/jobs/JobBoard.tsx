'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Clock, 
  DollarSign, 
  ExternalLink,
  Filter,
  Wifi,
  Building2,
  Star,
  Loader2,
  ChevronRight
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  remote: boolean;
  salary: string;
  description: string;
  requirements: string[];
  category: string;
  postedAt: string;
  applyUrl: string;
  logo?: string;
  featured: boolean;
}

export default function JobBoard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.set('category', category);
      if (remoteOnly) params.set('remote', 'true');
      if (search) params.set('search', search);

      const response = await fetch(`/api/jobs?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setJobs(data.jobs);
        setCategories(data.categories);
        if (data.jobs.length > 0 && !selectedJob) {
          setSelectedJob(data.jobs[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchJobs();
  }, [category, remoteOnly]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Posted today';
    if (diffDays === 2) return 'Posted yesterday';
    if (diffDays <= 7) return `Posted ${diffDays} days ago`;
    return `Posted ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            🚀 African Tech Jobs
          </h1>
          <p className="text-lg opacity-90 mb-8 max-w-2xl">
            Discover amazing career opportunities at Africa's top tech companies, startups, and remote-friendly employers.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 max-w-3xl">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search jobs, companies, or keywords..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3 bg-white text-orange-500 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Search Jobs
            </button>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm sticky top-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </h3>

              {/* Category Filter */}
              <div className="mb-4">
                <label className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Remote Filter */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remoteOnly}
                  onChange={(e) => setRemoteOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <Wifi className="w-4 h-4" />
                  Remote Only
                </span>
              </label>

              {/* Post a Job CTA */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href="/jobs/post"
                  className="block w-full text-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                >
                  Post a Job - $99
                </Link>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                  Reach 100K+ African professionals
                </p>
              </div>
            </div>
          </div>

          {/* Job Listings */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600 dark:text-gray-400">
                {loading ? 'Loading...' : `${jobs.length} jobs found`}
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Job List */}
                <div className="space-y-3">
                  {jobs.map(job => (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm cursor-pointer transition-all hover:shadow-md border-2 ${
                        selectedJob?.id === job.id 
                          ? 'border-orange-500' 
                          : 'border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {job.logo ? (
                          <img
                            src={job.logo}
                            alt={job.company}
                            className="w-12 h-12 rounded-lg object-contain bg-gray-100"
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=f97316&color=fff`;
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-orange-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                                {job.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {job.company}
                              </p>
                            </div>
                            {job.featured && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {job.location}
                            </span>
                            {job.remote && (
                              <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                                Remote
                              </span>
                            )}
                            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                              {job.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Job Details Panel */}
                {selectedJob && (
                  <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm sticky top-4 h-fit">
                    <div className="flex items-start gap-4 mb-4">
                      {selectedJob.logo ? (
                        <img
                          src={selectedJob.logo}
                          alt={selectedJob.company}
                          className="w-16 h-16 rounded-xl object-contain bg-gray-100"
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedJob.company)}&background=f97316&color=fff`;
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                          <Building2 className="w-8 h-8 text-orange-500" />
                        </div>
                      )}
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                          {selectedJob.title}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                          {selectedJob.company}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                        <MapPin className="w-4 h-4" />
                        {selectedJob.location}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                        <Briefcase className="w-4 h-4" />
                        {selectedJob.type}
                      </span>
                      {selectedJob.salary && (
                        <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                          <DollarSign className="w-4 h-4" />
                          {selectedJob.salary}
                        </span>
                      )}
                      {selectedJob.remote && (
                        <span className="flex items-center gap-1 text-sm text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                          <Wifi className="w-4 h-4" />
                          Remote
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDate(selectedJob.postedAt)}
                    </p>

                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {selectedJob.description}
                      </p>
                    </div>

                    {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                      <div className="mb-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Requirements</h3>
                        <ul className="space-y-1">
                          {selectedJob.requirements.map((req, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <ChevronRight className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <a
                      href={selectedJob.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
                    >
                      Apply Now
                      <ExternalLink className="w-4 h-4 inline ml-2" />
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!loading && jobs.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No jobs found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your filters or search terms
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
