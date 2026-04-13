import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  

  return (
    <div className="page">

      <div className='main-container'>

        <div className='card'>
        

          <div className='nav-bar'>
            <button className='nav-btn'>Home</button>
            <button className='nav-btn'>Progress</button>
            <button className='nav-btn'>About</button>
            <button className='nav-btn'>Login</button>

          </div>

          <div className='hero-content'>
            <span className="badge">New • A calmer way to build habits</span>

            <h1 className='nav-title'>HABIT TRACKER</h1>
            <h2 className='nav-subtitle'>Track your habits and achieve your goals</h2>

            <div className="cta">
              <button className="btn primary">Start Your Journey</button>
              <button className="btn secondary">View Dashboard</button>
            </div>

          </div>

        </div>

      </div>

      <div className="fade-section">
        <div className="about">
          <h2>How it works</h2>
          <p>
          Build habits with small consistent steps. Track progress, stay motivated,
          and improve daily with a simple system designed for real growth.
          </p>
        </div>
      </div>

      <div className="footer">
        <p>© 2026 Habit Tracker</p>
        <div className="footer-nav">
          <span>Home</span>
          <span>About</span>
          <span>Contact</span>
        </div>
      </div>


    </div>
  )
}

export default App
