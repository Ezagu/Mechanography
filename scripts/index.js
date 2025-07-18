import { wordsList, getWords } from './words.js';

const inputElement = document.querySelector('.js-input');
const resetButtonElement = document.querySelector('.js-reset-button');
const quantityInputElement = document.querySelector('.js-quantity-input');

const wordsContainerElement = document.querySelector('.js-words-container');
const resultBgElement = document.querySelector('.js-result-bg');

const timeButton = document.querySelector('.js-time-button');
const wordsButton = document.querySelector('.js-words-button');

const score = {
  wrongChar: 0,
  correctChar: 0,
  wrongWord: 0,
  correctWord: 0
}
let currentWordElem;
let wordIndex = 0;
let isPlaying = false;

let gameMode = 'time';
let playingTime = 30;
let timer;
let intervalTimerId;
let playingWords = 15;
let temp = 0;
let intervalTempId;

renderWords();

// Event Listener
document.querySelector('.js-close-button')
  .addEventListener('click', () => {
    reset();
    toggleDisplayResult();
  });

inputElement.addEventListener('keyup', (event) => {
  // Put the background red on the word if the input is wrong
  if(!compareWord()){
    currentWordElem.classList.add('bgc-red');
  }
  else {
    currentWordElem.classList.remove('bgc-red');
  }
  // If one key was pressed in the input
  if (event.key != ' ' && event.key != 'Backspace' && event.key != 'Enter') {
    if(!isPlaying) {
      startGame();
    }

    if(compareChar()) {
      score.correctChar++;
    }
    else {
      score.wrongChar++;
    }
  }
  else if(event.key === ' ' || event.code === 'Space') {
    if(getInputValue().replaceAll(' ', '') === '') {
      // If nothing is write then dont submit
      inputElement.value = '';
      return;
    }
    submitWord();
  }
});

resetButtonElement.addEventListener('click', () => reset());

quantityInputElement.addEventListener('blur', () => {
  if(gameMode === 'time') {
    playingTime = quantityInputElement.value;
    if(playingTime < 30) {
      playingTime = 30;
      quantityInputElement.value = 30;
    }
  }
  else if(gameMode === 'words') {
    playingWords = quantityInputElement.value;
    if(playingWords < 15) {
      playingWords = 15;
      quantityInputElement.value = 15;
    }
  }
  renderWords();
});

quantityInputElement.addEventListener('keydown', (event) => {
  if(event.key === 'Enter') {
    quantityInputElement.blur();
    inputElement.focus();
  }
});

timeButton.addEventListener('click', () => {
  timeButton.classList.add('button-active');
  wordsButton.classList.remove('button-active');
  gameMode = 'time';
  reset();
});

wordsButton.addEventListener('click', () => {
  wordsButton.classList.add('button-active');
  timeButton.classList.remove('button-active');
  gameMode = 'words';
  reset();
});

//--------FUNCTIONS-----------

function startGame() {
  isPlaying = true;
  quantityInputElement.disabled = true;
  if(gameMode === 'time') {
    playingTime = quantityInputElement.value;
    startTimer();
  }
  else if(gameMode === 'words') {
    playingWords = quantityInputElement.value;
    quantityInputElement.value = 0;
    startTemp();
  }
}

function finishGame() {
  isPlaying = false;
  quantityInputElement.disabled = false;
  inputElement.disabled = true;
  if(gameMode === 'time') {
    clearTimeout(intervalTimerId);
    calculateUpdateResults();
  }
  else if(gameMode === 'words') {
    clearTimeout(intervalTempId);
    calculateUpdateResults();
  }
}

function reset(){
  isPlaying = false;
  score.wrongChar = 0;
  score.correctWord = 0;
  score.correctChar = 0;
  score.wrongWord = 0;

  quantityInputElement.disabled = false;
  if(gameMode === 'time') {
    quantityInputElement.value = playingTime;
  }
  else if(gameMode === 'words') {
    quantityInputElement.value = playingWords;
  }
  clearTimeout(intervalTimerId);
  clearTimeout(intervalTempId);

  renderWords();
}

