import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Configure AWS SDK
export const s3 = new AWS.S3({
    region: process.env.AWS_REGION,  
    accessKeyId: process.env.AWS_ACCESSKEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESSKEY,
    signatureVersion: "v4"
});

 
 

 