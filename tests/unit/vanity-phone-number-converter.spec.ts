import { expect } from 'chai';
import { handler as vanityPhoneNumberConverterHandler } from '../../src/handlers/vanity-phone-number-converter';
import * as AWS from 'aws-sdk';
import * as AWSMock from 'aws-sdk-mock';

/*
Test plans
- successfully PUT to DB
    AWSMock.mock("DynamoDB", "putItem", function (params, callback) {
      callback(null, "successfully put item in database");
    });
- errors if input is incorrect
- handle case of duplicate record (caller phone number has already invoked lambda in the past)
*/

describe('Test for vanity-phone-number-converter', function () {
  it('Verifies successful response', async () => {
    const result: any = await vanityPhoneNumberConverterHandler(
      {
        phoneNumber: '8004742253'
      },
      null,
      null
    );
    // const result: string[] = await vanityPhoneNumberConverterHandler({
    //   phoneNumber: "8004742253",
    // });
    expect(result).to.be.an('array');
  });
});
