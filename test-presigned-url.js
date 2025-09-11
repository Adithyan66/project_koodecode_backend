

const AWS = require('aws-sdk');
require('dotenv').config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

async function testPresignedUrl() {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `test-images/test-${Date.now()}.jpg`,
      Expires: 300,
      ContentType: 'image/jpeg',
      ACL: 'public-read'
    };

    const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
    console.log('✅ Pre-signed URL generated successfully!');
    console.log('Upload URL:', uploadUrl);
    console.log('✅ Test passed - S3 service is working!');
  } catch (error) {
    console.log('❌ Pre-signed URL generation failed:', error.message);
  }
}

testPresignedUrl();
