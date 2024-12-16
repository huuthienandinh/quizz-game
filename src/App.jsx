
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
            style: true,
            on: true,
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
    }
    })

    console.log(mixAnswers)
    return mixAnswers

  }


  function changestyle(id){
    const newQuestions = questions.map(question => { 
      return {
        ...question,
        all_answers: question.all_answers.map(answ => {
          return answ.answer === id ? {
            ...answ,
            style: !answ.style,
          }: answ
        })
      }
    })
    setQuestions(newQuestions)
    console.log(newQuestions)

  }


  function startGame(){
    const newQuestions = getAllQuestions(dataQuizz)
    setQuestions(newQuestions) 
  }



  const QuestionElement = questions.map(question =>

    <div key={question}>
        <h2>{decode(question.question)}</h2>
        {question.all_answers.map(answ =>
            <button onClick={()=>changestyle(answ.answer)} className={answ.style === true ? 'boxAnswers' : 'boxAnswersClicked'} key={answ.answer} >{decode(answ.answer)}</button>)}

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
