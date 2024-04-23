import React,{useState} from "react";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button,  Input, FormGroup, Form  } from "reactstrap";
import axios from "axios";
import { useNavigate } from 'react-router-dom'; 
import base_url from './../api/springapi'
import { Link } from "react-router-dom";
import './../styles/LoginPage.css' 

const Login = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
    
  const navigate = useNavigate();

  const isValidEmail = (email) => {
    // Regular expression for basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const isValidPassword = (password) => {
    // Check if password length is at least 8 characters
    return password.length >= 8;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isValidEmail(loginData.email)) {
      toast.error('Invalid email format', { position: 'top-center' });
      return;
    }
  
    if (!isValidPassword(loginData.password)) {
      toast.error('Invalid password', { position: 'top-center' });
      return;
    }  

    try {
      const response = await axios.post(`${base_url}/auth/signin`, loginData);
      if (response.status === 200) {
        localStorage.setItem('token', response.data.token);
        navigate('/note'); // Redirect to the Note page
      }} catch (error) {
        console.error('Login failed:', error);
        toast.error('Invalid Credentials. Please try again later', { position: 'top-center' });
      }};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  return (
  <div className="image">
  <div className="login-page">
    <>  
    <div className="login-form"> 
    <Form onSubmit={handleSubmit}>
      <FormGroup className="input-container">
      <h1 className="login-header">Sign in</h1>
        <Input
          className="input-field"
          type="text"
          id="email"
          name="email"
          placeholder="Username"
          value={loginData.email}
          onChange={handleChange}
          required
        />
      </FormGroup>
       <FormGroup className="input-container">
       {/* <Label for="password">Password:</Label> */}
        <Input
          className="input-field"
          type="password"
          id="password"
          name="password"
          placeholder="Password"
          value={loginData.password}
          onChange={handleChange}
          required
        />
      </FormGroup>
        <div style={{marginBottom:10}}>
        <Link className="button-signin" to="/register">Don't have an account? Sign up</Link>
        </div>
      <Button className="login-button" type="submit">LOGIN</Button>
    </Form>
    </div>  
    </>
  </div>
  </div>
  );
}

export default Login;