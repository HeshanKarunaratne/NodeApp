const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const jsonWebToken = require('jsonwebtoken');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

/*
global.mc = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
	database: '',
	 socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock'
});
*/

const myJWTSecretKey = 'my-secret-key';

global.mc = mysql.createConnection({
	host:'192.248.32.211',
	user: 'heshan',
	password: 'Hsh7867',
	database: '',
	insecureAuth:true
	});


mc.connect();

global.IndexNo;

//login code
app.post('/login/:IndexNo/:StdPassword', function (req, res) {

	IndexNo = req.params.IndexNo;
	let StdPassword = req.params.StdPassword;
	let data = IndexNo.substring(2, 6);
	database = 'as' + data + 'web';
	let userdata = { "IndexNo": IndexNo, "StdPassword": StdPassword };
	mc.changeUser({ database: database }, function (err) {
		if (err) throw err;
	});

	if ((!IndexNo) || (!StdPassword)) {

		return res.send({ 'message': 'false' });
	}


	mc.query('SELECT * FROM student where IndexNo=? AND StdPassword=?', [IndexNo, StdPassword], function (error, results, fields) {
		if (error) throw error;
		if (results.length == 0) {
			return res.send({ 'message': 'false' });
		} else if (results.length == 1) {
			const user = {
				IndexNo: IndexNo,
				StdPassword: StdPassword
			};

			token = jsonWebToken.sign(user, myJWTSecretKey);
			
			res.json({

				'message': 'true',
				'token': token,
				'data': results
			});

		} else {
			return res.send({ 'message': 'false' });
		}

	});

});


function isValidToken(token) {
	try {
		const tokenDecodedData = jsonWebToken.verify(token, myJWTSecretKey);
		return true;
	} catch (error) {
		return false;
	}
}

//getsubject
app.get('/getSubjects/:Number', function (req, res) {
	let Number = req.params.Number;
	let token = req.headers.authorization;
	IndexNo = global.IndexNo;
	if (!token) {
		return res.status(400).send({ 'message': 'false' });
	}

	if (!Number) {
		return res.status(400).send({ 'message': 'false' });
	}
	if (isValidToken(token)) {
		mc.query("SELECT `combination`.Subject1 ,`combination`.Subject2,`combination`.Subject3 FROM `combination` where `combination`.Number=? ", [Number], function (error, results, fields) {

			if (error) throw error;
			if (results.length > 0){
				return res.send({ 'message': 'true', 'data': results });
			}else{
				return res.send({ 'message': 'false' });
			}
		});
	} else {
		res.json({
			'message': 'false',
			data: "Invalid Token"
		});
	}

});

