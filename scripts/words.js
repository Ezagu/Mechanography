export let wordsList = [];

export async function getWords(quantity) {
  const response = await fetch(`https://random-word-api.vercel.app/api?words=${quantity}`);
  const words = await response.json();
  wordsList = words;
}