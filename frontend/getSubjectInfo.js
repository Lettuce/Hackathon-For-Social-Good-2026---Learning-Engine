let subject = "";

document.addEventListener("DOMContentLoaded", async () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const subjectName = urlParams.get("name");

  if (subjectName) {
    subject = subjectName;
    const questions = await getQuestions(subject);
    renderQuestions(questions);
  }
});

function getQuestions(subjectName) {
  return fetch(`../backend/data/${subjectName}/questions.json`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      // Assuming the JSON is an array where each object has a 'questions' key
      return data.map((item) => item.questions);
    })
    .catch((error) => {
      console.error("Could not fetch subjects:", error);
      return null;
    });
}

function renderQuestions(questions) {
  if (questions) {
    console.log("Fetched Subjects Data:", questions);
    const questionsElement = document.getElementById("questions");

    if (!questionsElement) {
      console.error("Target element #questions not found in DOM");
      return;
    }

    questions.forEach((question) => {
      const pTag = document.createElement("p");
      pTag.textContent = question;
      questionsElement.appendChild(pTag);
    });
  }
}