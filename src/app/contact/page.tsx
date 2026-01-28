'use client';

import { useState } from 'react';
import { Mail, Phone, Send, MessageSquare, Briefcase, Newspaper } from 'lucide-react';
import type { Metadata } from 'next';

const contactReasons = [
  { id: 'general', label: 'General Inquiry', icon: MessageSquare },
  { id: 'advertising', label: 'Advertising', icon: Briefcase },
  { id: 'editorial', label: 'Editorial/Tips', icon: Newspaper },
  { id: 'support', label: 'Technical Support', icon: Mail },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    reason: 'general',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Contact Form & Info */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-headline font-bold text-gray-900 dark:text-white mb-4">
              Get in Touch
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Have a question, tip, or want to partner with us? We'd love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-8">
                <h2 className="text-2xl font-headline font-bold text-gray-900 dark:text-white mb-6">
                  Send Us a Message
                </h2>

                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Thank you for reaching out. We'll get back to you within 24 hours.
                    </p>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({
                          name: '',
                          email: '',
                          reason: 'general',
                          subject: '',
                          message: '',
                        });
                      }}
                      className="text-brand-accent hover:underline"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Contact Reason */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        What's this about?
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {contactReasons.map((reason) => (
                          <button
                            key={reason.id}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, reason: reason.id }))}
                            className={`flex flex-col items-center p-4 rounded-lg border-2 transition-colors ${
                              formData.reason === reason.id
                                ? 'border-brand-accent bg-brand-accent/10'
                                : 'border-gray-200 dark:border-gray-700 hover:border-brand-accent/50'
                            }`}
                          >
                            <reason.icon
                              className={`w-6 h-6 mb-2 ${
                                formData.reason === reason.id
                                  ? 'text-brand-accent'
                                  : 'text-gray-400'
                              }`}
                            />
                            <span
                              className={`text-sm ${
                                formData.reason === reason.id
                                  ? 'text-brand-accent font-medium'
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}
                            >
                              {reason.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Name & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          Your Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                        placeholder="How can we help?"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-accent focus:border-transparent resize-none"
                        placeholder="Tell us more..."
                      />
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
                        {error}
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full md:w-auto px-8 py-3 bg-brand-accent text-white rounded-lg font-medium hover:bg-brand-accent/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              {/* Quick Contact */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Quick Contact
                </h3>
                <div className="space-y-4">
                  <a
                    href="mailto:tips@afriverse.africa"
                    className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-brand-accent transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    tips@afriverse.africa
                  </a>
                  <a
                    href="tel:+2348109561020"
                    className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-brand-accent transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    +234 810 956 1020
                  </a>
                </div>
              </div>

              {/* Response Time */}
              <div className="bg-gradient-to-br from-brand-accent to-brand-secondary rounded-lg p-6 text-white">
                <h3 className="font-bold mb-2">Response Time</h3>
                <p className="text-sm opacity-90">
                  We typically respond within 24 hours during business days. For urgent matters, please call us directly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
