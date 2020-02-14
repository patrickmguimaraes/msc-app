## IBM MSC SERVER

This is a Web project with ExpressJS on NodeJS, made to be a server application for the MSC. When configureted and running, it listens GET and POST calls, managing informations stored on IBM Cloudant.

[![](https://github.com/patrickmguimaraes)]
[![](https://img.shields.io/badge/IBM%20Cloud-powered-blue.svg)](https://bluemix.net)
![Platform](https://img.shields.io/badge/platform-NODE-lightgrey.svg?style=flat)

### Table of Contents
* [Configuration](#configuration)
* [Run](#run)
* [Debug](#debug)

<a name="configuration"></a>
### Configuration

The project contains IBM Cloudant to be created. First you have to have an IBM Cloud and the create a IBM Cloudant. After that, you have to create the credentials and setup the informations on this project.

Service credentials are taken from IBM Cloudant and configureted in `./server/config/config.js` (startting with CLOUDANT_)

The Watson Assistant credentials is alread configureted. If you want to point to another Assistant, this new one have to have these intents: #create_ticket (Ask for create a ticket), #ticket_description (Ask for type a description for the ticket), #see_tickets (Ask for see all tickets), #ticket_number ask for bringing a ticket description.

You will also need to create a secret key for JWT configuration on the fild (secret)

<a name="run"></a>
### Run
#### Using local environment
This is a Node.js project, configureted in a development environment. The first thing you have to do is to install all the dependencies required. To do it, run:

```bash
npm install
```

If you do not have all of the tools installed on your computer yet and you want to compile and run your application, you can run the following script. Your application will be compiled with Docker containers. Run:

```bash
bx dev build
bx dev run
```

To only run you application, plese choose one option:

```bash
npm start
npm run dev
```

#### Using your local development environment


##### Endpoints

Your application is running at: `http://localhost:3000/` in your browser.
