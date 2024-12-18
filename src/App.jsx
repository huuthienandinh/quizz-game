
import './App.css'
import React from 'react'
import QandA from './QandA'
import {nanoid} from 'nanoid'
import {decode} from 'html-entities'


function App() {


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
    const newQuestions = questions.map((question, qId) => {
      if (qId === questionId) {
        return {
          ...question,
          all_answers: question.all_answers.map((answer, aId) => {
            // Trường hợp 1: Chưa click gì, chỉ thay đổi style của answer được click
            if (!question.isClick && aId === answerId) {
              return {
                ...answer,
                style: true, // Đổi style của answer được click
              };
            }
    
            // Trường hợp 2: Đã click, chỉ reset style của answer đã được click
            if (question.isClick && question.clickedAnswer === aId) {
              return {
                ...answer,
                style: false, // Trả lại trạng thái ban đầu
              };
            }
    
            // Các answer khác không thay đổi
            return answer;
          }),
          // Cập nhật trạng thái click
          isClick: question.isClick ? false : true,
          clickedAnswer: question.isClick ? null : answerId, // Lưu hoặc reset answer đã click
        };
      }
    
      return question; // Câu hỏi khác không thay đổi
    });


    setQuestions(newQuestions)
    console.log(newQuestions)

  }


  function startGame(){
    const newQuestions = getAllQuestions(dataQuizz)
    setQuestions(newQuestions) 
  }



  const QuestionElement = questions.map((question, questionId) =>

    <div key={questionId} >

        <h2 className='textQuestion'>
          {questionId + 1}. {decode(question.question)} (<span style={{ textDecoration: 'underline' }}>{question.type}</span>)
        </h2>

        {question.all_answers.map((answer, answerId) =>
            <button onClick={()=>changestyle(questionId, answerId)} className={answer.style === false ? 'boxAnswers' : 'boxAnswersClicked'} key={answer.answer}> 
              {decode(answer.answer)} 
            </button>)}

    </div>)

  return (
    <main>    
      <div className='container'>   
        <button  onClick={startGame}> Start Game</button>
        {QuestionElement}
      </div> 
    </main>
     
  )
}

export default App
