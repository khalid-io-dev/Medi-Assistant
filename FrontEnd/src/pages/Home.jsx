import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui';
import { Footer } from '../components/layout';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      title: 'Protocoles Médicaux',
      description: 'Accès instantané aux protocoles standardisés pour une prise en charge optimale des patients.',
      icon: BookOpenIcon,
      color: 'from-primary-500 to-primary-600',
    },
    {
      title: 'IA Contextuelle',
      description: 'Intelligence artificielle spécialisée pour aider dans les diagnostics complexes.',
      icon: BrainIcon,
      color: 'from-secondary-500 to-secondary-600',
    },
    {
      title: 'Réponses Sourcées',
      description: 'Chaque réponse est basée sur une documentation clinique vérifiée et fiable.',
      icon: ShieldCheckIcon,
      color: 'from-accent-500 to-accent-600',
    },
    {
      title: 'Rapidité d\'Exécution',
      description: 'Optimisé pour les situations d\'urgence nécessitant une réponse immédiate.',
      icon: ZapIcon,
      color: 'from-warning to-orange-500',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Consultations' },
    { value: '500+', label: 'Professionnels' },
    { value: '99.9%', label: 'Disponibilité' },
    { value: '<2s', label: 'Temps de réponse' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold text-text-primary">MediAssist</span>
            </Link>
            <div className="flex items-center space-x-4">
              {user ? (
                <Button onClick={() => window.location.href = '/chat'}>
                  Accéder au Chat
                </Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => window.location.href = '/login'}>
                    Connexion
                  </Button>
                  <Button onClick={() => window.location.href = '/register'}>
                    S'inscrire
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-background to-secondary-50" />
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[600px] h-[600px] bg-secondary-200/30 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-6">
                <SparklesIcon className="w-4 h-4 mr-2" />
                Propulsé par l'IA Avancée
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-text-primary leading-tight mb-6">
                Votre assistant{' '}
                <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                  médical intelligent
                </span>
              </h1>
              <p className="text-lg text-text-secondary mb-8 max-w-lg">
                MediAssist fournit aux professionnels de santé un accès instantané et 
                contextualisé aux protocoles médicaux grâce à l'intelligence artificielle.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <Button size="lg" onClick={() => window.location.href = '/chat'}>
                    Accéder au Chat
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </Button>
                ) : (
                  <>
                    <Button size="lg" onClick={() => window.location.href = '/register'}>
                      Commencer gratuitement
                      <ArrowRightIcon className="w-5 h-5 ml-2" />
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => window.location.href = '/login'}>
                      Se connecter
                    </Button>
                  </>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-white rounded-3xl shadow-2xl p-6 border border-slate-100">
                <div className="flex items-center space-x-2 mb-4 pb-4 border-b border-slate-100">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-2 text-sm text-text-muted">Assistant MediAssist</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <UserIcon className="w-4 h-4 text-text-secondary" />
                    </div>
                    <div className="bg-slate-100 rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%]">
                      <p className="text-sm text-text-primary">Quels sont les signes d'alerte d'une détresse respiratoire ?</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 justify-end">
                    <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl rounded-tr-none px-4 py-2 max-w-[80%]">
                      <p className="text-sm text-white">Les signes d'alerte incluent : dyspnée au repos, tirage, batttement des ailes du nez, cyanose, FR {'>'} 30/min...</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0">
                      <SparklesIcon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <UserIcon className="w-4 h-4 text-text-secondary" />
                    </div>
                    <div className="bg-slate-100 rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%]">
                      <p className="text-sm text-text-primary">Merci pour ces informations !</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center space-x-2 text-xs text-text-muted">
                    <SparklesIcon className="w-3 h-3" />
                    <span>Réponse générée en 1.2s • Sources vérifiées</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-text-secondary mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4">
              Une plateforme conçue pour les professionnels de santé
            </h2>
            <p className="text-lg text-text-secondary">
              MediAssist combine l'intelligence artificielle de pointe avec une expertise médicale 
              pour vous fournir des réponses précises et rapides.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="h-full bg-white rounded-2xl p-6 border border-slate-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative bg-gradient-to-br from-primary-500 to-secondary-600 rounded-3xl p-8 lg:p-16 text-center overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Prêt à révolutionner votre pratique médicale ?
              </h2>
              <p className="text-lg text-white/80 mb-8">
                Rejoignez des milliers de professionnels de santé qui utilisent déjà MediAssist 
                pour améliorer leurs décisions cliniques.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-primary-600 hover:bg-white/90"
                  onClick={() => window.location.href = user ? '/chat' : '/register'}
                >
                  {user ? 'Accéder au Chat' : 'Commencer gratuitement'}
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Icon components
function BookOpenIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function BrainIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}

function ShieldCheckIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function ZapIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function SparklesIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
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

function UserIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

export default Home;