function startTimer() {
  timer = playingTime;

  intervalTimerId = setInterval(() => {
    if(timer > 0) {
      timer--;
      quantityInputElement.value = timer;
    }
    if(timer === 0) {
      finishGame();
    }
  }, 1000);
}

function startTemp() {
  temp = 0;

  intervalTempId = setInterval(() => {
    temp++;
    quantityInputElement.value = temp;
  },1000);
}

// Game logic

function nextWord() {
  // Change to the next word in the list
  currentWordElem.classList.remove('js-actual-word');
  wordIndex++;

  if(wordIndex === wordsList.length) {
    finishGame();
    return;
  }

  currentWordElem = document.querySelector(`#word${wordIndex}`);
  currentWordElem.classList.add('js-actual-word');
  // Move the display scroll to center the actual word
  currentWordElem.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
}

function submitWord(){
  // Update the score and paint the word 
  if(compareWord() && getCurrentWord().length === getInputValue().length - 1){
    // correct word
    score.correctWord++;
    currentWordElem.classList.add('green-color');
  } else {
    // wrong word
    score.wrongWord++;
    currentWordElem.classList.add('red-color');
    currentWordElem.classList.remove('bgc-red');
  }

  // Reset the input and next word
  inputElement.value = '';
  nextWord();
}

function compareWord() {
  // Compare the actual word and the input word
  const inputWord = getInputValue().replaceAll(' ', '');
  const actualWord = getCurrentWord().slice(0, inputWord.length);
  return inputWord === actualWord ? true : false;
}

function compareChar() {
  const indexLastChar = getInputValue().length - 1;
  const inputChar = getInputValue()[indexLastChar];
  const actualWordChar = getCurrentWord()[indexLastChar];
  return inputChar === actualWordChar ? true : false;
}

function getCurrentWord() {
  return document.querySelector('.js-actual-word').innerHTML;
}

function getInputValue() {
  return inputElement.value;
}

//-------------DOM--------------

async function renderWords(){
  if(gameMode === 'time') {
    await getWords(200);
  }
  else if (gameMode === 'words') {
    playingWords = document.querySelector('.js-quantity-input').value;
    await getWords(playingWords);
  }

  let displayHtml = '';

  wordsList.forEach((word, i) => {
    if(i === 0) {
      displayHtml += `<div id="word0" class="word js-actual-word">${word}</div>`;
      return;
    }
    displayHtml += `<div id="word${i}" class="word">${word}</div>`;
  });

  wordsContainerElement.innerHTML = displayHtml;
  currentWordElem = document.querySelector('#word0');
  wordIndex = 0;
  document.querySelector('.js-display').scrollTop = 0;
  inputElement.disabled = false;
  inputElement.value = '';
}

function calculateUpdateResults() {
  const keystrokes = score.correctChar + score.wrongChar;
  const accuracy = Math.floor(score.correctChar / (score.correctChar + score.wrongChar) * 100) || 0;
  let wpm;
  if(gameMode === 'time') {
    wpm = 60 / playingTime * score.correctWord;
  }
  else if(gameMode === 'words') {
    wpm = 60 / temp * score.correctWord;
  }
  
  document.querySelector('.js-score-container')
    .innerHTML = `
      <h2 class="score-title">Result</h2>
      <p class="js-wpm wpm">${Math.round(wpm)} WPM</p>
      <div class="score-element">
        <div>Time</div>
        <div>${gameMode === 'time' ? playingTime : temp}s</div>
      </div>
      <div class="score-element">
        <div>Keystrokes</div>
        <div>
          (<span class="green-color">${score.correctChar}</span> | <span class="red-color">${score.wrongChar}</span>) ${keystrokes}
        </div>
      </div>
      <div class="score-element">
        <div>Accuracy</div>
        <div>${accuracy}%</div>
      </div>
      <div class="score-element">
        <div>Correct words</div>
        <div class="green-color">${score.correctWord}</div>
      </div>
      <div class="score-element">
        <div>Wrong words</div>
        <div class="red-color">${score.wrongWord}</div>
      </div>
    `;

  inputElement.blur();
  toggleDisplayResult();
}

function toggleDisplayResult() {
  if(resultBgElement.style.display === 'block') {
    resultBgElement.style.display = 'none';
  }
  else {
    resultBgElement.style.display = 'block';
  }
}