const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

const validateToken = {
	before: async (request) => {
		try {
			const token = request.event.headers.authorization.replace('Bearer ', '');

			if (!token) throw new Error('No token provided');

			const data = jwt.verify(token, secret);

			request.event.userId = data.userId;
			request.event.username = data.username;
			return request.response;
		} catch (error) {
			request.event.error = '401';
			return request.response;
		}
	},

	onError: async (request) => {
		request.event.error = '404';
		return request.response;
	},
};

module.exports = { validateToken };
