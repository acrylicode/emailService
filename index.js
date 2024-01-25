const express = require('express')
const cors = require('cors')
const app = express()
const port = 10000
const bodyParser = require('body-parser')
const nodemailer = require('nodemailer');
const CryptoJS = require('crypto-js');
const writePdf = require('./pdfCreator');
var fs = require("fs");
const handlebars = require('handlebars');
const path = require('path');

const emailSender = process.env.SENDER

const transporter = nodemailer.createTransport({
    port: 465,               // true for 465, false for other ports
    host: process.env.HOST,
    auth: {
        user: emailSender,
        pass: process.env.EMAIL_PASS,
    },
    secure: true,

});



// create application/json parser
const jsonParser = bodyParser.json()

app.use(cors())


app.get('/', (req, res) => {
    res.send('Hello World!')
})

const permutationsForSouvenirs = [
    [0, 1, 2, 3], // None
    [0, 1, 3, 2], // None
    [0, 2, 1, 3], // -> yes
    [0, 2, 3, 1], // -> yes
    [0, 3, 1, 2], // -> yes
    [0, 3, 2, 1], // None
    [1, 0, 2, 3], // None
    [1, 0, 3, 2], // None
    [1, 2, 0, 3], // -> yes
    [1, 2, 3, 0], // -> yes
    [1, 3, 0, 2], // None
    [1, 3, 2, 0], // -> yes
    [2, 0, 1, 3], // -> yes
    [2, 0, 3, 1], // None
    [2, 1, 0, 3], // None
    [2, 1, 3, 0], // -> yes
    [2, 3, 0, 1], // None
    [2, 3, 1, 0], // -> yes
    [3, 0, 1, 2], // -> yes
    [3, 0, 2, 1], // -> yes
    [3, 1, 0, 2], // -> yes
    [3, 1, 2, 0], // -> yes
    [3, 2, 0, 1], // -> yes
    [3, 2, 1, 0] // -> yes
];

const permutationsForGroups = [
    [0, 2, 1, 3], // -> yes 0
    [0, 2, 3, 1], // -> yes 1
    [0, 3, 1, 2], // -> yes 2
    [1, 2, 0, 3], // -> yes 3
    [1, 2, 3, 0], // -> yes 4
    [1, 3, 2, 0], // -> yes 5
    [2, 0, 1, 3], // -> yes 6
    [2, 1, 3, 0], // -> yes 7
    [2, 3, 1, 0], // -> yes 8
    [3, 0, 1, 2], // -> yes 9 
    [3, 0, 2, 1], // -> yes 10
    [3, 1, 0, 2], // -> yes 11
    [3, 1, 2, 0], // -> yes 12
    [3, 2, 0, 1], // -> yes 13
    [3, 2, 1, 0] // -> yes 14
]; // 15 groups


const poemLines = [
    "Logic and emotion are antagonists.",
    "In the mix a new paradigm emerges.",
    "Uncovering a purer essence of the sense of self.",
    "Wisely releasing excitement to achieve a common frequency.",


    "In the depths of the ocean, a delicate balance is disturbed.",
    "Intrusion of civilization disrupts the harmony and the natural order.",
    "Human intervention causes a ripple effect that shatters the serenity.",
    "The fragile equilibrium is fractured, leaving residents in jeopardy.",


    "Stillness uncovers new perspectives.",
    "Storms of thoughts conquer your attention.",
    "Desire, emotions and addictions confuse the mind and cloud the judgment.",
    "Find the antidote within yourself.",


    "Within the constant flow of reality, proximity to action quickens the pace of time.",
    "The intensity of the experience bends the rhythm of life.",
    "Anticipation in the game of existence, creates a thrilling sense of purpose.",
    "Urgency is the fuel for action.",
]



const deletePdf = (dir) => {

    fs.rmSync(dir, { recursive: true, force: true });

    // const filePath = "./temp/Certificate_of_Engagement.pdf";

    // try {
    //     fs.unlinkSync(filePath, (err) => {
    //         if (err) {
    //             console.error(`Error deleting file: ${err}`);
    //         } else {
    //             console.log('File deleted successfully');
    //         }
    //     });

    // } catch (err) {
    //     console.log(err)
    // }
}

function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

