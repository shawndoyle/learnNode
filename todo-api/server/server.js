const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
	let todo = new Todo({
		text: req.body.text
	});
	todo.save().then(doc => {
		res.send(doc);
	}, err => {
		res.status(400).send(err);
	});
});

app.get('/todos', (req, res) => {
	Todo.find().then(todos => {
		res.send({todos});
	}, err => {
		res.status(400).send(err);
	});
});

app.get('/todos/:id', (req, res) => {
	const {id} = req.params;
	if(!ObjectID.isValid(id)) {
		return res.status(404).send()
	}
	Todo.findById(id)
		.then(todo => {
			if(!todo) {
				return res.status(404).send();
			}
			res.send({todo});
		})
		.catch(() => {
			res.status(400).send();
		});
});

app.delete('/todos/:id', (req, res) => {
	const {id} = req.params;
	if(!ObjectID.isValid(id)) {
		return res.status(404).send();
	}
	Todo.findByIdAndRemove(id)
		.then(todo => {
			if(!todo) {
				return res.status(404).send();
			}
			res.send({todo});
		}).catch(() => {
			res.status(400).send();
		});
});

app.patch('/todos/:id', (req, res) => {
	const {id} = req.params;
	const body = _.pick(req.body, ['text', 'completed']);
	if(!ObjectID.isValid(id)) {
		return res.status(404).send();
	}
	if(_.isBoolean(body.completed) && body.completed) {
		body.completedAt = new Date().getTime();
	} else {
		body.completed = false;
		body.completedAt = null;
	}
	Todo.findByIdAndUpdate(id, {$set: body}, {new: true})
	.then(todo => {
		if(!todo) {
			return res.status(404).send();
		}
		res.send({todo});
	})
	.catch(e => {
		res.status(400).send();
	})
});

//Create user
app.post('/users', (req, res) => {
	const user = new User(_.pick(req.body, ['email', 'password']))
	user.save()
	.then(user => {
		return user.generateAuthToken();
	}).then(token => {
		res.header('x-auth', token).send(user);
	}).catch(e => {
		res.status(400).send(e);
	});
});

//Login
app.post('/users/login', (req, res) => {
	const {email, password} = req.body;
	User.findByCredentials(email, password)
	.then(user => {
		return user.generateAuthToken()
		.then(token => {
			res.header('x-auth', token).send(user);
		});
	}).catch(e => {
		res.status(400).send();
	});
});

app.get('/users/me', authenticate, (req, res) => {
	res.send(req.user);
});

app.listen(port, () => {
	console.log(`Started up on port ${port}`);
});

module.exports = {app};