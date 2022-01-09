import { DynamoDB } from 'aws-sdk';
const words: string[] = require('an-array-of-english-words');
const DDB = new DynamoDB.DocumentClient();
interface PhoneCharMap {
  [key: string]: string[];
}
const phoneCharacterMap: PhoneCharMap = {
  // Assume 0 and 1 are not in the phone number for now as they aren't on the keypad
  // '0': [""],
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
   3rd iteration - queue is queue ['gp', 'gq', 'gr', 'gs', 'hp', 'hq', 'hr', 'hs', 'ip', 'iq', 'ir', 'is']
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

export const handler = async (event, context, callback) => {
  let callerPhoneNumber = '';
  if (event['Details']) {
    callerPhoneNumber =
      event['Details']['ContactData']['CustomerEndpoint']['Address'].slice(2); // strip country code
  } else {
    callerPhoneNumber = '8004742253';
  }

  const formattedPhoneNumber = replaceUnhandledDigits(callerPhoneNumber);
  console.log('formattedPhoneNumber', formattedPhoneNumber);
  /*
  8004742253 fallback example for local testing returns:
  vanityNumbers [
  '800GRIBBLE',
  '800474ABLE',
  '800474BAKE',
  '800474BALD',
  '800474BALE'
  ]
  */
  if (formattedPhoneNumber.length < 10) {
    return [];
  }
  const first3 = formattedPhoneNumber.slice(0, 3);
  const last7 = formattedPhoneNumber.slice(formattedPhoneNumber.length - 7);
  const last4 = formattedPhoneNumber.slice(formattedPhoneNumber.length - 4);
  const first6 = formattedPhoneNumber.slice(0, 6);

  // ideally format is 3DIGITAREACODE-LAST7 - check for that first
  let permutations = getPermutationsIterative(last7);
  console.log('7 letter permutations:', permutations);

  const vanityNumbers: string[] = [];
  for (let i = 0; i < permutations.length; i++) {
    let permutation = permutations[i];
    for (let j = 0; j < words.length; j++) {
      if (permutation === words[j]) {
        vanityNumbers.push(`${first3}${words[j].toUpperCase()}`);
        if (vanityNumbers.length >= 5) {
          break; // 5 best results max reached
        }
      }
    }
  }

  if (vanityNumbers.length < 5) {
    // couldn't get 5 results with single words; run again against last4 for higher chance of results
    permutations = getPermutationsIterative(last4);
    console.log('4 letter permutations:', permutations);
    for (let i = 0; i < permutations.length; i++) {
      let permutation = permutations[i];
      if (vanityNumbers.length >= 5) {
        break; // 5 best results max reached
      }
      for (let j = 0; j < words.length; j++) {
        if (permutation === words[j]) {
          vanityNumbers.push(`${first6}${words[j].toUpperCase()}`);
        }
      }
    }
  }
  console.log('vanityNumbers', vanityNumbers);
  await saveToDB(callerPhoneNumber, formattedPhoneNumber, vanityNumbers);
  // return vanityNumbers;
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      vanityNumbers,
      callerPhoneNumber
    })
  };
  console.log('response:', response);
  let connectBotResponse;
  if (vanityNumbers.length) {
    const vanityNumbersJoined = vanityNumbers.join(', '); // so the bot can read the vanity number conversationally
    const csvVanityNumbers = vanityNumbers.join('').split('').join(', '); // so the bot can spell out the digits more slowly
    const csvCallerPhoneNumber = callerPhoneNumber.split('').join(', '); // so the bot can spell out the digits more slowly
    connectBotResponse = `Thank you for calling our vanity number generator. 
    We have successfully saved vanity phone numbers based on your caller number to our DynamoDB Database. 
    Your phone number is ${csvCallerPhoneNumber}. The vanity numbers generated for this are: ${vanityNumbersJoined}. 
    Spelled out they are ${csvVanityNumbers}...`;
    if (callerPhoneNumber.includes('0') || callerPhoneNumber.includes('1')) {
      connectBotResponse +=
        "Please note that because your phone number includes a zero or a one in it, those numbers were replaced with 2's in your vanity numbers so they can correspond with a phone keypad...";
    }
  } else {
    connectBotResponse =
      'Thank you for calling our vanity number generator. Unfortunately, your phone number did not generate any results using the words we have available to compare to...';
  }
  connectBotResponse += 'Thanks for using our services. Have a great day!`';
  callback(null, {
    connectBotResponse
  });
  return response;
};

const saveToDB = async (
  callerPhoneNumber: string,
  formattedPhoneNumber: string,
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
