import React, { useEffect, useMemo, useState } from 'react'
import { Search, Mail, Phone, Trash2, Plus } from 'lucide-react'
import { getALlstudent, getAllUsers } from '../../api/api'

const getListFromResponse = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.content)) return data.content
  if (Array.isArray(data?.users)) return data.users
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.data?.content)) return data.data.content
  if (Array.isArray(data?.data?.users)) return data.data.users
  if (Array.isArray(data?.data?.data)) return data.data.data
  if (Array.isArray(data?.data?.students)) return data.data.students
  return []
}

const isStudentUser = (user) => {
  const roles = [
    user?.role,
    user?.userRole,
    user?.user_type,
    user?.userType,
    ...(Array.isArray(user?.roles) ? user.roles : []),
    ...(Array.isArray(user?.authorities) ? user.authorities : []),
  ]
  return roles.some((roleItem) => {
    if (!roleItem) return false
    if (typeof roleItem === 'string') {
      const normalized = roleItem.toUpperCase()
      return normalized === 'STUDENT' || normalized === 'ROLE_STUDENT'
    }
    if (typeof roleItem === 'object') {
      const value = String(roleItem?.name || roleItem?.role || roleItem?.authority || '').toUpperCase()
      return value === 'STUDENT' || value === 'ROLE_STUDENT'
    }
    return false
  })
}

const toText = (value, fallback = 'N/A') => {
  if (value === null || value === undefined || value === '') return fallback
  return String(value)
}

const getStudentId = (student) =>
  student?.studentId || student?.student_id || student?.id || student?.user_id

const getStudentName = (student) => {
  if (student?.fullName) return student.fullName
  if (student?.fullname) return student.fullname
  if (student?.name) return student.name
  const firstName = student?.firstName || student?.first_name
  const lastName = student?.lastName || student?.last_name
  const composed = [firstName, lastName].filter(Boolean).join(' ').trim()
  return composed || 'Unknown Student'
}

const getRegistrationNo = (student) =>
  student?.registrationNo ||
  student?.registration_number ||
  student?.indexNo ||
  student?.index_no ||
  student?.studentCode ||
  `ID-${getStudentId(student) ?? 'N/A'}`

const getDepartment = (student) =>
  student?.department || student?.program || student?.faculty || 'N/A'

const getYear = (student) =>
  student?.year || student?.studyYear || student?.academicYear || student?.level || 'N/A'

const normalizeDepartment = (value) => {
  const raw = String(value ?? '').toUpperCase()
  if (raw.includes('ENGINEER')) return 'ENGINEERING'
  if (raw.includes('ICT')) return 'ICT'
  if (raw.includes('BIO')) return 'BIOSYSTEM'
  return raw
}

const normalizeYear = (value) => {
  const raw = String(value ?? '').trim()
  if (/^1|1ST/i.test(raw)) return '1st YEAR'
  if (/^2|2ND/i.test(raw)) return '2nd YEAR'
  if (/^3|3RD/i.test(raw)) return '3rd YEAR'
  if (/^4|4TH/i.test(raw)) return '4th YEAR'
  return raw
}

const getInitials = (name) =>
  name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

