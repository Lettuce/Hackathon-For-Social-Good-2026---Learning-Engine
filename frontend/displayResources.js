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

  const result = document.createElement("div");
  const resultText = document.createElement("p");
  
  resultText.textContent = `You got ${correctQuestions.length} correct out of 6`;
  result.appendChild(resultText);
  const body = document.getElementById("body");
  body.appendChild(result);
  
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
        document.getElementById(resource.id).innerHTML = "To learn more about where this information was found, click on the following link: " + resourceURL;
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