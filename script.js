const wordsList = ['hello', 'back', 'cat', 'dog', 'ruin', 'socks', 'read', 'piano', 'pencil', 'red', 'white', 'clock'];

const inputElement = document.querySelector('.js-input');
const displayElement = document.querySelector('.js-display');
let actualWordElem;

let quantityWords = 20;
let wordIndex = 0;
const score = {
  wrongChar: 0,
  correctChar: 0,
  wrongWord: 0,
  correctWord: 0
}

updateQuantityWords();
showWordsInDisplay(quantityWords);
displayResults();

function showWordsInDisplay(quantity){
  // Create al the words and show it on the display
  let displayHtml = '';
  for(let i = 0; i < quantity; i++) {
    const word = wordsList[Math.floor(Math.random() * wordsList.length)];
    if(i === 0) {
      displayHtml += `<div id="word0" class="word js-actual-word">${word}</div>`;
      continue;
    }
    displayHtml += `<div id="word${i}" class="word">${word}</div>`;
  }
  displayElement.innerHTML = displayHtml;
  actualWordElem = document.querySelector('#word0');
}

function nextWord() {
  // Change to the next word in the list
  actualWordElem.classList.remove('js-actual-word');

  wordIndex++;
  if(wordIndex === quantityWords) {
    // If it was the last word, finish
    displayResults();
    return;
  }
  actualWordElem = document.querySelector(`#word${wordIndex}`);
  actualWordElem.classList.add('js-actual-word');
}

function displayResults() {
  const keystrokesElem = document.querySelector('.js-keystrokes');
  const accuracyElem = document.querySelector('.js-accuracy');
  const correctWordsElem = document.querySelector('.js-correct-words');
  const wrongWordsElem = document.querySelector('.js-wrong-words');

  const keystrokes = score.correctChar + score.wrongChar;
  const accuracy = Math.floor(score.correctChar / (score.correctChar + score.wrongChar) * 100) || 0;

  keystrokesElem.innerHTML = `(<span class="green-color">${score.correctChar}</span> | <span class="red-color">${score.wrongChar}</span>) ${keystrokes}`;
  accuracyElem.innerHTML = `${accuracy}%`
  correctWordsElem.innerHTML = `<span class="green-color">${score.correctWord}</span>`;
  wrongWordsElem.innerHTML = `<span class="red-color">${score.wrongWord}</span>`;
}

function onKeyUpInput(event) {
  // Put the background red on the word if the input is wrong
  if(!compareWord()){
    actualWordElem.classList.add('bgc-red');
  }
  else {
    actualWordElem.classList.remove('bgc-red');
  }

  // If one key was pressed in the input
  if (event.key != ' ' && event.key != 'Backspace') {
    // Compare the chars and update score
    if(compareChar()) {
      score.correctChar++;
    }
    else {
      score.wrongChar++;
    }
  }
  else if(event.key === ' ') {
    // If the input was a space, submit the word
    if(getInputValue().replaceAll(' ', '') === '') {
      // If nothing is write, not submit
      inputElement.value = '';
      return;
    }
    submitWord();
  }
}

function submitWord(){
  // Update the score and paint the word 
  if(compareWord() && getActualWord().length === getInputValue().length - 1){
    // correct word
    score.correctWord++;
    actualWordElem.classList.add('green-color');
  } else {
    // wrong word
    score.wrongWord++;
    actualWordElem.classList.add('red-color');
    actualWordElem.classList.remove('bgc-red');
  }

  // Reset the input and next word
  inputElement.value = '';
  nextWord();
}

function compareWord() {
  // Compare the actual word and the input word
  const inputWord = getInputValue().replaceAll(' ', '');
  const actualWord = getActualWord().slice(0, inputWord.length);
  return inputWord === actualWord ? true : false;
}

function compareChar() {
  // Compare the last char in input with the actual word char
  const indexLastChar = getInputValue().length - 1;
  const inputChar = getInputValue()[indexLastChar];
  const actualWordChar = getActualWord()[indexLastChar];
  return inputChar === actualWordChar ? true : false;
}

function reset(){
  score.wrongChar = 0;
  score.correctWord = 0;
  score.correctChar = 0;
  score.wrongWord = 0;
  inputElement.value = '';
  wordIndex = 0;
  updateQuantityWords()
  showWordsInDisplay(quantityWords);
  displayResults();
}

function resetKeyPressed(event) {
  // If enter was pressed in the quantity input then reset
  if(event.key === 'Enter') {
    reset();
  }
}

function updateQuantityWords() {
  quantityWords = Number(document.querySelector('.js-quantity-input').value) || 20;
}

function getActualWord() {
  return document.querySelector('.js-actual-word').innerHTML;
}

function getInputValue() {
  return inputElement.value;
}