const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dnlmfuwst',
  api_key: '839655743539418',
  api_secret: '72FqA04jdVAUMHh262ZJK9uHuKM'
});

async function uploadLogo() {
  try {
    const result = await cloudinary.uploader.upload(
      './public/assets/logos/Afriverse-logo.png',
      {
        folder: 'afriverse',
        public_id: 'Afriverse-logo',
        overwrite: true,
        resource_type: 'image'
      }
    );
    console.log('✅ Logo uploaded successfully!');
    console.log('URL:', result.secure_url);
    console.log('Public ID:', result.public_id);
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
  }
}

uploadLogo();