//result-subject only 
app.get('/getResults/subject/:Subject', function (req, res) {
	let Subject = req.params.Subject;
	IndexNo = global.IndexNo;
	let token = req.headers.authorization;
	console.log("result Subject " + Subject);
	if (!token) {
		return res.send({ 'message': 'false' });
	}
	if (!Subject) {
		return res.send({ 'message': 'false' });
	}
	if (isValidToken(token)) {
		mc.query("SELECT `result`.Grade,`result`.CourseCode,`course`.CourseDesc FROM `result`,`course` where `result`.CourseCode=`course`.CourseCode AND IndexNo=? AND `result`.CourseCode like ?", [IndexNo, '%' + Subject + '%'], function (error, results, fields) {
			if (results.length > 0) {
				return res.send(results);
			} else {
				return res.send({ 'message': 'false' });
			}
		})
	} else {
		res.json({
			'message': 'false',
			data: "Invalid Token"
		});
	}
});

	//result-year only 
	app.get('/getResults/year/:Year', function (req, res) {
		let Year = req.params.Year;
		console.log("result Year " + Year);
		IndexNo = global.IndexNo;
		let token = req.headers.authorization;
		let RegExp = '^.{4}[' + Year + '].{6}';
		if (!token) {
			return res.send({ 'message': 'false' });
		}
		if (!Year) {
			return res.send({ 'message': 'false' });
		}
	
			if (isValidToken(token)) {
				mc.query("SELECT `result`.Grade,`result`.CourseCode,`course`.CourseDesc FROM `result`,`course` where `result`.CourseCode=`course`.CourseCode AND IndexNo=? AND `result`.CourseCode RegExp ? ", [IndexNo, RegExp], function (error, results, fields) {
					if (results.length > 0) {
						return res.send(results);
					} else {
						return res.send({ 'message': 'false' });
					}
				})
			} else {
				res.json({
					'message': 'false',
					data: "Invalid Token"
				});
			}
	});

	//result-subject and year only 
	app.get('/getResults/subject/:Subject/year/:Year', function (req, res) {
		let Subject = req.params.Subject;
		let Year = req.params.Year;
		IndexNo = global.IndexNo;
		let token = req.headers.authorization;
		let RegExp = Subject + '.{1}' + Year + '.{6}';
		console.log("result Subject " + Subject + " result Year " + Year);
		if (!token) {
			return res.send({ 'message': 'false' });
		}
		if (!Subject) {
			return res.send({ 'message': 'false' });
		}
		if (!Year) {
			return res.send({ 'message': 'false' });
		}			
			if (isValidToken(token)) {
				mc.query("SELECT `result`.Grade,`result`.CourseCode,`course`.CourseDesc FROM `result`,`course` where `result`.CourseCode=`course`.CourseCode AND IndexNo=? AND `result`.CourseCode Regexp ?", [IndexNo, RegExp], function (error, results, fields) {
					if (results.length > 0) {
						return res.send(results);
					} else {
						return res.send({ 'message': 'false' });
					}
				})
			} else {
				res.json({
					'message': 'false',
					data: "Invalid Token"
				});
			}
	});

	//attempt-subject only 
	app.get('/getAttempts/subject/:Subject', function (req, res) {
		let Subject = req.params.Subject;
		let token = req.headers.authorization;
		IndexNo = global.IndexNo;
		console.log("attempt Subject " + Subject);
		if (!token) {
			return res.send({ 'message': 'false' });
		}
		if (!Subject) {
			return res.send({ 'message': 'false' });
		}
			if (isValidToken(token)) {
				mc.query("SELECT `result`.CourseCode,`course`.CourseDesc,`result`.Attempt1,`result`.Attempt2,`result`.Attempt3,`result`.Attempt4,`result`.Attempt5 FROM `result`,`course` where `result`.CourseCode=`course`.CourseCode AND IndexNo=? AND `result`.CourseCode like ?", [IndexNo, '%' + Subject + '%'], function (error, results, fields) {
					if (results.length > 0) {
						return res.send(results);
					} else {
						return res.send({ 'message': 'false' });
					}
				})
			} else {
				res.json({
					'message': 'false',
					data: "Invalid Token"
				});
			}
	});

	//attempt-year only 
	app.get('/getAttempts/year/:Year', function (req, res) {
		let Year = req.params.Year;
		IndexNo = global.IndexNo;
		let token = req.headers.authorization;
		console.log("attempt year " + Year);
		let RegExp = '^.{4}[' + Year + '].{6}';
		if (!token) {
			return res.send({ 'message': 'false' });
		}
		if (!Year) {
			return res.send({ 'message': 'false' });
		}
			if (isValidToken(token)) {
				mc.query("SELECT `result`.CourseCode,`course`.CourseDesc,`result`.Attempt1,`result`.Attempt2,`result`.Attempt3,`result`.Attempt4,`result`.Attempt5 FROM `result`,`course` where `result`.CourseCode=`course`.CourseCode AND IndexNo=? AND `result`.CourseCode RegExp ? ", [IndexNo, RegExp], function (error, results, fields) {
					if (results.length > 0) {
						return res.send(results);
					} else {
						return res.send({ 'message': 'false' });
					}
				})
			} else {
				res.json({
					'message': 'false',
					data: "Invalid Token"
				});
			}
	});

	//attempt-subject and year only 
	app.get('/getAttempts/subject/:Subject/year/:Year', function (req, res) {
		let Subject = req.params.Subject;
		let Year = req.params.Year;
		IndexNo = global.IndexNo;
		let token = req.headers.authorization;
		console.log("attempt subject " + Subject + " attempt year " + Year);
		let RegExp = Subject + '.{1}' + Year + '.{6}';
		if (!token) {
			return res.send({ 'message': 'false' });
		}
		if (!Year) {
			return res.send({ 'message': 'false' });
		}
		if (!Subject) {
			return res.send({ 'message': 'false' });
		}
		if (isValidToken(token)) {
			mc.query("SELECT `result`.CourseCode,`course`.CourseDesc,`result`.Attempt1,`result`.Attempt2,`result`.Attempt3,`result`.Attempt4,`result`.Attempt5 FROM `result`,`course` where `result`.CourseCode=`course`.CourseCode AND IndexNo=? AND `result`.CourseCode RegExp ? ", [IndexNo, RegExp], function (error, results, fields) {
				if (results.length > 0) {
					return res.send(results);
				} else {
					return res.send({ 'message': 'false' });
				}
			})
		} else {
			res.json({
				'message': 'false',
				data: "Invalid Token"
			});
		}
	});


	//gpa-subject only
	app.get('/getGPA/subject/:Subject', function (req, res) {
		let Subject = req.params.Subject;
		IndexNo = global.IndexNo;
		let token = req.headers.authorization;
		console.log("gpa Subject " + Subject);
		if (!token) {
			return res.send({ 'message': 'false' });
		}
		if (!Subject) {
			return res.send({ 'message': 'false' });
		}
			if (isValidToken(token)) {
			mc.query("SELECT " + Subject + "TotCredits," + Subject + "GPA FROM `gpa` where IndexNo=?", [IndexNo], function (error, results, fields) {
			if (results.length > 0) {
				return res.send({ 'message': 'true', 'data': results });
					} else {
						return res.send({ 'message': 'false' });
					}
				})
			} else {
				res.json({
					'message': 'false',
					data: "Invalid Token"
				});
			}
	});

	//rank-subject only
	app.get('/getRank/subject/:Subject', function (req, res) {
		let Subject = req.params.Subject;
		IndexNo = global.IndexNo;
		console.log("rank Subject " + Subject);
		let token = req.headers.authorization;
		if (!Subject) {
			return res.send({ 'message': 'false' });
		}
			if (isValidToken(token)) {
				mc.query("SELECT IndexNo," + Subject + "GPA,rank FROM(SELECT *,IF(" + Subject + "GPA = @_last_" + Subject + "GPA, @cur_rank := @cur_rank, @cur_rank := @_sequence) AS rank,@_sequence := @_sequence + 1,@_last_" + Subject + "GPA := " + Subject + "GPA FROM gpa, (SELECT @cur_rank := 1, @_sequence := 1, @_last_" + Subject + "GPA := NULL) r ORDER BY " + Subject + "GPA DESC) ranked where IndexNo=? ", [IndexNo], function (error, results, fields) {
					if (results.length > 0) {
					return res.send({ 'message': 'true', 'data': results });
						} else {
							return res.send({ 'message': 'false' });
						}
					})
				} else {
					res.json({
						'message': 'false',
						data: "Invalid Token"
					});
				}
	});


	// port must be set to 8080 because incoming http requests are routed from port 80 to port 8080
	app.listen(8080, function () {
		console.log('Node app is running on port 8080');
	});


