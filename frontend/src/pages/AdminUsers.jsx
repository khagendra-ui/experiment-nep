import { useEffect, useState } from 'react';
import { axiosInstance } from '@/App';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Ban, CheckCircle, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { Link, useLocation } from 'react-router-dom';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('active');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [banReason, setBanReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const location = useLocation();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filterParam = params.get('filter');
    const roleParam = params.get('role');

    if (filterParam && ['active', 'inactive', 'banned', 'all'].includes(filterParam)) {
      setFilter(filterParam);
    }

    if (roleParam && ['user', 'hotel_owner', 'admin', 'all'].includes(roleParam)) {
      setRoleFilter(roleParam);
    }
  }, [location.search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId, payload) => {
    setUpdating(true);
    try {
      await axiosInstance.patch(`/admin/users/${userId}/status`, payload);
      toast.success('User status updated');
      setSelectedUser(null);
      setBanReason('');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update user');
    } finally {
      setUpdating(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (roleFilter !== 'all' && user.role !== roleFilter) return false;
    if (filter === 'banned') return user.is_banned;
    if (filter === 'inactive') return user.is_active === false;
    if (filter === 'all') return true;
    return user.is_active !== false && !user.is_banned;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/admin">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">User Management</h1>
          <p className="text-xl text-gray-600">Deactivate or ban abusive accounts</p>
        </div>

        <Tabs value={filter} onValueChange={setFilter} className="mb-6">
          <TabsList className="grid w-full md:w-auto grid-cols-4 gap-2">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
            <TabsTrigger value="banned">Banned</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs value={roleFilter} onValueChange={setRoleFilter} className="mb-8">
          <TabsList className="grid w-full md:w-auto grid-cols-4 gap-2">
            <TabsTrigger value="all">All Roles</TabsTrigger>
            <TabsTrigger value="user">Users</TabsTrigger>
            <TabsTrigger value="hotel_owner">Hotel Owners</TabsTrigger>
            <TabsTrigger value="admin">Admins</TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredUsers.length === 0 ? (
          <Card className="border-2">
            <CardContent className="text-center py-20">
              <p className="text-gray-500 text-xl">No users found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="border-2 hover:shadow-xl transition">
                <CardContent className="p-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
                    <p className="text-gray-600">{user.email}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 uppercase font-semibold">
                        {user.role}
                      </span>
                      {user.is_banned && (
                        <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 font-semibold">Banned</span>
                      )}
                      {user.is_active === false && (
                        <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold">Inactive</span>
                      )}
                    </div>
                    {user.ban_reason && (
                      <p className="mt-2 text-sm text-red-600">Reason: {user.ban_reason}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => updateUserStatus(user.id, { is_active: false })}
                      variant="outline"
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Deactivate
                    </Button>
                    <Button
                      onClick={() => updateUserStatus(user.id, { is_active: true })}
                      variant="outline"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Activate
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedUser(user);
                        setBanReason(user.ban_reason || '');
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Ban
                    </Button>
                    {user.is_banned && (
                      <Button
                        onClick={() => updateUserStatus(user.id, { is_banned: false })}
                        variant="outline"
                      >
                        Remove Ban
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Ban User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Reason for banning {selectedUser?.name}</p>
            <Textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Provide a reason for the ban"
              className="min-h-24"
            />
            <Button
              onClick={() => updateUserStatus(selectedUser.id, { is_banned: true, ban_reason: banReason })}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={updating}
            >
              Confirm Ban
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
