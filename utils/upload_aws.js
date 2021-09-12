require("dotenv").config({ path: ".env" });
const AWS = require("aws-sdk");

// const ID = process.env.AWS_ACCESS_KEY_ID;
// const SECRET = process.env.AWS_SECRET_KEY;
// const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

async function awsUploadImage(file, filePath) {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${filePath}`,
    Body: file,
  };

  try {
    const response = await s3.upload(params).promise();
    return response.Location;
  } catch (error) {
    throw new Error();
  }
}

module.exports = awsUploadImage;