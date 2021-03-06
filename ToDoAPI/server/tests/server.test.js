//Libraries
const expect = require('expect')
const request = require('supertest')

//Local imports
const app = require('./../server')
const Todo = require('./../models/todo')

beforeEach((done) => {
	Todo.deleteMany({}).then(done)
})

describe('POST /todos', () => {
	it('should create a new todo', (done) => {
		let text = 'Test todo text'

		request(app)
			.post('/todos')
			.send({ text })
			.expect(200)
			.expect(() => {
				expect(res.body.text).toBe(text)
			})
			.end((err, res) => {
				if(err) {
					return done(err)
				}

				Todo.find().then((todos) => {
					expect(todos.length).toBe(1)
					expect(todos[0].text).toBe(text)
					done()
				}).catch((err) => done(err))
			})
	})
})