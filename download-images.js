const https = require('https');
const fs = require('fs');
const path = require('path');

const images = [
  {
    url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30',
    filename: 'hero-bg.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1522778526097-ce0a22ceb253',
    filename: 'celebrities/john-legend.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb',
    filename: 'celebrities/emma-watson.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d',
    filename: 'celebrities/gordon-ramsay.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55',
    filename: 'celebrities/serena-williams.jpg'
  }
];

async function downloadImage(url, filename) {
  const filepath = path.join(__dirname, 'public', filename);
  const dir = path.dirname(filepath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const file = fs.createWriteStream(filepath);
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`Downloaded: ${filename}`);
          resolve();
        });
      } else {
        reject(`Failed to download ${url}: ${response.statusCode}`);
      }
    }).on('error', (err) => {
      reject(`Error downloading ${url}: ${err.message}`);
    });
  });
}

async function downloadAll() {
  for (const image of images) {
    try {
      await downloadImage(image.url, image.filename);
    } catch (error) {
      console.error(error);
    }
  }
}

downloadAll();
