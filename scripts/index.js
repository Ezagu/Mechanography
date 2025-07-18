import { wordsList, getWords } from './words.js';

const inputElement = document.querySelector('.js-input');
const resetButtonElement = document.querySelector('.js-reset-button');
const quantityInputElement = document.querySelector('.js-quantity-input');

const wordsContainerElement = document.querySelector('.js-words-container');
const timerElement = document.querySelector('.js-timer');
const resultBgElement = document.querySelector('.js-result-bg');

let quantityWords = 60;
const score = {
  wrongChar: 0,
  correctChar: 0,
  wrongWord: 0,
  correctWord: 0
}
let currentWordElem;
let intervalTimerId;
let quantityTimer = 60;
let wordIndex = 0;
let time;
let isPlaying = false;
let gameMode = 'time';

if(gameMode === 'time') {
  getWords(200).then(() => {
    renderWords(quantityWords);
  });
}
else if(gameMode === 'word') {
  getWords(quantityWords).then(() => {
    renderWords(quantityWords);
  });
}



// Event Listener

document.querySelector('.js-close-button')
  .addEventListener('click', () => {
    toggleDisplayResult();
    reset();
  });

inputElement.addEventListener('keyup', (event) => onKeyUpInput(event));

resetButtonElement.addEventListener('click', () => reset());

quantityInputElement.addEventListener('keydown', (event) => resetKeyPressed(event));

function onKeyUpInput(event) {
  console.log(event);
  // Put the background red on the word if the input is wrong
  if(!compareWord()){
    currentWordElem.classList.add('bgc-red');
  }
  else {
    currentWordElem.classList.remove('bgc-red');
  }
  // If one key was pressed in the input
  if (event.key != ' ' && event.key != 'Backspace' && event.key != 'Enter') {
    // If not playing then start the timer
    if(!isPlaying) {
      startTimer();
      isPlaying = true;
    }
    // Compare the chars and update score
    if(compareChar()) {
      score.correctChar++;
    }
    else {
      score.wrongChar++;
    }
  }
  else if(event.key === ' ' || event.code === 'Space') {
    // If the input was a space then submit the word
    if(getInputValue().replaceAll(' ', '') === '') {
      // If nothing is write then dont submit
      inputElement.value = '';
      return;
    }
    submitWord();
  }
}

function reset(){
  isPlaying = false;
  // Reset score
  score.wrongChar = 0;
  score.correctWord = 0;
  score.correctChar = 0;
  score.wrongWord = 0;

  inputElement.value = '';
  wordIndex = 0;
  // Reset the words in display
  getWords(200).then(() => {
    renderWords(quantityWords);
  });
  // Stop timer
  clearInterval(intervalTimerId);
  // Reset timer
  updateQuantityTimer();
  timerElement.innerHTML = quantityTimer;
  // Scroll the display to top
  document.querySelector('.js-display').scrollTop = 0;
  // Set focus on input
  inputElement.focus();
}

function startTimer() {
  // Start the timer
  // Get the time and put it
  updateQuantityTimer()
  time = quantityTimer;
  //Start the interval
  intervalTimerId = setInterval(function() {
    if(time > 0) {
      time--;
      timerElement.innerHTML = time;
    }
    if(time === 0) {
      // Time up
      isPlaying = false;
      calculateUpdateResults();
      // Stop the interval
      clearTimeout(intervalTimerId);
    }
  }, 1000)
}

function updateQuantityTimer() {
  // Get the value in the input quantity and put it in the variable
  quantityTimer = Number(quantityInputElement.value) || 60;

  if(quantityTimer < 30) {
    // If was an incorrect value, put it 30
    quantityInputElement.value = 30;
    quantityTimer = 30;
  }
}

function nextWord() {
  // Change to the next word in the list
  currentWordElem.classList.remove('js-actual-word');
  wordIndex++;
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

function renderWords(){
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
}

function calculateUpdateResults() {
  // Calculate and update the results
  const keystrokesElem = document.querySelector('.js-keystrokes');
  const accuracyElem = document.querySelector('.js-accuracy');
  const correctWordsElem = document.querySelector('.js-correct-words');
  const wrongWordsElem = document.querySelector('.js-wrong-words');
  const wpmElem = document.querySelector('.js-wpm');

  const keystrokes = score.correctChar + score.wrongChar;
  const accuracy = Math.floor(score.correctChar / (score.correctChar + score.wrongChar) * 100) || 0;
  const wpm = 60 / quantityTimer * score.correctWord;

  wpmElem.innerHTML = `${wpm} WPM`; 
  keystrokesElem.innerHTML = `(<span class="green-color">${score.correctChar}</span> | <span class="red-color">${score.wrongChar}</span>) ${keystrokes}`;
  accuracyElem.innerHTML = `${accuracy}%`
  correctWordsElem.innerHTML = `<span class="green-color">${score.correctWord}</span>`;
  wrongWordsElem.innerHTML = `<span class="red-color">${score.wrongWord}</span>`;
  // Unfocus the input
  inputElement.blur();
  // Show the results
  toggleDisplayResult();
}

function toggleDisplayResult() {
  // Show or not the result modal window
  if(resultBgElement.style.display === 'block') {
    //Hide
    resultBgElement.style.display = 'none';
  }
  else {
    //Show
    resultBgElement.style.display = 'block';
  }
}

function resetKeyPressed(event) {
  // If enter was pressed in the quantity input then reset
  if(event.key === 'Enter') {
    reset();
  }
}