const middy = require('@middy/core');
const { validateToken } = require('../middleware/auth');
const { validateAuth } = require('../../utils/validateAuth');
const { editNote } = require('../../utils/notes');
const { validateNoteBody, serverError, notOwnerError, missingNoteIdError, successResponse } = require('../../utils/validations');

const handler = async (event, context) => {
	const authError = validateAuth(event);
	if (authError) return authError;

	const { id: noteId } = event.pathParameters;
	if (!noteId) return missingNoteIdError();

	const body = event.body ? JSON.parse(event.body) : {};

	const validationError = validateNoteBody(body, true);
	if(validationError) return validationError;

	try{
	const editedNote = await editNote(event.userId, noteId, body);
		return successResponse('Updated note', {note: editedNote});
	} catch (error) {
		if (error.name === 'ConditionalCheckFailedException') {
			return notOwnerError();
		}
		return serverError();
	}
};

module.exports.handler = middy(handler).use(validateToken);