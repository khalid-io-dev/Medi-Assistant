import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { adminService } from '../services/api';
import { Card, Input, Badge, Button, Skeleton } from '../components/ui';

const AdminHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userIdFilter = queryParams.get('userId');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        let response;
        if (userIdFilter) {
          response = await adminService.getUserHistory(userIdFilter);
        } else {
          response = await adminService.getHistory();
        }
        setHistory(response.data);
      } catch (err) {
        console.error("Error fetching admin history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [userIdFilter]);

  const filteredHistory = history.filter(item =>
    item.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.response.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.user_id.toString().includes(searchTerm)
  );

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy à HH:mm', { locale: fr });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Historique Global</h1>
          <p className="text-text-secondary">
            {userIdFilter 
              ? `Conversations de l'utilisateur #${userIdFilter}` 
              : "Toutes les conversations de la plateforme"}
          </p>
        </div>

        <div className="flex gap-3">
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<SearchIcon className="w-5 h-5" />}
            className="md:w-72"
          />
          {userIdFilter && (
            <Link to="/admin/history">
              <Button variant="outline">
                <XIcon className="w-4 h-4 mr-2" />
                Effacer le filtre
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <Badge variant="primary">{filteredHistory.length} résultat(s)</Badge>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <div className="p-6 space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Skeleton circle width={40} height={40} />
                    <div className="flex-1">
                      <Skeleton width={200} height={20} />
                    </div>
                  </div>
                  <Skeleton width="100%" height={60} />
                </div>
              ))}
            </div>
          </Card>
        ) : filteredHistory.length === 0 ? (
          <Card>
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <AlertCircleIcon className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-1">
                Aucun historique trouvé
              </h3>
              <p className="text-text-secondary">
                {searchTerm ? 'Essayez une autre recherche' : 'Aucune conversation enregistrée'}
              </p>
            </div>
          </Card>
        ) : (
          filteredHistory.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <Link
                      to={`/admin/history?userId=${item.user_id}`}
                      className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary">Utilisateur #{item.user_id}</p>
                        <p className="text-sm text-text-muted">ID: {item.id}</p>
                      </div>
                    </Link>
                  </div>
                  <div className="flex items-center text-sm text-text-muted">
                    <ClockIcon className="w-4 h-4 mr-1.5" />
                    {formatDate(item.created_at)}
                  </div>
                </div>

                {/* Content */}
                <div className="pt-4 space-y-4">
                  {/* Question */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="primary" size="sm">Question</Badge>
                    </div>
                    <p className="text-text-primary font-medium text-lg">{item.query}</p>
                  </div>

                  {/* Response */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-500 to-teal-600 flex items-center justify-center">
                        <SparklesIcon className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm font-medium text-text-secondary">Réponse de MediAssist</span>
                    </div>
                    <p className="text-text-secondary leading-relaxed">{item.response}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

// Icon components
function SearchIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function XIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

function ClockIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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

function SparklesIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

export default AdminHistory;
