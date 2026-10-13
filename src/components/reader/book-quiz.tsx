"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  getBookQuizAttempt,
  saveBookQuizAttempt,
  type BookQuizAttempt,
} from "@/data/book-progress";
import { getBookQuizQuestions, type Book } from "@/data/books";
import { ActionButton } from "@/components/ui/action-button";

function normalizeAnswer(answer: string) {
  return answer
    .trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("fr");
}

function getMention(score: number) {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Très bien";
  if (score >= 60) return "Bien";
  return "À renforcer";
}

export function BookQuiz({ book }: { book: Book }) {
  const questions = getBookQuizQuestions(book);
  const [attempt, setAttempt] = useState<BookQuizAttempt | null>(null);
  const [phase, setPhase] = useState<
    "loading" | "name" | "questions" | "result" | "error"
  >("loading");
  const [nameInput, setNameInput] = useState("");
  const [selectedChoice, setSelectedChoice] = useState("");
  const [writtenAnswer, setWrittenAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      try {
        const savedAttempt = getBookQuizAttempt(book.id);
        if (savedAttempt && savedAttempt.responses.length > questions.length) {
          throw new Error("Les réponses enregistrées ne correspondent pas à ce test.");
        }
        if (
          savedAttempt?.completed &&
          savedAttempt.responses.length !== questions.length
        ) {
          throw new Error("Le résultat enregistré pour ce test est incomplet.");
        }

        setAttempt(savedAttempt);
        setNameInput(savedAttempt?.name ?? "");
        setPhase(
          savedAttempt?.completed
            ? "result"
            : savedAttempt
              ? "questions"
              : "name",
        );
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Le test enregistré n’a pas pu être chargé.",
        );
        setPhase("error");
      }
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [book.id, questions.length]);

  const currentIndex = attempt?.responses.length ?? 0;
  const question = questions[currentIndex];

  const handleStart = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = nameInput.trim();
    if (!name) {
      setError("Saisissez votre nom pour commencer le test.");
      return;
    }

    const newAttempt: BookQuizAttempt = {
      name,
      responses: [],
      completed: false,
    };

    try {
      saveBookQuizAttempt(book.id, newAttempt);
      setAttempt(newAttempt);
      setError(null);
      setPhase("questions");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Votre test n’a pas pu être enregistré.",
      );
    }
  };

  const handleContinue = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!attempt || !question) return;

    let value: string;
    let correct: boolean;

    if (question.type === "choice") {
      if (selectedChoice === "") {
        setError("Choisissez une réponse avant de continuer.");
        return;
      }
      value = selectedChoice;
      correct = Number(selectedChoice) === question.correctAnswer;
    } else {
      value = writtenAnswer.trim();
      if (!value) {
        setError("Écrivez une réponse avant de continuer.");
        return;
      }
      correct = question.acceptedAnswers.some(
        (acceptedAnswer) =>
          normalizeAnswer(acceptedAnswer) === normalizeAnswer(value),
      );
    }

    const responses = [...attempt.responses, { value, correct }];
    const nextAttempt: BookQuizAttempt = {
      ...attempt,
      responses,
      completed: responses.length === questions.length,
    };

    try {
      saveBookQuizAttempt(book.id, nextAttempt);
      setAttempt(nextAttempt);
      setSelectedChoice("");
      setWrittenAnswer("");
      setError(null);
      if (nextAttempt.completed) setPhase("result");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Votre réponse n’a pas pu être enregistrée.",
      );
    }
  };

  if (phase === "loading") {
    return <div className="quiz-panel" aria-label="Chargement du test" />;
  }

  if (phase === "error") {
    return (
      <div className="quiz-panel">
        <div className="quiz-intro-heading" role="alert">
          <span className="eyebrow">TEST INDISPONIBLE</span>
          <h2>Impossible de reprendre cette tentative.</h2>
          <p className="quiz-intro">{error}</p>
        </div>
      </div>
    );
  }

  if (phase === "name") {
    return (
      <div className="quiz-panel">
        <div className="quiz-intro-heading">
          <span className="eyebrow">AVANT DE COMMENCER</span>
          <h2>Qui passe le test&nbsp;?</h2>
          <p className="quiz-intro">
            Votre nom apparaîtra avec votre score et votre mention à la fin.
            Le test se fait en une seule tentative.
          </p>
        </div>
        <form className="quiz-name-form" onSubmit={handleStart}>
          <label htmlFor={`${book.id}-reader-name`}>Votre nom</label>
          <input
            id={`${book.id}-reader-name`}
            autoComplete="name"
            maxLength={80}
            required
            value={nameInput}
            onChange={(event) => setNameInput(event.target.value)}
            placeholder="Ex. Amadou Diallo"
          />
          {error && <p className="quiz-error" role="alert">{error}</p>}
          <ActionButton type="submit">Commencer le test</ActionButton>
        </form>
      </div>
    );
  }

  if (phase === "result" && attempt) {
    const correctCount = attempt.responses.filter((response) => response.correct).length;
    const score = Math.round((correctCount / questions.length) * 100);

    return (
      <div className="quiz-panel quiz-result">
        <div className="quiz-result-mark" aria-hidden="true">✓</div>
        <span className="eyebrow">TEST TERMINÉ</span>
        <h2>Bravo, {attempt.name}.</h2>
        <p className="quiz-intro">
          Votre résultat pour « {book.title} » est enregistré sur cet appareil.
        </p>
        <div className="quiz-score-card">
          <span>VOTRE SCORE</span>
          <strong>{correctCount} / {questions.length}</strong>
          <span>{score} % de bonnes réponses</span>
        </div>
        <p className="quiz-mention">
          Mention : <strong>{getMention(score)}</strong>
        </p>
      </div>
    );
  }

  if (!attempt || !question) return null;

  return (
    <div className="quiz-panel">
      <div className="quiz-intro-heading">
        <span className="eyebrow">QUESTION {currentIndex + 1} / {questions.length}</span>
        <h2>À vous de jouer, {attempt.name}.</h2>
        <p className="quiz-intro">
          Une fois votre réponse validée, vous ne pourrez plus la modifier ni
          revenir à cette question.
        </p>
      </div>
      <form className="quiz-answer-form" onSubmit={handleContinue}>
        {question.type === "choice" ? (
          <fieldset className="quiz-question">
            <legend>{question.question}</legend>
            {question.answers.map((answer, index) => (
              <label
                className={`quiz-answer${selectedChoice === String(index) ? " selected" : ""}`}
                key={answer}
              >
                <input
                  type="radio"
                  name={`${book.id}-question-${currentIndex}`}
                  value={index}
                  checked={selectedChoice === String(index)}
                  onChange={() => {
                    setSelectedChoice(String(index));
                    setError(null);
                  }}
                />
                <span className="answer-index">{String.fromCharCode(65 + index)}</span>
                <span>{answer}</span>
              </label>
            ))}
          </fieldset>
        ) : (
          <div className="quiz-question quiz-written-question">
            <label htmlFor={`${book.id}-written-answer`}>{question.question}</label>
            <input
              id={`${book.id}-written-answer`}
              autoComplete="off"
              value={writtenAnswer}
              onChange={(event) => {
                setWrittenAnswer(event.target.value);
                setError(null);
              }}
              placeholder={question.placeholder ?? "Votre réponse"}
            />
          </div>
        )}
        {error && <p className="quiz-error" role="alert">{error}</p>}
        <div className="quiz-actions">
          <span className="quiz-no-back">Réponse définitive après validation</span>
          <ActionButton type="submit">
            {currentIndex === questions.length - 1
              ? "Terminer le test"
              : "Valider et continuer"}
          </ActionButton>
        </div>
      </form>
    </div>
  );
}
