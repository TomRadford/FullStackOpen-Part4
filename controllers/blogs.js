const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const { userExtractor } = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
	const blogs = await Blog.find({})
		.populate('user', {name: 1, username: 1, id: 1})
	response.json(blogs)

})

blogsRouter.post('/', userExtractor, async (request, response) => {
	if (!request.body.title) {
		return response.status(400).end()
	}
	if (!request.body.url) {
		return response.status(400).end()
	}

	if (!request.user) {
		return response.status(401).json({ error: 'Missing or invalid token ' })
	}

	const newBlog = request.body
	newBlog.user = request.user
	const user = request.user
	newBlog.likes = newBlog.likes
		? newBlog.likes
		: 0
	const blog = new Blog(newBlog)

	const savedBlog = await blog.save()
	response.status(201).json(savedBlog)
	user.blogs = user.blogs.concat(savedBlog._id)
	await user.save()
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
	
	if (!request.user.id) {
		return response.status(400).json({
			error: 'Missing or invalid token'
		})
	}

	const blog = await Blog.findById( request.params.id )

	if (blog.user.toString() !== request.user.id) {
		return response.status(401).json({
			error: 'Blog can only be deleted by its creator'
		})
	}

	await Blog.findByIdAndDelete(request.params.id)
	response.status(204).end()
})

blogsRouter.put('/:id', userExtractor, async (request, response) => {
	const {body} = request
	body.user = request.user.id
	if (!request.user) {
		return response.status(401).json({ error: 'Missing or invalid token ' })
	}
	const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, body, { new: true, context: 'query' } )
	response.json(updatedBlog)
})

module.exports = blogsRouter