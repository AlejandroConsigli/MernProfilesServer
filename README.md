# Profiles

This project was created with [Node](https://nodejs.org/es/), [Express](https://expressjs.com/es/) and [MongoDB](https://www.mongodb.com/).

## Initialization Scripts

The first command to run is `npm i` to install dependencies.
You can see all the dependencies and scripts in `package.json` file.

Then, to start the project, run `npm start`.
The project will open in [http://localhost:5000](http://localhost:5000) to check it in the browser.
The project will reload if you make edits.
You will also see any lint errors in the console.

**Note: you will need to run `MernProfilesClient` to interact with the project**

## Project Walkthrough

The project is made up of a main server.js file.

This one connects with our database which is built with [Mongodb Atlas](https://www.mongodb.com/es/cloud/atlas).

It is made up of routes to make several queries. These routes work with models, which are then sent to the database.

It works with various middlewares. Some of them are to authenticate the user and others to upload files, being images in this case.

Finally, it has email logic included. This is for all registration and password recovery of a user.