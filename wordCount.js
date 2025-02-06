const fs = require('fs');

// Function to clean and count words from text
function countWordsInText(text) {
    // Remove unwanted characters (numbers, special symbols, etc.)
    const cleanedText = text.replace(/[^A-Za-z\s-]/g, '');  // Keeps only letters, spaces, and hyphens
    
    // Tokenize the cleaned text
    const words = cleanedText.split(/\s+/);

    // Remove words that are purely numeric (to avoid counting numbers)
    const filteredWords = words.filter(word => isNaN(word));

    // Count only words (no punctuation or special characters)
    const wordCount = filteredWords.filter(word => /^[A-Za-z-]+$/.test(word)).length; // Include hyphenated words

    return { wordCount, cleanedText };
}

// Function to count all words from a text file
function countAllWordsFromTextFile(filePath) {
    let totalWordCount = 0;
    let totalText = '';
    let citationFound = false;

    try {
        const text = fs.readFileSync(filePath, 'utf-8');
        let content = '';
        
        const lines = text.split('\n');
        for (let line of lines) {
            // Check if 'citation' is in the current line
            if (line.toLowerCase().includes('citation')) {
                citationFound = true;
                content += line.split('citation')[0];  // Add text before 'citation'
                break;  // Stop after finding 'citation'
            }

            content += line + '\n';  // Otherwise, keep adding the line to the content
        }

        // Clean and count words from the text up to the word 'citation'
        const { wordCount, cleanedText } = countWordsInText(content);
        totalWordCount = wordCount;
        totalText = cleanedText;

        return { totalWordCount, totalText, citationFound };
    } catch (e) {
        console.error(`Error: ${e}`);
        return { error: e.message, totalText: '', citationFound: false };
    }
}

// Main program that gets input from command line
const filePath = process.argv[2];  // Get the file path from command line argument

if (!filePath) {
    console.log('Usage: node countWords.js <path_to_text_file>');
    process.exit(1);
}

if (!fs.existsSync(filePath)) {
    console.log(`Error: File '${filePath}' not found.`);
    process.exit(1);
}

const { totalWordCount, totalText, citationFound } = countAllWordsFromTextFile(filePath);

if (typeof totalWordCount === 'number') {
    let includedText = totalText.replace(/\n/g, ' ');  // Replace newlines with spaces
    includedText = includedText.replace(/\s+/g, ' ').trim();  // Collapse multiple spaces into one
    
    console.log('\nText added to the word count:\n');
    console.log(includedText);
    
    if (citationFound) {
        console.log(`\nTotal word count (stopped at 'citation'): ${totalWordCount - 1}`);
    } else {
        console.log(`\nTotal word count: ${totalWordCount}`);
    }
} else {
    console.log(totalWordCount);  // Error message
}
