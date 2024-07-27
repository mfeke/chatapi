const AWS = require('aws-sdk');
const express = require('express');
const { getSecretValue } = require('./secretsManager');

require('aws-sdk/lib/maintenance_mode_message').suppress = true;
require("dotenv").config();

async function configureAWS() {
  try {
    const secrets = await getSecretValue('myAppSecrets');
    AWS.config.update({
      accessKeyId: secrets.AWS_ACCESS_KEY_ID,
      secretAccessKey: secrets.AWS_SECRET_ACCESS_KEY
    });

    // Create S3 service instance
    const s3 = new AWS.S3();
    const constantParams = {
      Bucket: process.env.BUCKET_NAME
    }

    const uploadImage = async (file) => {
      const fileContent = Buffer.from(file.buffer, "Binary");
      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: file.originalname,
        Body: fileContent,
        ACL: "public-read"
      };

      return new Promise((resolve, reject) => {
        s3.upload(params, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    };

    const uploadImages = async (files, name) => {
      const uploadPromises = files.map((file, index) => {
        const fileContent = Buffer.from(file.buffer, "Binary");
        const params = {
          Bucket: process.env.BUCKET_NAME,
          Key: name + index,
          Body: fileContent,
          ACL: "public-read"
        };

        return new Promise((resolve, reject) => {
          s3.upload(params, (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          });
        });
      });

      return Promise.all(uploadPromises);
    };

    const deleteImage = async (keys) => {
      const deletePromises = keys.map(key => {
        const deleteParams = {
          Key: key,
          ...constantParams // Ensure this includes necessary parameters like Bucket name.
        };
        return new Promise((resolve, reject) => {
          s3.deleteObject(deleteParams, (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          });
        });
      });

      try {
        const results = await Promise.all(deletePromises);
        return results;
      } catch (error) {
        throw new Error(`Failed to delete some objects: ${error.message}`);
      }
    };

    module.exports = {
      uploadImage,
      uploadImages,
      deleteImage
    };

  } catch (err) {
    console.error('Failed to configure AWS:', err);
  }
}

configureAWS();
