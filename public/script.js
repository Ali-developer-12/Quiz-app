let currentChapter = null;
let questions = [];
let currentQuestionIndex = 0;
let userAnswers = [];

const API_BASE = '/api';

function loadChapters() {
    try {
        const container = document.getElementById('chapters-container');
        if (!container) return;
        container.innerHTML = '';
        
        for (let i = 1; i <= 9; i++) {
            const btn = document.createElement('button');
            btn.className = 'chapter-card';
            btn.textContent = `Chapter ${i}`;
            btn.onclick = () => {
                localStorage.setItem('quiz_chapter', i);
                window.location.href = 'quiz.html';
            };
            container.appendChild(btn);
        }
    } catch (error) {
        const container = document.getElementById('chapters-container');
        if (container) container.innerHTML = '';
    }
}

async function startQuiz() {
    currentChapter = localStorage.getItem('quiz_chapter');
    
    if (!currentChapter) {
        window.location.href = 'index.html';
        return;
    }

    const titleEl = document.getElementById('quiz-title');
    if (titleEl) titleEl.textContent = `Chapter ${currentChapter}`;
    
    try {
        const response = await fetch(`${API_BASE}/questions/${currentChapter}`);
        if (!response.ok) return;
        questions = await response.json();
        
        if (!questions || questions.length === 0) {
            document.getElementById('quiz-container').innerHTML = '';
            return;
        }

        currentQuestionIndex = 0;
        userAnswers = [];
        showQuestion();

    } catch (error) {
        document.getElementById('quiz-container').innerHTML = '';
    }
}

function showQuestion() {
    const q = questions[currentQuestionIndex];
    document.getElementById('progress-text').textContent = `Question ${currentQuestionIndex + 1}/${questions.length}`;
    document.getElementById('question-text').textContent = q.question;
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    document.getElementById('next-btn').style.display = 'none';
    document.getElementById('submit-btn').style.display = 'none';

    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt;
        if (opt === q.correctAnswer) {
            btn.dataset.correct = "true";
        }
        btn.onclick = () => selectOption(btn, opt, q._id, q.correctAnswer);
        optionsContainer.appendChild(btn);
    });
}

function selectOption(selectedBtn, answer, questionId, correctAnswer) {
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(btn => btn.disabled = true);
    
    if (answer === correctAnswer) {
        selectedBtn.classList.add('correct');
    } else {
        selectedBtn.classList.add('wrong');
        buttons.forEach(btn => {
            if (btn.dataset.correct === "true") {
                btn.classList.add('correct');
            }
        });
    }

    userAnswers = userAnswers.filter(a => a.questionId !== questionId);
    userAnswers.push({ questionId, answer });

    if (currentQuestionIndex < questions.length - 1) {
        document.getElementById('next-btn').style.display = 'inline-block';
    } else {
        document.getElementById('submit-btn').style.display = 'inline-block';
    }
}

function nextQuestion() {
    currentQuestionIndex++;
    showQuestion();
}

async function submitQuiz() {
    try {
        document.getElementById('submit-btn').disabled = true;
        document.getElementById('submit-btn').textContent = 'Submitting...';

        const payload = {
            chapter: parseInt(currentChapter),
            answers: userAnswers
        };

        const response = await fetch(`${API_BASE}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) return;
        const result = await response.json();
        
        if (!result || Object.keys(result).length === 0) return;
        
        localStorage.setItem('quiz_result', JSON.stringify(result));
        window.location.href = 'result.html';

    } catch (error) {
        document.getElementById('submit-btn').disabled = false;
        document.getElementById('submit-btn').textContent = 'Submit Quiz';
    }
}

function showResult() {
    const resultStr = localStorage.getItem('quiz_result');
    if (!resultStr) {
        window.location.href = 'index.html';
        return;
    }

    const result = JSON.parse(resultStr);
    
    document.getElementById('total-questions').textContent = result.totalQuestions;
    document.getElementById('correct-answers').textContent = result.correctAnswers;
    document.getElementById('score-percentage').textContent = result.scorePercentage;
    
    const scoreTextObj = document.getElementById('score-text');
    if (result.scorePercentage >= 80) {
        scoreTextObj.textContent = 'Excellent!';
        scoreTextObj.style.color = '#2ecc71';
    } else if (result.scorePercentage >= 50) {
        scoreTextObj.textContent = 'Good Job!';
        scoreTextObj.style.color = '#f39c12';
    } else {
        scoreTextObj.textContent = 'Keep Practicing!';
        scoreTextObj.style.color = '#e74c3c';
    }

    localStorage.removeItem('quiz_result');
    localStorage.removeItem('quiz_chapter');
}
