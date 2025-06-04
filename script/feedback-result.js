import { app } from "./firebase.js";

// Initialize Firestore using the global firebase object from CDN
const db = firebase.firestore();

const eventSelect = document.getElementById("eventSelect");
const resultsContainer = document.getElementById("resultsContainer");

// Fetch all event titles
async function loadEvents() {
    const snapshot = await db.collection("events").get();
    eventSelect.innerHTML = `<option value="">-- Select an event --</option>`;
    snapshot.forEach(doc => {
        const option = document.createElement("option");
        option.value = doc.id;
        option.textContent = doc.id;
        eventSelect.appendChild(option);
    });
}

// Fetch and display questions and answers for the selected event
async function displayResultsForEvent(eventTitle) {
    resultsContainer.innerHTML = "";

    // Fetch questions
    const questionsSnap = await db.collection("events").doc(eventTitle).collection("questions").orderBy("createdAt", "asc").get();
    const questions = [];
    questionsSnap.forEach(doc => {
        questions.push({ id: doc.id, ...doc.data() });
    });

    // Fetch all feedback answers (assuming a "responses" subcollection per event)
    const responsesSnap = await db.collection("events").doc(eventTitle).collection("responses").get();
    const responses = [];
    responsesSnap.forEach(doc => {
        responses.push(doc.data());
    });

    // Display questions and answers
    if (questions.length === 0) {
        resultsContainer.innerHTML = `<div class="text-center text-red-600">No questions found for this event.</div>`;
        return;
    }

    // Questions Table
    const questionsHtml = questions.map((q, idx) => `
        <tr>
            <td class="border px-4 py-2 font-semibold">${idx + 1}. ${q.text}</td>
            <td class="border px-4 py-2">${q.type === "rating" ? "Rating (1-5)" : "Text"}</td>
        </tr>
    `).join("");

    let html = `
        <h2 class="text-2xl font-bold mb-4 mt-6">Questions</h2>
        <table class="w-full mb-8 border">
            <thead>
                <tr>
                    <th class="border px-4 py-2">Question</th>
                    <th class="border px-4 py-2">Type</th>
                </tr>
            </thead>
            <tbody>
                ${questionsHtml}
            </tbody>
        </table>
    `;

    // Answers Table
    if (responses.length === 0) {
        html += `<div class="text-center text-gray-600">No feedback responses submitted yet.</div>`;
    } else {
        html += `
            <h2 class="text-2xl font-bold mb-4">Responses</h2>
            <div class="overflow-x-auto">
            <table class="w-full border">
                <thead>
                    <tr>
                        <th class="border px-4 py-2">#</th>
                        <th class="border px-4 py-2">Name</th>
                        <th class="border px-4 py-2">Email</th>
                        ${questions.map((q, idx) => `<th class="border px-4 py-2">Q${idx + 1}</th>`).join("")}
                    </tr>
                </thead>
                <tbody>
                    ${responses.map((resp, idx) => `
                        <tr>
                            <td class="border px-4 py-2">${idx + 1}</td>
                            <td class="border px-4 py-2">${resp.name || ""}</td>
                            <td class="border px-4 py-2">${resp.email || ""}</td>
                            ${questions.map((q, qidx) => {
                                const ans = resp.answers && resp.answers[q.id];
                                return `<td class="border px-4 py-2">${ans !== undefined ? ans : ""}</td>`;
                            }).join("")}
                        </tr>
                    `).join("")}
                </tbody>
            </table>
            </div>
        `;
    }

    resultsContainer.innerHTML = html;
}

eventSelect.addEventListener("change", async (e) => {
    const eventTitle = e.target.value;
    if (eventTitle) {
        await displayResultsForEvent(eventTitle);
    } else {
        resultsContainer.innerHTML = "";
    }
});

window.addEventListener("DOMContentLoaded", loadEvents);
