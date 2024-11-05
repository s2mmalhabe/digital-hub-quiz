const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const questions = require('./questions');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs'); 
app.use(express.static('public'));
app.use('/node_modules', express.static('node_modules'));


let currentQuestion = 0;
let score = 0;
let answers = [];

app.get('/', (req, res) => {
    res.render('index', { 
        question: questions[currentQuestion],
        currentQuestion: currentQuestion 
    });
});

app.post('/submit-answer', (req, res) => {
    const { answer } = req.body;
    answers.push(answer);

    // Calculate score
    if (answer === 'a') score += 3;
    else if (answer === 'b') score += 2;
    else if (answer === 'c') score += 1;

    currentQuestion++;

    if (currentQuestion < questions.length) {
        res.redirect('/');
    } else {
        res.sendFile(__dirname + '/public/end.html');
    }
});



app.post('/finalize', (req, res) => {
    const email = req.body.email;
    let grade = '';

    if (score >= 15) grade = 'green';
    else if (score >= 11) grade = 'yellow';
    else grade = 'red';

    // Save results
    const result = `Email: ${email}, Grade: ${grade}, Score: ${score}, Answers: ${JSON.stringify(answers)}\n`;
    fs.appendFileSync('results.txt', result);

    // Reset for next user
    currentQuestion = 0;
    score = 0;
    answers = [];

    res.redirect('/');
});


app.post('/start-over', (req, res) => {
    // Reset everything for a new quiz without saving any info
    currentQuestion = 0;
    score = 0;
    answers = [];

    res.redirect('/');
});


app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
