const { db } = require('./db');
const { nanoid } = require('nanoid');
const {
	PutCommand,
	UpdateCommand,
	QueryCommand,
} = require('@aws-sdk/lib-dynamodb');

const createNote = async (userId, title, text) => {
	const noteId = nanoid();
	const now = new Date().toISOString();

	await db.send(
		new PutCommand({
			TableName: process.env.NOTES_TABLE,
			Item: {
				noteId: noteId,
				userId: userId,
				title: title,
				text: text,
				createdAt: now,
			},
		})
	);
	return { noteId, createdAt: now };
};

const getUserNotes = async (userId) => {
	const result = await db.send(
		new QueryCommand({
			TableName: process.env.NOTES_TABLE,
			KeyConditionExpression: 'userId = :userId',
			ExpressionAttributeValues: {
				':userId': userId,
			},
		})
	);
	return result.Items || [];
};

const editNote = async (userId, noteId, updates) => {
	const now = new Date().toISOString();
	const finalUpdates = { ...updates, modifiedAt: now };
	const reservedKeywords = { text: '#text', title: '#title' };
	const finalKey = Object.keys(finalUpdates);

	const UpdateExpression =
		'set ' +
		finalKey
			.map(
				(attributeName) =>
					`${
						reservedKeywords[attributeName] || attributeName
					} = :${attributeName}`
			)
			.join(', ');

	const ExpressionAttributeValues = finalKey.reduce((values, attributeName) => {
		values[`:${attributeName}`] = finalUpdates[attributeName];
		return values;
	}, {});

	const ExpressionAttributeNames = {};
	if (finalUpdates.text) ExpressionAttributeNames['#text'] = 'text';
	if (finalUpdates.title) ExpressionAttributeNames['#title'] = 'title';

	try {
		const result = await db.send(
			new UpdateCommand({
				TableName: process.env.NOTES_TABLE,
				Key: {
					userId: userId,
					noteId: noteId,
				},
				UpdateExpression,
				ExpressionAttributeValues,
				ExpressionAttributeNames:
					Object.keys(ExpressionAttributeNames).length > 0
						? ExpressionAttributeNames
						: undefined,
				ConditionExpression: 'userId = :userId',
				ExpressionAttributeValues: {
					...ExpressionAttributeValues,
					':userId': userId,
				},
				ReturnValues: 'ALL_NEW',
			})
		);
		return result.Attributes;
	} catch (error) {
		if (error.name === 'ConditionalCheckFailedException') {
			throw new Error('Note not found or unauthorized to edit');
		}
		throw error;
	}
};

const deleteNote = async (userId, noteId) => {
	const now = new Date();
	const deletedAt = now.toISOString();
	const expiresAt = Math.floor((now.getTime() + 5 * 24 * 60 * 60 * 1000) / 1000);
	/* 10 sekunders test för att permanent ta bort anteckning:
	const expiresAt = Math.floor(Date.now() / 1000) + 10; */

	try {
		await db.send(
			new UpdateCommand({
				TableName: process.env.NOTES_TABLE,
				Key: { userId: userId, noteId: noteId },
				UpdateExpression: 'set deletedAt = :deletedAt, expiresAt = :expiresAt',
				ExpressionAttributeValues: { ':deletedAt': deletedAt, ':expiresAt': expiresAt},
				ConditionExpression:
					'userId = :userId AND attribute_not_exists(deletedAt)',
				ExpressionAttributeValues: { ':deletedAt': deletedAt, ':expiresAt': expiresAt, ':userId': userId },
			})
		);
	} catch (error) {
		if (error.name === 'ConditionalCheckFailedException') {
			throw new Error('Note not found or unauthorized to delete');
		}
		throw error;
	}
};

const getDeletedNotes = async (userId) => {
	const now = Math.floor(Date.now() / 1000);

	const result = await db.send(
		new QueryCommand({
			TableName: process.env.NOTES_TABLE,
			KeyConditionExpression: 'userId = :userId',
			FilterExpression: 'attribute_exists(deletedAt) AND (attribute_not_exists(expiresAt) OR expiresAt > :now)',
			ExpressionAttributeValues: { ':userId': userId, ':now': now },
		})
	);
	return result.Items || [];
};

const restoreNote = async (userId, noteId) => {
	const now = new Date().toISOString();

	try {
		const result = await db.send(
			new UpdateCommand({
				TableName: process.env.NOTES_TABLE,
				Key: { userId: userId, noteId: noteId },
				UpdateExpression: ' REMOVE deletedAt SET modifiedAt = :now',
				ExpressionAttributeValues: { ':now': now },
				ConditionExpression: 'userId = :userId AND attribute_exists(deletedAt)',
				ExpressionAttributeValues: { ':userId': userId, ':now': now },
				ReturnValues: 'ALL_NEW',
			})
		);
		return result.Attributes;
	} catch (error) {
		if (error.name === 'ConditionalCheckFailedException') {
			throw new Error('Note not found or unauthorized to restore');
		}
		throw error;
	}
};

module.exports = {
	createNote,
	getUserNotes,
	editNote,
	deleteNote,
	getDeletedNotes,
	restoreNote,
};