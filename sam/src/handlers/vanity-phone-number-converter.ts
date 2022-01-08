import { DynamoDB } from "aws-sdk";

const words: string[] = require("an-array-of-english-words");

export const handler = async () => {
  console.log("words:", words); // TODO: write algorithm to find word matches based on phone keypad
  // If you change this message, you will need to change hello-from-lambda.test.js
  const message = "TODO: add vanity phone number converter function";

  // All log statements are written to CloudWatch
  console.info(`${message}`);

  return message;
};
