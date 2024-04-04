import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import base_url from './../api/springapi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './../styles/SignUpPage.css';

const Register = () => {
  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    email: "",
    password: "",
    confirmPassword: "" // Ensure this matches with the state name
  });

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password) => {
    return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (signupData.firstName.trim() === '') {
        throw new Error("Please enter your first name.");
      }
      if (signupData.lastName.trim() === '') {
        throw new Error("Please enter your last name.");
      }
      if (!validateEmail(signupData.email)) {
        throw new Error("Please enter a valid email address.");
      }
      if (!validatePassword(signupData.password)) {
        throw new Error("Please enter a valid password(Minimum 8 characters with )!");
      }
      if (signupData.password !== signupData.confirmPassword) {
        throw new Error("Confirm password does not match. Please enter the same password in both fields.");
      }
      if (signupData.confirmPassword.trim() === '') {
        throw new Error("Please enter confirm password.");
      }

      const response = await axios.post(`${base_url}/auth/signup`, signupData);
      console.log(response.data);
      const token = response.data.token;
      localStorage.setItem('token', token);
      toast.success("Verification link sent. Kindly check your email!", { position: "top-center" });
    } catch (error) {
      console.error("Error:", error.message);
      toast.error(error.message, { position: 'top-center' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupData({ ...signupData, [name]: value });
  };

  const currentDate = new Date().toISOString().split('T')[0]; 

  return (
    <div className="image">
      <>
          <form className="register-form">
            <div className="input-container-register">
              <h1 className="register-header">Create Account</h1>
              <p>Enter your personal details and start journey with us</p>
              <div className="input-row">
              <div className="input-group">
  <label className="input-label">
    Name
  </label>
</div>
<div className='name'>
  <div className="input-field-wrapper">
    <input
      className="input-field-register"
      type="text"
      id="firstName"
      name="firstName"
      placeholder="First Name"
      value={signupData.firstName}
      onChange={handleChange}
      required
      autoComplete="off"
    /><div className="sub-label">Your first name</div>
  </div>
  <div className="input-field-wrapper">
    <input
      className="input-field-register"
      type="text"
      id="lastName"
      name="lastName"
      placeholder="Last Name"
      value={signupData.lastName}
      onChange={handleChange}
      required
      autoComplete="off"
    /><div className="sub-label">Your last name</div>
  </div>
</div>
<div style={{marginBottom:20}} className="input-group" >
  <div className="input-field-wrapper" style={{marginRight:117}}>
    <label className="input-label">
      Date of Birth
    </label>
    <input
    style={{width:'137%',textTransform:'uppercase',fontFamily:'calibri'}}
      className="input-field-register"
      type="date"
      id="dateOfBirth"
      name="dateOfBirth"
      placeholder="Date of Birth"
      value={signupData.dateOfBirth}
      onChange={handleChange}
      max={currentDate}
      autoComplete="off"
    /><div className="sub-label">Date</div>
  </div>
  <div className="input-field-wrapper">
    <label className="input-label">
      Email
    </label>
    <input
      className="input-field-register"
      type="email"
      id="email"
      name="email"
      placeholder="Email"
      value={signupData.email}
      onChange={handleChange}
      required
      autoComplete="off"
    /><div className="sub-label">example@gmail.com</div>
  </div>
</div>
      <label className="input-label">Password</label>
      <div className='name'>
          <div className="input-field-wrapper">
                <input
                  className="input-field-register"
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Password"
                  value={signupData.password}
                  onChange={handleChange}
                  required
                  autoComplete="off"
                /><div className="sub-label">Password</div></div>
                <div className="input-field-wrapper">
                <input
                  className="input-field-register"
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={signupData.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="off"
                /><div className="sub-label">Confirm Password</div></div></div>
              </div>
              <Link style={{ marginLeft: 150, color: "ActiveBorder",marginRight:100 }} to="/">
                Already have an account? Sign in
              </Link>
              <button className="register-button" onClick={handleSubmit} type="submit">
                SIGN UP
              </button>
            </div>
          </form>
      </>
    </div>
  );
};

export default Register;
