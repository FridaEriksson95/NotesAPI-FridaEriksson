const middy = require('@middy/core');
const { createUser } = require('../../utils/user');
const { validateSignupBody, usernameExistsError, signUpResponse } = require('../../utils/validations');


const handler = async (event) => {
	const body = event.body ? JSON.parse(event.body) : {};
	
	const { username, password, firstname, lastname } = body;

	const validationError = validateSignupBody(body);
	if(validationError) return validationError;

	const result = await createUser(username, password, firstname, lastname);
	return signUpResponse(result);
};

module.exports.handler = middy(handler);
