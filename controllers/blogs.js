const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  if (!request.body.title) {
    return response.status(400).end()
  }
  if (!request.body.url) {
    return response.status(400).end()
  }

  const newBlog = request.body
  newBlog.likes = newBlog.likes
    ? newBlog.likes
    : 0
  const blog = new Blog(newBlog)
  const savedNote = await blog.save()
  response.status(201).json(savedNote)
})

blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const { body } = request
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, body, { new: true } )
  response.json(updatedBlog)
})


module.exports = blogsRouter
