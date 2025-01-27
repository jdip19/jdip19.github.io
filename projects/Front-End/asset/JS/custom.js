
// Function to generate and append the HTML code
function generateAndAppendRow() {
    var outputContainer = document.getElementById('outputContainer');

    for (var i = 1; i <= 10; i++) {
        var newRow = document.createElement('div');
        newRow.className = 'flex-row justify-content-between tbl-row';
        newRow.innerHTML = `
        <div>`+ i + `</div>
        <div>12</div>
        <div>LIOLO CERAMICA PVT.</div>
        <div>RAJKOT</div>
        <div>58</div>
        <div>1476</div>
        <div>1866904</div>
        <div>0</div>
        <div>587354</div>
        <div>1866904</div>
        <div>49286</div>
        <div>1817618</div>
        `;
        outputContainer.appendChild(newRow);
    }
}
function genPDF() {
    const pdf = new jsPDF();
    pdf.fromHTML(document.getElementById('my-element'));
    pdf.save("output.pdf");
    const dataURL = pdf.output('datauri');
}