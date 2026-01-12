import { UserPreferences } from '@/types';

const PREFERENCES_KEY = 'urban_grid_preferences';

const defaultPreferences: UserPreferences = {
  interests: [],
  darkMode: false,
  fontSize: 'medium',
  language: 'en',
  savedArticles: [],
  readingHistory: [],
};

/**
 * Get user preferences from localStorage (not cookies to avoid 431 errors)
 */
export function getPreferences(): UserPreferences {
  if (typeof window === 'undefined') {
    return defaultPreferences;
  }
  
  const stored = localStorage.getItem(PREFERENCES_KEY);
  
  if (stored) {
    try {
      return { ...defaultPreferences, ...JSON.parse(stored) };
    } catch (e) {
      console.error('Failed to parse preferences:', e);
    }
  }
  
  return defaultPreferences;
}

/**
 * Save user preferences to localStorage
 */
export function savePreferences(preferences: Partial<UserPreferences>): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  const current = getPreferences();
  const updated = { ...current, ...preferences };
  
  // Limit arrays to prevent storage bloat
  if (updated.savedArticles.length > 100) {
    updated.savedArticles = updated.savedArticles.slice(0, 100);
  }
  if (updated.readingHistory.length > 50) {
    updated.readingHistory = updated.readingHistory.slice(0, 50);
  }
  
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
}

/**
 * Update user interests
 */
export function updateInterests(interests: string[]): void {
  savePreferences({ interests });
}

/**
 * Toggle dark mode
 */
export function toggleDarkMode(): boolean {
  const current = getPreferences();
  const darkMode = !current.darkMode;
  savePreferences({ darkMode });
  return darkMode;
}

/**
 * Save article for later
 */
export function saveArticle(articleId: string): void {
  const prefs = getPreferences();
  const savedArticles = [...prefs.savedArticles];
  
  if (!savedArticles.includes(articleId)) {
    savedArticles.push(articleId);
    savePreferences({ savedArticles });
  }
}

/**
 * Remove saved article
 */
export function unsaveArticle(articleId: string): void {
  const prefs = getPreferences();
  const savedArticles = prefs.savedArticles.filter(id => id !== articleId);
  savePreferences({ savedArticles });
}

/**
 * Track article read
 */
export function trackArticleRead(articleId: string): void {
  const prefs = getPreferences();
  const readingHistory = [articleId, ...prefs.readingHistory.filter(id => id !== articleId)].slice(0, 50);
  savePreferences({ readingHistory });
}

/**
 * Check if article is saved
 */
export function isArticleSaved(articleId: string): boolean {
  const prefs = getPreferences();
  return prefs.savedArticles.includes(articleId);
}
