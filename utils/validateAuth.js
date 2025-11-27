const { sendResponse } = require("./response");

const validateAuth = (event) => {
if (event?.error && event?.error === '401')
    return sendResponse(401, {
        success: false,
        message: 'Invalid or missing token',
    });
    return null;
};

module.exports = { validateAuth };