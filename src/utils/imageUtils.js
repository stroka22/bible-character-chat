export const generateFallbackAvatar = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
};
export const getSafeAvatarUrl = (name, url) => {
    if (!url)
        return generateFallbackAvatar(name);
    try {
        const { hostname } = new URL(url);
        // Explicitly allow Unsplash and Imgur hosted images (and sub-domains).
        const allowedHosts = [
            // Unsplash
            'images.unsplash.com',
            'unsplash.com',
            // Imgur
            'imgur.com',
            'i.imgur.com',
            'm.imgur.com',
            's.imgur.com'
        ];

        const isAllowed =
            allowedHosts.includes(hostname) ||
            hostname.endsWith('.unsplash.com') ||
            hostname.endsWith('.imgur.com');

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
