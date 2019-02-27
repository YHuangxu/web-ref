const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const passport = require('passport');
const validateRegisterInput = require('../validation/register');
const validateLoginInput = require('../validation/login');

/* GET users listing. */
router.get('/register', function(req, res, next) {
  res.send('respond with a resource');
});


// router 
// post method
router.post('/register', (req, res) => {

	const {errors, isValid} = validateRegisterInput(req.body);

	if(!isValid){
		return res.status(400).json(errors);
	}
	User.findOne({
		email: req.body.email
	})
	.then(user => {
		console.log("expecetd 20");
	
		if(user){
			return res.status(400).json({email: 'email already exist'});
		}else{
			
			const newUser = new User({
				name: req.body.name,
				email: req.body.email,
				password: req.body.password,
				studentOrNot: req.body.studentOrNot
			});

			console.log(newUser);

			bcrypt.genSalt(10, (err, salt) => {
				bcrypt.hash(newUser.password, salt, (err, hash)=>{
					if(err) throw err;
					newUser.password = hash;
					console.log("49?")
					console.log(newUser);
					newUser.save()
						.then(user => res.send(user))
						.catch(err => console.log(err));
				})

			})
		}
	})
});


//login router
router.post('/login', (req, res) =>{

	const {errors, isValid} = validateLoginInput(req.body);

	if(!isValid){
		return res.status(400).json(errors);
	}


	const email = req.body.email;
	const password = req.body.password;
	student = false;
	console.log(req);
	User.findOne({email})
		.then(user => {
			if(user){
				if(user.studentOrNot){
					student = true;
					console.log(student);
				}
			}
		})



	

	User.findOne({email})
		.then(user =>{
			if(!user){
				errors.email = 'user not found';
				return res.status(404).json(errors);
			}

			bcrypt.compare(password, user.password)
				.then(isMatch =>{
					if(isMatch){
						const payload = {id: user.id, name: user.name};

						jwt.sign(payload, keys.secretOrKey, {expiresIn: 3600}, (err, token) => {
							return res.json({
								success: true,
								studnetBool: student,
								token: "Bearer " + token  
							});
						});
					}else{
						errors.password = 'not equals'
						return res.status(400).json(errors);
					}
				});
		});
});


router.get('/current', passport.authenticate('jwt', {session: false}), (req, res)=>{
	res.json({
		id: req.user.id,
		name: req.user.name,
		studentOrNot: req.user.studentOrNot
	});
});



module.exports = router;
