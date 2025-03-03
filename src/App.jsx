
import './App.css'
import React from 'react'
import {decode} from 'html-entities'
import Swal from 'sweetalert2'

function App() {

  const [dataQuizz, setDataQuizz] = React.useState([])
  const [questions, setQuestions] =React.useState([])
  const [point, setPoint] = React.useState(0)
  const [clickedAnswer, setclickedAnswer] = React.useState(0)


  React.useEffect(() => {
    fetch("https://opentdb.com/api.php?amount=10")
    .then(res => res.json())
    .then(data => {
      if (data.results){
        setDataQuizz(data.results)
      }
      else{
        console.error(" Invalid data format!", data)
      }
    })   
    .catch(error => console.error("Failed to fetch data!", error))

  },[])

  function getAllQuestions(array) {
     const mixAnswers = array.map(array => {                                                  ///mix and random answers
      const {correct_answer, incorrect_answers} = array;                                  
      const all_answers = [...incorrect_answers, correct_answer]
      const randomAnswer = all_answers.slice().sort(() => Math.random() - 0.5)
      console.log(randomAnswer)
      const all_answers_on = randomAnswer.map(answer =>{                                       /// Add style for all answers
          return{
            answer: answer,
            style: false,
          }
      })
    return{
      ...array,
      correct_answer: correct_answer,
      incorrect_answers: incorrect_answers,
      all_answers: all_answers_on,
      isClick: false,
    }
    })

    console.log(mixAnswers)
    return mixAnswers

  }

  function checkAnswer() {
    const newPoints = questions.reduce((count, question) => {
        if (question.all_answers.some(answer => answer.style === true && answer.answer === question.correct_answer)) {
            return count + 1;
        } 
        return count;
    }, 0);

    setPoint(newPoints); 
    Swal.fire("You got " + newPoints + " answers right");
}


  function changeStyle(questionId, answerId) {
    setQuestions(prevQuestions =>
      prevQuestions.map((question, qId) =>
        qId === questionId
          ? {
              ...question,
              all_answers: question.all_answers.map((answer, aId) => ({
                ...answer,
                style: aId === answerId, // Only change style if answer is chosen from user
              })),
              isClick: true, // Question is clicked by user
              clickedAnswer: answerId,
            }
          : question
      )
    );
  }

    React.useEffect(() => {
      const clickedAnswer = questions.filter(question => question.isClick).length;
      setclickedAnswer(clickedAnswer)
    }, [questions]);


  function startGame(){
    const newQuestions = getAllQuestions(dataQuizz)
    setQuestions(newQuestions) 
  }



  const QuestionElement = questions.map((question, questionId) =>

    <div key={questionId} >

        <h2 className='textQuestion'>
          {questionId + 1}. {decode(question.question)} ( <span style={{ textDecoration: 'underline' }}>{question.difficulty}</span>)
        </h2>

        {question.all_answers.map((answer, answerId) =>
            <button onClick={()=>changeStyle(questionId, answerId)} className={answer.style === false ? 'boxAnswers' : 'boxAnswersClicked'} key={answer.answer}> 
              {decode(answer.answer)} 
            </button>)}

    </div>)


  return (
      <main>    
        <div className='container'>   
          <div className='row'>
            <button  onClick={startGame}> Start Game</button>
            <div> Answers done: {clickedAnswer}</div> 
          </div>
          {QuestionElement}
          {clickedAnswer === 10 && <button onClick={checkAnswer} className='buttonAnswer'> Check answer </button>}
      
        </div> 
      </main>
     
  )
}

export default App
