document.addEventListener("DOMContentLoaded", async () => {
    overrideFormSubmission("createUserForm", (formAnswers) => {
        const {username, password} = formAnswers;
        API.createUser(username, password);
        console.log(formAnswers);
    });

    overrideFormSubmission("logInForm", (formAnswers) => {
        console.log(answerformAnswerss);
    });
});

const getAnswers = (formElement) => {
    const formData = new FormData(formElement);
    return Object.fromEntries(formData.entries());
};

const overrideFormSubmission = (formId, submitFunction) => {
    document.getElementById(formId).addEventListener("submit", (event) => {
        event.preventDefault();
        const answers = getAnswers(event.target);
        submitFunction(answers);
    });
};