/**
 * Image utility functions for handling avatars and other images
 * in the Bible Character Chat application.
 */

/**
 * Generates a fallback avatar URL using the ui-avatars.com service.
 * Creates a placeholder image with the initials of the provided name
 * and a random background color.
 * 
 * @param name - The name to use for generating the avatar (will use initials)
 * @returns A URL to a generated avatar image
 */
export const generateFallbackAvatar = (name: string): string => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name,
  )}&background=random`;
};

/**
 * Returns a "safe" avatar URL by validating and sanitizing the input URL.
 * - Rejects obvious placeholders like `example.com/*`
 * - Falls back to the ui-avatar generator when URL is missing or invalid
 * - Catches and handles malformed URLs
 * 
 * @param name - The name to use for fallback avatar generation
 * @param url - The URL to validate and sanitize (optional)
 * @returns A safe URL to use for avatars
 */
export const getSafeAvatarUrl = (name: string, url?: string | null): string => {
  // If no URL provided, generate a fallback
  if (!url) return generateFallbackAvatar(name);

  try {
    // Parse the URL to check its validity and extract the hostname
    const { hostname } = new URL(url);
    
    // Reject common placeholder domains
    if (
      hostname === 'example.com' ||
      hostname.endsWith('.example.com') ||
      hostname === 'localhost'
    ) {
      return generateFallbackAvatar(name);
    }
    
    // URL is valid and not a placeholder
    return url;
  } catch {
    // URL is malformed, generate a fallback
    return generateFallbackAvatar(name);
  }
};
