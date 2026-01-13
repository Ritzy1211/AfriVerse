'use client';

/**
 * Sanity Studio embedded in Next.js
 * Access at: /studio
 */

import { NextStudio } from 'next-sanity/studio';
import config from '../../../../sanity.config';

export default function StudioPage() {
  return <NextStudio config={config} />;
}
