pageTitle = document.title;

function getQuestions(pageTitle) {
  return fetch(`../backend/data/${pageTitle}/questions.json`)
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

getQuestions(pageTitle).then((questions) => {
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