import React, { useState } from 'react'
import './CSS/LoginSignup.css'

const LoginSignup = () => {

  const [state, setState] = useState("Login")

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  })

  const changeHandler = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const login = async () => {
      console.log("Login Function Executed", formData)

      const response = await fetch('https://e-commerce-0112.onrender.com/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const responseData = await response.json()
      console.log("login API Response:", responseData)

      if (responseData.success) {
        localStorage.setItem('auth-token', responseData.token)
        window.location.replace("/")
      } else {
        // ✅ FIX HERE (no name change)
        alert(responseData.errors)
      }
  }

  const signup = async () => {
    
      console.log("Signup Function Executed", formData)

      const response = await fetch('https://e-commerce-0112.onrender.com/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const responseData = await response.json()
      console.log("Signup API Response:", responseData)

      if (responseData.success) {
        localStorage.setItem('auth-token', responseData.token)
        window.location.replace("/")
      } else {
        // ✅ FIX HERE (no name change)
        alert(responseData.errors)
      }

   
  }

  return (
    <div className='loginsignup'>
      <div className="loginsignup-container">

        <h1>{state}</h1>

        <div className="loginsignup-fields">
          {state === "Sign Up" && (
            <input
              name='username'
              value={formData.username}
              onChange={changeHandler}
              type="text"
              placeholder='Your Name'
            />
          )}

          <input
            name='email'
            value={formData.email}
            onChange={changeHandler}
            type="email"
            placeholder='Email Address'
          />

          <input
            name='password'
            value={formData.password}
            onChange={changeHandler}
            type="password"
            placeholder='Password'
          />
        </div>

        <button onClick={() => state === "Login" ? login() : signup()}>
          Continue
        </button>

        {state === "Sign Up" ? (
          <p className='loginsignup-login'>
            Already have an account?
            <span
              style={{ cursor: 'pointer', color: 'blue' }}
              onClick={() => setState("Login")}
            >
              {" "}Login here
            </span>
          </p>
        ) : (
          <p className='loginsignup-login'>
            Create an account?
            <span
              style={{ cursor: 'pointer', color: 'blue' }}
              onClick={() => setState("Sign Up")}
            >
              {" "}Click here
            </span>
          </p>
        )}

        <div className="loginsignup-agree">
          <input type="checkbox" />
          <p>By continuing, I agree to the terms of use & privacy policy</p>
        </div>

      </div>
    </div>
  )
}

export default LoginSignup
