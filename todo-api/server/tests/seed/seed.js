const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo.js');
const {User} = require('./../../models/user.js');

const UserOneId = new ObjectID();
const UserTwoId = new ObjectID();

const testUsers = [{
	_id: UserOneId,
	email: 'shawn@example.com',
	password: 'FirstPassword',
	tokens: [{
		access: 'auth',
		token: jwt.sign({ _id: UserOneId, access: 'auth'}, 'abc123').toString()
	}]
}, {
	_id: UserTwoId,
	email: 'eric@example.com',
	password: 'SecondPassword'
}];


const testTodos = [
{
	_id: new ObjectID(),
	text: "First dummy todo"
}, {
	_id: new ObjectID(),
	text: "Second dummy todo",
	completed: true,
	completedAt: 333
}];

const populateTodos = (done) => {
	Todo.deleteMany().then(() => {
		return Todo.insertMany(testTodos);
	})
	.then(() => done())
	.catch(done);
};

const populateUsers = (done) => {
	User.deleteMany().then(() => {
		let user1 = new User(testUsers[0]).save();
		let user2 = new User(testUsers[1]).save();
		return Promise.all([user1, user2]);
	}).then(() => done())
	.catch(done);
};

module.exports = {populateTodos, testTodos, populateUsers, testUsers};