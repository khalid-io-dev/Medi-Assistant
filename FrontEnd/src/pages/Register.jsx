import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input } from '../components/ui';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    is_active: true,
    role: 'USER',
    password: '',
    password_repeat: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password_repeat) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || "Une erreur est survenue lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Compte' },
    { number: 2, title: 'Sécurité' },
  ];

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Créer un compte
          </h1>
          <p className="text-text-secondary">
            Rejoignez MediAssist et accédez à l'assistant médical intelligent
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((s, index) => (
            <div key={s.number} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                  step >= s.number
                    ? 'bg-primary-500 text-white'
                    : 'bg-slate-100 text-text-muted'
                }`}
              >
                {s.number}
              </div>
              <span
                className={`ml-2 text-sm font-medium hidden sm:block ${
                  step >= s.number ? 'text-text-primary' : 'text-text-muted'
                }`}
              >
                {s.title}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 h-0.5 mx-4 transition-colors ${
                    step > s.number ? 'bg-primary-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3"
          >
            <AlertCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {step === 1 ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <Input
                label="Nom d'utilisateur"
                name="username"
                type="text"
                placeholder="Choisissez un nom d'utilisateur"
                value={formData.username}
                onChange={handleChange}
                leftIcon={<UserIcon className="w-5 h-5" />}
                required
              />

              <Input
                label="Adresse email"
                name="email"
                type="email"
                placeholder="vous@example.com"
                value={formData.email}
                onChange={handleChange}
                leftIcon={<MailIcon className="w-5 h-5" />}
                required
              />

              <Button
                type="button"
                className="w-full"
                size="lg"
                onClick={() => setStep(2)}
                disabled={!formData.username || !formData.email}
              >
                Continuer
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <Input
                label="Mot de passe"
                name="password"
                type="password"
                placeholder="Créez un mot de passe"
                value={formData.password}
                onChange={handleChange}
                leftIcon={<LockIcon className="w-5 h-5" />}
                helperText="Minimum 8 caractères"
                required
              />

              <Input
                label="Confirmer le mot de passe"
                name="password_repeat"
                type="password"
                placeholder="Confirmez votre mot de passe"
                value={formData.password_repeat}
                onChange={handleChange}
                leftIcon={<LockIcon className="w-5 h-5" />}
                required
              />

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  required
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                />
                <label className="text-sm text-text-secondary">
                  J'accepte les{' '}
                  <Link to="/terms" className="text-primary-500 hover:text-primary-600">
                    conditions d'utilisation
                  </Link>{' '}
                  et la{' '}
                  <Link to="/privacy" className="text-primary-500 hover:text-primary-600">
                    politique de confidentialité
                  </Link>
                </label>
              </div>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  size="lg"
                  onClick={() => setStep(1)}
                >
                  Retour
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  size="lg"
                  loading={loading}
                >
                  S'inscrire
                </Button>
              </div>
            </motion.div>
          )}
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-text-secondary">
          Déjà un compte ?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary-500 hover:text-primary-600 transition-colors"
          >
            Se connecter
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

// Icon components
function UserIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function MailIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
    </svg>
  );
}

function LockIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function AlertCircleIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ArrowRightIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  );
}

export default Register;
