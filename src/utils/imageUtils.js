export const generateFallbackAvatar = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
};
export const getSafeAvatarUrl = (name, url) => {
    if (!url)
        return generateFallbackAvatar(name);
    try {
        const { protocol, hostname } = new URL(url);

        // Reject non-HTTPS images to avoid mixed-content issues on mobile
        if (protocol !== 'https:') {
            return generateFallbackAvatar(name);
        }
        // Explicitly allow Unsplash and Imgur hosted images (and sub-domains).
        const allowedHosts = [
        const allowedExactHosts = [
            'images.unsplash.com',
            'unsplash.com',
            // Imgur
            'imgur.com',
            'i.imgur.com',
            'm.imgur.com',
            's.imgur.com'
            's.imgur.com',
            // FaithTalkAI own domain
            'faithtalkai.com',
            'www.faithtalkai.com',
            // Cloudinary (common managed hosting)
            'res.cloudinary.com',
            // Amazon S3 generic endpoint
            's3.amazonaws.com'

        const isAllowed =
        // Hosts we allow by suffix (any sub-domain)
        const allowedSuffixes = [
            '.unsplash.com',
            '.imgur.com',
            '.supabase.co',
            '.s3.amazonaws.com'
        ];

        const isAllowed =
            allowedExactHosts.includes(hostname) ||
            allowedSuffixes.some((suffix) => hostname.endsWith(suffix));
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
