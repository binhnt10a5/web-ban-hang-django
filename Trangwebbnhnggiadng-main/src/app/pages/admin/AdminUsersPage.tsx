import React, { useState, useEffect } from 'react';
import { Search, Shield, User as UserIcon, Trash2, Unlock } from 'lucide-react';
import { usersApi } from '../../services/api';
import type { User } from '../../types';
import { toast } from 'sonner';

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const result = await usersApi.getAll();
      if (result.success && result.data) {
        setUsers(result.data);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      const result = await usersApi.updateRole(userId, newRole);
      if (result.success) {
        toast.success('Đã cập nhật vai trò người dùng');
        loadUsers();
      } else {
        toast.error(result.error || 'Lỗi khi cập nhật vai trò');
      }
    } catch (error) {
      toast.error('Lỗi khi cập nhật vai trò');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Bạn có chắc muốn xóa người dùng này?')) return;

    try {
      const result = await usersApi.delete(userId);
      if (result.success) {
        toast.success('Đã xóa người dùng');
        loadUsers();
      } else {
        toast.error(result.error || 'Lỗi khi xóa người dùng');
      }
    } catch (error) {
      toast.error('Lỗi khi xóa người dùng');
    }
  };

  const handleUnlock = async (userId: string) => {
    try {
      const result = await usersApi.unlockAccount(userId);
      if (result.success) {
        toast.success('Đã mở khóa tài khoản');
        loadUsers();
      } else {
        toast.error(result.error || 'Lỗi khi mở khóa tài khoản');
      }
    } catch (error) {
      toast.error('Lỗi khi mở khóa tài khoản');
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-white">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Quản lý người dùng</h1>
          <p className="text-gray-400">{filteredUsers.length} người dùng</p>
        </div>

        {/* Search */}
        <div className="bg-[#2a2a2a] rounded-lg p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Tìm kiếm người dùng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Users Table */}
        {filteredUsers.length === 0 ? (
          <div className="bg-[#2a2a2a] rounded-lg p-12 text-center">
            <p className="text-gray-400 text-lg">Không tìm thấy người dùng nào</p>
          </div>
        ) : (
          <div className="bg-[#2a2a2a] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1a1a1a]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                      Người dùng
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                      Vai trò
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-[#333] transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            {user.role === 'admin' ? (
                              <Shield className="w-5 h-5 text-blue-400" />
                            ) : (
                              <UserIcon className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.name}</p>
                            {user.phone && (
                              <p className="text-gray-500 text-sm">{user.phone}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{user.email}</td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(user.id, e.target.value as 'user' | 'admin')
                          }
                          className={`px-3 py-1 rounded-lg text-sm font-medium border ${
                            user.role === 'admin'
                              ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                              : 'bg-gray-700 text-gray-300 border-gray-600'
                          }`}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        {user.isLocked ? (
                          <span className="px-3 py-1 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1 w-fit">
                            🔒 Đã khóa
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-lg text-sm font-medium bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1 w-fit">
                            ✓ Hoạt động
                          </span>
                        )}
                        {user.failedLoginAttempts && user.failedLoginAttempts > 0 && !user.isLocked && (
                          <p className="text-yellow-400 text-xs mt-1">
                            {user.failedLoginAttempts}/5 lần sai
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {user.isLocked && (
                            <button
                              onClick={() => handleUnlock(user.id)}
                              className="p-2 hover:bg-green-500/20 rounded-lg transition group"
                              title="Mở khóa tài khoản"
                            >
                              <Unlock className="w-4 h-4 text-gray-500 group-hover:text-green-400" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition group"
                          >
                            <Trash2 className="w-4 h-4 text-gray-500 group-hover:text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
