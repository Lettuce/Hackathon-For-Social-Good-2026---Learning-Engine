<<<<<<< HEAD
pageTitle = document.title;

function getQuestions(pageTitle) {
  return fetch(`../backend/data/${pageTitle}/questions.json`)
=======
subject = "";

document.addEventListener("DOMContentLoaded", () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const subjectName = urlParams.get("name");

  if (subjectName) {
    subject = subjectName;
  }
});

function getQuestions(subject) {
  return fetch(`../backend/data/${subject}/questions.json`)
>>>>>>> 12c64a1 (fect: subject is name pased by getSubjectInfo.js)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      return data.map((item) => item.questions);
    })
    .catch((error) => {
      console.error("Could not fetch subjects:", error);
      return null;
    });
}

<<<<<<< HEAD
getQuestions(pageTitle).then((questions) => {
=======
getQuestions(subject).then((questions) => {
>>>>>>> 12c64a1 (fect: subject is name pased by getSubjectInfo.js)
  if (questions) {
    console.log("Fetched Subjects Data:", questions);
    const questionsElement = document.getElementById("questions");

    if (!questionsElement) {
      console.error("Target element #subjects not found in DOM");
      return;
    }

    questions.forEach((question) => {
      const pTag = document.createElement("p");
      pTag.textContent = question;
      questionsElement.appendChild(pTag);
    });
  }
});