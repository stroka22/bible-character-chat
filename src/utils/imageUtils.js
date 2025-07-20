export const generateFallbackAvatar = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
};
export const getSafeAvatarUrl = (name, url) => {
    if (!url)
        return generateFallbackAvatar(name);
    try {
        const { hostname } = new URL(url);
        // Explicitly allow Unsplash-hosted images (and sub-domains).
        const allowedHosts = ['images.unsplash.com', 'unsplash.com'];
        const isAllowed = allowedHosts.includes(hostname) || hostname.endsWith('.unsplash.com');

        if (isAllowed) {
            return url;
        }

        // Block known placeholders / private hosts
        if (hostname === 'example.com' ||
            hostname.endsWith('.example.com') ||
            hostname === 'localhost') {
            return generateFallbackAvatar(name);
        }

        // Fallback for any other un-recognised host
        return generateFallbackAvatar(name);
    }
    catch {
        return generateFallbackAvatar(name);
    }
};