export default function StudentManagement() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('ALL')
  const [selectedYear, setSelectedYear] = useState('ALL')

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)
        setError('')
        let studentList = []
        try {
          const usersResponse = await getAllUsers()
          const usersList = getListFromResponse(usersResponse)
          studentList = usersList.filter((user) => isStudentUser(user))
        } catch (usersError) {
          console.warn('Users endpoint failed, fallback to students/all:', usersError)
        }
        if (studentList.length === 0) {
          const studentsResponse = await getALlstudent()
          const directStudentsList = getListFromResponse(studentsResponse)
          studentList = directStudentsList
        }
        setStudents(studentList)
      } catch (err) {
        console.error('Failed to fetch students:', err)
        setError('Failed to load students. Please try again.')
        setStudents([])
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [])

  const departments = ['ALL', 'ENGINEERING', 'ICT', 'BIOSYSTEM']
  const years = ['ALL', '1st YEAR', '2nd YEAR', '3rd YEAR', '4th YEAR']

  const filteredStudents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return students.filter((student) => {
      const name = getStudentName(student).toLowerCase()
      const matchesSearch = query.length === 0 || name.includes(query)
      const matchesDepartment =
        selectedDepartment === 'ALL' ||
        normalizeDepartment(getDepartment(student)) === selectedDepartment
      const matchesYear =
        selectedYear === 'ALL' || normalizeYear(getYear(student)) === selectedYear
      return matchesSearch && matchesDepartment && matchesYear
    })
  }, [students, searchTerm, selectedDepartment, selectedYear])

  const handleDelete = (studentId) => {
    setStudents((prev) => prev.filter((s) => getStudentId(s) !== studentId))
  }

  return (
    <section className="w-full max-w-7xl rounded-2xl bg-[#081a31] px-4 py-5 text-white sm:px-6 md:px-8 md:py-7">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-[30px] font-bold leading-none text-white">
            Student Management
          </h1>
          <p className="mt-3 text-lg text-white/65">Manage and view all student records</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-[#d7b430] px-5 py-3 text-lg font-semibold text-[#081a31] transition-colors hover:bg-[#e4c553]"
        >
          <Plus size={20} />
          Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-white/14 bg-[#0e2a4a] p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/45"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search students by name..."
              className="w-full rounded-xl border border-white/25 bg-[#081f3b] py-2 pl-10 pr-3 text-base text-white placeholder:text-white/45 outline-none transition-colors focus:border-[#d7b430]"
            />
          </div>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="rounded-xl border border-white/25 bg-[#081f3b] px-3 py-2 text-base text-white outline-none focus:border-[#d7b430]"
          >
            <option value="ALL">All Departments</option>
            {departments.filter((d) => d !== 'ALL').map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="rounded-xl border border-white/25 bg-[#081f3b] px-3 py-2 text-base text-white outline-none focus:border-[#d7b430]"
          >
            <option value="ALL">All Years</option>
            {years.filter((y) => y !== 'ALL').map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="mt-5 overflow-hidden rounded-xl border border-white/14 bg-[#0e2a4a]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse table-fixed">
            <colgroup>
              <col className="w-[28%]" />
              <col className="w-[36%]" />
              <col className="w-[16%]" />
              <col className="w-[12%]" />
              <col className="w-[8%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-white/14 bg-[#103459]">
                <th className="px-3 py-3 text-left text-base font-semibold text-white/70">Student Info</th>
                <th className="px-3 py-3 text-left text-base font-semibold text-white/70">Contact</th>
                <th className="px-3 py-3 text-left text-base font-semibold text-white/70">Department</th>
                <th className="px-3 py-3 text-left text-base font-semibold text-white/70">Year</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-white/65">
                    Loading students...
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-rose-300">{error}</td>
                </tr>
              )}
              {!loading && !error && filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-white/65">
                    No students found
                  </td>
                </tr>
              )}
              {!loading && !error && filteredStudents.map((student) => {
                const studentId = getStudentId(student)
                const name = getStudentName(student)
                return (
                  <tr
                    key={studentId ?? getRegistrationNo(student)}
                    className="border-b border-white/10 transition-colors hover:bg-[#12355b]"
                  >
                    {/* Student Info */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#d7b430]/20 text-sm font-medium text-[#d7b430]">
                          {getInitials(name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold text-white">{name}</p>
                          <p className="mt-0.5 text-sm text-white/55">
                            {toText(getRegistrationNo(student))}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-3 py-3">
                      <p className="flex items-center gap-2 text-sm text-white/75">
                        <Mail size={12} className="flex-shrink-0 text-white/45" />
                        <span className="truncate">{toText(student?.email)}</span>
                      </p>
                      <p className="mt-1 flex items-center gap-2 text-sm text-white/75">
                        <Phone size={12} className="flex-shrink-0 text-white/45" />
                        {toText(student?.phone || student?.contactNumber || student?.mobile)}
                      </p>
                    </td>

                    {/* Department */}
                    <td className="px-3 py-3 text-base text-white">
                      {toText(getDepartment(student))}
                    </td>

                    {/* Year */}
                    <td className="px-3 py-3 text-base text-white">
                      {toText(getYear(student))}
                    </td>

                    {/* Delete */}
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => handleDelete(studentId)}
                        className="text-rose-400 transition-colors hover:text-rose-300"
                        aria-label="Delete student"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}