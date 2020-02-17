/*
 * An implementation of the Porter stemming algorithm.
 *
 * Logic referenced from Apache Lucene implementation found at:
 * https://github.com/apache/lucene-solr/blob/master/lucene/analysis/common/src/java/org/apache/lucene/analysis/en/PorterStemmer.java
 *
 * To run, use `node porter.js [word]` or run test data with `node porter.js --test`
 *
 * Test data from Apache Lucene implementation, found at:
 * https://github.com/apache/lucene-solr/blob/master/lucene/analysis/common/src/test/org/apache/lucene/analysis/en/porterTestData.zip
 */

fs = require('fs');

const stem = (word) => {
  // Helper functions
  const isConsonant = (str, index) => {
    switch (str[index]) {
      case 'a':
      case 'e':
      case 'i':
      case 'o':
      case 'u':
        return false;
      case 'y':
        return index === 0 ? true : !isConsonant(str, index - 1);
      default:
        return true;
    }
  }

  const hasVowel = (str) => {
    for (let i = 0; i < str.length; i++) {
      if (!isConsonant(str, i)) {
        return true;
      }
    }
    return false;
  }

  const endsInDoubleConsonant = (str) => {
    const lastChar = str.charAt(str.length - 1);
    if (lastChar.length === 1 && isConsonant(lastChar, 0)) {
      return str.endsWith(lastChar + lastChar);
    }
    return false;
  }

  const endsInCVC = (str) => {
    if (str.length < 3) {
      return false;
    }

    const lastChar = str.charAt(str.length - 1);
    if (!isConsonant(word, str.length - 3) || isConsonant(word, str.length - 2) || !isConsonant(lastChar, 0)) {
      return false;
    }
    if (lastChar === 'w' || lastChar === 'x' || lastChar === 'y') {
      return false;
    }
    return true;
  }

  const numConsonantSequences = (str) => {
    let num = 0;
    let i = 0;
    while (true) {
      if (i > str.length - 1) {
        return num;
      }
      if (!isConsonant(str, i)) {
        break;
      }
      i++;
    }
    i++;
    while (true) {
      while(true) {
        if (i > str.length - 1) {
          return num;
        }
        if (isConsonant(str, i)) {
          break;
        }
        i++;
      }
      i++;
      num++;
      while(true) {
        if (i > str.length - 1) {
          return num;
        }
        if (!isConsonant(str, i)) {
          break;
        }
        i++;
      }
      i++;
    }
  }

  const replaceIfSequences = (oldEnd, newEnd) => {
    if (word.endsWith(oldEnd) && numConsonantSequences(word.slice(0, -oldEnd.length)) > 0) {
      word = word.slice(0, -oldEnd.length) + newEnd;
      return true;
    }
    return word.endsWith(oldEnd);
  }

  const trimIfSequences = (oldEnd) => {
    if (word.endsWith(oldEnd) && numConsonantSequences(word.slice(0, -oldEnd.length)) > 1) {
      word = word.slice(0, -oldEnd.length);
      return true;
    }
    return word.endsWith(oldEnd);
  }

  // Stemming steps
  const removePlurals = () => {
    if (word.endsWith('s')) {
      if (word.endsWith('sses') || word.endsWith('ies')) {
        word = word.slice(0, -2);
      } else if (word.charAt(word.length - 2) !== 's') {
        word = word.slice(0, -1);
      }
    }
  }

  const removeTenses = () => {
    if (word.endsWith('eed')) {
      if (numConsonantSequences(word.slice(0, -3)) > 0) {
        word = word.slice(0, -1);
      }
    } else {
      const hasPast = word.endsWith('ed') && hasVowel(word.slice(0, -2));
      const hasActive = word.endsWith('ing') && hasVowel(word.slice(0, -3));
      if (hasPast) {
        word = word.slice(0, -2);
      } else if (hasActive) {
        word = word.slice(0, -3);
      }

      if (hasPast || hasActive) {
        if (word.endsWith('at') || word.endsWith('bl') || word.endsWith('iz')) {
          word += 'e';
        } else if (endsInDoubleConsonant(word)) {
          const lastChar = word.charAt(word.length - 1);
          if (lastChar !== 'l' && lastChar !== 's' && lastChar !== 'z') {
            word = word.slice(0, -1);
          }
        } else if (numConsonantSequences(word) === 1 && endsInCVC(word)) {
          word += 'e';
        }
      }
    }
  }

  const turnYToI = () => {
    if (word.endsWith('y') && hasVowel(word.slice(0, -1))) {
      word = word.slice(0, -1) + 'i';
    }
  }

  const cleanSuffixes = () => {
    // Round one
    if (replaceIfSequences('ational', 'ate')) {} else
    if (replaceIfSequences('tional', 'tion')) {} else
    if (replaceIfSequences('enci', 'ence')) {} else
    if (replaceIfSequences('anci', 'ance')) {} else
    if (replaceIfSequences('izer', 'ize')) {} else
    if (replaceIfSequences('bli', 'ble')) {} else
    if (replaceIfSequences('alli', 'al')) {} else
    if (replaceIfSequences('entli', 'ent')) {} else
    if (replaceIfSequences('eli', 'e')) {} else
    if (replaceIfSequences('ousli', 'ous')) {} else
    if (replaceIfSequences('ization', 'ize')) {} else
    if (replaceIfSequences('ation', 'ate')) {} else
    if (replaceIfSequences('ator', 'ate')) {} else
    if (replaceIfSequences('alism', 'al')) {} else
    if (replaceIfSequences('iveness', 'ive')) {} else
    if (replaceIfSequences('fulness', 'ful')) {} else
    if (replaceIfSequences('ousness', 'ous')) {} else
    if (replaceIfSequences('aliti', 'al')) {} else
    if (replaceIfSequences('iviti', 'ive')) {} else
    if (replaceIfSequences('biliti', 'ble')) {} else
    if (replaceIfSequences('logi', 'log')) {}

    // Round two
    if (replaceIfSequences('icate', 'ic')) {} else
    if (replaceIfSequences('ative', '')) {} else
    if (replaceIfSequences('alize', 'al')) {} else
    if (replaceIfSequences('iciti', 'ic')) {} else
    if (replaceIfSequences('ical', 'ic')) {} else
    if (replaceIfSequences('ful', '')) {} else
    if (replaceIfSequences('ness', '')) {}

    // Round three
    if (trimIfSequences('al')) {} else
    if (trimIfSequences('ance')) {} else
    if (trimIfSequences('ence')) {} else
    if (trimIfSequences('er')) {} else
    if (trimIfSequences('ic')) {} else
    if (trimIfSequences('able')) {} else
    if (trimIfSequences('ible')) {} else
    if (trimIfSequences('ant')) {} else
    if (trimIfSequences('ement')) {} else
    if (trimIfSequences('ment')) {} else
    if (trimIfSequences('ent')) {} else
    if (word.length >= 4 && (word.charAt(word.length - 4) === 's' || word.charAt(word.length - 4) === 't') && trimIfSequences('ion')) {} else
    if (trimIfSequences('ou')) {} else
    if (trimIfSequences('ism')) {} else
    if (trimIfSequences('ate')) {} else
    if (trimIfSequences('iti')) {} else
    if (trimIfSequences('ous')) {} else
    if (trimIfSequences('ive')) {} else
    if (trimIfSequences('ize')) {}
  }

  const removeFinalLetter = () => {
    if (word.endsWith('e')) {
      const numSequences = numConsonantSequences(word.slice(0, -1));
      if (numSequences > 1 || numSequences === 1 && !endsInCVC(word.slice(0, -1))) {
        word = word.slice(0, -1);
      }
    }
    if (word.endsWith('l') && endsInDoubleConsonant(word) && numConsonantSequences(word.slice(0, -1)) > 1) {
      word = word.slice(0, -1);
    }
  }

  if (word.length > 2) {
    removePlurals();
    removeTenses();
    turnYToI();
    cleanSuffixes();
    removeFinalLetter();
  }

  return word;
}

const runTest = () => {
  let input, output;
  try {
    input = fs.readFileSync('voc.txt', 'utf8').split('\n');
    output = fs.readFileSync('output.txt', 'utf8').split('\n');
  } catch (err) {
    console.log('Error reading from file:', err);
    return;
  }

  let numPasses = 0;
  let numFailures = 0;
  for (let i = 0; i < input.length; i++) {
    const stemmed = stem(input[i]);
    if (stemmed !== output[i]) {
      numFailures++;
      console.log(input[i], stemmed, output[i]);
    } else {
      numPasses++;
    }
  }

  console.log('Passed:', numPasses, 'Failed:', numFailures);
}

if (!process.argv[2]) {
  console.log('Please pass in a word to stem or the --test option');
} else if (process.argv[2] === '--test') {
  runTest();
} else {
  console.log(stem(process.argv[2]));
}
