/*
this file will be overwritten at buildtime in amplify so we can set env vars dynamically from SAM template
local development reads this file directly
*/

interface Environment {
  API_URL: string;
}
export const environment: Environment = {
  API_URL: 'https://pndcjwkl1k.execute-api.us-east-1.amazonaws.com/Prod'
};
