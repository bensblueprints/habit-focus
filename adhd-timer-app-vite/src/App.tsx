import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [time, setTime] = useState(25 * 60) // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    let interval: number | undefined

    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval)
            setIsActive(false)
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    } else {
      clearInterval(interval)
    }

    return () => clearInterval(interval)
  }, [isActive, isPaused])

  const handleStart = () => {
    setIsActive(true)
    setIsPaused(false)
  }

  const handlePause = () => {
    setIsPaused(true)
  }

  const handleResume = () => {
    setIsPaused(false)
  }

  const handleReset = () => {
    setIsActive(false)
    setIsPaused(false)
    setTime(25 * 60)
  }

  const formatTime = () => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="app-container">
      <h1>ADHD Timer</h1>
      <div className="timer">{formatTime()}</div>
      <div className="controls">
        {!isActive && !isPaused ? (
          <button onClick={handleStart}>Start</button>
        ) : isPaused ? (
          <button onClick={handleResume}>Resume</button>
        ) : (
          <button onClick={handlePause}>Pause</button>
        )}
        <button onClick={handleReset} disabled={!isActive && !isPaused}>
          Reset
        </button>
      </div>
    </div>
  )
}

export default App
