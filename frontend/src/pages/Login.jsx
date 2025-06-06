import React, { useState } from 'react';
import { useLoginMutation } from '../Redux/Features/api/apiSlice';
import { useDispatch } from 'react-redux';
import { jwtDecode } from "jwt-decode";
import { LoginInto } from '../Redux/Features/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import "../styles/login.css"
function Login() {
    const [loginInfo, setLoginInfo] = useState({
        username: "",
        password: ""
    });

    const [login] = useLoginMutation();
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const handlesSubmit = async (e) => {
        e.preventDefault();
        try {
            if (loginInfo.username !== "" && loginInfo.password !== "") {
                const response = await login(loginInfo);
                const userId = jwtDecode(response.data.token).userId
                const token = response.data.token
                dispatch(LoginInto({ userId, token }))
                navigate('/chat')

            } else {
                alert("Please insert username and password");
            }
        } catch (error) {
            alert("The email doesn't exist or The password you’ve entered is incorrect");
            console.error(error);
        }
    };

    return (
        <main className="auth-container">
        <div className="auth-card">
          <form onSubmit={handlesSubmit}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              name="username"
              onChange={(e) =>
                setLoginInfo({ ...loginInfo, username: e.target.value })
              }
            />
            <br />
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              onChange={(e) =>
                setLoginInfo({ ...loginInfo, password: e.target.value })
              }
            />
            <br /><br />
            <input type="submit" value="Login" />
          </form>
      
          <div className="auth-footer">
            <Link to="/register" className="auth-link">
              Don't have an account? Register here
            </Link>
          </div>
        </div>
      </main>
    );
}

export default Login;
