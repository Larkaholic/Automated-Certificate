import { app } from "./firebase.js";

// Initialize Firestore using the global firebase object from CDN
const db = firebase.firestore();

let questionCount = 0;
const form = document.getElementById("questionForm");
const output = document.getElementById("output");
const eventTitleInput = document.getElementById("eventTitle");

// Helper to get event title (trimmed)
function getEventTitle() {
    return eventTitleInput ? eventTitleInput.value.trim() : "";
}

// Helper to create a question div
function createQuestionDiv({ id = "", text = "", type = "text" } = {}) {
    questionCount++;
    const questionDiv = document.createElement("div");
    questionDiv.className = "flex items-start gap-4";
    questionDiv.dataset.id = id || questionCount;
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

// Fetch and display all questions for the current event from Firestore
async function displayQuestionsFromFirebase() {
    form.innerHTML = "";
    questionCount = 0;
    const eventTitle = getEventTitle();
    if (!eventTitle) return;

    const snapshot = await db.collection("events").doc(eventTitle).collection("questions")
        .orderBy("createdAt", "asc")
        .get();

    snapshot.forEach(doc => {
        const data = doc.data();
        createQuestionDiv({ id: doc.id, text: data.text, type: data.type || "text" });
    });
}

// Call on page load and when event title changes
window.addEventListener("DOMContentLoaded", displayQuestionsFromFirebase);
if (eventTitleInput) {
    eventTitleInput.addEventListener("input", displayQuestionsFromFirebase);
}

document.getElementById("addQuestionBtn").addEventListener("click", () => {
    if (!getEventTitle()) {
        alert("Please enter an event title first.");
        return;
    }
    createQuestionDiv();
});

form.addEventListener("click", async (e) => {
    if (e.target.classList.contains("remove-btn")) {
        const questionDiv = e.target.closest("div");
        const docId = questionDiv.dataset.id;
        questionDiv.remove();

        // Remove from Firestore if it exists in DB
        const eventTitle = getEventTitle();
        if (docId && eventTitle && !isNaN(docId) === false) {
            try {
                await db.collection("events").doc(eventTitle).collection("questions").doc(docId).delete();
                await displayQuestionsFromFirebase();
            } catch (error) {
                output.classList.remove("hidden");
                output.textContent = `Error removing from Firebase: ${error.message}`;
            }
        }
    }
});

document.getElementById("saveFormBtn").addEventListener("click", async () => {
    const eventTitle = getEventTitle();
    if (!eventTitle) {
        alert("Please enter an event title before saving.");
        return;
    }
    const questionDivs = form.querySelectorAll("div[data-id]");
    output.classList.remove("hidden");
    let results = [];

    for (const div of questionDivs) {
        const input = div.querySelector("input[name='question']");
        const select = div.querySelector("select[name='type']");
        const questionText = input.value.trim();
        const questionType = select.value;
        const docId = div.dataset.id;

        if (questionText) {
            const payload = {
                text: questionText,
                type: questionType,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            try {
                if (isNaN(docId) === false) {
                    // New question, add to Firestore
                    await db.collection("events").doc(eventTitle).collection("questions").add(payload);
                } else {
                    // Existing question, update in Firestore
                    await db.collection("events").doc(eventTitle).collection("questions").doc(docId).set(payload, { merge: true });
                }
                results.push(payload);
            } catch (error) {
                output.textContent = `Error saving to Firebase: ${error.message}`;
            }
        }
    }

    output.textContent = JSON.stringify(results, null, 2) + "\n\nQuestions saved to Firebase!";
    await displayQuestionsFromFirebase();
});