import { DynamoDB } from "aws-sdk";

const words: string[] = require("an-array-of-english-words");

const vanityPhoneNumberConverterHandler = async () => {
  console.log("words:", words);
  // If you change this message, you will need to change hello-from-lambda.test.js
  const message = "TODO: add vanity phone number converter function";

  // All log statements are written to CloudWatch
  console.info(`${message}`);

  return message;
};

export default vanityPhoneNumberConverterHandler;
