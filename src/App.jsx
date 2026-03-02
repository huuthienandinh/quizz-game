
import './App.css';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { decode } from 'html-entities';
import Swal from 'sweetalert2';
import confetti from 'canvas-confetti';

function shuffle(array) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function AnswerButton({ answer, selected, onClick }) {
  const className = selected ? 'boxAnswersClicked' : 'boxAnswers';
  return (
    <button className={className} onClick={onClick} key={answer}>
      {decode(answer)}
    </button>
  );
}

function Question({ question, qIndex, onAnswer }) {
  const getDifficultyClass = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'difficultyEasy';
      case 'medium':
        return 'difficultyMedium';
      case 'hard':
        return 'difficultyHard';
      default:
        return '';
    }
  };

  return (
    <div>
      <h2 className="textQuestion">
        {qIndex + 1}. {decode(question.question)} (
        <span className={getDifficultyClass(question.difficulty)}>
          {question.difficulty}
        </span>
        )
      </h2>
      {question.allAnswers.map((ans, aIndex) => (
        <AnswerButton
          key={ans.answer}
          answer={ans.answer}
          selected={ans.selected}
          onClick={() => onAnswer(qIndex, aIndex)}
        />
      ))}
    </div>
  );
}

export default function App() {
  const [rawData, setRawData] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchQuizData() {
      setLoading(true);
      try {
        const res = await fetch('https://opentdb.com/api.php?amount=10');
        if (!res.ok) throw new Error(res.statusText);
        const json = await res.json();
        setRawData(json.results || []);
      } catch (err) {
        console.error(err);
        setError('Unable to load questions');
      } finally {
        setLoading(false);
      }
    }
    fetchQuizData();
  }, []);

  const initialiseQuestions = useCallback(
    (data) =>
      data.map((item) => {
        const allAnswers = shuffle([
          ...item.incorrect_answers,
          item.correct_answer,
        ]).map((ans) => ({ answer: ans, selected: false }));

        return {
          ...item,
          allAnswers,
          isAnswered: false,
        };
      }),
    []
  );

  const startGame = useCallback(() => {
    setQuestions(initialiseQuestions(rawData));
  }, [initialiseQuestions, rawData]);

  const handleAnswer = useCallback((qIdx, aIdx) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? {
              ...q,
              isAnswered: true,
              allAnswers: q.allAnswers.map((ans, j) => ({
                ...ans,
                selected: j === aIdx,
              })),
            }
          : q
      )
    );
  }, []);

  const answersDone = useMemo(
    () => questions.filter((q) => q.isAnswered).length,
    [questions]
  );

  const calculateScore = useCallback(() => {
    const score = questions.reduce(
      (sum, q) =>
        sum +
        (q.allAnswers.some(
          (a) => a.selected && a.answer === q.correct_answer
        )
          ? 1
          : 0),
      0
    );
    // burst confetti before showing alert
    confetti({
      particleCount: 200,
      spread: 160,
      origin: { y: 0.6 },
    });

    Swal.fire({
      title: `You got ${score} answers right`,
      icon: 'success',
      confirmButtonText: 'Play again',
    }).then((result) => {
      if (result.isConfirmed) {
        startGame();
      }
    });
  }, [questions, startGame]);

  const questionElements = useMemo(
    () =>
      questions.map((q, idx) => (
        <Question
          key={idx}
          question={q}
          qIndex={idx}
          onAnswer={handleAnswer}
        />
      )),
    [questions, handleAnswer]
  );

  return (
    <main>
      <div className="container">
        <div className="row">
          <button className="startGameBtn" onClick={startGame} disabled={loading || !rawData.length}>
            Start Game
          </button>
        </div>
        <div className="answerCounterContainer">
          <div className="answerCounter">Answers done: {answersDone}/10</div>
        </div>

        {error && <div className="error">{error}</div>}
        {loading && <div>Loading questions…</div>}

        {questionElements}

        {answersDone === 10 && (
          <button onClick={calculateScore} className="checkAnswerBtn">
            Check answer
          </button>
        )}
      </div>
    </main>
  );
}
