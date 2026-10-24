import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Lock,
  IdCard,
  Phone,
  Building,
  GraduationCap,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Civil Engineering',
  'Information Technology',
  'Biotechnology',
  'Sciences & Humanities',
  'Other / General',
];

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    collegeId: '',
    department: DEPARTMENTS[0],
    phone: '',
  });

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Client-side validations
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.collegeId ||
      !formData.phone
    ) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setIsSubmitting(true);
      await register(formData);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setFormError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-500 text-white items-center justify-center shadow-lg shadow-brand-500/25 mb-2">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Join CampusGeeks
          </h2>
          <p className="text-sm text-slate-500">
            Borrow academic gear, share idle equipment, and build campus reputation
          </p>
        </div>

        {/* Error Alert */}
        {formError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" />
            <span className="font-medium">{formError}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            placeholder="e.g. Priya Sharma"
            value={formData.name}
            onChange={handleChange}
            icon={User}
            required
          />

          <Input
            label="College / Campus Email"
            name="email"
            type="email"
            placeholder="priya@college.edu"
            value={formData.email}
            onChange={handleChange}
            icon={Mail}
            helperText="Prefer your official student email for trusted verification"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Student ID / Roll No"
              name="collegeId"
              placeholder="e.g. 2024-EC-102"
              value={formData.collegeId}
              onChange={handleChange}
              icon={IdCard}
              required
            />

            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="+91 9876543210"
              value={formData.phone}
              onChange={handleChange}
              icon={Phone}
              helperText="For pickup WhatsApp links"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Department <span className="text-rose-500">*</span>
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Building className="h-5 w-5" />
              </div>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="block w-full rounded-xl border border-slate-200 bg-white pl-11 pr-3.5 py-2.5 text-sm text-slate-900 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                required
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="At least 6 characters"
            value={formData.password}
            onChange={handleChange}
            icon={Lock}
            required
          />

          <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs border border-emerald-200/80">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>You start with a pristine <strong>5.0 ★ Trust Score</strong>. Maintain it by returning items on time!</span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full justify-center text-base"
          >
            Create Student Account
          </Button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-sm text-slate-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-brand-600 hover:text-brand-700 underline underline-offset-4"
            >
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
