const fs = require('fs');

async function testCloudinaryUpload() {
  const cloudName = 'ditb2aeea';
  const uploadPreset = 'ecomstacks_preset';
  
  const thumUrl = 'https://image.thum.io/get/width/1200/crop/675/https://pebblely.com';
  
  const formData = new FormData();
  formData.append('file', thumUrl);
  formData.append('upload_preset', uploadPreset);
  
  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    console.log('Response:', data);
  } catch (err) {
    console.error('Error:', err);
  }
}

testCloudinaryUpload();
