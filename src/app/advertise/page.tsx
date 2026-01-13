import { redirect } from 'next/navigation';

/**
 * Redirects /advertise to /media-kit
 * The media-kit page contains all advertising information
 */
export default function AdvertisePage() {
  redirect('/media-kit');
}
