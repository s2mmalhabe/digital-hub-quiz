const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const session = require('express-session');
const questions = require('./questions');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs'); 
app.use(express.static('public'));
app.use('/node_modules', express.static('node_modules'));


app.use(session({
    secret: 'your-secret-key', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

app.get('/', (req, res) => {
    if (!req.session.currentQuestion) {
        req.session.currentQuestion = 0;
        req.session.score = 0;
        req.session.answers = [];
    }

    res.render('index', { 
        question: questions[req.session.currentQuestion],
        currentQuestion: req.session.currentQuestion 
    });
});

app.post('/submit-answer', (req, res) => {
    const { answer } = req.body;
    req.session.answers.push(answer);

    if (req.session.currentQuestion <= questions.length - 1) {

        if (answer === 'a') req.session.score += 3;
        else if (answer === 'b') req.session.score += 2;
        else if (answer === 'c') req.session.score += 1;
    }


    req.session.currentQuestion++;

    if (req.session.currentQuestion < questions.length) {
        res.redirect('/');
    } else {
        let grade = '';
        if (req.session.score >= 15) grade = 'green';
        else if (req.session.score >= 11) grade = 'yellow';
        else grade = 'red';

        req.session.grade = grade;

        res.render('end', { score: req.session.score, grade: grade });
    }
});

app.post('/finalize', (req, res) => {
    const email = req.body.email;
    const grade = req.session.grade;
    const score = req.session.score;
    const answers = req.session.answers.join(';'); 

    const filePath = 'results.csv';
    const fileExists = fs.existsSync(filePath);

    const result = `${email},${grade},${score},"${answers}"\n`;

    if (!fileExists) {
        const header = 'Email,Grade,Score,Answers\n';
        fs.writeFileSync(filePath, header, { flag: 'a' });
    }

    fs.appendFileSync(filePath, result);

    req.session.currentQuestion = 0;
    req.session.score = 0;
    req.session.answers = [];
    req.session.grade = '';

    res.redirect('/');
});


app.post('/start-over', (req, res) => {
    req.session.currentQuestion = 0;
    req.session.score = 0;
    req.session.answers = [];

    res.redirect('/');
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});