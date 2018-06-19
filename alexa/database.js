var ObjectId = require('mongodb').ObjectID;


let databaseFunctions = {
    nextDiscoveryQuestion: function (db,database,request,response) {
        //return new Promise(function(resolve,reject) {resolve()});
        let orderBy = request.slots['orderBy'] ? request.slots['orderBy'].value : 'successRate';
        let sortFilter={};
        let limit = 1;
        let criteria = [];
        return new Promise(function(resolve,reject) {
            databaseFunctions.getUser(db,database,request,response).then(function(user) {
                if (user) {
                    criteria.push({$or:[{access:{$eq:ObjectId(user._id)}},{access :{$eq:'public'}}]})
                    let session = request.getSession();
                    let tagFilter = ''
                    let topicFilter = ''
                    if (session.get('tagFilter')) {
                        tagFilter=session.get('tagFilter')
                    //    tagFilter = closestTag(tagFilter)[0];
                    } else if (session.get('topicFilter')){
                        topicFilter=session.get('topicFilter')
                     //   topicFilter=closestTopic(topicFilter)[0];
                    }
                    
                    if (topicFilter) {
                        //criteria.push({quiz:{$eq:topicFilter}});
                        criteria.push({quiz:new RegExp('^' + topicFilter + '$', 'i')});
                        orderBy = 'sort';
                    }
                    if (tagFilter) { 
                        let tag = String(tagFilter).trim().toLowerCase(); 
                        criteria.push({'tags': {$in:[tag]}});
                    }
                    
                   // console.log(['filter',tagFilter,topicFilter]);
                    criteria.push({discoverable :{$ne:'no'}});
                    criteria.push({ok_for_alexa :{$eq:true}});
                    sortFilter[orderBy]=-1;
                    let progressCriteria = {
                        $and:[
                            {'user': {$eq:ObjectId(user._id)}} , 
                            {seenTally: {$gt:0}}, 
                            
                    ]};
                    //progressCriteria = {'user': {$eq:user._id}};
                    //console.log([user._id,progressCriteria]);
                    db.collection('userquestionprogress').find(progressCriteria).toArray().then(function(progress) {
                        if (progress) {
                           // console.log(['progress res',progress]);
                            let notThese = [];
                            for (var seenId in progress) {
                                notThese.push(ObjectId(progress[seenId].question));
                            };
                            criteria.push({'_id': {$nin: notThese}});
                           // console.log(['disco criteria',notThese,criteria]);
                        }
                        db.collection('questions').find({$and:criteria}).sort(sortFilter).limit(limit).toArray().then(function( questions) {
                              //console.log(['user res',questions ? questions.length : 0,questions]);    
                            resolve(questions);
                        })
                    });


                } else {
                    // NO USER, SHOW BY POPULAR
                     db.collection('questions').find({$and:criteria}).limit(limit).toArray().then(function(results) {
                       //  console.log(['no user res',results ? results.length : 0]);    
                        resolve(results);
                    })
                }
            });        
        });
    },

    getReviewQuestions: function (db,database,request,response) {
         //console.log('review');
         let session = request.getSession();
                    
         let limit=3;
         let orderBy = 'timeScore'
         let orderMeBy = {};
         orderMeBy[orderBy] = 1;          
         let criteria=[];
         console.log('review');
         return new Promise(function(resolve,reject) {
            databaseFunctions.getUser(db,database,request,response).then(function(user) {
           //     console.log('review gotuser');
                if (user) {
                     //if (req.query.band && req.query.band.length > 0) {
                         //if (parseInt(req.query.band,10) > 0) {
                             //criteria.push({successTally:{$eq:parseInt(req.query.band,10)}});
                         //} else {
                             //criteria.push({$or:[{successTally:{$eq:0}},{successTally:{$exists:false}}]});
                         //}
                         
                     //} 
                    let tagFilter = ''
                    let topicFilter = ''
            
                    if (session.get('reviewTagFilter')) {
                        tagFilter=session.get('reviewTagFilter')
                    } else if (session.get('reviewTopicFilter')){
                        topicFilter=session.get('reviewTopicFilter')
                    }
                    //console.log(['filter',tagFilter,topicFilter]);
                    if (topicFilter) {
                        criteria.push({topic:new RegExp('^' + topicFilter + '$', 'i')});
                        orderBy = 'sort';
                    } 
                    if (tagFilter) { 
                        let tag = tagFilter.trim().toLowerCase(); 
                        criteria.push({'tags': {$in:[tag]}});
                    }
                    console.log(['filter',tagFilter,topicFilter]);
                    
                    if (!tagFilter && !topicFilter) { 
                        let oneHourBack = new Date().getTime() - 1800000;
                        criteria.push({$or:[{seen:{$lt:oneHourBack}},{seenTally:{$not:{$gt:1}}}]});    
                    }
                 
                    criteria.push({$or:[{block :{$lte:0}},{block :{$exists:false}}]});
                    if (user && String(user._id).length > 0) {
                         criteria.push({user:ObjectId(user._id)});
                        // sort by successTally and then most recently seen first
                     //    console.log(JSON.stringify(criteria));
                        db.collection('userquestionprogress').find({$and:criteria}).sort({'successTally':1,'seen':1}).limit(limit).toArray().then(function(questions,error) {
                            if (questions) {
                               // console.log(questions);
                                let questionKeys = [];
                                let indexedQuestions = {};
                                let successAndDateKeyed={};
                                let successKeys=[];
                                let successDateKeys={};
                                //let i = 0;
                                questions.forEach(function(question) {
                                    successTally = parseInt(question.successTally,10) > 0 ? parseInt(question.successTally,10) : 0;
                                    if (!successAndDateKeyed.hasOwnProperty(successTally)) {
                                        successAndDateKeyed[successTally]={};
                                        successKeys.push(successTally);
                                    };
                                    let d = new Date(question.seen);
                                    let dateKey=d.getDate()+' '+d.getMonth()+' '+d.getFullYear();
                                    if (!successAndDateKeyed[successTally].hasOwnProperty(dateKey)) {
                                        successAndDateKeyed[successTally][dateKey]=[];
                                        if (!successDateKeys.hasOwnProperty(successTally)) {
                                            successDateKeys[successTally] = [];
                                        }
                                        successDateKeys[successTally].push(dateKey);
                                    };
                                    successAndDateKeyed[successTally][dateKey].push(question);
                                //    questionIds.push(question.questionId);
                                    questionKeys.push(ObjectId(question.question));
                                //    indexedQuestions[question.questionId] = i;
                                //    i++;
                                });
                                let successAndDateOrderedIds=[];
                                successKeys.forEach(function(successTally) {
                                    successDateKeys[successTally].forEach(function(day) {
                                        let shuffleGroup = successAndDateKeyed[successTally][day];
                                        shuffleGroup.sort(function() {
                                          return .5 - Math.random();
                                        });
                                        shuffleGroup.forEach(function(question) {
                                            successAndDateOrderedIds.push(ObjectId(question.question));
                                        });
                                    }); 
                                });
                              //  console.log(['REVItEW',successAndDateOrderedIds]);
                                db.collection('questions').find({_id:{$in:successAndDateOrderedIds}}).limit(limit).toArray(function(err,results) {
                                   // console.log([err,results]);
                                    let questionIndex={};
                                    results.forEach(function(question) {
                                        questionIndex[question._id]=question;
                                        //console.log(question._id);
                                    });
                                    let orderedResults=[];
                                    successAndDateOrderedIds.forEach(function(question) {
                                        if (questionIndex[question]) {
                                            orderedResults.push(questionIndex[question]);   
                                        }
                                    });
                                  //  console.log(['RESOLVE',orderedResults[0]]);
                                    resolve(orderedResults);
                                })
                            } else {
                                resolve(null);
                            }
                        });
                    } else {
                        resolve(null);
                    }

                }
            });
        });
    },

    logStatus: function (db,database,type,question,request,response) {
        return databaseFunctions.getUser(db,database,request,response).then(function(user) {
            if (user && (type==="seen" || type==="successes")) {
                let ts = new Date().getTime();
                db.collection(type).insert({user:ObjectId(user._id),question:ObjectId(question),timestamp:ts}).then(function(inserted) {
                    console.log(['LOG '+type]);
                    // collate tally of all seen, calculate success percentage to successScore
                    databaseFunctions.updateQuestionTallies(db,database,user._id,question,(type==="successes"));
                    //res.send('inserted');
                }).catch(function(e) {
                   console.log(e);
                });            
            }
        });
    },

    getUser: function(db,database,request,response) {
        let accessToken = request.getSession().details.user ? request.getSession().details.user.accessToken : '';
       // console.log('get user',accessToken,request.getSession());
        return new Promise(function(resolve,reject) {
            if (accessToken) {
                
                database.OAuthAccessToken.findOne({accessToken:accessToken})
                .then(function(token)  {
         //           console.log(['found token',token]);
                    if (token != null) {
                        return database.User.findOne({ _id:ObjectId(token.user)}).then(function(user) {
           //                 console.log(['resolve user',user]);
                            resolve(user);
                        })
                    }
                    resolve(null);
                });  
            } else {
                resolve(null);
            }
        })
    },
    
    blockQuestion: function(db,database,user,question,topic) {
        console.log(['block',user,question,topic]);
        db.collection('userquestionprogress').findOne({$and:[{'user': {$eq:ObjectId(user)}},{question:{$eq:ObjectId(question)}} ]}).then(function(progress) {
                if (progress) {
                    // OK
                    progress.block = 1; //new Date().getTime();
                    progress.topic = topic;
                    db.collection('userquestionprogress').update({_id:progress._id},progress).then(function() {
                      //  console.log(['update',progress]);
                
                    });
                    
                } else {
                      progress = {'user':ObjectId(user),question:ObjectId(question)};
                      progress.block = 1; //new Date().getTime();
                      progress.topic = topic;
                      db.collection('userquestionprogress').save(progress).then(function() {
                        //  console.log(['insert',progress]);
                
                    });
                } 
            })
    },
    
    // UPDATE PROGRESS
    // update question stats into the questions collection
    updateQuestionTallies: function(db,database,user,question,tallySuccess=false) {
        
        db.collection('questions').findOne({_id:ObjectId(question)}).then(function(result) {
                if (result && result._id) {
                    let data={};
                    if (!tallySuccess) {
                        data.seenTally = result.seenTally ? parseInt(result.seenTally,10) + 1 : 1;
                    } else {
                        let successTally = result.successTally ? parseInt(result.successTally,10) + 1 : 1;
                        data.successTally = successTally;
                        data.successRate = data.seenTally > 0 ? successTally/data.seenTally : 0;                    
                    }
                    db.collection('questions').update({_id: ObjectId(question)},{$set:data}).then(function(qres) {
                       // console.log(['saved question',qres]);
                    });
                    databaseFunctions.updateUserQuestionProgress(db,database,user,question,result.quiz,result.tags,tallySuccess);
                }
        }).catch(function(e) {
            console.log(['update q err',e]);
        });
         

    },

    // update per user progress stats into the userquestionprogress collection
    updateUserQuestionProgress: function (db,database,user,question,quiz,tags,tallySuccess) {
        //console.log('UUQP');
        db.collection('userquestionprogress').findOne({$and:[{'user': {$eq:ObjectId(user)}},{question:ObjectId(question)} , {block:{ $not: { $gt: 0 } }}]}).then(function(progress) {
            if (!progress) progress = {user:ObjectId(user),question:ObjectId(question)};
            progress.topic=quiz;
            progress.tags=tags;
            if (!tallySuccess) {
                progress.seenTally = progress.seenTally ? parseInt(progress.seenTally,10) + 1 : 1;
                progress.seen = new Date().getTime();
            } else {
                progress.successTally = progress.successTally ? parseInt(progress.successTally,10) + 1 : 1;
                progress.success = progress.seen;
                progress.successRate = (parseInt(progress.successTally,10) > 0 && parseInt(progress.seenTally,10) > 0) ? progress.successTally/progress.seenTally : 0;
            }
                
            progress.block=0;
            db.collection('userquestionprogress').save(progress).then(function() {
                //console.log('UUQP SAVED');
            
            });
        
      }).catch(function(e) {
          console.log(['err',e]);
      });
        
    }
}
module.exports=databaseFunctions 