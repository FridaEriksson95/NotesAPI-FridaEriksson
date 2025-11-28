const middy = require('@middy/core');
const { validateToken } = require('../middleware/auth');
const { validateAuth } = require('../../utils/validateAuth');
const { restoreNote } = require('../../utils/notes');
const { successResponse, failureResponse } = require('../../utils/validations');

const handler = async (event, context) => {
	const authError = validateAuth(event);
	if (authError) return authError;

	const { id: noteId } = event.pathParameters;
	if (!noteId) return missingNoteIdError();

	try {
		const restoredNote = await restoreNote(event.userId, noteId);
		return successResponse('Note restored', { note: restoredNote });
	} catch (error) {
		if (error.message.includes('unauthorized')) {
			return failureResponse('Note is not deleted');
		}
		if ((error.name = 'ConditionalCheckFailedException')) {
			return notOwnerError();
		}
		return serverError();
	}
};

module.exports.handler = middy(handler).use(validateToken);
