const fs = require('fs');
const writeFile = fs.writeFile;

// Configure `environment.ts` file path
const targetPathEnvironment = './src/environment.ts';

console.log('environment in amplify:', process.env);

// `environment.ts` file structure
const envConfigFile = `export const environment = {
    API_URL: '${process.env.API_URL}'
  };
  `;

console.log(
  'The file `environment.ts` will be written with the following content: \n'
);
console.log(envConfigFile);

writeFile(targetPathEnvironment, envConfigFile, function (err) {
  if (err) {
    throw console.error(err);
  } else {
    console.log(
      `environment.ts file generated correctly at ${targetPathEnvironment} \n`
    );
  }
});
