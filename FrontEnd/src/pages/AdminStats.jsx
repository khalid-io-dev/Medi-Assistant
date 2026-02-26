import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { adminService } from '../services/api';
import { Card, Badge, Skeleton } from '../components/ui';

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminService.getStats();
        setStats(response.data);
      } catch (err) {
        console.error("Error fetching admin stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const COLORS = ['#0EA5E9', '#6366F1', '#10B981', '#F59E0B', '#EF4444'];

  const formatBarData = () => {
    if (!stats?.frequent_questions) return [];
    return stats.frequent_questions.map((q, i) => ({
      name: q.question.length > 25 ? q.question.substring(0, 25) + '...' : q.question,
      count: q.count,
      full: q.question
    }));
  };

  const formatPieData = () => {
    if (!stats?.frequent_questions) return [];
    const topQuestions = stats.frequent_questions.slice(0, 5);
    const otherCount = stats.total_queries - topQuestions.reduce((acc, q) => acc + q.count, 0);
    
    return [
      ...topQuestions.map((q, i) => ({ name: `Q${i + 1}`, value: q.count })),
      ...(otherCount > 0 ? [{ name: 'Autres', value: otherCount }] : [])
    ];
  };

  const statCards = [
    {
      title: 'Requêtes Totales',
      value: stats?.total_queries || 0,
      icon: MessageSquareIcon,
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-50',
      textColor: 'text-primary-600'
    },
    {
      title: 'Utilisateurs Actifs',
      value: stats?.active_users_count || 0,
      icon: UsersIcon,
      color: 'from-secondary-500 to-secondary-600',
      bgColor: 'bg-secondary-50',
      textColor: 'text-secondary-600'
    },
    {
      title: 'Questions Fréquentes',
      value: stats?.frequent_questions?.length || 0,
      icon: TrendingUpIcon,
      color: 'from-accent-500 to-accent-600',
      bgColor: 'bg-accent-50',
      textColor: 'text-accent-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Tableau de Bord</h1>
        <p className="text-text-secondary">Vue d'ensemble de l'activité de la plateforme</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm font-medium">{card.title}</p>
                  <p className="text-3xl font-bold text-text-primary mt-1">
                    {loading ? (
                      <Skeleton width={80} height={36} />
                    ) : (
                      card.value.toLocaleString()
                    )}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${card.bgColor} flex items-center justify-center`}>
                  <card.icon className={`w-6 h-6 ${card.textColor}`} />
                </div>
              </div>
              <div className={`mt-4 h-1 w-full rounded-full bg-gradient-to-r ${card.color}`} />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <Card.Header>
              <div>
                <Card.Title>Questions les plus posées</Card.Title>
                <Card.Description>Top des requêtes les plus fréquentes</Card.Description>
              </div>
            </Card.Header>
            <Card.Content>
              {loading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <Skeleton width="100%" height={250} />
                </div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formatBarData()} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                      <XAxis type="number" stroke="#64748B" fontSize={12} />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        stroke="#64748B" 
                        fontSize={11}
                        width={150}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                        formatter={(value, name, props) => [value, 'Nombre']}
                        labelFormatter={(label, payload) => payload?.[0]?.payload?.full || label}
                      />
                      <Bar dataKey="count" fill="#0EA5E9" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card.Content>
          </Card>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <Card.Header>
              <div>
                <Card.Title>Répartition des requêtes</Card.Title>
                <Card.Description>Distribution par catégorie</Card.Description>
              </div>
            </Card.Header>
            <Card.Content>
              {loading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <Skeleton width="100%" height={250} circle />
                </div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={formatPieData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {formatPieData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card.Content>
          </Card>
        </motion.div>
      </div>

      {/* Top Questions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <Card>
          <Card.Header>
            <Card.Title>Top Questions détaillées</Card.Title>
          </Card.Header>
          <Card.Content>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} width="100%" height={60} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {stats?.frequent_questions?.map((q, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold text-sm">
                        {i + 1}
                      </span>
                      <p className="text-text-primary font-medium truncate">{q.question}</p>
                    </div>
                    <Badge variant="primary" size="sm">{q.count} fois</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card.Content>
        </Card>
      </motion.div>
    </div>
  );
};

// Icon components
function MessageSquareIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  );
}

function UsersIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function TrendingUpIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}

export default AdminStats;
