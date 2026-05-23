const https = require('https');
https.get('https://image.thum.io/get/width/1200/crop/675/https://pebblely.com', (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers['content-type']);
});
