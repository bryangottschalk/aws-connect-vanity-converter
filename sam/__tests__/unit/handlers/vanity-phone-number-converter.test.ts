// TODO: write tests

// Import all functions from vanity-phone-number-converter.ts
const lambda = require("../../../src/handlers/vanity-phone-number-converter.ts");

// This includes all tests for vanityPhoneNumberConverter()
describe("Test for vanity-phone-number-converter", function () {
  // This test invokes vanityPhoneNumberConverter() and compare the result
  it("Verifies successful response", async () => {
    const result = await lambda.vanityPhoneNumberConverterHandler();
    const expectedResult = "TODO: add vanity phone number converter function";
    expect(result).toEqual(expectedResult);
  });
});
