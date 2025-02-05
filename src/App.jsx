
import './App.css'
import React from 'react'
import QandA from './QandA'
import {nanoid} from 'nanoid'
import {decode} from 'html-entities'
import Swal from 'sweetalert2'

function App() {

  let countPoint = 1;
  // mot lan clicked la luu lai gia tri do, xong se check vs dap an tai do
  const [dataQuizz, setDataQuizz] = React.useState([])
  const [questions, setQuestions] =React.useState([])

  const [answers, setAnswers] = React.useState(
    [{
    questions:"",
    correct_answer:"",
    all_answers:[],
  }])


  React.useEffect(() => {
    fetch("https://opentdb.com/api.php?amount=10")
    .then(res => res.json())
    .then(data => setDataQuizz(data.results))   

  },[])

  function getAllQuestions(array) {
     const mixAnswers = array.map(array => { 
      const {correct_answer, incorrect_answers} = array;   
      const all_answers = [...incorrect_answers, correct_answer]
      const randomAnswer = all_answers.slice().sort(() => Math.random() - 0.5)
      console.log(randomAnswer)
      const all_answers_on = randomAnswer.map(answer =>{
          return{
            answer: answer,
            style: false,
          }
      })
      const indexCorrectAnswer = randomAnswer.findIndex(answer => answer == correct_answer)

      console.log(correct_answer)

      console.log(all_answers_on)

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


  function changestyle(questionId, answerId){
    const newQuestions = questions.map((question, qId) => 
    qId === questionId
      ? {
          ...question,
          all_answers: question.all_answers.map((answer, aId) => ({
            ...answer,
            style: !question.isClick && aId === answerId // Đổi style nếu chưa click
              ? true
              : question.isClick && question.clickedAnswer === aId // Reset nếu click lại
              ? false
              : answer.style, // Giữ nguyên style
          })),
          isClick: !question.isClick, // Đổi trạng thái câu hỏi
          clickedAnswer: question.isClick ? null : answerId, // Cập nhật answer đã click
        }
      : question // Các câu hỏi khác giữ nguyên
  );

    setQuestions(newQuestions)
    console.log(newQuestions)

  }



  function countPointFn(questionId) {
    const newQuestions = questions.map((question, qId) => {

        if (question.isClick) {
          countPoint++; 
        }
        return {
          ...question, 
        };
    });
    console.log(countPoint)
    
  }


  const handleClick = () => {
    Swal.fire("you got 3 answers right");

  }


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
            <button onClick={()=>{changestyle(questionId, answerId); countPointFn(questionId)}} className={answer.style === false ? 'boxAnswers' : 'boxAnswersClicked'} key={answer.answer}> 
              {decode(answer.answer)} 
            </button>)}

    </div>)



  return (
    <main>    
      <div className='container'>   
        <button  onClick={startGame}> Start Game</button>
        {QuestionElement}
        <button onClick={handleClick} className='buttonAnswer'> Check answer </button>
      </div> 
    </main>
     
  )
}

export default App
