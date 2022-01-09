# Description: AWS Connect Vanity Converter App

This project contains AWS SAM CloudFormation templates to the following resources:

- AWS Lambda Function: Includes a vanity number generation algorithm which is intended to be trigged by an AWS Contact Flow to produce vanity phone number suggestions to the user.
- DynamoDB Table: Stores the results of the Lambda function containing the caller's phone number and the suggested vanity phone numbers

It also includes unit tests to be ran locally, a webpack configuration to allow the Lambda function to be written in TypeScript, and an architecture diagram.

- `src` - Code for the application's Lambda function.
- `events` - Invocation events that you can use to invoke the function.
- `tests` - Unit tests for the application code.
- `template.yaml` - The SAM template that defines the application's AWS resources.

## Quick Start

Prerequisites:

- AWS SAM CLI - [Install the AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html).
- Node.js - [Install Node.js 14](https://nodejs.org/en/), including the npm package management tool.
- Docker - [Install Docker community edition](https://hub.docker.com/search/?type=edition&offering=community).

* NOTE: Before deploying, ensure that your shell is assigned to the correct AWS Profile.

1. To build and deploy this application for the first time, run the following in your shell:

```bash
npm i
npm run build
sam deploy --guided
```

2. Run unit tests:

```bash
npm run test
```

3. Create an Amazon Connect instance in the AWS Console - note your Access URL for step 4
4. Add the Lambda generated from the SAM deploy to your new Connect instance. Go to Amazon Connect > Your instance > Contact flows > AWS Lambda > Add Lambda Function
5. Import the Contact Flow from this repo. Go to your Access URL for your Connect Instance > Login > Go to Routing/Contact flows > Click "Create contact flow" > Down arrow next to save > "Import flow" and select the JSON file from this repo.

## Architecture Diagram

## Future Improvements

- Consider re-writing iterative vanity number permutations algorithm to be recursive rather than iterative. This would make the function more terse but is not likely to improve time complexity. A recursive algorithm could be achieved through depth first search.
- In the case that the caller's phone number has 0's or 1's, the Lambda vanity number function assumes both of those digits are 2's. This could produce incorrect vanity number results, but for the case of practicality and wanting users to have a higher chance of producing results I decided to add this assumption. In production this would likely return 0 results, an error, or check a different portion of the number that didn't include 0's or 1's for vanity possibilities instead.
- Write the Contact Flow as SAM or CDK code instead of requiring an import from the AWS Console
- Duplicate the CloudFormation template aspects of this application using AWS CDK in a new directory
- Set up continuous integration with unit tests and continuously deployment with the repository

## Challenges

- Deploying Lambda with TypeScript: To this point I have deployed Lambdas with JavaScript and decided to add the challenge of using TypeScript here. Since Lambda doesn't natively support TypeScript, I installed Webpack to convert the code back to JavaScript before deploying. I ran into issues using Jest for testing with TypeScript in this scenario, so I ended up swapping in Mocha and Chai as testing libraries.
- The vanity number generation algorithm: I did not initially realize how much a queue structure made sense for the permutation algorithm and began with a couple different solutions.
- Connecting Lambda to Contact Flow: It took me some time to find where to add my Lambda to my AWS Connect Contact Flow. I initially referenced the ARN and could not get beyond the error path preceding the Lambda invokation, in which it did not seem to produce any error in CloudWatch for assistance with debugging. I then discovered this was due to not having permissions to reference or invoke it. I then found where to add the Lambda to my Connect Instance in the AWS Console and resolved the issue.
- Reading Lambda response from Contact Flow: I was initially trying to read the return result of the Lambda using the

## Unit tests

Tests are defined in the `tests` folder in this project. Use `npm` to install the [Mocha test framework] and run unit tests.

```bash
my-application$ npm install
my-application$ npm run test
```

## Cleanup

To delete the sample application that you created, use the AWS CLI. Assuming you used your project name for the stack name, you can run the following:

```bash
aws cloudformation delete-stack --stack-name sam
```
