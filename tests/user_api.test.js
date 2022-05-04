const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user') 

beforeEach(async () => {
	await User.deleteMany({})
	const blogUsers = helper.initialUsers.map(user => new User(user))
	const promiseArray = blogUsers.map(blog => blog.save())
	await Promise.all(promiseArray)
})

describe('When an invalid user is added', () => {

	test('the user is not added to the database', async () => {
		const usersBefore = await User.find({})
		const badUser = {
			name: 'Ta',
			username: 'a',
		} 
		
		await api
			.post('/api/users')
			.send(badUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)

		const usersAfter = await User.find({})

		expect(usersAfter).toEqual(usersBefore)
	})

	test('the correct status code and error message are returned when no password', async () => {
		const badUser = {
			name: 'Ta',
			username: 'a',
		} 
        
		const res = await api
			.post('/api/users')
			.send(badUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)


		expect(JSON.stringify(res.body)).toContain('missing username or password')

	})

	test('the correct status code and error message are returned when no length less than three', async () => {
		const badUser = {
			name: 'Taadaa',
			username: 'a',
			password: 'sekret'
		} 
        
		const res = await api
			.post('/api/users')
			.send(badUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)


		expect(JSON.stringify(res.body)).toContain('username and password need to each be at least 3 charaters long')

	})


})

afterAll(async () => {
	mongoose.connection.close()
})