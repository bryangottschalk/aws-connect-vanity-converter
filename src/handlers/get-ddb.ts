import { DynamoDB } from 'aws-sdk';
const DDB = new DynamoDB.DocumentClient();

export const GEThandler = async (event, context, callback) => {
  const result = await getDDB();
  return result;
};

const getDDB = async () => {
  const params = {
    TableName: process.env.TABLE_NAME
  };
  try {
    const allData = await DDB.scan(params).promise();
    const response = {
      statusCode: 200,
      body: JSON.stringify(allData.Items),
      headers: {
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,GET'
      }
    };
    return response;
  } catch (err) {
    const response = {
      statusCode: 500,
      body: JSON.stringify(err)
    };
    return response;
  }
};
