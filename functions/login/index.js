const middy = require('@middy/core');
const { loginUser } = require('../../utils/user');
const { validateLoginBody, loginResponse } = require('../../utils/validations');

const handler = async (event) => {
	const body = event.body ? JSON.parse(event.body) : {};

	const validationError = validateLoginBody(body);
	if(validationError) return validationError;

	const { username, password} = body;

	const result = await loginUser(username, password);
	return loginResponse(result);
};

module.exports.handler = middy(handler);