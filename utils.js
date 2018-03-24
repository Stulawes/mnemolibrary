const mustache = require('mustache');
const nodemailer = require('nodemailer');
const template= require('./template');
const config=require('./config');


module.exports = {
  sendMail : function(from,to,subject,html) {
    var transporter = nodemailer.createTransport(config.transport);

    var mailOptions = {
      from: from,
      to: to,
      subject: subject,
      html: html
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        res.send('FAIL');
      } else {
        console.log('Email sent: ' + info.response);
        res.send('OK');
      }
    });

},
   renderLogin: function renderLogin(req,vars) {
        let templateVars = Object.assign({},req.body);
        templateVars = Object.assign(templateVars,vars);
        templateVars.clientId = config.clientId;
        templateVars.clientSecret = config.clientSecret;
        //templateVars.successUrl = config.successUrl;
        
        return mustache.render(template.login,templateVars);
    },
    
    sendTemplate: function sendTemplate(req,res,vars) {
        let templateVars = Object.assign({},req.query);
        templateVars = Object.assign(templateVars,vars);
        res.send(mustache.render(template.layout,templateVars));    
    },
    
    createIndexes: function (json) {
        var quizzes = {};
        var tags = {};
        var relatedTags = {};
        var tagTopics = {};
        var topicTags = {};
        // collate quizzes and tags
        let indexedQuestions= {};
        for (var questionKey in json['questions']) {
            const question = json['questions'][questionKey]
            var id = question.ID
            var tagList = question.tags.split(',')
            var quiz = question.quiz;
            if (! (Array.isArray(quizzes[quiz]))) {
                quizzes[quiz] = []
            }
            quizzes[quiz].push(id);
        
            for (var tagKey in tagList) {
                
                var tag = tagList[tagKey].trim().toLowerCase();
                if (tag.length > 0) {
                    if (! (Array.isArray(tags[tag]))) {
                        tags[tag] = []
                    }
                    if (! (Array.isArray(relatedTags[tag]))) {
                        relatedTags[tag] = {}
                    }
                    if (!(Array.isArray(tagTopics[tag]))) {
                        tagTopics[tag] = []
                    }
                    if (! (Array.isArray(topicTags[quiz]))) {
                        topicTags[quiz] = []
                    }
                    tags[tag].push(id);
                    if (!tagTopics[tag].includes(quiz)) {
                        tagTopics[tag].push(quiz)
                    }
                    if (!topicTags[quiz].includes(tag)) {
                        topicTags[quiz].push(tag)
                    }
                    tagList.forEach(function(relatedTag) {
                        if (relatedTag !== tag) {
                            relatedTags[tag][relatedTag]=true;
                        }
                    });
                    
                }
                
            }
            indexedQuestions[id]=questionKey;
        }
        let words = [];
        for (let tag in tags) {
            words.push({text:tag, value: tags[tag].length});
        }
        return {'questions':json['questions'], 'indexedQuestions':indexedQuestions,'topics':quizzes,'words':words,'tags':tags,'relatedTags':relatedTags,'topicTags':topicTags,'tagTopics':tagTopics};
  }

}