const sendMail = (mail, souvenirPath, souvenirName, cerificateFolder, token) => {

    const __dirname = path.resolve();
    const filePath = path.join(__dirname, 'templateEmail.html');
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const replacements = {
        url: `https://felipeinfantinom.com/activate?accessToken=${token}`,
    };
    const htmlToSend = template(replacements);


    const mailData = {
        from: emailSender,  // sender address
        to: mail,   // list of receivers
        subject: 'The journey continues',
        html: htmlToSend,
        // text: `Dear Engager, 
        
        
        // Thank you for your participation and engagement in the exhibition. 
        
        // I hope you enjoyed the experience.

        // Attached is a unique activation key and additional guidance.

        // Everything you find that takes you to greater knowledge, keep it to yourself.

        // This journey is meant to be enjoyed alone. 

        // Trust me it will make sense in the future, only one can be rewarded.


        // Greetings,
        // Felipe Infantino M
        // `,
        attachments: [
            {
                filename: 'Unique_secret.pdf',
                path: `${cerificateFolder}/Unique_secret.pdf`
            },
            {
                filename: 'Additional_Guidence.pdf',
                path: `${cerificateFolder}/Additional_Guidence.pdf`
            },
        ]
    };

    transporter.sendMail(mailData, function (err, info) {
        if (err) {
            console.log(err)
        } else {
            console.log(info);
            setTimeout(() => {
                deletePdf(cerificateFolder)
            }, 10000)
        }
    });
}


function replaceAndCapitalize(inputString) {
    const charactersToReplaceWithSpace = [".", "_", "+", "-", "~", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

    let replacedString = '';
    let seenCharacter = false;

    for (const char of inputString) {
        if (charactersToReplaceWithSpace.includes(char)) {
            if (!seenCharacter) {
                replacedString += ' ';
                seenCharacter = true;
            }
        } else {
            replacedString += char;
            seenCharacter = false;
        }
    }

    // Capitalize the first letter of each word
    replacedString = replacedString.replace(/\b\w/g, match => match.toUpperCase());

    return replacedString.trim();
}


// For personalized email
app.post('/emailService', jsonParser, (req, res) => {
    console.log('emailService')
    const { recievePersonalized, email, order, title, date, engagerNumber, token } = req.body
    res.sendStatus(200)
    res.end()

    console.log("recievePersonalized, email, order, title, date, engagerNumber", recievePersonalized, email, order, title, date, engagerNumber)

    if (recievePersonalized) {
        const index = permutationsForSouvenirs.findIndex((permutation) => permutation.every((value, index) => value === order[index]))
        const souvenirIndex = index + 1

        const group = permutationsForGroups.findIndex((permutation) => permutation.every((value, index) => value === order[index])) + 1

        const poemLine = poemLines[group - 1]
        const souvenirPath = `assets/Images/${souvenirIndex}.jpeg`
        const souvenirName = `${souvenirIndex}.jpeg`
        const name = replaceAndCapitalize(email.split('@')[0])

        const payload = `${group},${engagerNumber}`
        // const derived_key = CryptoJS.enc.Base64.parse(process.env.ENCRYPTION_KEY)
        // const iv = CryptoJS.enc.Utf8.parse(process.env.ENCRYPTION_IV);
        // const encryptedData = CryptoJS.AES.encrypt(payload, derived_key, { iv: iv, mode: CryptoJS.mode.CBC }).toString();
        const encryptedData = btoa(payload)

        const tempPdfId = uuidv4()

        try {
            if (!fs.existsSync(tempPdfId)) {
                fs.mkdirSync(tempPdfId);
            }
        } catch (err) {
            console.error(err);
        }
        console.log('group', group)
        console.log('poemLine', poemLine)
        const dataEngangement = {
            group,
            poemLine,
            qrCodeUrl: encryptedData
        }
        const headerContent = `<div style="text-align: center; margin-top: 50px">
        <h1 style="font-weight: 700;">Activation key</h1>
        </div>`

        const templateName = poemLine ? "template.html" : "templateNoGroup.html"

        const certicatePromise = writePdf(dataEngangement, tempPdfId, templateName, "Unique_secret.pdf", headerContent)



        const headerContentHiddenLanguage = `<div style="text-align: center; margin-top: 50px">
        <h1 style="font-weight: 700;">Hidden Language</h1>
        </div>`

        const hiddenPromise = writePdf(dataEngangement, tempPdfId, "hiddenLanguage.html", "Additional_Guidence.pdf", headerContentHiddenLanguage)
        Promise.all([certicatePromise, hiddenPromise]).then((values) => {
            console.log(values, souvenirPath);
            sendMail(email, souvenirPath, souvenirName, tempPdfId, token)

        }).catch((err) => {
            console.log(err)
        })




    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})