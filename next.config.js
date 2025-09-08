/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: true,
    },
    images: {
        domains: [
            'i.postimg.cc',       // Postimg
            'imgur.com',          // Imgur
            'i.imgur.com',        // Imgur direct links
            'cloudinary.com',     // Cloudinary
            'res.cloudinary.com', // Cloudinary direct links
            'images.unsplash.com',// Unsplash
            'picsum.photos',      // Lorem Picsum
            'via.placeholder.com' // Placeholder
        ],
    },
}

module.exports = nextConfig