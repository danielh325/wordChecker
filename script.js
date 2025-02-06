// Attach event listener to the process button
document.getElementById('processBtn').addEventListener('click', function() {
  const fileInput = document.getElementById('fileInput');
  const outputDiv = document.getElementById('output');
  outputDiv.textContent = ''; // Clear previous output

  if (!fileInput.files || fileInput.files.length === 0) {
    outputDiv.textContent = 'Please select a file.';
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
    const text = e.target.result;
    const result = countAllWordsFromText(text);

    let displayText = 'Text added to the word count:\n\n' + result.totalText + '\n\n';
    if (result.citationFound) {
      displayText += "Total word count (stopped at 'citation'): " + (result.totalWordCount - 1);
    } else {
      displayText += "Total word count: " + result.totalWordCount;
    }
    
    outputDiv.textContent = displayText;
  };

  reader.onerror = function() {
    outputDiv.textContent = 'Error reading file.';
  };

  reader.readAsText(file);
});

// Function to clean and count words from text
function countWordsInText(text) {
  // Remove unwanted characters (numbers, special symbols, etc.)
  const cleanedText = text.replace(/[^A-Za-z\s-]/g, ''); // keeps letters, spaces, and hyphens

  // Tokenize the cleaned text
  const words = cleanedText.split(/\s+/);

  // Remove words that are purely numeric (to avoid counting numbers)
  const filteredWords = words.filter(word => isNaN(word));

  // Count only words (include hyphenated words)
  const wordCount = filteredWords.filter(word => /^[A-Za-z-]+$/.test(word)).length;

  return { wordCount, cleanedText };
}

// Function to process the text file content
function countAllWordsFromText(text) {
  let totalWordCount = 0;
  let totalText = '';
  let citationFound = false;

  const lines = text.split('\n');
  for (let line of lines) {
    // Check if 'citation' is in the current line (case-insensitive)
    if (line.toLowerCase().includes('citation')) {
      citationFound = true;
      // Append only the text before the word 'citation'
      totalText += line.split(/citation/i)[0];
      break;
    }
    totalText += line + '\n';
  }

  // Clean and count words from the text up to (but not including) 'citation'
  const { wordCount, cleanedText } = countWordsInText(totalText);
  totalWordCount = wordCount;

  return { totalWordCount, totalText: cleanedText.trim(), citationFound };
}
