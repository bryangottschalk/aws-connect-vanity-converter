import { expect } from "chai";
import vanityPhoneNumberConverterHandler from "../../src/handlers/vanity-phone-number-converter";
import * as AWS from "aws-sdk";
import * as AWSMock from "aws-sdk-mock";

/*
Test plans
- successfully PUT to DB
    AWSMock.mock("DynamoDB", "putItem", function (params, callback) {
      callback(null, "successfully put item in database");
    });
- errors if input is incorrect
- handle case of duplicate record (caller phone number has already invoked lambda in the past)
*/

describe("Test for vanity-phone-number-converter", function () {
  it("Verifies successful response", async () => {
    const result = await vanityPhoneNumberConverterHandler();
    const expectedResult = "TODO: add vanity phone number converter function";
    expect(result).to.equal(expectedResult);
  });
});
