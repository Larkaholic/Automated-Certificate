import { app } from "./firebase.js";

// Initialize Firestore using the global firebase object from CDN
const db = firebase.firestore();

let questionCount = 0;
const form = document.getElementById("questionForm");
const output = document.getElementById("output");

// Helper to create a question div
function createQuestionDiv({ text = "", type = "text" } = {}) {
    questionCount++;
    const questionDiv = document.createElement("div");
    questionDiv.className = "flex items-start gap-4";
    questionDiv.dataset.id = questionCount;
    questionDiv.innerHTML = `
        <input type="text" name="question" value="${text}" placeholder="Enter your question" class="flex-1 p-2 border border-gray-300 bg-white rounded-xl shadow-lg" />
        <select name="type" class="p-2 border border-gray-300 rounded-xl bg-white shadow-lg">
            <option value="text"${type === "text" ? " selected" : ""}>Text</option>
            <option value="rating"${type === "rating" ? " selected" : ""}>Rating (1-5)</option>
        </select>
        <button type="button" class="remove-btn text-red-600 hover:underline">Remove</button>
    `;
    form.appendChild(questionDiv);
}

// Fetch and display all questions from all feedback forms in Firestore
async function displayQuestionsFromFirebase() {
    // Clear form first
    form.innerHTML = "";
    questionCount = 0;

    const snapshot = await db.collection("feedbackForms")
        .orderBy("createdAt", "desc")
        .get();

    let allQuestions = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        if (Array.isArray(data.questions)) {
            allQuestions = allQuestions.concat(data.questions);
        }
    });

    allQuestions.forEach(q => {
        createQuestionDiv({ text: q.text, type: q.type || "text" });
    });
}

// Call on page load
window.addEventListener("DOMContentLoaded", displayQuestionsFromFirebase);

document.getElementById("addQuestionBtn").addEventListener("click", () => {
    createQuestionDiv();
});

form.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-btn")) {
        e.target.closest("div").remove();
    }
});

document.getElementById("saveFormBtn").addEventListener("click", async () => {
    const questions = [];
    const questionDivs = form.querySelectorAll("div[data-id]");

    questionDivs.forEach((div, index) => {
        const input = div.querySelector("input[name='question']");
        const select = div.querySelector("select[name='type']");
        const questionText = input.value.trim();
        const questionType = select.value;
        if (questionText) {
            questions.push({ id: index + 1, text: questionText, type: questionType });
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
            // Refresh questions from Firebase after saving
            await displayQuestionsFromFirebase();
        } catch (error) {
            output.textContent += `\n\nError saving to Firebase: ${error.message}\n${JSON.stringify(error)}`;
            console.error("Firestore error:", error);
        }
    } else {
        output.textContent += "\n\nNo questions to save!";
    }
});