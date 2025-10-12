'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export default function RegisterPage() {
  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [id, setId] = useState(''); // สำหรับแก้ไขเท่านั้น

  // Users table states
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('--ทั้งหมด--');
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(false);

  const { data: session, status } = useSession();
  const router = useRouter();

  // ถ้าไม่ใช่ staff ห้ามเข้าหน้านี้
  useEffect(() => {
    if (status === "loading") return;
    if (session?.user?.role !== "staff") {
      router.replace("/"); // redirect ไปหน้าแรก
    }
  }, [session, status, router]);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v0/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        setFilteredUsers(data.users);
      } else {
        setMessage(data.message || "ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter + Search + Sort
  useEffect(() => {
    let filtered = [...users];

    if (roleFilter !== '--ทั้งหมด--') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(user =>
        String(user.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      const aValue = a[sortField as keyof User].toString().toLowerCase();
      const bValue = b[sortField as keyof User].toString().toLowerCase();
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, sortField, sortDirection]);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/v0/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role }),
      });

      const data = await res.json();
      setMessage(data.message);

      if (res.ok && data.success) {
        resetForm();
        // Fetch users ใหม่แต่ไม่ต้อง set loading
        const usersRes = await fetch('/api/v0/users');
        const usersData = await usersRes.json();
        if (usersData.success) {
          setUsers(usersData.users);
          setFilteredUsers(usersData.users);
        }
      }
    } catch (error) {
      setMessage('เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setId('');
    setUsername('');
    setEmail('');
    setPassword('');
    setRole('user');
    setIsEditing(false);
    setMessage('');
  };

  const handleUpdateUser = async () => {
    if (!id) {
      setMessage('กรุณาเลือกผู้ใช้ที่ต้องการแก้ไข');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/v0/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, role }),
      });

      const data = await res.json();
      setMessage(data.message);

      if (res.ok && data.success) {
        resetForm();
        await fetchUsers();
      }
    } catch (error) {
      setMessage('เกิดข้อผิดพลาดในการแก้ไข');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้?')) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/v0/users/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      setMessage(data.message);

      if (res.ok && data.success) {
        await fetchUsers();
      }
    } catch (error) {
      setMessage('เกิดข้อผิดพลาดในการลบ');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      user: 'ผู้ใช้',
      instructor: 'ผู้สอน',
      staff: 'ผู้ดูแลระบบ'
    };
    return roleMap[role] || role;
  };

  const totalUsers = users.length;
  const totalInstructors = users.filter(u => u.role === 'instructor').length;
  const totalStaffs = users.filter(u => u.role === 'staff').length;

  if (status === "loading" || session?.user?.role !== "staff") {
    return <p className="p-6 text-center text-gray-600 dark:text-gray-400">Loading...</p>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans text-gray-900 bg-white min-h-screen">
      <h2 className="text-3xl font-extrabold mb-8 border-b border-gray-300 pb-2 text-orange-600">Users Management Form</h2>
      <div className="flex flex-wrap gap-10">
        {/* Registration Form */}
        <div className="flex-shrink-0 w-full max-w-md bg-gray-50 rounded-lg border border-gray-300 p-6 shadow-sm">
          <h3 className="mb-6 text-xl font-semibold text-gray-900">
            {isEditing ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}
          </h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isEditing) {
                handleUpdateUser();
              } else {
                handleRegister(e);
              }
            }}
            className="flex flex-col gap-5"
          >
            <div>
              <label className="block mb-1 font-semibold text-gray-800">Username:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-800">Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900"
              />
            </div>
            {!isEditing && (
              <div>
                <label className="block mb-1 font-semibold text-gray-800">Password:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900"
                />
              </div>
            )}
            <div>
              <label className="block mb-1 font-semibold text-gray-800">Role:</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900"
              >
                <option value="user">ผู้ใช้</option>
                <option value="instructor">ผู้สอน</option>
                <option value="staff">ผู้ดูแลระบบ</option>
              </select>
            </div>
            <div className="flex gap-3 mt-3">
              <button
                type="submit"
                disabled={loading}
                className={`flex-grow px-5 py-2 rounded-md font-bold text-white transition-colors ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {loading ? 'กำลังดำเนินการ...' : isEditing ? 'อัปเดต' : 'เพิ่ม'}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setIsEditing(false);
                }}
                disabled={loading}
                className="px-5 py-2 rounded-md font-bold bg-gray-400 text-white hover:bg-gray-600 transition-colors"
              >
                {isEditing ? 'ยกเลิก' : 'รีเซ็ต'}
              </button>
            </div>
          </form>
          {message && (
            <p
              className={`mt-5 px-4 py-2 rounded-md border ${
                message.toLowerCase().includes('success')
                  ? 'bg-green-100 border-green-400 text-green-700'
                  : 'bg-red-100 border-red-400 text-red-700'
              }`}
            >
              {message}
            </p>
          )}
        </div>

        {/* Users Table */}
        <div className="flex-grow min-w-[400px] bg-gray-50 rounded-lg border border-gray-300 p-6 shadow-sm">
          <h3 className="mb-6 text-xl font-semibold text-gray-900">
            รายชื่อผู้ใช้ (ทั้งหมด {totalUsers} คน) | ผู้สอน {totalInstructors} | ผู้ดูแลระบบ {totalStaffs}
          </h3>

          {/* Search and Filter Controls */}
          <div className="flex flex-wrap gap-6 mb-6 items-center">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="font-semibold text-gray-700 mr-2 whitespace-nowrap">ค้นหา:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาจากรหัส, Email, Username..."
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 w-72 text-gray-900"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="font-semibold text-gray-700 mr-2 whitespace-nowrap">บทบาท:</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 w-44"
              >
                <option value="--ทั้งหมด--">--ทั้งหมด--</option>
                <option value="user">ผู้ใช้</option>
                <option value="instructor">ผู้สอน</option>
                <option value="staff">ผู้ดูแลระบบ</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-12 text-center text-gray-500">กำลังโหลดข้อมูล...</div>
            ) : (
              <table className="w-full border-collapse border border-gray-300 text-gray-900 text-sm">
                <thead>
                  <tr className="bg-white border-b border-gray-300">
                    <th
                      className="border border-gray-300 px-3 py-2 text-left cursor-pointer select-none"
                      onClick={() => handleSort('id')}
                    >
                      รหัสประจำตัว {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="border border-gray-300 px-3 py-2 text-left cursor-pointer select-none"
                      onClick={() => handleSort('username')}
                    >
                      Username {sortField === 'username' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Email</th>
                    <th
                      className="border border-gray-300 px-3 py-2 text-left cursor-pointer select-none"
                      onClick={() => handleSort('role')}
                    >
                      Role {sortField === 'role' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500">
                        ไม่พบข้อมูลผู้ใช้
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, index) => (
                      <tr
                        key={user.id}
                        className={index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}
                      >
                        <td className="border border-gray-300 px-3 py-2">{user.id}</td>
                        <td className="border border-gray-300 px-3 py-2">{user.username}</td>
                        <td className="border border-gray-300 px-3 py-2">{user.email}</td>
                        <td className="border border-gray-300 px-3 py-2">
                          <span
                            className={`inline-block px-3 py-1 rounded-full font-semibold text-xs text-white ${
                              user.role === 'staff'
                                ? 'bg-orange-700'
                                : user.role === 'instructor'
                                ? 'bg-orange-500'
                                : 'bg-orange-400'
                            }`}
                          >
                            {getRoleDisplayName(user.role)}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-center whitespace-nowrap">
                          <button
                            className="px-3 py-1 mr-2 rounded bg-orange-600 hover:bg-orange-700 text-white font-semibold transition-colors"
                            onClick={() => {
                              setId(user.id);
                              setUsername(user.username);
                              setEmail(user.email);
                              setRole(user.role);
                              setIsEditing(true);
                            }}
                          >
                            แก้ไข
                          </button>
                          <button
                            className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-900 text-white font-semibold transition-colors"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            ลบ
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getRoleDisplayName(role: string) {
  const roleMap: { [key: string]: string } = {
    user: 'ผู้ใช้',
    instructor: 'ผู้สอน',
    staff: 'ผู้ดูแลระบบ',
  };
  return roleMap[role] || role;
}
