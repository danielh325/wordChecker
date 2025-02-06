const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
    const { filePath } = event.queryStringParameters;  // File path passed as query param

    // Your function for counting words
    function countWordsInText(text) {
        const cleanedText = text.replace(/[^A-Za-z\s-]/g, '');
        const words = cleanedText.split(/\s+/);
        const filteredWords = words.filter(word => isNaN(word));
        const wordCount = filteredWords.filter(word => /^[A-Za-z-]+$/.test(word)).length;
        return { wordCount, cleanedText };
    }

    function countAllWordsFromTextFile(filePath) {
        let totalWordCount = 0;
        let totalText = '';
        let citationFound = false;

        try {
            const text = fs.readFileSync(path.join(__dirname, '..', filePath), 'utf-8');
            let content = '';

            const lines = text.split('\n');
            for (let line of lines) {
                if (line.toLowerCase().includes('citation')) {
                    citationFound = true;
                    content += line.split('citation')[0];
                    break;
                }
                content += line + '\n';
            }

            const { wordCount, cleanedText } = countWordsInText(content);
            totalWordCount = wordCount;
            totalText = cleanedText;

            return { totalWordCount, totalText, citationFound };
        } catch (e) {
            console.error(`Error: ${e}`);
            return { error: e.message, totalText: '', citationFound: false };
        }
    }

    if (!filePath) {
        return {
            statusCode: 400,
            body: 'Error: File path is required.',
        };
    }

    if (!fs.existsSync(filePath)) {
        return {
            statusCode: 400,
            body: `Error: File '${filePath}' not found.`,
        };
    }

    const { totalWordCount, totalText, citationFound } = countAllWordsFromTextFile(filePath);

    if (typeof totalWordCount === 'number') {
        let includedText = totalText.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        let wordCountMessage = `Total word count: ${totalWordCount}`;

        if (citationFound) {
            wordCountMessage = `Total word count (stopped at 'citation'): ${totalWordCount - 1}`;
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                wordCountMessage,
                includedText,
            }),
        };
    }

    return {
        statusCode: 500,
        body: `Error: ${totalText}`,
    };
};
