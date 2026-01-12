'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  AlertTriangle,
  Image as ImageIcon,
  Quote,
  Hash,
  Clock,
  Send,
} from 'lucide-react';

export default function GuidelinesPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/writer"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Writer Guidelines</h1>
          <p className="text-slate-500 text-sm">Standards and best practices for AfriVerse contributors</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Article Structure */}
        <section className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Article Structure</h2>
          </div>
          
          <div className="space-y-4 text-slate-600">
            <div>
              <h3 className="font-medium text-slate-900 mb-2">Headline</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Keep headlines under 70 characters for SEO</li>
                <li>Be specific and descriptive</li>
                <li>Avoid clickbait or misleading titles</li>
                <li>Use active voice when possible</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-slate-900 mb-2">Summary/Excerpt</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>2-3 sentences maximum</li>
                <li>Summarize the key point of the article</li>
                <li>This appears in search results and social shares</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-slate-900 mb-2">Body Content</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Minimum 800 words for in-depth articles</li>
                <li>Use short paragraphs (3-4 sentences max)</li>
                <li>Include subheadings every 300-400 words</li>
                <li>Lead with the most important information</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Writing Standards */}
        <section className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Writing Standards</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-slate-900 mb-2 text-green-600">✓ Do</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Verify all facts and statistics
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Cite sources for claims and data
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Use clear, simple language
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Include multiple perspectives
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Proofread before submitting
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-slate-900 mb-2 text-red-600">✗ Don't</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  Plagiarize or copy content
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  Use unverified rumors as facts
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  Include personal opinions in news
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  Use sensationalist language
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  Submit unfinished work
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Images */}
        <section className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Image Guidelines</h2>
          </div>
          
          <div className="space-y-4 text-slate-600 text-sm">
            <p>
              <strong className="text-slate-900">Writers suggest images</strong> — final selection is done by the editorial team to ensure licensing compliance.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Suggest relevant images with URLs or descriptions</li>
              <li>Include source/attribution information</li>
              <li>Do not use copyrighted images without permission</li>
              <li>Preferred sources: Reuters, AFP, AP, licensed stock photos</li>
              <li>Editorial team will handle final image selection and licensing</li>
            </ul>
          </div>
        </section>

        {/* Quotes & Sources */}
        <section className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Quote className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Quotes & Sources</h2>
          </div>
          
          <div className="space-y-4 text-slate-600 text-sm">
            <ul className="list-disc list-inside space-y-1">
              <li>Always attribute quotes to specific sources</li>
              <li>Verify quotes are accurate before publishing</li>
              <li>Protect confidential sources when necessary</li>
              <li>Include full names and titles on first reference</li>
              <li>Use "said" instead of editorializing verbs</li>
            </ul>
          </div>
        </section>

        {/* Categories & Tags */}
        <section className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <Hash className="w-5 h-5 text-slate-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Categories & Tags</h2>
          </div>
          
          <div className="space-y-4 text-slate-600 text-sm">
            <p>
              <strong className="text-slate-900">Choose the most relevant category</strong> for your article. Tags help readers find related content.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-slate-900 mb-2">Categories</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Politics - Government, elections, policy</li>
                  <li>Business - Economy, finance, trade</li>
                  <li>Technology - Innovation, startups, digital</li>
                  <li>Entertainment - Music, film, culture</li>
                  <li>Sports - Football, athletics, tournaments</li>
                  <li>Lifestyle - Fashion, travel, wellness</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-slate-900 mb-2">Tags</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Use 3-5 relevant tags per article</li>
                  <li>Include country/region names</li>
                  <li>Add key people and organizations</li>
                  <li>Use existing tags when possible</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Submission Process */}
        <section className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Send className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Submission Process</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">1</div>
                <div className="w-0.5 h-full bg-slate-200 my-2"></div>
              </div>
              <div className="flex-1 pb-6">
                <h3 className="font-medium text-slate-900">Write Draft</h3>
                <p className="text-sm text-slate-600">Create your article with headline, body, and suggested images</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">2</div>
                <div className="w-0.5 h-full bg-slate-200 my-2"></div>
              </div>
              <div className="flex-1 pb-6">
                <h3 className="font-medium text-slate-900">Submit for Review</h3>
                <p className="text-sm text-slate-600">Click "Submit for Review" when your article is ready. You cannot edit after submission.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">3</div>
                <div className="w-0.5 h-full bg-slate-200 my-2"></div>
              </div>
              <div className="flex-1 pb-6">
                <h3 className="font-medium text-slate-900">Editorial Review</h3>
                <p className="text-sm text-slate-600">Editors review your article. They may approve, request changes, or reject.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">4</div>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-slate-900">Publication</h3>
                <p className="text-sm text-slate-600">Approved articles are published by the editorial team. You'll be notified.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Turnaround Times */}
        <section className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-blue-900">Expected Turnaround</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white rounded-lg p-4">
              <p className="font-bold text-2xl text-blue-600">24-48h</p>
              <p className="text-slate-600">Initial review</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="font-bold text-2xl text-blue-600">24h</p>
              <p className="text-slate-600">Revision requests</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="font-bold text-2xl text-blue-600">Same day</p>
              <p className="text-slate-600">Breaking news</p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
          <h3 className="font-medium text-slate-900 mb-2">Need Help?</h3>
          <p className="text-sm text-slate-600">
            Contact the editorial team at{' '}
            <a href="mailto:editorial@afriverse.com" className="text-primary hover:underline">
              editorial@afriverse.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
