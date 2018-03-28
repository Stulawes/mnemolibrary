import React, { Component } from 'react';

export default class QuizQuestionList extends Component {
    render() {
        if (Array.isArray(this.props.questions)) {
            let questions = this.props.questions.map((question, key) => {
              return <div className='list-group-item' key={question._id} >
              <a onClick={() => this.props.setQuiz(question)}  href="#"   >{question.interogative}&nbsp;{question.prefix}&nbsp;{question.question}&nbsp;{question.postfix}</a>
              
              </div>
              
            })
            return (
              <div className="quiz-questions list-group">
                  {
                    questions
                  }
                
              </div>
            )
        } else {
            return null
        }
        
        
    };
}
