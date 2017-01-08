const knex = require('../database/schema.knex.js');

let getAllEvents = () => {
	return knex('Events');
};

let getEventsById = (id) => {
	return knex('Events').where('id', id);
};

let saveEvent = (event) => {
	console.log("SAVING EVENT?", event)
  return knex('Events').insert({
    event: event
  }); 
};

let addEventToEventsUsers = (EventId, UsersId) => {
	console.log("EVENTS ID", EventId, "AND THE USER ID", UsersId)
  return knex('EventsUsers').insert({
    EventsId: EventId,
    UserId: UsersId
  }); 
};

let getEventsByUserId = (UserId) => {
return knex('EventsUsers').where({
    UserId: UserId
  }).then((data) => {
    return data;
  });
};

let getEventsUsersByEventsId = (EventId) => {
  return knex('EventsUsers').where({
    EventsId: EventId
  });
};

module.exports = {
	getAllEvents:getAllEvents,
	getEventsById: getEventsById,
	saveEvent: saveEvent,
	addEventToEventsUsers: addEventToEventsUsers,
	getEventsByUserId: getEventsByUserId,
	getEventsUsersByEventsId: getEventsUsersByEventsId
};