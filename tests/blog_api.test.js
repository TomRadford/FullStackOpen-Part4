const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const config = require('../utils/config')
const Blog = require('../models/blog')
const User = require('../models/user')

beforeEach( async () => {
	await mongoose.connect(config.MONGODB_URI)
	await Blog.deleteMany({})
	const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
	const promiseArray = blogObjects.map(blog => blog.save())
	await Promise.all(promiseArray)
	await User.deleteMany({})
})

test('return the correct amount of notes in JSON format', async () => {
	const response = await api.get('/api/blogs')
		.expect(200)
		.expect('Content-Type', /application\/json/)
	expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('blog unique identifier property is named as id', async () => {
	const response = await api.get('/api/blogs')
	expect(response.body[0].id).toBeDefined()
})

test('POST request sucessfully creates new blog post', async () => {
	const newBlog = {
		title: 'Test testing testing blog',
		author: 'Test master',
		url: 'http://testblogs.com/node/4',
		likes: 13,
	}
   
	const user = helper.initialUsers[Math.floor(Math.random() * (3 - 0) )]
	await api
		.post('/api/users')
		.send(user)
	const userLoginObject = await api
		.post('/api/login')
		.send(user)
	const authHeader = `Bearer ${userLoginObject.body.token}`

	await api
		.post('/api/blogs')
		.set('Authorization', authHeader)
		.send(newBlog)
		.expect(201)
		.expect('Content-Type', /application\/json/)

	const blogsAtEnd = await helper.blogsInDb()
	expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

	const blogURLs = blogsAtEnd.map(blog => blog.url)
	expect(blogURLs).toContain(newBlog.url)

})

test('likes property defaults to the value 0', async () => {
	const newBlog = {
		title: 'Test testing testing blog',
		author: 'Test master',
		url: 'http://testblogs.com/node/4'
	}

	const user = helper.initialUsers[Math.floor(Math.random() * (3 - 0) )]
	await api
		.post('/api/users')
		.send(user)
	const userLoginObject = await api
		.post('/api/login')
		.send(user)
	const authHeader = `Bearer ${userLoginObject.body.token}`



	const response = await api
		.post('/api/blogs')
		.set('Authorization', authHeader)
		.send(newBlog)
		.expect(201)
		.expect('Content-Type', /application\/json/)

	expect(response.body.likes).toBe(0)
})

test('missing title and url returns 400', async () => {
	const newBlog = {
		author: 'Test master',
		likes: 55
	}

	await api
		.post('/api/blogs')
		.send(newBlog)
		.expect(400)
})

test('a single blog post is successfully deleted', async () => {
	const userToPost = helper.initialUsers[0] 
	await api
		.post('/api/users')
		.send(userToPost)
	
	const userLoginObject = await api
		.post('/api/login')
		.send(userToPost)
	const authHeader = `Bearer ${userLoginObject.body.token}`

	const blogToPost = {
		title: 'React patterns',
		author: 'Michael Chan',
		url: 'https://reactpatterns.com/',
		likes: 7,
	}
	const blogToDelete = await api
		.post('/api/blogs')
		.set('Authorization', authHeader)
		.send(blogToPost)

	await api
		.delete(`/api/blogs/${blogToDelete.body.id}`)
		.set('Authorization', authHeader)
		.expect(204)
	const resultBlogs = await helper.blogsInDb()
	const blogIds = resultBlogs.map(blog => blog.id)
	expect(blogIds).not.toContain(blogToDelete.body.id)
})

test('a single blog post is successfully updated', async () => {
	const user = helper.initialUsers[Math.floor(Math.random() * (3 - 0) )]
	await api
		.post('/api/users')
		.send(user)
	const userLoginObject = await api
		.post('/api/login')
		.send(user)
	const authHeader = `Bearer ${userLoginObject.body.token}`

	const blogToUpdate = helper.initialBlogs[0]
	const response = await api
		.put(`/api/blogs/${blogToUpdate._id}`)
		.set('Authorization', authHeader)
		.send({ 'likes': 55 })
		.expect(200)
		.expect('Content-Type', /application\/json/)
	expect(response.body.likes).toEqual(55)
})

test('fails with 401 if no token provided', async () => {
	const blog = helper.initialBlogs[0] 
	await api
		.post('/api/blogs')
		.send(blog)
		.expect(401)
})

afterAll(() => {mongoose.connection.close()})