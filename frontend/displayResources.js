"use strict";

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
    signature: displayResources: string string string -> void

    purpose: expects a string that is representative of the id of the current
             answer that the user has given a response to and expects a string
             corresponding to the id of the p element below the question and
             a string for the subject name, and returns nothing,
             with the side-effect of changing the p element below the question
             that the user just answered to display the resource that corresponds
             with that answer.
*/

// Have the pIdStrings be the same as the resourceIds
function displayResources(answerIdString, pIdString, subjectName)
{
    let answerId = document.getElementById(answerIdString);

    let allResources = getResources(subjectName);
    // Need to find a way to pull just 1 resource, and have it correspond to the correct question
    let resourceURL = allResources.filter((resource) => resource.id == pIdString)[0].url

    document.getElementById(pIdString).innerHTML = "To learn more about where this information was found, click on the following link: " + resourceURL;
}