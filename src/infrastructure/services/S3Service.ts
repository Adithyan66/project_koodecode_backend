

// import AWS from 'aws-sdk';
// import { config } from '../config/config';

// export class S3Service {
//   private s3: AWS.S3;
//   private bucketName: string;

//   constructor() {
//     this.s3 = new AWS.S3({
//       accessKeyId: config.aws.accessKeyId,
//       secretAccessKey: config.aws.secretAccessKey,
//       region: config.aws.region
//     });
//     this.bucketName = config.aws.s3BucketName;
//   }

//   async generatePresignedUrl(key: string, contentType: string): Promise<string> {
//     const params = {
//       Bucket: this.bucketName,
//       Key: key,
//       Expires: 300, // 5 minutes
//       ContentType: contentType,
//       // ACL: 'public-read'
//     };

//     return this.s3.getSignedUrlPromise('putObject', params);
//   }

//   async deleteObject(key: string): Promise<void> {
//     const params = {
//       Bucket: this.bucketName,
//       Key: key
//     };

//     await this.s3.deleteObject(params).promise();
//   }

//   getPublicUrl(key: string): string {
//     return `https://${this.bucketName}.s3.${config.aws.region}.amazonaws.com/${key}`;
//   }
// }


import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config/config';

export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      },
      region: config.aws.region
    });
    this.bucketName = config.aws.s3BucketName;
  }

  async generatePresignedUrl(key: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn: 300 });
  }

  async deleteObject(key: string): Promise<void> {
    const params = {
      Bucket: this.bucketName,
      Key: key
    };

    await this.s3Client.deleteObject(params).promise();
  }

  getPublicUrl(key: string): string {
    return `https://${this.bucketName}.s3.${config.aws.region}.amazonaws.com/${key}`;
  }
}