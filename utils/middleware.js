const User = require('../models/user')
const jwt = require('jsonwebtoken')

const tokenExtractor = (request, response, next) => {
	const authorization = request.get('authorization')
	if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
		request.token = authorization.substring(7)
	} else request.token = null
	next()
}

const userExtractor = async (request, response, next) => {
	if (request.token !== null) {
		const decodedToken = jwt.verify(request.token, process.env.SECRET)
		request.user  = await User.findById( decodedToken.id )
	}
	next()
}

const errorHandler = (error, request, response, next) => {

	if (error.name === 'JsonWebTokenError') {
		response.status(400).json({
			error: 'Token invalid'
		})
	}
	else if (error.name === 'TokenExpiredError') {
		response.status(400).json({
			error: 'Provided token has expired'
		})
	}

	console.error(error.message)

	next(error)
}

module.exports = { tokenExtractor, errorHandler, userExtractor }