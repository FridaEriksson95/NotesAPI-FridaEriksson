const middy = require('@middy/core');
const { validateToken } = require('../middleware/auth');
const { validateAuth } = require('../../utils/validateAuth');
const { createNote } = require('../../utils/notes');
const { validateNoteBody, successResponse } = require('../../utils/validations');

const handler = async (event, context) => {
	const authError = validateAuth(event);
	if (authError) return authError;

	const body = event.body ? JSON.parse(event.body) : {};

	const validationError = validateNoteBody(body);
	if(validationError) return validationError;

	const { title, text } = body;

	const { noteId } = await createNote(event.userId, title, text);
	return successResponse('Note saved', { noteId: noteId});
}

module.exports.handler = middy(handler).use(validateToken);