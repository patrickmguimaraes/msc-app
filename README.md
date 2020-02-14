## IBM MSC SERVER

This is a web project with Express on NodeJS, made to be a server application for the MSC. When configureted and running, it listens GET and POST calls, managing informations stored on IBM Cloudant.

[![](https://img.shields.io/badge/IBM%20Cloud-powered-blue.svg)](https://bluemix.net)
![Platform](https://img.shields.io/badge/platform-NODE-lightgrey.svg?style=flat)
![](https://img.shields.io/badge/Express-Framework-brightgreen)

### Table of Contents
* [Configuration](#configuration)
* [Run](#run)

<a name="configuration"></a>
### Configuration

The project contains IBM Cloudant to be created. First you have to have an IBM Cloud account and then create a IBM Cloudant. After that, you have to get the credentials and setup then on this project. The database credentials are taken from IBM Cloudant and configureted in `./server/config/config.js` (startting with CLOUDANT_). When the system run for the first time, it will automatically create two tables on your Cloudnat (user and ticket).

The Watson Assistant credentials are alread configureted. If you want to point to another Assistant, plese create these intents: #create_ticket (Ask for create a ticket), #ticket_description (Ask for type a description for the ticket), #see_tickets (Ask for see all tickets), #ticket_number (Ask for bringing a ticket description). After creating these intents, you can point to another assistent changing the pre configureted credentials on `./server/config/config.js`.

You will also need to create a secret key on `./server/config/config.js` for JWT configuration on the fild (secret).

#### Using local environment
This is a NodeJS project, configureted in a development environment. The first thing you have to do is to install all the dependencies required. To do it, run:

```bash
npm install
```

<a name="run"></a>
### Run

If you do not have all of the tools installed on your computer yet and you want to compile and run your application, you can run the following script. Your application will be compiled with Docker containers. Run:

```bash
bx dev build
bx dev run
```

To only run your application, please choose one option:

```bash
npm start
npm run dev
```

##### Endpoints

The application is configureted to run on `http://localhost:3000/`.
