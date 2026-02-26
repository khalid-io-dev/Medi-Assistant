import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { adminService } from '../services/api';
import { Card, Input, Badge, Button, Table, Skeleton, Avatar } from '../components/ui';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await adminService.getAllUsers();
        setUsers(response.data);
      } catch (err) {
        console.error("Error fetching users", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Gestion des Utilisateurs</h1>
          <p className="text-text-secondary">Consultez et gérez les professionnels de santé inscrits</p>
        </div>

        <Input
          placeholder="Rechercher un utilisateur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<SearchIcon className="w-5 h-5" />}
          className="md:w-80"
        />
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <Badge variant="primary">{filteredUsers.length} utilisateur(s)</Badge>
      </div>

      {/* Users Table */}
      <Card padding="none">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton circle width={40} height={40} />
                <div className="flex-1 space-y-2">
                  <Skeleton width={200} height={20} />
                  <Skeleton width={150} height={16} />
                </div>
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <UsersIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-1">
              Aucun utilisateur trouvé
            </h3>
            <p className="text-text-secondary">
              {searchTerm ? 'Essayez une autre recherche' : 'Aucun utilisateur inscrit'}
            </p>
          </div>
        ) : (
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.Header>Utilisateur</Table.Header>
                <Table.Header>Email</Table.Header>
                <Table.Header>Rôle</Table.Header>
                <Table.Header>Statut</Table.Header>
                <Table.Header>Actions</Table.Header>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {filteredUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <Table.Cell>
                    <div className="flex items-center space-x-3">
                      <Avatar
                        name={user.username}
                        size="sm"
                      />
                      <div>
                        <p className="font-medium text-text-primary">{user.username}</p>
                        <p className="text-xs text-text-muted">ID: {user.id}</p>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center text-text-secondary">
                      <MailIcon className="w-4 h-4 mr-2 text-text-muted" />
                      {user.email}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge 
                      variant={user.role === 'ADMIN' ? 'secondary' : 'primary'}
                      size="sm"
                    >
                      {user.role === 'ADMIN' ? (
                        <ShieldIcon className="w-3 h-3 mr-1" />
                      ) : (
                        <UserIcon className="w-3 h-3 mr-1" />
                      )}
                      {user.role}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge 
                      variant={user.is_active ? 'success' : 'error'}
                      size="sm"
                      dot
                      dotColor={user.is_active ? 'bg-green-500' : 'bg-red-500'}
                    >
                      {user.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Link to={`/admin/history?userId=${user.id}`}>
                      <Button variant="ghost" size="sm">
                        <HistoryIcon className="w-4 h-4 mr-2" />
                        Historique
                      </Button>
                    </Link>
                  </Table.Cell>
                </motion.tr>
              ))}
            </Table.Body>
          </Table>
        )}
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

function UsersIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function MailIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function ShieldIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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

function HistoryIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default AdminUsers;
