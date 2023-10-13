let categories = {};
let continueAsking = true;
let recognition;

// Initialize Speech Recognition
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
recognition = new SpeechRecognition();
recognition.interimResults = true;

// Function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Function to analyze the answer and determine the next category
function analyzeAnswer(answer) {
    if (answer.includes("family") || answer.includes("friend")) {
        return "Friends/Family";
    } else if (answer.includes("work") || answer.includes("job")) {
        return "Occupation";
    } else if (answer.includes("relax") || answer.includes("hobby")) {
        return "Relaxation";
    } else {
        return "Depth";
    }
}

async function fetchData() {
    try {
        const response = await fetch('questions.json');
        const data = await response.json();
        categories = data;
    } catch (error) {
        console.error('Error fetching the questions:', error);
    }
}

fetchData();

function confirmInteraction() {
    const productType = document.getElementById('product-type').value;
    const interactionType = document.getElementById('interaction-type').value;
    displayQuestions(productType, interactionType, true);
}

function displayQuestions(productType, interactionType, initial = false) {
    let questionsToDisplay = [];
    let fordPriority = ["Friends/Family", "Relaxation", "Occupation", "Depth"];

    for (let category of fordPriority) {
        if (categories[productType] && categories[productType][interactionType] && categories[productType][interactionType][category]) {
            questionsToDisplay = questionsToDisplay.concat(categories[productType][interactionType][category].map(q => q.question));
        }
    }

    // Shuffle the questions
    shuffleArray(questionsToDisplay);

    // If it's the initial question, only show one
    const limit = initial ? 1 : 3;

    let questionHtml = '';
    for (let i = 0; i < Math.min(limit, questionsToDisplay.length); i++) {
        questionHtml += `<button onclick="setCurrentQuestion('${questionsToDisplay[i]}')">${questionsToDisplay[i]}</button>`;
    }

    document.getElementById('left-panel').innerHTML = questionHtml;
}

function setCurrentQuestion(question) {
    document.getElementById('current-question').innerText = question;
    startListening();  // Start listening when a new question is set
}

function submitResponse() {
    const currentQuestion = document.getElementById('current-question').innerText;
    const response = document.getElementById('response-text').value;

    const logEntry = `<p><strong>Q:</strong> ${currentQuestion} <br><strong>A:</strong> ${response}</p>`;
    document.getElementById('log').innerHTML += logEntry;

    document.getElementById('response-text').value = '';

    if (continueAsking) {
        const nextCategory = analyzeAnswer(response);
        const productType = document.getElementById('product-type').value;
        const interactionType = document.getElementById('interaction-type').value;

        // Display the next best question based on the analyzed category
        displayQuestions(productType, interactionType);
    }
}

function saveOutput() {
    const callReferenceId = document.getElementById('call-reference-id').value;
    const log = document.getElementById('log').innerHTML;
    localStorage.setItem(callReferenceId, log);
}

function endQuestions() {
    continueAsking = false;
    recognition.stop();  // Stop listening when questions end
}

// Start voice recognition and populate the response field
function startListening() {
    recognition.addEventListener('result', (e) => {
        const transcript = Array.from(e.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');

        document.getElementById('response-text').value = transcript;
    });

    recognition.start();
}
