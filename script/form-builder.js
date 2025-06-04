import { app } from "./firebase.js";

// Initialize Firestore using the global firebase object from CDN
const db = firebase.firestore();

let questionCount = 0;
const form = document.getElementById("questionForm");
const output = document.getElementById("output");

document.getElementById("addQuestionBtn").addEventListener("click", () => {
    questionCount++;

    const questionDiv = document.createElement("div");
    questionDiv.className = "flex items-start gap-4";
    questionDiv.dataset.id = questionCount;

    questionDiv.innerHTML = `
    <input type="text" name="question" placeholder="Enter your question" class="flex-1 p-2 border border-gray-300 bg-white rounded-xl shadow-lg" />
    <button type="button" class="remove-btn text-red-600 hover:underline">Remove</button>
    `;

    form.appendChild(questionDiv);
});

form.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-btn")) {
    e.target.closest("div").remove();
    }
});

document.getElementById("saveFormBtn").addEventListener("click", async () => {
    const questions = [];
    const inputs = form.querySelectorAll("input[name='question']");

    inputs.forEach((input, index) => {
        const questionText = input.value.trim();
        if (questionText) {
            questions.push({ id: index + 1, text: questionText });
        }
    });

    output.classList.remove("hidden");
    output.textContent = JSON.stringify(questions, null, 2);

    // Store questions as a feedback form in Firestore
    if (questions.length > 0) {
        const payload = {
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            questions: questions
        };
        console.log("Firestore payload:", payload);
        try {
            await db.collection("feedbackForms").add(payload);
            output.textContent += "\n\nFeedback form saved to Firebase!";
        } catch (error) {
            output.textContent += `\n\nError saving to Firebase: ${error.message}\n${JSON.stringify(error)}`;
            console.error("Firestore error:", error);
        }
    } else {
        output.textContent += "\n\nNo questions to save!";
    }
});