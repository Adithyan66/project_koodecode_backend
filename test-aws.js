// const AWS = require('aws-sdk');
// require('dotenv').config();

// const s3 = new AWS.S3({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION
// });

// async function testConnection() {
//   try {
//     const result = await s3.listBuckets().promise();
//     console.log('✅ AWS Connection successful!');
//     console.log('Your buckets:', result.Buckets.map(b => b.Name));
    
//     // Check if our bucket exists
//     const bucketExists = result.Buckets.some(b => b.Name === process.env.S3_BUCKET_NAME);
//     if (bucketExists) {
//       console.log('✅ KoodeCode bucket found!');
//     } else {
//       console.log('❌ KoodeCode bucket not found');
//     }
//   } catch (error) {
//     console.log('❌ AWS Connection failed:', error.message);
//   }
// }

// testConnection();



const AWS = require('aws-sdk');
require('dotenv').config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

async function testS3Access() {
  try {
    console.log('Testing S3 access for KoodeCode...');
    
    // Test 1: Check bucket access
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      MaxKeys: 1
    };
    
    await s3.listObjectsV2(params).promise();
    console.log('✅ Bucket access successful!');
    console.log('✅ Credentials are working correctly');
    
    // Test 2: Generate pre-signed URL
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `test-images/test-${Date.now()}.jpg`,
      Expires: 300,
      ContentType: 'image/jpeg',
      ACL: 'public-read'
    };

    const uploadUrl = await s3.getSignedUrlPromise('putObject', uploadParams);
    console.log('✅ Pre-signed URL generated successfully!');
    console.log('✅ S3 service is ready for KoodeCode!');
    
    console.log('\n🎉 ALL TESTS PASSED - Your S3 integration is working!');
    
  } catch (error) {
    console.log('❌ S3 test failed:', error.message);
    
    if (error.code === 'NoSuchBucket') {
      console.log('💡 Make sure your bucket name is correct in .env file');
    } else if (error.code === 'InvalidAccessKeyId') {
      console.log('💡 Check your AWS_ACCESS_KEY_ID in .env file');
    } else if (error.code === 'SignatureDoesNotMatch') {
      console.log('💡 Check your AWS_SECRET_ACCESS_KEY in .env file');
    }
  }
}

testS3Access();
