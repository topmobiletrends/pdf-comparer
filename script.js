document.addEventListener('DOMContentLoaded', function() {
    const pdf1Input = document.getElementById('pdf1');
    const pdf2Input = document.getElementById('pdf2');
    const compareBtn = document.getElementById('compare-btn');
    const preview1 = document.getElementById('preview1');
    const preview2 = document.getElementById('preview2');
    const textDiffOutput = document.getElementById('text-diff');
    const diffPreview1 = document.getElementById('diff-preview1');
    const diffPreview2 = document.getElementById('diff-preview2');

    // Set PDF.js worker path
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

    // Load and preview PDF
    async function loadPDF(inputElement, previewElement) {
        const file = inputElement.files[0];
        if (!file) return;

        const fileReader = new FileReader();
        
        fileReader.onload = async function() {
            const typedarray = new Uint8Array(this.result);
            
            try {
                // Load the PDF document
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                
                // Get the first page
                const page = await pdf.getPage(1);
                const scale = 1.5;
                const viewport = page.getViewport({ scale });
                
                // Prepare canvas
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                
                // Render PDF page to canvas
                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;
                
                // Clear previous content and append canvas
                previewElement.innerHTML = '';
                previewElement.appendChild(canvas);
                
                // Extract text (for comparison)
                const textContent = await page.getTextContent();
                const text = textContent.items.map(item => item.str).join(' ');
                return text;
            } catch (error) {
                console.error('Error loading PDF:', error);
                previewElement.innerHTML = '<p>Error loading PDF. Please try another file.</p>';
                return '';
            }
        };
        
        fileReader.readAsArrayBuffer(file);
    }

    // Compare two PDFs
    async function comparePDFs() {
        const file1 = pdf1Input.files[0];
        const file2 = pdf2Input.files[0];
        
        if (!file1 || !file2) {
            alert('Please upload both PDF files first.');
            return;
        }
        
        // Load and extract text from both PDFs
        const text1 = await loadPDF(pdf1Input, preview1);
        const text2 = await loadPDF(pdf2Input, preview2);
        
        // Compare the text content
        const dmp = new diff_match_patch();
        const diffs = dmp.diff_main(text1, text2);
        dmp.diff_cleanupSemantic(diffs);
        
        // Display differences
        displayTextDiff(diffs);
    }

    // Display text differences
    function displayTextDiff(diffs) {
        let html = '';
        diffs.forEach(([type, text]) => {
            switch (type) {
                case 1: // Insertion
                    html += `<span class="diff-added">${text}</span>`;
                    break;
                case -1: // Deletion
                    html += `<span class="diff-removed">${text}</span>`;
                    break;
                case 0: // No change
                    html += text;
                    break;
            }
        });
        textDiffOutput.innerHTML = html;
    }

    // Event listeners
    pdf1Input.addEventListener('change', () => loadPDF(pdf1Input, preview1));
    pdf2Input.addEventListener('change', () => loadPDF(pdf2Input, preview2));
    compareBtn.addEventListener('click', comparePDFs);
});