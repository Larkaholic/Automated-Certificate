import { app } from "./firebase.js";

// Initialize Firestore using the global firebase object from CDN
const db = firebase.firestore();

async function loadFeedbackForm() {
    const formContainer = document.getElementById("dynamicFeedbackForm");
    if (!formContainer) return;

    // Get all questions, ordered by creation date
    const snapshot = await db.collection("questions")
        .orderBy("createdAt", "asc")
        .get();

    formContainer.innerHTML = ""; // Clear previous content

    if (snapshot.empty) {
        formContainer.innerHTML = "<div class='text-center text-red-600'>No questions found.</div>";
        return;
    }

    // Render all questions as input fields or rating radios
    snapshot.forEach((doc, idx) => {
        const q = doc.data();
        const div = document.createElement("div");
        div.className = "mb-4";
        div.innerHTML = `
            <label class="block text-lg font-medium mb-2">${q.text}</label>
            ${
                q.type === "rating"
                ? `<div class="flex gap-4">
                        ${[1,2,3,4,5].map(num => `
                            <label class="flex flex-col items-center">
                                <input type="radio" name="answer${idx + 1}" value="${num}" class="form-radio text-blue-600" />
                                <span>${num}</span>
                            </label>
                        `).join('')}
                   </div>`
                : `<input type="text" name="answer${idx + 1}" class="w-full px-4 py-2 border border-gray-400 rounded-xl shadow-xl focus:outline-none" />`
            }
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
