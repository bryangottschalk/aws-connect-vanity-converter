import { expect } from 'chai';
import * as AWS from 'aws-sdk';
import * as AWSMock from 'aws-sdk-mock';
const vanityFuncsToTest = require('../../src/handlers/vanity-phone-number-converter'); // have to require because of conditional test func export

/*
TODO: add more tests mocking DynamoDB
Test plans
- successfully PUT to DB
    AWSMock.mock("DynamoDB", "putItem", function (params, callback) {
      callback(null, "successfully put item in database");
    });
- errors if input is incorrect
*/

const testPhoneNumber = '8004742253';

describe('Test for vanity-phone-number-converter', function () {
  beforeEach(async () => {
    process.env.TABLE_NAME = 'VanityPhoneNumberTable';
  });
  it('replaceUnhandledDigits() replaces zeros and ones with twos', async () => {
    const result: string = await vanityFuncsToTest.replaceUnhandledDigits(
      testPhoneNumber
    );
    expect(result).to.equal('8224742253');
    expect(result).to.not.include('0');
    expect(result).to.not.include('1');
  });
  it('getPermutationsIterative() gets a list of permutations', async () => {
    const phoneNumber: string = await vanityFuncsToTest.replaceUnhandledDigits(
      testPhoneNumber
    );
    const result: string = await vanityFuncsToTest.getPermutationsIterative(
      phoneNumber
    );
    expect(result).to.have.length.greaterThan(0);
  });
  it('generateConnectBotResponse() returns a string with a length', async () => {
    const phoneNumber: string = await vanityFuncsToTest.replaceUnhandledDigits(
      testPhoneNumber
    );
    const vanityNumbers: string =
      await vanityFuncsToTest.getPermutationsIterative(phoneNumber);
    const botRes: string[] = vanityFuncsToTest.generateConnectBotResponse(
      vanityNumbers,
      phoneNumber
    );
    expect(botRes).to.have.length.greaterThan(0);
  });
});
