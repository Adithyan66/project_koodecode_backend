

import AWS from 'aws-sdk';
import { config } from '../config/config';

export class S3Service {
  private s3: AWS.S3;
  private bucketName: string;

  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
      region: config.aws.region
    });
    this.bucketName = config.aws.s3BucketName;
  }

  async generatePresignedUrl(key: string, contentType: string): Promise<string> {
    const params = {
      Bucket: this.bucketName,
      Key: key,
      Expires: 300, // 5 minutes
      ContentType: contentType,
    //   ACL: 'public-read'
    };

    return this.s3.getSignedUrlPromise('putObject', params);
  }

  async deleteObject(key: string): Promise<void> {
    const params = {
      Bucket: this.bucketName,
      Key: key
    };

    await this.s3.deleteObject(params).promise();
  }

  getPublicUrl(key: string): string {
    return `https://${this.bucketName}.s3.${config.aws.region}.amazonaws.com/${key}`;
  }
}
