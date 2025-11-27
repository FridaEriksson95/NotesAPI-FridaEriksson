const middy = require('@middy/core');
const { validateToken } = require('../middleware/auth');
const { validateAuth } = require('../../utils/validateAuth');
const { deleteNote } = require('../../utils/notes');
const { notOwnerError, serverError, missingNoteIdError, successResponse } = require('../../utils/validations');

const handler = async (event, context) => {
	const authError = validateAuth(event);
	if (authError) return authError;

	const { id: noteId } = event.pathParameters;
	if (!noteId) return missingNoteIdError();

	try {
		await deleteNote(event.userId, noteId);
		return successResponse('Deleted note');
	} catch (error) {
		if (error.name === 'ConditionalCheckFailedException') {
			return notOwnerError();
		}
		return serverError();
	}
};

module.exports.handler = middy(handler).use(validateToken);
