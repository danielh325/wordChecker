const init = () => {
    const fileInput = document.getElementById('fileInput');
    const results = document.getElementById('results');
    const textPreview = document.getElementById('textPreview');
    const wordCount = document.getElementById('wordCount');

    const processPDF = async (pdf) => {
        let fullText = '';
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            
            // Preserve original line breaks and spacing
            let pageText = '';
            let lastY = 0;
            
            textContent.items.forEach((item, index) => {
                // Detect new line using Y position
                if (index > 0 && Math.abs(item.transform[5] - lastY) > 5) {
                    pageText += '\n';
                }
                pageText += item.str + ' ';
                lastY = item.transform[5];
            });

            fullText += pageText + '\n\n';
        }
        return fullText;
    };

    const countWords = (text) => {
        // Remove numbers and special characters
        const cleaned = text
            .replace(/\d+/g, '')
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        return cleaned.split(' ').filter(word => word.length > 0).length;
    };

    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        document.getElementById('progressOverlay').style.display = 'flex';
        results.style.display = 'none';

        try {
            const pdfData = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
            const rawText = await processPDF(pdf);
            
            // Stop at citation
            const citationIndex = rawText.toLowerCase().indexOf('citation');
            const finalText = citationIndex > -1 
                ? rawText.substring(0, citationIndex) 
                : rawText;

            // Display formatted text
            textPreview.textContent = finalText;
            wordCount.textContent = countWords(finalText);
            results.style.display = 'block';
        } catch (error) {
            alert('Error processing PDF: ' + error.message);
        } finally {
            document.getElementById('progressOverlay').style.display = 'none';
        }
    });
};

document.addEventListener('DOMContentLoaded', init);
