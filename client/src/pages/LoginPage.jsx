import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, GraduationCap, AlertCircle, Sparkles } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please fill in both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setFormError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Demo account quick filler
  const fillDemoStudent = () => {
    setEmail('rahul.verma@testcollege.edu');
    setPassword('password123');
    setFormError('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-500 text-white items-center justify-center shadow-lg shadow-brand-500/25 mb-2">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome back
          </h2>
          <p className="text-sm text-slate-500">
            Log in to manage your campus equipment borrows & listings
          </p>
        </div>

        {/* Error Alert */}
        {formError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" />
            <span className="font-medium">{formError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Campus Email"
            id="email"
            type="email"
            placeholder="student@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={Lock}
            required
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full justify-center text-base"
          >
            Sign In to CampusGeeks
          </Button>

          {/* Quick Demo Credentials Helper */}
          <div className="pt-2">
            <button
              type="button"
              onClick={fillDemoStudent}
              className="w-full py-2 px-3 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl border border-brand-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              1-Click Demo Login (Rahul - CS Dept)
            </button>
          </div>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-sm text-slate-600">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="font-bold text-brand-600 hover:text-brand-700 underline underline-offset-4"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
