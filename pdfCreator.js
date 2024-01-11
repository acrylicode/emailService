var pdf = require("pdf-creator-node");
var fs = require("fs");


const writePdf = (data, tempPdfId, templateName, pdfName, headerContent) => {
    // Read HTML Template
    var html = fs.readFileSync(templateName, "utf8");

    var options = {
        format: "A4",
        orientation: "portrait",
        header: {
            height: "45mm",
            contents: headerContent
        },
    };

    var document = {
        html: html,
        path: `./${tempPdfId}/${pdfName}`,
        data,
        type: "",
    };

    return new Promise((resolve, reject) => {
        pdf
            .create(document, options)
            .then((res) => {
                resolve(`./${tempPdfId}/${pdfName}`)
            })
            .catch((error) => {
                reject(error)
            });
    })
}

module.exports = writePdf