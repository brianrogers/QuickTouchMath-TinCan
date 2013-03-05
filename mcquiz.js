/*jslint nomen: true, debug: true, evil: false, vars: true, white: true, browser: true, bitwise: true */
/*global $, jQuery, alert, escape*/
//like a uuid
//http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
             .toString(16)
             .substring(1);
};

function uuid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
         s4() + '-' + s4() + s4() + s4();
}
var getSkillId = function (gametype) {
  switch (gametype) {
    case 'div':
      return 'db071e53cfbb1b489bb752a49195494aa4c90938_id';
    case 'mul':
      return '4de11163a02bc9212b3dbb5db8f431c86773fa8b_id';
    case 'add':
      return 'ecb39d82d05f63e84558a2a93f59568d0d8b652d_id';
    case 'sub':
      return 'd05df9a709ca57544ca53ba0364821d587d1556f_id';
  }
};

// copyright 2011 Brian Rogers - Creature Teachers
var mcquiz = function() {
	this.quizTime = 60;
	this.counter = 60;
	this.questions = [];
	this.wrongQuestions = [];
	this.currentQuestion = 0;
	this.score = 0;
	this.gametype = 'add';
	this.randomizeQuestions = true;
	this.questionTimer = 0;
	this.questionTimerInterval = null;
	this.questionTimerRunning = false;
	this.sessionid = uuid();

	// this.tc_lrs = {};
	// this.tc_lrs.endpoint = "https://cloud.scorm.com/ScormEngineInterface/TCAPI/VK76L7KZME/";
	// this.tc_lrs.auth = "Basic Vks3Nkw3S1pNRTo3WTFETmM1bWFwYk5wckg5aE1KQmNaNTFUbWFGSXNvY1hnUlFjREtn";
	this.tc_lrs = {};
	this.tc_lrs.endpoint = "https://cloud.scorm.com/ScormEngineInterface/TCAPI/EGOZ6RLIC0";
	this.tc_lrs.auth = "Basic RUdPWjZSTElDMDp2VDVpc2dKSk9sbGZKODRNeEFOV3NYMFVYaVYxSFc1VXVia3RzeGtl";


	this.parseXml = function(xml) {
		var thisClass = this;
		$(xml).find("question").each(function() {
			var question = [];
			$(this).find("string").each(function() {
				question.push($(this).text());
			});
			thisClass.addQuestion(question);
		});

		this.askQuestion();
	};

	this.addQuestion = function(question) {
		this.questions.push(question);
	};

	this.saveScoreToServer = function() {

		var thisClass = this;
		console.log('saving player=' + thisClass.playerName + '&score=' + thisClass.score + '&game=' + thisClass.gametype);
		//save score
		//$.ajax({
		//	type: "POST",
		//	url: "/savescore",
		//	data: "player=" + thisClass.playerName + "&score=" + thisClass.score + "&game=" + thisClass.gametype,
		//	//dataType: ($.browser.msie) ? "text/xml" : "xml",
		//	success: function(xml) {},
		//	error: function(err1, err2, err3, err4) {}
		//});

		localStorage.setItem('qtm-'+thisClass.gametype+'-score',thisClass.score);
	};

	this.gameOver = function() {
		clearInterval(this.timer);

		var missedString = "<br>";
		var i = 0;
		for (i = 0; i < this.wrongQuestions.length - 1; i++) {
			missedString += this.wrongQuestions[i][1] + ' = ' + this.wrongQuestions[i][2] + "<br>";
		}

		this.updateGameOverUI('Good Job!<br>You got ' + this.score + ' correct!<br><br>You missed ' + missedString);

		this.saveScoreToServer();
	};

	this.timerStep = function() {
		this.counter--;
		if (this.counter === 0) {
			//game over
			this.updateTimerUI(this.counter);
			this.gameOver();

		} else {
			//update timer
			this.updateTimerUI(this.counter);
		}
	};

	mcquiz.prototype.updateResetGameUI = function() {};
	mcquiz.prototype.updateStartGameUI = function() {};
	mcquiz.prototype.updateGameOverUI = function(message) {};
	mcquiz.prototype.updateTimerUI = function(counter) {};
	mcquiz.prototype.updateQuestionUI = function(text, answers) {};
	mcquiz.prototype.updateScoreUI = function(score) {};

	this.shuffle = function(ArrayToSuffle) {
		var i = ArrayToSuffle.length;
		if (i === 0) {
			return false;
		}
		while (--i) {
			var j = Math.floor(Math.random() * (i + 1));
			var tempi = ArrayToSuffle[i];
			var tempj = ArrayToSuffle[j];
			ArrayToSuffle[i] = tempj;
			ArrayToSuffle[j] = tempi;
		}
		return true;
	};

	this.askQuestion = function() {
		if (this.randomizeQuestions) {
			this.loadRandomQuestion();
		} else {
			this.loadNextSequentialQuestion();
		}
	};

	this.startQuestionTimer = function() {
		if (this.questionTimerRunning === false) {
			this.questionTimer = 0;
			var self = this;
			this.questionTimerInterval = window.setInterval(function() {
				self.questionTimer += 1;
				console.log(self.questionTimer);
			},
			1000);
			this.questionTimerRunning = true;
		}
	};

	this.stopQuestionTimer = function() {
		window.clearInterval(this.questionTimerInterval);
		this.questionTimerRunning = false;
	};

	this.loadRandomQuestion = function() {
		this.currentQuestion = this.questions[Math.floor(Math.random() * this.questions.length)];

		answers = [this.currentQuestion[2], this.currentQuestion[3], this.currentQuestion[4], this.currentQuestion[5]];
		this.shuffle(answers);

		this.updateQuestionUI(this.currentQuestion[1], answers);

		this.startQuestionTimer();
	};

	this.loadNextSequentialQuestion = function() {

		answers = [this.currentQuestion[2], this.currentQuestion[3], this.currentQuestion[4], this.currentQuestion[5]];
		this.shuffle(answers);

		this.updateQuestionUI(this.currentQuestion[1], answers);

		this.currentQuestion++; //increment the currentQuestion
		this.startQuestionTimer();
	};

	this.submitAnswer = function(buttonClicked) {
		this.stopQuestionTimer();

		this.generateStatement(buttonClicked);

		this.askQuestion();
	};

	this.resetGame = function(gameType) {
		this.gametype = gameType;

		this.score = 0;
		this.counter = this.quizTime;
		this.sessionid = uuid();

		this.updateResetGameUI();
		this.updateScoreUI(this.score);
		this.updateTimerUI(this.counter);

		var questionFile = '';
		switch (this.gametype) {
		case 'add':
			questionFile = 'questions/addition.xml';
			break;
		case 'sub':
			questionFile = 'questions/subtraction.xml';
			break;
		case 'mul':
			questionFile = 'questions/multiplication.xml';
			break;
		case 'div':
			questionFile = 'questions/division.xml';
			break;
		default:
			questionFile = 'questions/addition.xml';
			break;
		}
		this.loadQuestionXml(questionFile);
	};

	this.loadQuestionXml = function(questionFile) {
		var thisClass = this;
		//load the plist xml file
		$.ajax({
			type: "GET",
			url: questionFile,
			dataType: ($.browser.msie) ? "text/xml" : "xml",
			success: function(xml) {
				console.log(xml);
				thisClass.parseXml(xml);
			},
			error: function(err, e2, e3) {
				console.log(err);
				thisClass.logError(err);
			}
		});
	};

	this.startGame = function() {
		console.log('starting game');
		thisClass = this;
		this.askQuestion();
		this.updateStartGameUI();
		//now start the timer
		this.timer = window.setInterval(function() {
			thisClass.timerStep();
		},
		1000);
	};

	this.logError = function(err) {
		if(console){
			console.log('error : ' + err);
		}
	};
	
	/**
	 * Convert number of seconds into time object
	 *
	 * @param integer secs Number of seconds to convert
	 * @return object
	 */
	this.secondsToTime = function(secs)
	{
		var hours = Math.floor(secs / (60 * 60));

		var divisor_for_minutes = secs % (60 * 60);
		var minutes = Math.floor(divisor_for_minutes / 60);

		var divisor_for_seconds = divisor_for_minutes % 60;
		var seconds = Math.ceil(divisor_for_seconds);

		var obj = {
			"h": hours,
			"m": minutes,
			"s": seconds
		};
		return "PT"+hours+"H"+minutes+"M"+seconds+"S";
	};
	
this.generateStatement = function(buttonClicked) {
	if(localStorage.getItem('qtm-player-name') != null && localStorage.getItem('qtm-player-name') != '') {
				var wasCorrect = false;

		if (buttonClicked === this.currentQuestion[6]) {
			wasCorrect = true;
			this.score++;
			this.updateScoreUI(this.score);
		} else {
			wasCorrect = false;
			this.wrongQuestions.push(this.currentQuestion);
		}

		var contextObj = {
			"contextActivities":{
				"grouping":{
					"id": "http://quicktouchmath.com/game/"+this.gametype+"/",
					"definition": {
						"name": {
							"en-US": "QuickTouchMath Online"
						},
						"description": {
							"en-US": "A fun way to practice basic math."
						}
					}
				}
			},
			"extensions":{
        // "http://quicktouchmath.com/game":this.gametype,
        // "http://quicktouchmath.com/group":this.currentQuestion[0],
				"http://quicktouchmath.com/game/quick-and-hacky/": {
				  "skill": {
            "id": getSkillId(this.gametype),
            "name": this.gametype
          },
          "sessionid": this.sessionid,
          "question": wasCorrect ? "correct" : "incorrect"
				}
			}
		};

		var interaction = {
      // "id": "http://quicktouchmath.com/game/"+this.gametype+"/"+this.currentQuestion[0],
			"id": "http://quicktouchmath.com/game/",
			"definition": {
				"description": {
					"en-US": this.currentQuestion[1]
				},
				"type": "http://adlnet.gov/expapi/activities/cmi.interaction",
				"interactionType": "choice",
				"correctResponsesPattern": [this.currentQuestion[6]],
				"choices": [{
					"id": "http://quicktouchmath.com/game/"+this.gametype+"/"+this.currentQuestion[0]+'/'+this.currentQuestion[2],
					"description": {
						"en-US": this.currentQuestion[2]
					}
				},
				{
					"id": "http://quicktouchmath.com/game/"+this.gametype+"/"+this.currentQuestion[0]+'/'+this.currentQuestion[3],
					"description": {
						"en-US": this.currentQuestion[3]
					}
				},
				{
					"id": "http://quicktouchmath.com/game/"+this.gametype+"/"+this.currentQuestion[0]+'/'+this.currentQuestion[4],
					"description": {
						"en-US": this.currentQuestion[4]
					}
				},
				{
					"id": "http://quicktouchmath.com/game/"+this.gametype+"/"+this.currentQuestion[0]+'/'+this.currentQuestion[5],
					"description": {
						"en-US": this.currentQuestion[5]
					}
				}]
			,
			"objectType": "Activity"
			} 
		};

		var stmt = {
			"actor": {"name" : this.playerName,"mbox" :  "mailto:"+this.playerName+"@quicktouchmath.com" ,"objectType" : "Agent"},
			"verb": {"display":{"en-US":"answered"},"id":"http://adlnet.gov/expapi/verbs/answered"},
			"object": interaction,
			"result": {
				"success": wasCorrect,
				"response": buttonClicked,
				"duration": this.secondsToTime(this.questionTimer)
			},
			"context": contextObj
		};
		console.log(stmt);
		

		tincan = new TinCan (
                        {
                            url: window.location
                        }
                    );
                    tincan.addRecordStore(
                        {
                  // endpoint: "https://cloud.scorm.com/ScormEngineInterface/TCAPI/VK76L7KZME/",
                  // auth:     "Basic Vks3Nkw3S1pNRTo3WTFETmM1bWFwYk5wckg5aE1KQmNaNTFUbWFGSXNvY1hnUlFjREtn"                  
                  endpoint: "https://cloud.scorm.com/ScormEngineInterface/TCAPI/EGOZ6RLIC0/",
                  auth:     "Basic RUdPWjZSTElDMDp2VDVpc2dKSk9sbGZKODRNeEFOV3NYMFVYaVYxSFc1VXVia3RzeGtl"
					    }
                    );

		tincan.sendStatement(stmt, function(data) {
			console.log(data);
		});
	}
};

this.putStatement = function(statement, callback) {
	console.log(JSON.stringify(statement));
	var self = this;
	$.ajax({
		url: self.tc_lrs.endpoint+'/statements',
		type: 'POST',
		dataType: 'json',
		data: JSON.stringify(statement),
		contentType: 'application/json',
		success: function(data) {
			//console.log(data); 
			callback(data);
		},
		error: function(err) {
			console.log(err);
			alert('error:' + err.status + ' - ' + err.statusText);

		},
		beforeSend: function(xhr) {
			xhr.setRequestHeader('Authorization', self.tc_lrs.auth);
			xhr.setRequestHeader('X-Experience-API-Version', '0.95');
		}
	});
};

};