import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg"
      >
        {/* 404 Illustration */}
        <div className="relative mb-8">
          <div className="text-9xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
            404
          </div>
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="w-32 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-text-primary mb-4">
          Page non trouvée
        </h1>
        <p className="text-text-secondary mb-8 text-lg">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button size="lg">
              <HomeIcon className="w-5 h-5 mr-2" />
              Retour à l'accueil
            </Button>
          </Link>
          <Link to="/chat">
            <Button variant="outline" size="lg">
              <MessageSquareIcon className="w-5 h-5 mr-2" />
              Accéder au Chat
            </Button>
          </Link>
        </div>

        {/* Decorative elements */}
        <div className="mt-12 flex justify-center space-x-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-slate-300"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

// Icon components
function HomeIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function MessageSquareIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  );
}

export default NotFound;
