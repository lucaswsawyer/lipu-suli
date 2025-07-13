// Toki Pona Wordle logic
const letters = ['a','e','i','o','u','k','l','m','n','p','s','t','w'];

function seedFromDate() {
  const d = new Date();
  return d.getFullYear()*10000 + (d.getMonth()+1)*100 + d.getDate();
}
function mulberry32(a) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

function getDailySolution() {
  const seed = seedFromDate();
  const rand = mulberry32(seed);
  let w = '';
  for (let i = 0; i < 5; i++) {
    w += letters[Math.floor(rand() * letters.length)];
  }
  return w;
}
const SOLUTION = getDailySolution();

function checkGuess(guess) {
  const result = [];
  const solArr = SOLUTION.split('');
  const guessArr = guess.split('');
  for (let i = 0; i < 5; i++) {
    if (guessArr[i] === solArr[i]) {
      result[i] = 'correct';
      solArr[i] = null;
    }
  }
  for (let i = 0; i < 5; i++) {
    if (result[i]) continue;
    const idx = solArr.indexOf(guessArr[i]);
    if (idx > -1) {
      result[i] = 'present';
      solArr[idx] = null;
    } else {
      result[i] = 'absent';
    }
  }
  return result;
}

window.Wordle = { SOLUTION, checkGuess };