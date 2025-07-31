const https = require('https');
const fs = require('fs');
const path = require('path');

const testimonialImages = [
  {
    name: 'sarah.jpg',
    url: 'https://randomuser.me/api/portraits/women/1.jpg'
  },
  {
    name: 'michael.jpg',
    url: 'https://randomuser.me/api/portraits/men/1.jpg'
  },
  {
    name: 'emily.jpg',
    url: 'https://randomuser.me/api/portraits/women/2.jpg'
  }
];

const downloadImage = (url, filename) => {
  const dir = path.join(__dirname, '..', 'public', 'testimonials');
  
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }

  const filepath = path.join(dir, filename);
  const file = fs.createWriteStream(filepath);

  https.get(url, response => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${filename}`);
    });
  }).on('error', err => {
    fs.unlink(filepath);
    console.error(`Error downloading ${filename}:`, err.message);
  });
};

testimonialImages.forEach(image => {
  downloadImage(image.url, image.name);
});
