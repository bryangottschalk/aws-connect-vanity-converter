# AWS Connect Vanity Converter App

## Demo
- Call my Connect Instance phone number (833) 346-1507 to hear your vanity number results read verbally.
- After calling, confirm the same result was added to the web application's table: https://master.d1xodj1i7x743l.amplifyapp.com

## Summary

This project contains AWS SAM CloudFormation templates to produce the same resources needed for above in your own AWS account:

- AWS Lambda Functions: Includes a vanity number generation algorithm which is intended to be trigged by an AWS Contact Flow to produce vanity phone number suggestions to the user and a GET function for the list of all results passed to the webapp
- API Gateway deploymement exposing the getvanitynumbers endpoint to the webapp
- DynamoDB Table: Stores the results of the Lambda function containing the caller's phone number and the suggested vanity phone numbers
- React Web Application displaying the results of the converter Lambda
- Default Continous deployment of the React Single Page App, linked to the Master branch, passing in the generated API endpoint from the ApiGateway created.

The repository also includes unit tests and a webpack configuration to allow the Lambda function to be written in TypeScript.

- `src > handlers` - Code for the application's Lambda functions.
- `tests` - Unit tests for the application code.
- `template.yaml` - The SAM template that defines the application's AWS resources.
- `webapp` - Small React application for displaying the DynamoDB results from the converter lambda

## Quick Start

To test my deployment and have AWS Connect read your vanity numbers results back to you, simply call (833) 346-1507.
Prerequisites:

- AWS SAM CLI - [Install the AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html).
- Node.js - [Install Node.js 14](https://nodejs.org/en/), including the npm package management tool.
- Docker - [Install Docker community edition](https://hub.docker.com/search/?type=edition&offering=community).
- NOTE: Before deploying, ensure that your shell is assigned to the correct AWS Profile.

1. To build and deploy this application for the first time, run the following in your shell:

```bash
npm i
npm run init-deploy (runs npm run build and sam deploy)
```

Note: to link continous deployment to the master branch you must pass in a personal access token to the SAM CLI prompt. This template uses GitHub: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token

2. Create a Connect instance in the AWS Console - note your Access URL for step 5
3. Add a phone number to your Connect instance
4. Import the Contact Flow from ./VanityPhoneNumberContactFlow.json. Go to your Access URL for your Connect Instance > Login > Go to Routing/Contact flows > Click "Create contact flow" > Down arrow next to save > "Import flow" and select the JSON file from this repo.
5. Add the Lambda generated from the SAM deploy to your new Connect instance. Go to Amazon Connect > Your instance > Contact flows > AWS Lambda > Add Lambda Function
6. Connect the Lambda to the Contact flow you imported -> Click the step "Invoke AWS Lambda function" from the drag and drop interface and select the generated function ARN.

## Unit tests

Tests are defined in the `tests` folder in this project. Use `npm` to install the [Mocha test framework] and run unit tests.

```bash
npm install
npm run test
```

## Architecture Diagram

View the application architure at this link: https://drive.google.com/file/d/1s6ENIEZDaD51v2_frfEkOSr3I4floXx-/view?usp=sharing

You can also open the .drawio file in the root directory from the draw.io website.

## Future Improvements

- Consider re-writing iterative vanity number permutations algorithm to be recursive rather than iterative. This would make the function more terse but is not likely to improve time complexity. A recursive algorithm could be achieved through depth first search.
- In the case that the caller's phone number has 0's or 1's, the Lambda vanity number function assumes both of those digits are 2's. This could produce incorrect vanity number results, but for the case of practicality and wanting users to have a higher chance of producing results I decided to add this assumption. In production this would likely return 0 results, an error, or check a different portion of the number that didn't include 0's or 1's for vanity possibilities instead.
- Write the Contact Flow as SAM or CDK code instead of requiring an import from the AWS Console
- Duplicate the CloudFormation template aspects of this application using AWS CDK in a new directory (I chose SAM based on more familiarity)
- Set up continuous integration with unit tests and continuously deployment with the repository
- Write stricter CORS policies for the Lambda API to only accept requests from the single page app and Connect

## Challenges

- Deploying Lambda with TypeScript: To this point I have deployed Lambdas with JavaScript and decided to add the challenge of using TypeScript here. Since Lambda doesn't natively support TypeScript, I installed Webpack to convert the code back to JavaScript before deploying. I ran into issues using Jest for testing with TypeScript in this scenario, so I ended up swapping in Mocha and Chai as testing libraries.
- The vanity number generation algorithm: I did not initially realize how much a queue structure made sense for the permutation algorithm and began with a couple different solutions.
- Connecting Lambda to Contact Flow: It took me some time to find where to add my Lambda to my AWS Connect Contact Flow. I initially referenced the ARN and could not get beyond the error path preceding the Lambda invokation, in which it did not seem to produce any error in CloudWatch for assistance with debugging. I then discovered this was due to not having permissions to reference or invoke it. I then found where to add the Lambda to my Connect Instance in the AWS Console and resolved the issue by being able to access the output of the lambda callback function from Connect.
- Mocking the DynamoDB database for unit testing with Mocha/Chai. This isn't something I have done before and I would have liked more time to dive deeper into the proper mocking techniques and creating a DynamoDB Docker Image for local, more rigorous testing

## Cleanup

To delete the sample application that you created, use the AWS CLI. You set the stack name yourself when you initially deployed the application via sam deploy.

```bash
aws cloudformation delete-stack --stack-name yourstackname
```
