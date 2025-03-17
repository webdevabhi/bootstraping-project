import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import apiService from '../../../services/apiService';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await apiService.post('/auth/login', { email, password });
    console.log('Login successful:', response);
  };

  return (
    <div className="flex align-items-center justify-content-center min-h-screen">
      <div className="w-full max-w-30rem px-3">
        <Card className="shadow-1">
          <h2 className="text-900 text-2xl font-medium text-center mb-4">Sign in to your account</h2>
          <form onSubmit={handleSubmit} className="flex flex-column gap-3">
            <div className="flex flex-column gap-2">
              <label htmlFor="email" className="text-700">Email address</label>
              <InputText
                data-testid='email'
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                required
              />
            </div>
            <div className="flex flex-column gap-2">
              <label htmlFor="password" className="text-700">Password</label>
              <span className="p-input-icon-right w-full">
                <InputText
                  data-testid='password'
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                  required
                />
                <button 
                  type="button"
                  className={`pi ${showPassword ? 'pi-eye' : 'pi-eye-slash'} cursor-pointer absolute border-none bg-transparent`}
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                />
              </span>
            </div>
            <Button
              type="submit"
              label="Sign in"
              className="w-full mt-2"
              style={{ background: '#6366f1' }}
            />
            <div className="text-center text-600 text-sm">
              Don't have an account? <Link to="/register" className="text-primary no-underline hover:underline">Register</Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default Login; 