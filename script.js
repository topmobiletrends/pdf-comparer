document.addEventListener('DOMContentLoaded', function() {
    const pdf1Input = document.getElementById('pdf1');
    const pdf2Input = document.getElementById('pdf2');
    const compareBtn = document.getElementById('compare');
    const resultsDiv = document.getElementById('results');

    // Set PDF.js worker path
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

    compareBtn.addEventListener('click', async function() {
        const file1 = pdf1Input.files[0];
        const file2 = pdf2Input.files[0];
        
        if (!file1 || !file2) {
            resultsDiv.innerHTML = '<p>Please upload both PDF files</p>';
            return;
        }

        resultsDiv.innerHTML = '<p>Processing PDFs...</p>';

        try {
            const text1 = await extractText(file1);
            const text2 = await extractText(file2);
            
            // Simple text comparison
            const diff = text1 === text2 
                ? '<p style="color:green">PDFs are identical</p>' 
                : '<p style="color:red">PDFs are different</p>';
            
            resultsDiv.innerHTML = diff;
        } catch (error) {
            resultsDiv.innerHTML = `<p style="color:red">Error: ${error.message}</p>`;
        }
    });

    async function extractText(file) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        const page = await pdf.getPage(1);
        const content = await page.getTextContent();
        return content.items.map(item => item.str).join(' ');
    }
});