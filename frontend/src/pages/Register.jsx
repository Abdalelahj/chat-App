import React, { useState } from "react";
import { useCreateUserMutation } from "../Redux/Features/api/apiSlice";
import "../styles/register.css";
import { Link, useNavigate } from "react-router-dom";

function Register() {
    const [userInfo, setUserInfo] = useState({
        username: "",
        password: "",
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [createUser] = useCreateUserMutation();

    const handleBackToLogin = () => {

    };

    const handlesSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        // Client-side validation
        if (userInfo.username.length < 5) {
            setError("Username must be at least 5 characters");
            setIsLoading(false);
            return;
        }

        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,12}$/.test(userInfo.password)) {
            setError("Password must be 8-12 characters with uppercase, lowercase, and number");
            setIsLoading(false);
            return;
        }

        try {
            const response = await createUser(userInfo);

            if (response.data?.success) {
                setSuccess(true);
                setTimeout(() => navigate("/login"), 2000);
            } else {
                setError(response.error?.data?.message || "Registration failed");
            }
        } catch (error) {
            setError("An unexpected error occurred");
            console.error("Registration error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main>
            <form onSubmit={handlesSubmit}>
                {success ? (
                    <div className="success-container">
                        <div className="success-message">
                            Registration successful!....
                            To login 
                        </div>
                       
                    </div>
                ) : (
                    <>
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={userInfo.username}
                            onChange={(e) =>
                                setUserInfo({ ...userInfo, username: e.target.value })
                            }
                            disabled={isLoading}
                        />
                        <br />
                        <small>Username length must be at least 5 characters</small>
                        <br />
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={userInfo.password}
                            onChange={(e) =>
                                setUserInfo({ ...userInfo, password: e.target.value })
                            }
                            disabled={isLoading}
                        />
                        <br />
                        <small>
                            The password has to be: Minimum eight characters, maximum 12 characters,
                            and contain at least one uppercase letter, one lowercase letter, and one number
                        </small>
                        <br />

                        {error && <div className="error-message">{error}</div>}

                        <div className="button-group">
                            <input
                                type="submit"
                                value={isLoading ? "Processing..." : "SignUp"}
                                disabled={isLoading}
                            />
                            <div className="auth-footer">
                                <Link
                                    to="/login"
                                    className="back-to-login-link"
                                    onClick={handleBackToLogin}
                                >
                                    ← Back to Login
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </form>
        </main>
    );
}

export default Register;