const { sendResponse } = require('./response');

const validateNoteBody = (body, allowEmpty = false) => {
	const { title, text } = body;

	if (!allowEmpty && (!title || !text)) {
		return sendResponse(400, {
			success: false,
			message: 'Title and text are required',
		});
	}

	if (title !== undefined) {
		if (title.trim() === '' && !allowEmpty) {
			return sendResponse(400, {
				success: false,
				message: 'Title cannot be empty',
			});
		}
		if (title.length > 50) {
			return sendResponse(400, {
				success: false,
				message: 'Title max 50 characters',
			});
		}
	}

	if (text !== undefined) {
		if (text.trim() === '' && !allowEmpty) {
			return sendResponse(400, {
				success: false,
				message: 'Text cannot be empty',
			});
		}
		if (text.length > 300) {
			return sendResponse(400, {
				success: false,
				message: 'Text max 300 characters',
			});
		}
	}
	return null;
};

const missingNoteIdError = () => {
	return sendResponse(404, { success: false, message: 'Missing note id' });
};

const validateSignupBody = (body) => {
	const { username, password, firstname, lastname } = body;

	if (!username || !password || !firstname || !lastname) {
		return sendResponse(400, {
			success: false,
			message: 'All fields are required',
		});
	}
	if (password.length < 6) {
		return sendResponse(400, {
			success: false,
			message: 'Password must be at least 6 characters',
		});
	}
	if (firstname.length > 30 || lastname.length > 30) {
		return sendResponse(400, {
			success: false,
			message: 'Firstname and lastname max 30 characters',
		});
	}
	return null;
};

const validateLoginBody = (body) => {
	const { username, password } = body;

	if (!username || !password) {
		return sendResponse(401, {
			success: false,
			message: 'Username & Password required',
		});
	}
	return null;
};

const signUpResponse = (result) => {
	if (result.message === 'Username already exists') {
		return sendResponse(409, result);
	}
	return sendResponse(result.success ? 200 : 401, result);
};

const loginResponse = (result) => {
	return sendResponse(result.success ? 200 : 401, result);
};

const notOwnerError = () => {
	return sendResponse(403, {
		success: false,
		message: 'You can only modify your own notes',
	});
};

const serverError = () => {
	return sendResponse(500, {
		success: false,
		message: 'Could not process request',
	});
};

const successResponse = (message = null, data = null) => {
	const response = { success: true };
	if (message) response.message = message;
	if (data) Object.assign(response, data);
	return sendResponse(200, response);
};

const failureResponse = (message = null, data = null) => {
	const response = { success: false };
	if (message) response.message = message;
	if (data) Object.assign(response, data);
	return sendResponse(400, response);
};

module.exports = {
	validateNoteBody,
	missingNoteIdError,
	validateSignupBody,
	validateLoginBody,
	successResponse,
	notOwnerError,
	serverError,
	signUpResponse,
	loginResponse,
	failureResponse,
};
