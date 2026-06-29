'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, ChevronRight, RotateCcw, Trophy } from 'lucide-react'

interface Question { q: string; options: string[]; answer: number; explain?: string }
interface Quiz { questions: Question[] }
interface Props { slug: string; inline?: boolean }

export default function BlogQuiz({ slug, inline = false }: Props) {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [showResult, setShowResult] = useState(false)
  const [expanded, setExpanded] = useState(!inline)

  useEffect(() => {
    fetch(`/quizzes/${slug}.json`)
      .then(r => { if (!r.ok) throw new Error('not found'); return r.json() })
      .then(data => { setQuiz(data); setAnswers(new Array(data.questions.length).fill(null)); setLoading(false) })
      .catch(() => setLoading(false))
  }, [slug])

  if (loading || !quiz) return null

  const q = quiz.questions[current]
  const total = quiz.questions.length
  const score = answers.filter((a, i) => a === quiz.questions[i].answer).length
  const pct = Math.round((score / total) * 100)
  const grade = pct === 100 ? '🏆 Perfect!' : pct >= 75 ? '🎯 Great!' : pct >= 50 ? '📚 Keep going!' : '💡 Review & retry'

  const handleSelect = (i: number) => {
    if (selected !== null) return
    setSelected(i)
    const na = [...answers]; na[current] = i; setAnswers(na)
  }
  const handleNext = () => { if (current < total - 1) { setCurrent(c => c+1); setSelected(answers[current+1]) } else setShowResult(true) }
  const handlePrev = () => { if (current > 0) { setCurrent(c => c-1); setSelected(answers[current-1]) } }
  const handleReset = () => { setCurrent(0); setSelected(null); setAnswers(new Array(total).fill(null)); setShowResult(false) }

  if (inline) return (
    <div className="mt-3 pt-3 border-t border-[var(--border)]">
      <div className="flex items-center justify-between">
        <span className="mono text-[10px] text-[var(--accent)] tracking-widest uppercase font-semibold">Quiz · {total} question{total !== 1 ? 's' : ''}</span>
        <span className="mono text-[10px] text-[var(--muted)]">included →</span>
      </div>
    </div>
  )

  return (
    <div className="mt-16 border border-[var(--border)] rounded-2xl overflow-hidden">
      <button onClick={() => setExpanded(e => !e)} className="w-full flex items-center justify-between px-6 py-4 bg-[var(--surface)] hover:bg-[var(--surface2)] transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:'var(--accent)'}}>
            <Trophy size={15} className="text-white" />
          </div>
          <div className="text-left">
            <p className="font-bold text-[var(--text)] text-sm">Test your knowledge</p>
            <p className="mono text-[10px] text-[var(--muted)] mt-0.5">{total} question{total !== 1 ? 's' : ''} · multiple choice</p>
          </div>
        </div>
        <ChevronRight size={16} className={`text-[var(--muted)] transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {expanded && (
        <div className="border-t border-[var(--border)] bg-[var(--bg)]">
          {!showResult ? (
            <div className="px-6 py-6">
              <div className="flex items-center justify-between mb-4">
                <span className="mono text-[10px] text-[var(--muted)] tracking-widest uppercase">Question {current + 1} of {total}</span>
                <span className="mono text-[10px] text-[var(--muted)]">{answers.filter(a => a !== null).length} answered</span>
              </div>
              <div className="h-1 bg-[var(--surface2)] rounded-full mb-6 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300" style={{width:`${((current+1)/total)*100}%`,background:'var(--accent)'}} />
              </div>
              <p className="font-semibold text-[var(--text)] text-base mb-5 leading-snug">{q.q}</p>
              <div className="space-y-3 mb-6">
                {q.options.map((opt, i) => {
                  const isSelected = selected === i
                  const isCorrect = i === q.answer
                  const revealed = selected !== null
                  let cls = 'border-[var(--border)] bg-[var(--surface)] text-[var(--text)]'
                  if (revealed && isCorrect) cls = 'border-green-500 bg-green-500 text-white'
                  else if (revealed && isSelected) cls = 'border-red-500 bg-red-500 text-white'
                  else if (isSelected) cls = 'border-[var(--accent)] bg-[var(--surface)] text-[var(--text)]'
                  return (
                    <button key={i} onClick={() => handleSelect(i)} disabled={selected !== null}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200 ${cls} ${selected === null ? 'hover:border-[var(--accent)] cursor-pointer' : 'cursor-default'}`}>
                      <span className={`mono text-xs font-bold shrink-0 w-5 h-5 rounded-full flex items-center justify-center border ${revealed && (isCorrect || isSelected) ? 'border-white text-white' : 'border-[var(--border)] text-[var(--muted)]'}`}>{String.fromCharCode(65+i)}</span>
                      <span className="text-sm">{opt}</span>
                      {revealed && isCorrect && <CheckCircle size={15} className="ml-auto shrink-0 text-white" />}
                      {revealed && isSelected && !isCorrect && <XCircle size={15} className="ml-auto shrink-0 text-white" />}
                    </button>
                  )
                })}
              </div>
              {selected !== null && q.explain && (
                <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] mb-5">
                  <p className="mono text-[10px] text-[var(--accent)] tracking-widest uppercase mb-1">Explanation</p>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{q.explain}</p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <button onClick={handlePrev} disabled={current === 0} className="px-4 py-2 rounded-lg border border-[var(--border)] text-xs text-[var(--muted)] hover:border-[var(--muted)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">← Previous</button>
                <button onClick={handleNext} disabled={selected === null} className="px-5 py-2 rounded-lg text-xs font-semibold text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed" style={{background: selected !== null ? 'var(--accent)' : 'var(--border)'}}>
                  {current === total - 1 ? 'See results' : 'Next →'}
                </button>
              </div>
            </div>
          ) : (
            <div className="px-6 py-8 text-center">
              <p className="text-4xl font-black text-[var(--text)] mb-1">{score}/{total}</p>
              <p className="font-semibold text-lg mb-1" style={{color:'var(--accent)'}}>{grade}</p>
              <p className="mono text-xs text-[var(--muted)] mb-6">{pct}% correct</p>
              <div className="h-2 bg-[var(--surface2)] rounded-full mb-6 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{width:`${pct}%`,background: pct>=75?'#4ade80':pct>=50?'var(--accent)':'#f87171'}} />
              </div>
              <div className="space-y-2 mb-6 text-left">
                {quiz.questions.map((question, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)]">
                    {answers[i] === question.answer ? <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" /> : <XCircle size={14} className="text-red-400 shrink-0 mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[var(--text)] leading-snug">{question.q}</p>
                      {answers[i] !== question.answer && <p className="mono text-[10px] text-green-500 mt-0.5">✓ {question.options[question.answer]}</p>}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={handleReset} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{background:'var(--accent)'}}>
                <RotateCcw size={14} /> Try again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
