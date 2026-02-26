import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { adminService, chatService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Card, Input, Badge, Skeleton } from '../components/ui';

const UserHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ total_queries: 0, last_active: null });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (user) {
          const [histRes, statsRes] = await Promise.all([
            chatService.getHistory(user.id),
            chatService.getStats()
          ]);
          setHistory(histRes.data);
          setStats(statsRes.data);
        }
      } catch (err) {
        console.error("Error fetching user history or stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const filteredHistory = history.filter(item =>
    item.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.response.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold text-text-primary">Mon Historique</h1>
          <p className="text-text-secondary">Retrouvez vos échanges passés avec l'assistant</p>
        </div>

        <Input
          placeholder="Rechercher dans mes conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<SearchIcon className="w-5 h-5" />}
          className="md:w-80"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm font-medium">Total des questions</p>
              <p className="text-3xl font-bold mt-1">
                {loading ? <Skeleton width={60} height={36} className="bg-white/20" /> : stats.total_queries || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <MessageSquareIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-secondary-500 to-secondary-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-100 text-sm font-medium">Dernière activité</p>
              <p className="text-lg font-semibold mt-1">
                {loading ? (
                  <Skeleton width={120} height={28} className="bg-white/20" />
                ) : stats.last_active ? (
                  formatDate(stats.last_active)
                ) : (
                  'Aucune activité'
                )}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* History List */}
      <Card padding="none">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-text-primary">Conversations</h2>
          <Badge variant="primary">{filteredHistory.length} résultat(s)</Badge>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex space-x-4">
                  <Skeleton circle width={40} height={40} />
                  <div className="flex-1 space-y-2">
                    <Skeleton width="80%" height={20} />
                    <Skeleton width="60%" height={16} />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-1">
                Aucun historique trouvé
              </h3>
              <p className="text-text-secondary">
                {searchTerm ? 'Essayez une autre recherche' : 'Commencez une conversation pour voir votre historique'}
              </p>
            </div>
          ) : (
            filteredHistory.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-6 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Question */}
                    <div className="mb-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="primary" size="sm">Question</Badge>
                        <span className="text-xs text-text-muted">
                          {formatDate(item.created_at)}
                        </span>
                      </div>
                      <p className="font-medium text-text-primary">{item.query}</p>
                    </div>

                    {/* Response */}
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-500 to-teal-600 flex items-center justify-center">
                          <SparklesIcon className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs font-medium text-text-secondary">Assistant MediAssist</span>
                      </div>
                      <p className="text-sm text-text-secondary line-clamp-3">{item.response}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </Card>
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

function MessageSquareIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  );
}

function CalendarIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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

function UserIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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

export default UserHistory;
