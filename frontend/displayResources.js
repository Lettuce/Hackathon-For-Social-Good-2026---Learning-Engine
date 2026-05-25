"use strict";

// Get the subject Name
document.addEventListener("DOMContentLoaded", async () => {
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
subjectName = urlParams.get("name") ?? "";

let subjectTitle = subjectName
.split(" ")
.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
.join(" ");
});

async function formSubmission(event) 
{
  const answers = getAnswers(event.target);

  // const mapObject = (object, func) => Object.fromEntries(Object.entries(object).map(([k, v]) => [k, func(k, v)]));
  // const processedAnswers = mapObject(answers, (k, v) => v);
  const correctQuestions = await API.submitAnswers(subjectName, answers);

  // Check if the result element already exists
  let result = document.getElementById("submission-result");
  let resultText;

  if (!result) {
    // If it doesn't exist, create the container and the paragraph
    result = document.createElement("div");
    result.id = "submission-result";

    resultText = document.createElement("p");
    resultText.id = "submission-result-text";
    result.appendChild(resultText);

    const body = document.getElementById("body");
    body.appendChild(result);
  } else {
    // If it already exists, select the existing paragraph element
    resultText = document.getElementById("submission-result-text");
  }

  resultText.textContent = `You got ${correctQuestions.length} correct out of 6`;

  // --- Background Color Highlighting Logic ---
  // Get all question group wrappers inside our fieldsets
  const questionGroups = document.querySelectorAll(".question-group");
  
  questionGroups.forEach((group) => {
    // Find all inputs (radios) belonging to this specific question
    const inputs = group.querySelectorAll('input[type="radio"]');
    if (inputs.length === 0) return;

    // Use the name attribute of the first input to identify the question ID
    const questionId = inputs[0].name;
    const isCorrect = correctQuestions.includes(questionId);
    const userAnswerValue = answers[questionId];

    inputs.forEach((input) => {
      // Find the corresponding label element
      const label = group.querySelector(`label[for="${input.id}"]`);
      if (!label) return;

    // Store original text so we don't infinitely append symbols on re-runs
    if (!label.hasAttribute("data-original-text")) {
      label.setAttribute("data-original-text", label.textContent);
    }

    // Reset background and restore original text
    label.style.backgroundColor = "transparent";
    label.textContent = label.getAttribute("data-original-text");

      // Check if this specific radio button is the one the user selected
      if (input.value === userAnswerValue) {
        if (isCorrect) {
          // User chose this option, and the question is in the correct list
          label.style.backgroundColor = "#00ff3c";
          label.textContent += " ✓";
        } else {
          // User chose this option, but it was incorrect
          label.style.backgroundColor = "#fd0015";
          label.textContent += " ✗";
        }
      }
    });
  });
  // ^^^ Background Color Highlighting Logic ^^^

  // Get all questions and resources
  let allQuestions = await getQuestions(subjectName);
  let allResources = await getResources(subjectName);

  // Use the answer key objects to get the questionIds
  console.log(allQuestions);
  let questionResources = allQuestions.map((question) => allResources.filter((resource) => resource.id == question.resourceId)[0]);

  // Use a forEach loop to display the resources (Note: the p element's IDs are the same as the resourceIds they correspond to)
  questionResources.forEach((resource) =>
  {
        let resourceURL = resource.url;
        const pElement = document.getElementById(resource.id);
        // pElement.innerHTML = "To learn more about where this information was found, click on the following link: " + resourceURL;
        // 
        const aElement = document.createElement("a");
        aElement.href = resourceURL;
        aElement.innerHTML = "here";
        pElement.appendChild(aElement);
  });
}

/*
    signature: getResources: string -> string

    purpose: expects a string that is representative of one of the (currently 6)
             subject names, and then returns all of the resources within that subject
             from the resources.json file in the form of a string
*/

function getResources(subjectName) 
{
  return fetch(`/data/subjects/${subjectName}/resources.json`)
    .then((response) => 
    {
      if (!response.ok) 
      {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    })

    .catch((error) => 
    {
      console.error("Could not fetch resources:", error);
      return [];
    });
}

/*
    signature: displayResources: string string -> void

    purpose: expects a string corresponding to the id of the p element below the 
             question and a string for the subject name, and returns nothing,
             with the side-effect of changing the p element below the question
             that the user just answered to display the resource that corresponds
             with that answer.
*/