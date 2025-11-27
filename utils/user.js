const { db } = require('./db');
const { PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { nanoid } = require('nanoid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

const getUser = async (username) => {
	try {
		const result = await db.send(
			new GetCommand({
				TableName: process.env.USERS_TABLE,
				Key: { username: username },
			})
		);
		return result.Item || null;
	} catch (error) {
		return null;
	}
};

const createUser = async (username, password, firstname, lastname) => {
	const userId = nanoid();
	const hashedPassword = await bcrypt.hash(password, 10);

	try {
		await db.send(
			new PutCommand({
				TableName: process.env.USERS_TABLE,
				Item: {
					userId: userId,
					username: username,
					password: hashedPassword,
					firstname: firstname,
					lastname: lastname,
				},
				ConditionExpression: 'attribute_not_exists(username)',
			})
		);
		return { success: true, userId: userId };
	} catch (error) {
		if (error.name === 'ConditionalCheckFailedException') {
			return { success: false, message: 'Username already exists' };
		}
		throw error;
	}
};

const loginUser = async (username, password) => {
	const user = await getUser(username);
	if (!user) return { success: false, message: 'Invalid username or password' };

	const passwordMatch = await bcrypt.compare(password, user.password);
	if (!passwordMatch)
		return { success: false, message: 'Invalid username or password' };

	const token = jwt.sign(
		{ userId: user.userId, username: user.username },
		secret,
		{ expiresIn: '2h' }
	);

	return { success: true, token: token };
};

module.exports = { getUser, createUser, loginUser };
