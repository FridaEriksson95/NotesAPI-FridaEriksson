const middy = require('@middy/core');
const { validateToken } = require('../middleware/auth');
const { validateAuth } = require('../../utils/validateAuth');
const { getDeletedNotes } = require('../../utils/notes');
const { successResponse } = require('../../utils/validations');

const handler = async (event, context) => {
    const authError = validateAuth(event);
    if (authError) return authError;

    const notes = await getDeletedNotes(event.userId);
    return successResponse('All deleted notes: ', { notes });
}

module.exports.handler = middy(handler).use(validateToken);