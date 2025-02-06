// Attach event listener to button
document.getElementById('processBtn').addEventListener('click', function () {
    const textInput = document.getElementById('userInput').value;
    const outputDiv = document.getElementById('output');
    const outputContainer = document.getElementById('outputContainer');

    outputDiv.textContent = ''; // Clear previous output
    outputContainer.style.display = 'none'; // Hide output before processing

    if (!textInput.trim()) {
        outputDiv.textContent = 'Please enter some text.';
        updateWordCount(0);
        outputContainer.style.display = 'block'; // Show output box even for error message
        return;
    }

    const result = countAllWordsFromText(textInput);

    let displayText = 'Processed Text:\n\n' + result.totalText + '\n\n';
    if (result.citationFound) {
        displayText += "Total word count (stopped at 'citation'): " + (result.totalWordCount - 1);
    } else {
        displayText += "Total word count: " + result.totalWordCount;
    }

    outputDiv.innerHTML = displayText.replace(/\n/g, '<br>'); // Preserve line breaks
    
    updateWordCount(result.totalWordCount);
    
    outputContainer.style.display = 'block'; // Show output box after processing
});

// Update live word count as user types
document.getElementById('userInput').addEventListener('input', function () {
    const text = this.value;
    const result = countAllWordsFromText(text);
    updateWordCount(result.totalWordCount);
});

// Function to clean and count words from text
function countWordsInText(text) {
    // Remove unwanted characters (numbers, special symbols, etc.)
    const cleanedText = text.replace(/[^A-Za-z\s-]/g, ''); // Keeps letters, spaces, and hyphens

    // Tokenize the cleaned text
    const words = cleanedText.split(/\s+/);

    // Remove words that are purely numeric (to avoid counting numbers)
    const filteredWords = words.filter(word => isNaN(word));

    // Count only words (including hyphenated words)
    const wordCount = filteredWords.filter(word => /^[A-Za-z-]+$/.test(word)).length;

    return { wordCount, cleanedText };
}

// Function to process the text input
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

// Function to update word count display
function updateWordCount(count) {
    document.getElementById('wordCount').textContent = count;
}
