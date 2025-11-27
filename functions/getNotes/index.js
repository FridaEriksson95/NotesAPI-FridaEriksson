const middy = require('@middy/core');
const { validateToken } = require('../middleware/auth');
const { validateAuth } = require('../../utils/validateAuth');
const { getUserNotes } = require('../../utils/notes');
const { successResponse } = require('../../utils/validations');

const handler = async (event, context) => {
	const authError = validateAuth(event);
	if (authError) return authError;

	const notes = await getUserNotes(event.userId);
	
	return successResponse('All your notes: ', {notes});
}

module.exports.handler = middy(handler).use(validateToken);