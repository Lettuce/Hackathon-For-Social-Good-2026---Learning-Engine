This is a Learning Engine where you answer questions to the best of your knowledge. 
After answering the questions you will be provided with the corresponding resource.

If you are a professor who wants to add their own questions, 
this is a flexible Learning Engine where you can just edit the contents of the json files to have the questions you want.

How to add your own questions (assuming you have little to no computer science knowledge):
1. First, find the subjects.json file (Note: if you do not wish to add any new subjects, you may skip steps 1-3)
    a. Click on the 'backend' directory (which can be found at the top)
    b. Click on the 'data' directory
    c. Click on subjects.json
2. In subjects.json, you will find an array titled "subjects".
    a. To add a subject, put the name of your subject in quotes like this: "subject name".
    b. Once you are done adding subjects, make sure that all of the subjects are separated by commas and that each of them have a pair of quotes surrounding them.
    c. Also make sure that the commas are outside of the quotes and that the last subject in the array does NOT have a comma after it.
    d. Save the file.
3. Next, you will need to create some .json files
    a. Click on the 'subjects' directory (which is right above subjects.json)
    b. Make a new directory with the same name as the first new subject you added to subjects.json
    c. Within that new directory, create 3 new files with the following names:
        -  answers.json
        -  questions.json
        -  resources.json
4. Let's start with setting up questions.json
    a. Find a different subject directory that's already been created, for example the astronomy directory.
    b. Inside of that directory, go to the questions.json file.
    c. Copy the first block, it should start with "id" and end with "resourceId", that's encapsulated by curly braces. {} (Make sure you copy the curly braces too).
    d. Open the new questions.json file that you created in the last step.
    e. Create a set of square brackets [] (just like all of the other questions.json files in the other subjects)
    f. Within those square brackets, paste the block that you just copied.
5. Start editing the new questions.json file. But make sure everything you adjust is still surrounded by quotes.
    a. Change the id to be something short and unique.
    b. Change the question to any question you would like.
    c. Change the description to something that describes the question .
    d. For the choices, you will see an array, similar to the subject array from subjects.json. You may put as many answer
       choices in there as you would like, just make sure they are each surrounded by quotes and separated by commas. Make sure the last answer choice doesn't have a comma after it. Also make sure they are all still encapsulated by square brackets []
    e. Change the difficulty as desired.
    f. And lastly, you will see resourceId. For now, leave that be. We'll come back to it later.
    g. To add another question, paste another block encapsulated by curly braces, below the one you just created.
    h. Make sure that each closing curly brace } has a comma after it, except if it's the last question block.
6. Now set up resources.json
    a. Follow the same steps you did in step 4 for the questions.json file. 
    b. Find an already-made subject director. 
    c. Copy the first block, it should start with "id" and end with "difficulty", that's encapsulated by curly braces {}
    d. Open the new resources.json file that you created in step 3.
    e. Create a set of square brackets []
    f. Within those square brackets, paste the block that you just copied.
7. Start editing the new resources.json file. But make sure everything you adjust is still surrounded by quotes.
    a. Just like with questions.json change each field as desired. The id that you create here is going to be what you will put as the resourceId in questions.json
    b. When inputting a resource, make sure that it logically corresponds to a specific question that you put in the questions.json.
8. Logically connecting the questions to the right resources.
    a. In the new questions.json file that you have created, you will recall that we left resourceId blank.
    b. For the resourceId put the id of the resource from resources.json that logically corresponds to the question that you are currently editing.
9. Set up answers.json
    a. 