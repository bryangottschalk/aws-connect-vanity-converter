import { DynamoDB } from "aws-sdk";
const words: string[] = require("an-array-of-english-words");

interface PhoneCharMap {
  [key: string]: string[];
}
const phoneCharacterMap: PhoneCharMap = {
  // Assume 0 and 1 are not in the phone number for now as they aren't on the keypad
  // '0': [""],
  // '1': [""],
  "2": ["a", "b", "c"],
  "3": ["d", "e", "f"],
  "4": ["g", "h", "i"],
  "5": ["j", "k", "l"],
  "6": ["m", "n", "o"],
  "7": ["p", "q", "r", "s"],
  "8": ["t", "u", "v"],
  "9": ["w", "x", "y", "z"],
};

const getPermutationsIterative = (phoneNumber: string): string[] => {
  let queue = [""];
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

export const handler = async (event) => {
  /*
  8004742253 example returns:
  vanityNumbers [
  '800GRIBBLE',
  '800474ABLE',
  '800474BAKE',
  '800474BALD',
  '800474BALE'
  ]
  */
  const phoneNumber = "8004742253"; // TODO: get dynamically from connect
  if (phoneNumber.length < 10) {
    return [];
  }
  const first3 = phoneNumber.slice(0, 3);
  const last7 = phoneNumber.slice(phoneNumber.length - 7);
  const last4 = phoneNumber.slice(phoneNumber.length - 4);
  const first6 = phoneNumber.slice(0, 6);

  // ideally format is 3DIGITAREACODE-LAST7 - check for that first
  let permutations = getPermutationsIterative(last7);
  console.log("7 letter permutations:", permutations);

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
    console.log("4 letter permutations:", permutations);
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
  console.log("vanityNumbers", vanityNumbers);
  return vanityNumbers;
};
