document.getElementById('processBtn').addEventListener('click', function () {
    const fileInput = document.getElementById('fileInput');
    const textInput = document.getElementById('userInput').value;
    const outputDiv = document.getElementById('output');
    outputDiv.style.display = "none"; // Hide output box initially

    if (!textInput.trim() && (!fileInput.files || fileInput.files.length === 0)) {
        outputDiv.textContent = 'Please enter text or upload a file.';
        updateWordCount(0);
        return;
    }

    if (textInput.trim()) {
        // Process manually entered text
        processText(textInput);
    } else {
        // Process uploaded file (PDF or TXT)
        const file = fileInput.files[0];
        if (file.type === "application/pdf") {
            processPDF(file);
        } else if (file.type === "text/plain") {
            processTextFile(file);
        } else {
            outputDiv.textContent = 'Unsupported file type. Please upload a TXT or PDF file.';
        }
    }
});

// Function to process user-inputted text
function processText(text) {
    const result = countAllWordsFromText(text);
    displayResults(result);
}

// Function to process a text file
function processTextFile(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        processText(e.target.result);
    };
    reader.readAsText(file);
}

// Function to process a PDF file
// Function to process a PDF file
function processPDF(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const typedArray = new Uint8Array(e.target.result);
        pdfjsLib.getDocument(typedArray).promise.then(pdf => {
            let text = "";
            let promises = [];

            // Iterate over all the pages
            for (let i = 1; i <= pdf.numPages; i++) {
                promises.push(pdf.getPage(i).then(page => {
                    return page.getTextContent().then(content => {
                        // Concatenate text from each page
                        text += content.items.map(item => item.str).join(" ") + "\n";
                    }).catch(err => console.error(`Error extracting text from page ${i}:`, err));
                }));
            }

            // Ensure all pages are processed before displaying results
            Promise.all(promises).then(() => {
                // Now that all pages are processed, pass the text to processText function
                processText(text);
            }).catch(err => console.error("Error processing PDF:", err));
        }).catch(err => console.error("Error loading PDF:", err));
    };
    reader.readAsArrayBuffer(file);
}


// Function to display results
function displayResults(result) {
    const outputDiv = document.getElementById('output');
    outputDiv.style.display = "block"; // Show output box

    let displayText = 'Processed Text:\n\n' + result.totalText + '\n\n';
    if (result.citationFound) {
        displayText += "Total word count (stopped at 'citation'): " + (result.totalWordCount - 1);
    } else {
        displayText += "Total word count: " + result.totalWordCount;
    }

    outputDiv.textContent = displayText;
    updateWordCount(result.totalWordCount);
}

// Function to count words from text
function countAllWordsFromText(text) {
    let totalWordCount = 0;
    let totalText = '';
    let citationFound = false;

    const lines = text.split('\n');
    for (let line of lines) {
        if (line.toLowerCase().includes('citation')) {
            citationFound = true;
            totalText += line.split(/citation/i)[0];
            break;
        }
        totalText += line + '\n';
    }

    const { wordCount, cleanedText } = countWordsInText(totalText);
    totalWordCount = wordCount;

    return { totalWordCount, totalText: cleanedText.trim(), citationFound };
}

// Function to clean and count words
function countWordsInText(text) {
    const cleanedText = text.replace(/[^A-Za-z\s-]/g, '');
    const words = cleanedText.split(/\s+/).filter(word => isNaN(word) && /^[A-Za-z-]+$/.test(word));
    return { wordCount: words.length, cleanedText };
}

// Function to update word count display
function updateWordCount(count) {
    document.getElementById('wordCount').textContent = count;
}
