export const generateFallbackAvatar = (name) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
};

export const getSafeAvatarUrl = (name, url) => {
  if (!url) return generateFallbackAvatar(name);
  try {
    const u = new URL(url);
    // Allow any HTTPS image to avoid mixed-content issues on mobile/desktop
    if (u.protocol === 'https:') return url;
    return generateFallbackAvatar(name);
  } catch {
    return generateFallbackAvatar(name);
  }
};
