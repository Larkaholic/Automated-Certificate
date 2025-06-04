import { app } from "./firebase.js";

// Initialize Firestore using the global firebase object from CDN
const db = firebase.firestore();

async function loadFeedbackForm() {
    const formContainer = document.getElementById("dynamicFeedbackForm");
    if (!formContainer) return;

    // Get all feedback forms, ordered by creation date
    const snapshot = await db.collection("feedbackForms")
        .orderBy("createdAt", "desc")
        .get();

    if (snapshot.empty) {
        formContainer.innerHTML = "<div class='text-center text-red-600'>No feedback forms found.</div>";
        return;
    }

    formContainer.innerHTML = ""; // Clear previous content

    // Collect all questions from all forms
    let allQuestions = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        if (Array.isArray(data.questions)) {
            allQuestions = allQuestions.concat(data.questions);
        }
    });

    if (allQuestions.length === 0) {
        formContainer.innerHTML = "<div class='text-center text-red-600'>No questions found in any feedback form.</div>";
        return;
    }

    // Render all questions as input fields
    allQuestions.forEach((q, idx) => {
        const div = document.createElement("div");
        div.className = "mb-4";
        div.innerHTML = `
            <label class="block text-lg font-medium mb-2">${q.text}</label>
            <input type="text" name="answer${idx + 1}" class="w-full px-4 py-2 border border-gray-400 rounded-xl shadow-xl focus:outline-none" />
        `;
        formContainer.appendChild(div);
    });

    // Optionally, add a submit button
    const submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.textContent = "Submit Feedback";
    submitBtn.className = "bg-black text-white px-4 py-2 rounded hover:bg-blue-700";
    formContainer.appendChild(submitBtn);
}

window.addEventListener("DOMContentLoaded", loadFeedbackForm);
