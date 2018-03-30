import React, { Component } from 'react';

import FindQuestions from './FindQuestions';
import QuizCarousel from './QuizCarousel';
import 'whatwg-fetch'

export default class ReviewPage extends Component {

    constructor(props) {
        super(props);
        //this.state = {
            //questions : this.props.questions,
            //indexedQuestions : this.props.indexedQuestions,
            //currentQuiz : this.props.currentQuiz
        //}
        this.finishReview = this.finishReview.bind(this);
        this.getQuestionsForReview = this.getQuestionsForReview.bind(this);
        
    };

   componentDidMount() {
  //  this.getQuestionsForReview();
   }
        
   
   // return seen questionIds sorted by 'review status'
  getQuestionsForReview() {
      console.log('getQuestionsForReview');
     this.props.getQuestionsForReview();
  };
    
    finishReview(questions,success) {
       console.log('finish review');
       this.getQuestionsForReview();
       //this.setCurrentPage('review');
       //this.props.setMessage('Review complete. You recalled '+success.length+' out of '+questions.length+' questions.'); 
       
   };
    
    render() {
        //console.log(['REVIEW',this.props.user]);
       if (this.props.user) {
            //console.log(['REVIEW USER',this.props.questions]);
            if (this.props.questions.length > 0) {
               //  console.log(['REVIEW questions']);
                return (
                <div>
                    <QuizCarousel setCurrentQuestion={this.props.setCurrentQuestion} discoverQuestions={this.props.discoverQuestions}  questions={this.props.questions} currentQuiz={this.props.currentQuiz} currentQuestion={this.props.currentQuestion} finishQuiz={this.finishReview} indexedQuestions={this.props.indexedQuestions} user={this.props.user}  progress={this.props.progress} updateProgress={this.props.updateProgress} setCurrentPage={this.props.setCurrentPage} successButton={true} setMessage={this.props.setMessage}  like={this.props.like} isLoggedIn={this.props.isLoggedIn} setCurrentQuiz={this.setCurrentQuiz} />
                </div>
                )
            } else {
                return (
                <div><b>No questions seen yet. </b><FindQuestions  discoverQuestions={this.props.discoverQuestions} setCurrentPage={this.props.setCurrentPage} /></div>
                )
            }
      } else {
        return (
            <div><b><button onClick={() => this.props.setCurrentPage('login')} className='btn btn-info'>Login</button> to track your progress</b></div>
        );
      }
    }
};
