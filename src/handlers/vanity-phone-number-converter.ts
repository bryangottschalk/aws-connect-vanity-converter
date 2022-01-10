import { DynamoDB } from 'aws-sdk';
const words: string[] = require('an-array-of-english-words');
const DDB = new DynamoDB.DocumentClient();
interface PhoneCharMap {
  [key: string]: string[];
}
const phoneCharacterMap: PhoneCharMap = {
  // '0': [""], replaceUnhandledDigits() below replaces 0 and 1 with 2
  // '1': [""],
  '2': ['a', 'b', 'c'],
  '3': ['d', 'e', 'f'],
  '4': ['g', 'h', 'i'],
  '5': ['j', 'k', 'l'],
  '6': ['m', 'n', 'o'],
  '7': ['p', 'q', 'r', 's'],
  '8': ['t', 'u', 'v'],
  '9': ['w', 'x', 'y', 'z']
};

const getPermutationsIterative = (phoneNumber: string): string[] => {
  let queue = [''];
  /*
   phone number = 800-474-2253 example 
   1st iteration - queue is [""]
   2nd iteration - queue is ['g', 'h', 'i']
   3rd iteration - queue is ['gp', 'gq', 'gr', 'gs', 'hp', 'hq', 'hr', 'hs', 'ip', 'iq', 'ir', 'is']
  */
  for (let i = 0; i < phoneNumber.length; i++) {
    let digit = phoneNumber[i];
    let queueLength = queue.length;
    for (let j = 0; j < queueLength; j++) {
      let keypadMatches: string[] = phoneCharacterMap[digit];
      let pop = queue.shift();
      for (let k = 0; k < keypadMatches.length; k++) {
        let newPerm = pop + keypadMatches[k]; // pop is previous set of data + add keypad matches
        queue.push(newPerm);
      }
    }
  }
  return queue;
};

const replaceUnhandledDigits = (callerPhoneNumber: string) => {
  let res = '';
  callerPhoneNumber.split('').forEach((digit) => {
    if (digit === '0' || digit === '1') {
      /*
      since 0 and 1 have no values to map to on dialpads, hard code to 2.
      in production would likely return 0 results, an error, or check a different 
      portion of the number for vanity possibilities instead.
      */
      res += '2';
    } else {
      res += digit;
    }
  });
  return res;
};

const getVanityNumbersFromPermutations = (
  permutations: string[],
  vanityNumbers: string[],
  vanityResultPrefix: string
) => {
  for (let i = 0; i < permutations.length; i++) {
    if (vanityNumbers.length >= 5) {
      break; // 5 best results max reached
    }
    let permutation = permutations[i];
    for (let j = 0; j < words.length; j++) {
      if (permutation === words[j]) {
        vanityNumbers.push(`${vanityResultPrefix}${words[j].toUpperCase()}`);
        if (vanityNumbers.length >= 5) {
          break; // 5 best results max reached
        }
      }
    }
  }
};

const generateConnectBotResponse = (
  vanityNumbers: string[],
  callerPhoneNumber: string
) => {
  let connectBotResponse = '';
  if (vanityNumbers.length) {
    const vanityNumbersJoined = vanityNumbers.join(', '); // read conversationally
    const csvVanityNumbers = vanityNumbers.join('').split('').join(', '); // CSV is read slowly
    connectBotResponse = `Thank you for calling our vanity number generator.
    \nWe have successfully saved ${
      vanityNumbers.length === 1
        ? 'a vanity phone number'
        : 'vanity phone numbers'
    } based on your caller number to our DynamoDB Database.\nThe vanity number${
      vanityNumbers.length > 1 && 's'
    } generated for your caller number ${
      vanityNumbers.length > 1 ? 'are' : 'is'
    }: ${vanityNumbersJoined}.\n
    Spelled out they are ${csvVanityNumbers}`;
    if (callerPhoneNumber.includes('0') || callerPhoneNumber.includes('1')) {
      connectBotResponse +=
        "\nPlease note that because your phone number includes a zero or a one in it, those numbers were replaced with 2's in your vanity numbers so they can correspond with a phone keypad...";
    }
  } else {
    connectBotResponse =
      '\nThank you for calling our vanity number generator. Unfortunately, your phone number did not generate any results using the words we have to compare to';
  }
  connectBotResponse += '\nThanks for using our services. \nHave a great day!`';
  return connectBotResponse;
};

export const handler = async (event, context, callback) => {
  let callerPhoneNumber = '';
  if (event['Details']) {
    callerPhoneNumber =
      event['Details']['ContactData']['CustomerEndpoint']['Address'].slice(2); // strip country code
  } else {
    callerPhoneNumber = '8004742253';
  }

  const formattedPhoneNumber = replaceUnhandledDigits(callerPhoneNumber);
  /* 8004742253 fallback example for local testing: vanityNumbers ['800GRIBBLE','800474ABLE','800474BAKE','800474BALD','800474BALE']*/
  if (formattedPhoneNumber.length < 10) {
    return [];
  }
  const first3 = formattedPhoneNumber.slice(0, 3);
  const last7 = formattedPhoneNumber.slice(formattedPhoneNumber.length - 7);
  // ideally format is 3DIGITAREACODE-LAST7 - check for that first
  let permutations = getPermutationsIterative(last7);
  const vanityNumbers: string[] = [];
  getVanityNumbersFromPermutations(permutations, vanityNumbers, first3);
  if (vanityNumbers.length < 5) {
    // fallback to last 4 digits being letters
    const last4 = formattedPhoneNumber.slice(formattedPhoneNumber.length - 4);
    const first6 = formattedPhoneNumber.slice(0, 6);
    permutations = getPermutationsIterative(last4);
    getVanityNumbersFromPermutations(permutations, vanityNumbers, first6);
  }
  if (vanityNumbers.length < 5) {
    // fallback to last 3 digits being letters
    const first7 = formattedPhoneNumber.slice(formattedPhoneNumber.length - 7);
    const last3 = formattedPhoneNumber.slice(formattedPhoneNumber.length - 3);
    permutations = getPermutationsIterative(last3);
    getVanityNumbersFromPermutations(permutations, vanityNumbers, first7);
  }
  console.log('vanityNumbers', vanityNumbers);
  const connectBotResponse = generateConnectBotResponse(
    vanityNumbers,
    callerPhoneNumber
  );
  await saveToDB(callerPhoneNumber, formattedPhoneNumber, vanityNumbers);
  callback(null, {
    connectBotResponse
  });
};

const saveToDB = async (
  callerPhoneNumber: string,
  formattedPhoneNumber: string, // determines actual vanity number (0's and 1's replaced with 2's)
  vanityNumbers: string[]
) => {
  try {
    await DDB.put({
      TableName: process.env.TABLE_NAME,
      Item: {
        callerPhoneNumber,
        formattedPhoneNumber,
        vanityNumbers
      },
      ConditionExpression: 'attribute_not_exists(pk)'
    }).promise();
    console.log('save to DDB success');
  } catch (err) {
    console.log('save to DDB error:');
    console.info(err);
  }
};

// conditional export for tests
if (process.env.NODE_ENV === 'test') {
  module.exports = {
    getPermutationsIterative,
    replaceUnhandledDigits,
    getVanityNumbersFromPermutations,
    generateConnectBotResponse,
    handler,
    saveToDB
  };
}
