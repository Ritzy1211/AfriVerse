'use client';

import { Target, Eye, Heart, Globe } from 'lucide-react';
import FloatingCard from './FloatingCard';

const values = [
  {
    icon: Target,
    title: 'Accuracy First',
    description: 'Every story is fact-checked and verified before publication. We prioritize truth over speed.',
  },
  {
    icon: Eye,
    title: 'Transparency',
    description: 'Clear labeling of sponsored content, honest corrections, and open editorial policies.',
  },
  {
    icon: Heart,
    title: 'Community Focus',
    description: 'We serve our readers, not algorithms. Your interests drive our content decisions.',
  },
  {
    icon: Globe,
    title: 'African First, Global Reach',
    description: 'Rooted in African culture while connecting with audiences worldwide.',
  },
];

export default function ValuesSection() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-headline font-bold text-gray-900 dark:text-white mb-12 text-center">
          Our Values
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <FloatingCard 
              key={value.title} 
              delay={(values.length - 1 - index) * 150}
              className="h-full"
            >
              <div className="flex flex-col h-full">
                {/* Icon container with gradient background */}
                <div className="w-14 h-14 bg-gradient-to-br from-brand-accent/20 to-brand-accent/5 rounded-xl flex items-center justify-center mb-5 transform transition-transform duration-300 group-hover:scale-110">
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-accent to-cyan-400 rounded-lg flex items-center justify-center shadow-lg shadow-brand-accent/25">
                    <value.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                
                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  {value.title}
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            </FloatingCard>
          ))}
        </div>
      </div>
    </section>
  );
}
