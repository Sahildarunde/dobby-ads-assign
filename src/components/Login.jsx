import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const Login = ({ toggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Both fields are required');
      return;
    }
    setError('');
    try {
      const resultAction = await dispatch(login({ email, password }));

      if (login.fulfilled.match(resultAction)) {
        navigate('/dashboard');
      } else {
        setError('Incorrect email or password! Please try again.');
      }
    } catch (error) {
      setError('Unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="flex justify-center min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-8 sm:p-10 md:p-12 lg:p-16 rounded-lg shadow-lg w-full max-w-sm sm:max-w-md lg:max-w-lg">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-700">Login</h2>
        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-6">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleLogin}
          className="w-full p-3 sm:p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          Login
        </button>
        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
        <div className="mt-4 text-center">
          <button
            onClick={toggleForm}
            className="text-blue-500 hover:underline"
          >
            Don't have an account? Signup
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
