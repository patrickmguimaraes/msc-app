/**
 *
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';
const config = require('./config/config.json');
var AssistantV2 = require('ibm-watson/assistant/v2'); // watson sdk
const { IamAuthenticator, BearerTokenAuthenticator } = require('ibm-watson/auth');
const log4js = require('log4js');
const logger = log4js.getLogger("logger");
var ticketService = require('./services/ticket.service');
var Q = require('q');
var saveTicket = null;
var lookTickets = null
var printLoggerDetail = true;

module.exports = function (app) {
  // Create the service wrapper

  let authenticator;
  if (config.ASSISTANT_IAM_APIKEY) {
    authenticator = new IamAuthenticator({
      apikey: config.ASSISTANT_IAM_APIKEY
    });
  } else if (config.BEARER_TOKEN) {
    authenticator = new BearerTokenAuthenticator({
      bearerToken: config.BEARER_TOKEN
    });
  }

  if (authenticator) {
    logger.info("Watson authenticate successfully!");
  }

  var assistant = new AssistantV2({
    version: '2019-02-28',
    authenticator: authenticator,
    url: config.ASSISTANT_URL,
    disableSslVerification: config.DISABLE_SSL_VERIFICATION === 'true' ? true : false
  });

  if (assistant) {
    logger.info("Watson assistant is working!");
  }

  // Endpoint to be call from the client side
  app.post('/watson/message', function (req, res) {
    let assistantId = config.ASSISTANT_ID || '<assistant-id>';
    if (!assistantId || assistantId === '<assistant-id>') {
      return res.json({
        output: {
          text:
            'The app has not been configured with a <b>ASSISTANT_ID</b> environment variable. Please refer to the ' +
            '<a href="https://github.com/watson-developer-cloud/assistant-simple">README</a> documentation on how to set this variable. <br>' +
            'Once a workspace has been defined the intents may be imported from ' +
            '<a href="https://github.com/watson-developer-cloud/assistant-simple/blob/master/training/car_workspace.json">here</a> in order to get a working application.',
        },
      });
    }

    var textIn = '';
    var id_user = req.body.id_user;

    if (req.body.input) {
      textIn = req.body.input.text;
    }

    var payload = {
      assistantId: assistantId,
      sessionId: req.body.session_id,
      input: {
        message_type: 'text',
        text: textIn,
      },
    };

    // Send the input to the assistant service
    assistant.message(payload, function (err, data) {
      if (err) {
        const status = err.code !== undefined && err.code > 0 ? err.code : 500;
        return res.status(status).json(err);
      }

      try {
        if (printLoggerDetail) { logger.info("The user typed: " + textIn); }
        if (printLoggerDetail) { logger.info("The system found: " + data.result); }

        if (!saveTicket && data.status == 200) {
          searchTicketIntent(data.result, "create_ticket").then(function (resultSearch) {
            if (resultSearch) {
              if (printLoggerDetail) { logger.info("The system found a intent create_ticket. Waiting for descrption."); }
              saveTicket = {
                id_user: id_user,
                description: "",
                status: "active",
                date: new Date()
              }
              return res.json(data);
            }
          });
        }
        else if (saveTicket && data.status == 200) {
          searchTicketIntent(data.result, "ticket_description").then(function (resultSearch) {
            if (resultSearch) {
              saveTicket.description = textIn;
              if (printLoggerDetail) { logger.info("The system was waiting for a description an found one: " + saveTicket); }

              ticketService.create(saveTicket).then(function (ticket) {
                if (printLoggerDetail) { logger.info("The system saved the ticket " + ticket); }
                saveTicket = null;
                return res.json(data);
              }).catch(function (error) {
                if (printLoggerDetail) { logger.error("Erro saving the ticket " + error); }
                data.output.generic[0].text = "Unfortunally the ticket couldn't be created. Try again soon.";
                return res.json(data);
              });
            }
          });
        }

        if (!lookTickets && data.status == 200) {
          searchTicketIntent(data.result, "see_tickets").then(function (resultSearch) {
            if (resultSearch) {
              ticketService.getAll(id_user).then(function (tickets) {
                if (printLoggerDetail) { logger.info("The system found tickets : " + tickets); }
                lookTickets = tickets;
                var arrayOptions = [];
                for (let index = 0; index < tickets.length; index++) {
                  const ticketItem = tickets[index];

                  var optionItem = {
                    label: "Ticket Number " + (index + 1),
                    value: {
                      input: {
                        text: "I would like to see the ticket number " + (index + 1)
                      }
                    }
                  };

                  arrayOptions.push(optionItem);
                }

                var dataReturn = {
                  title: "I found " + tickets.length + " tickets. Which one would you like to see?",
                  options: arrayOptions,
                  response_type: "option"
                };

                data.result.output.generic.push(dataReturn);

                return res.json(data);
              }).catch(function (error) {
                if (printLoggerDetail) { logger.error("Erro looking for tickets " + error); }
                data.result.output.generic[0].text = "Unfortunally the system couldn't find tickets. Try again soon.";
                return res.json(data);
              });
            }
            else {
              return res.json(data);
            }
          });
        }
        else if (lookTickets && data.status == 200) {
          searchTicketIntent(data.result, "ticket_number").then(function (resultSearch) {
            if (resultSearch) {
              if (printLoggerDetail) { logger.info("Details for the ticket."); }
              var entityValue = data.result.output.entities[0].value;
              var genericArray = [];
              var description = lookTickets[entityValue-1].description;
              
              var newDescription = {
                response_type: 'text',
                text: description
              }
              genericArray.push(data.result.output.generic[0]);
              genericArray.push(newDescription);
              genericArray.push(data.result.output.generic[1]);
              data.result.output.generic = genericArray;
              
              return res.json(data);
            }
          });
        }
        else {
          saveTicket = null;
          return res.json(data);
        }
      } catch (error) {
        logger.error(error);
        const status = err.code !== undefined && err.code > 0 ? err.code : 500;
        return res.status(status).json(err);
      }
    });
  });

  function searchTicketIntent(response, intentToLookFor) {
    var deferred = Q.defer();
    response = JSON.parse(JSON.stringify(response));
    
    if (printLoggerDetail) { logger.info("Looking for " + intentToLookFor + " in ==> " + response); }

    if (response.output && response.output.intents) {
      if (printLoggerDetail) { logger.info("Intent list found: " + response.output.intents); }
      response.output.intents.forEach(intentItem => {

        if (printLoggerDetail) { logger.info("Comparing: " + intentItem.intent + " with " + intentToLookFor); }
        if (intentItem && intentItem.intent) {
          var intentItemString = intentItem.intent;
          
          if (intentItemString == intentToLookFor) {
            deferred.resolve(true);
            return deferred.promise;
          }
        }
      });
    }

    deferred.resolve(false);
    return deferred.promise;
  }

  app.get('/watson/session', function (req, res) {
    saveTicket = null;

    assistant.createSession(
      {
        assistantId: config.ASSISTANT_ID || '{assistant_id}',
      },
      function (error, response) {
        if (error) {
          return res.send(error);
        } else {
          return res.send(response);
        }
      }
    );
  });
};