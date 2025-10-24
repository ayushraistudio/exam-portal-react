import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import AdminHome from '../components/admin/AdminHome'
import StudentManagement from '../components/admin/StudentManagement'
import ContestManagement from '../components/admin/ContestManagement'
import RejoinRequests from '../components/admin/RejoinRequests'
import ContestResults from '../components/admin/ContestResults'

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminHome />} />
        <Route path="/students" element={<StudentManagement />} />
        <Route path="/contests" element={<ContestManagement />} />
        <Route path="/rejoin-requests" element={<RejoinRequests />} />
        <Route path="/results/:contestId" element={<ContestResults />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  )
}
