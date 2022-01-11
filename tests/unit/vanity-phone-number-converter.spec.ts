import { expect } from 'chai';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const vanityFuncsToTest = require('../../src/handlers/vanity-phone-number-converter'); // have to require because of conditional test func export
const ddbMock = mockClient(DynamoDBDocumentClient);

const testPhoneNumber = '8004742253';

describe('Test for vanity-phone-number-converter', function () {
  beforeEach(async () => {
    ddbMock.reset();
  });

  it('DDB Scan should get vanity number results', async () => {
    const seedData = [
      {
        callerPhoneNumber: '8722210174',
        formattedPhoneNumber: '8722222274',
        vanityNumbers: [
          '872222ABRI',
          '872222BASH',
          '872222CAPH',
          '872222CAPI',
          '872222CASH'
        ]
      },
      {
        callerPhoneNumber: '8004742253',
        formattedPhoneNumber: '8224742253',
        vanityNumbers: [
          '822GRIBBLE',
          '822474ABLE',
          '822474BAKE',
          '822474BALD',
          '822474BALE'
        ]
      }
    ];
    ddbMock.on(ScanCommand).resolves({
      Items: seedData
    });
    const result = await ddbMock.send(
      new ScanCommand({
        TableName: process.env.TABLE_NAME
      })
    );
    expect(result['Items']).to.eql(seedData);
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
