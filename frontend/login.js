document.addEventListener("DOMContentLoaded", async () => {
    overrideFormSubmission("createUserForm", async (formAnswers) => {
        const {username, password} = formAnswers;
        const success = await API.createUser(username, password);
        if(success) loginSuccess();
        else createUserFail();
    });

    overrideFormSubmission("logInForm", async (formAnswers) => {
        const {username, password} = formAnswers;
        const success = await API.login(username, password);
        if(success) loginSuccess();
        else loginFail();
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

const loginFail = () => {
    window.alert("Login failed, either your credentials are wrong or the server is down.");
};

const createUserFail = () => {
    window.alert("Account creation failed. Either the account exists already or the server is down.");
};

const loginSuccess = () => {
    window.location.href = "/";
};