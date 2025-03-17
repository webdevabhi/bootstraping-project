import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import apiService from '../../../services/apiService';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await apiService.post('/auth/register', { ...formData, role: 'app_client' });
    console.log('Registration successful:', response);
  };

  return (
    <div className="flex align-items-center justify-content-center min-h-screen">
      <div className="w-full max-w-30rem px-3">
        <Card className="shadow-1">
          <h2 className="text-900 text-2xl font-medium text-center mb-4">Create your account</h2>
          <form onSubmit={handleSubmit} className="flex flex-column gap-3">
            <div className="flex flex-column gap-2">
              <label htmlFor="name" className="text-700">Full Name</label>
              <InputText
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full"
                required
              />
            </div>
            <div className="flex flex-column gap-2">
              <label htmlFor="email" className="text-700">Email address</label>
              <InputText
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full"
                required
              />
            </div>
            <div className="flex flex-column gap-2">
              <label htmlFor="password" className="text-700">Password</label>
              <span className="p-input-icon-right w-full">
                <InputText
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
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
            <div className="flex flex-column gap-2">
              <label htmlFor="confirmPassword" className="text-700">Confirm Password</label>
              <span className="p-input-icon-right w-full">
                <InputText
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full"
                  required
                />
                <button 
                  type="button"
                  className={`pi ${showConfirmPassword ? 'pi-eye' : 'pi-eye-slash'} cursor-pointer absolute border-none bg-transparent`}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                />
              </span>
            </div>
            <Button
              type="submit"
              label="Create Account"
              className="w-full mt-2"
              style={{ background: '#6366f1' }}
            />
            <div className="text-center text-600 text-sm">
              Already have an account? <Link to="/login" className="text-primary no-underline hover:underline">Sign in</Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default Register; 