import React, { useEffect, useMemo, useState } from 'react'
import { Search, Mail, Phone, Trash2, Plus, X, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { createStudentUser, generateStudentUsername, getALlstudent, getAllUsers } from '../../api/api'

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

const getEntityUserKey = (entity) =>
  String(entity?.userId || entity?.user_id || entity?.id || '')

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

const getBatch = (student) =>
  student?.batch ??
  student?.academicBatch ??
  student?.batchYear ??
  student?.intake ??
  student?.batch_no ??
  'N/A'

const getYear = (student) => {
  const value =
    student?.year ??
    student?.studyYear ??
    student?.academicYear ??
    student?.yearOfStudy ??
    student?.level
  return value === null || value === undefined || value === '' ? 'N/A' : value
}

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

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

const DEPARTMENT_OPTIONS = [
  { value: 'ICT', label: 'ICT' },
  { value: 'BST', label: 'BST' },
  { value: 'ET', label: 'ET' },
]

export default function StudentManagement() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('ALL')
  const [selectedYear, setSelectedYear] = useState('ALL')
  const [isOpen, setIsOpen] = useState(false)
  const [usernameLoading, setUsernameLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    username: '',
    password: '',
    department: '',
    email: '',
    batch: '',
  })
  const [formError, setFormError] = useState('')

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)
        setError('')
        const [stuRes, usrRes] = await Promise.allSettled([
          getALlstudent(),
          getAllUsers(),
        ])

        const studentsData = stuRes.status === 'fulfilled' ? getListFromResponse(stuRes.value) : []
        const usersData = usrRes.status === 'fulfilled' ? getListFromResponse(usrRes.value) : []

        const usersById = new Map(usersData.map((user) => [getEntityUserKey(user), user]))

        const mergedStudents = studentsData.map((student) => {
          const relatedUser = usersById.get(getEntityUserKey(student))
          return {
            ...relatedUser,
            ...student,
            username: student?.username ?? relatedUser?.username,
            fullName: student?.fullName ?? student?.fullname ?? relatedUser?.fullName ?? relatedUser?.fullname ?? relatedUser?.name,
            email: student?.email ?? relatedUser?.email,
            department: student?.department ?? relatedUser?.department,
            batch: student?.batch ?? relatedUser?.batch,
            year: student?.year ?? relatedUser?.year,
          }
        })

        if (mergedStudents.length > 0) {
          setStudents(mergedStudents)
        } else {
          setStudents(usersData.filter((user) => isStudentUser(user)))
        }
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

  const updateForm = (event) => {
    const { name, value } = event.target
    setFormError('')
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const openAddStudentModal = async () => {
    setIsOpen(true)
    setFormError('')
    setUsernameLoading(true)
    setForm((prev) => ({
      ...prev,
      username: '',
    }))

    try {
      const response = await generateStudentUsername('STUDENT')
      const generatedUsername = response?.data ?? response?.username ?? ''

      if (!generatedUsername) {
        throw new Error('Username was not returned by the server.')
      }

      setForm((prev) => ({
        ...prev,
        username: String(generatedUsername),
      }))
    } catch (err) {
      console.error('Failed to generate username:', err)
      setFormError('Failed to generate username. Please try again.')
    } finally {
      setUsernameLoading(false)
    }
  }

  const handleAddStudent = async (event) => {
    event.preventDefault()

    const username = form.username.trim()
    const password = form.password.trim()
    const department = form.department.trim()
    const email = form.email.trim()
    const batch = form.batch.trim()

    if (usernameLoading || !username) {
      return
    }

    if (!password || !department || !email || !batch) {
      setFormError('Please fill all fields.')
      return
    }

    if (!/^\d+$/.test(batch)) {
      setFormError('Batch must be an integer value.')
      return
    }

    if (!isValidEmail(email)) {
      setFormError('Please enter a valid email address.')
      return
    }

    try {
      setSubmitting(true)
      setFormError('')

      const payload = {
        username,
        password,
        department,
        email,
        batch: Number(batch),
        year: 1,
        role: 'STUDENT',
      }

      const response = await createStudentUser(payload)
      const createdStudent = response?.data || response
      const normalizedStudent = {
        ...createdStudent,
        username: createdStudent?.username ?? username,
        fullName: createdStudent?.fullName ?? createdStudent?.name ?? username,
        department: createdStudent?.department ?? department,
        email: createdStudent?.email ?? email,
        batch: createdStudent?.batch ?? Number(batch),
        year: createdStudent?.year ?? 1,
      }

      if (createdStudent) {
        setStudents((prev) => [normalizedStudent, ...prev])
      }

      toast.success(response?.message || 'Student created successfully')

      setForm({ username: '', password: '', department: '', email: '', batch: '' })
      setIsOpen(false)
    } catch (err) {
      console.error('Failed to create student:', err)
      const errorMessage = err?.response?.data?.message || 'Failed to create student. Please try again.'
      setFormError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
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
          onClick={openAddStudentModal}
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
              <col className="w-[24%]" />
              <col className="w-[30%]" />
              <col className="w-[14%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[8%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-white/14 bg-[#103459]">
                <th className="px-3 py-3 text-left text-base font-semibold text-white/70">Student Info</th>
                <th className="px-3 py-3 text-left text-base font-semibold text-white/70">Contact</th>
                <th className="px-3 py-3 text-left text-base font-semibold text-white/70">Department</th>
                <th className="px-3 py-3 text-left text-base font-semibold text-white/70">Batch</th>
                <th className="px-3 py-3 text-left text-base font-semibold text-white/70">Year</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-white/65">
                    Loading students...
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-rose-300">{error}</td>
                </tr>
              )}
              {!loading && !error && filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-white/65">
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
                    <td className="px-3 py-3 text-base text-white">
                      {toText(getDepartment(student))}
                    </td>
                    <td className="px-3 py-3 text-base text-white">
                      {toText(getBatch(student))}
                    </td>
                    <td className="px-3 py-3 text-base text-white">
                      {toText(getYear(student))}
                    </td>
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

      {/* Modern Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-[#081a31] shadow-2xl ring-1 ring-white/10">

            {/* Modal header with gold accent bar */}
            <div className="relative border-b border-white/10 bg-[#0e2a4a] px-6 py-5">
              <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-[#d7b430]" />
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Add New Student</h2>
                  <p className="mt-0.5 text-sm text-white/50">Fill in the details to register a student</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="ml-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal body */}
            <form className="px-6 py-5 space-y-4" onSubmit={handleAddStudent}>

              {/* Username — read-only */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-widest text-white/40">
                  Username
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0a2240] px-4 py-2.5">
                  <span className={`flex-1 text-sm ${usernameLoading ? 'animate-pulse text-white/30' : form.username ? 'text-[#d7b430]' : 'text-white/30'}`}>
                    {usernameLoading ? 'Generating…' : form.username || 'Auto-generated'}
                  </span>
                  {usernameLoading && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#d7b430]/30 border-t-[#d7b430]" />
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-widest text-white/40" htmlFor="student-password">
                  Password
                </label>
                <input
                  id="student-password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={updateForm}
                  placeholder="Enter password"
                  className="w-full rounded-xl border border-white/10 bg-[#0a2240] px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition-all focus:border-[#d7b430]/60 focus:bg-[#0d2a4e]"
                  required
                />
              </div>

              {/* Department — select */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-widest text-white/40" htmlFor="student-department">
                  Department
                </label>
                <div className="relative">
                  <select
                    id="student-department"
                    name="department"
                    value={form.department}
                    onChange={updateForm}
                    className="w-full appearance-none rounded-xl border border-white/10 bg-[#0a2240] px-4 py-2.5 text-sm text-white outline-none transition-all focus:border-[#d7b430]/60 focus:bg-[#0d2a4e]"
                    required
                  >
                    <option value="" disabled>Select department</option>
                    {DEPARTMENT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/35"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-widest text-white/40" htmlFor="student-email">
                  Email
                </label>
                <input
                  id="student-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={updateForm}
                  placeholder="student@example.com"
                  className="w-full rounded-xl border border-white/10 bg-[#0a2240] px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition-all focus:border-[#d7b430]/60 focus:bg-[#0d2a4e]"
                  required
                />
              </div>

              {/* Batch */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-widest text-white/40" htmlFor="student-batch">
                  Batch
                </label>
                <input
                  id="student-batch"
                  name="batch"
                  type="number"
                  min="1"
                  step="1"
                  value={form.batch}
                  onChange={updateForm}
                  placeholder="e.g. 2024"
                  className="w-full rounded-xl border border-white/10 bg-[#0a2240] px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition-all focus:border-[#d7b430]/60 focus:bg-[#0d2a4e]"
                  required
                />
              </div>

              {/* Error */}
              {formError && (
                <div className="flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2.5">
                  <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-400" />
                  <p className="text-sm text-rose-300">{formError}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 rounded-xl border border-white/15 py-2.5 text-sm font-semibold text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  disabled={usernameLoading || !form.username || submitting}
                  type="submit"
                  className="flex-1 rounded-xl bg-[#d7b430] py-2.5 text-sm font-bold text-[#081a31] transition-all hover:bg-[#e4c553] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving…' : 'Add '}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
