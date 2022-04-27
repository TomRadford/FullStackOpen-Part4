
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const { response } = require('../app')

beforeEach( async () => {
  await Blog.deleteMany({})
  const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
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

  await api
    .post('/api/blogs')
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
  const response = await api.post('/api/blogs')
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
  const blogToDelete = helper.initialBlogs[0]
  await api
    .delete(`/api/blogs/${blogToDelete._id}`)
    .expect(204)
  const resultBlogs = await helper.blogsInDb()
  const blogIds = resultBlogs.map(blog => blog.id)
  expect(blogIds).not.toContain(helper.initialBlogs[0]._id)
})

test('a single blog post is successfully updated', async () => {
  const blogToUpdate = helper.initialBlogs[0]
  const response = await api
    .put(`/api/blogs/${blogToUpdate._id}`)
    .send({ 'likes': 55 })
    .expect(200)
    .expect('Content-Type', /application\/json/)
  expect(response.body.likes).toEqual(55)
})

afterAll(() => {mongoose.connection.close()})