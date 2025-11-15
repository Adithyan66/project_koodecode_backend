

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config/config';
import axios from 'axios';

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
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key
    });

    await this.s3Client.send(command);
  }

  getPublicUrl(key: string): string {
    return `https://${this.bucketName}.s3.${config.aws.region}.amazonaws.com/${key}`;
  }

  async uploadFromUrl(imageUrl: string, s3Key: string, contentType?: string): Promise<string> {
    try {
      // Download image from URL
      const response = await axios.get(imageUrl, { 
        responseType: 'arraybuffer',
        timeout: 10000, // 10 second timeout
        maxContentLength: 10 * 1024 * 1024 // 10MB max file size
      });
      
      const imageBuffer = Buffer.from(response.data);
      
      // Determine content type
      const detectedContentType = contentType || response.headers['content-type'] || 'image/jpeg';
      
      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
        Body: imageBuffer,
        ContentType: detectedContentType,
      });
      
      await this.s3Client.send(command);
      return s3Key;
    } catch (error) {
      console.error('Failed to upload image from URL:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to upload image from URL: ${errorMessage}`);
    }
  }
}