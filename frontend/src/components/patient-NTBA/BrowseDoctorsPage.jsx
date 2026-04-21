import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, SlidersHorizontal } from 'lucide-react'
import DoctorCard from '../../components/patient/DoctorCard'
import EmptyState from '../../components/patient/EmptyState'
import Loader from '../../components/common/Loader'
import { getAllDoctors } from '../../services/patientService'

export default function BrowseDoctorsPage() {
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState([])
  const [filteredDoctors, setFilteredDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const specializations = [
    'All',
    'General Physician',
    'Cardiologist',
    'Dermatologist',
    'Neurologist',
    'Orthopedic',
    'Pediatrician',
    'Psychiatrist',
    'Gynecologist',
    'Dentist',
  ]

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await getAllDoctors()
        setDoctors(data || [])
        setFilteredDoctors(data || [])
      } catch (err) {
        setError('Failed to load doctors. Please try again.')
        console.error('Doctors error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  useEffect(() => {
    let result = [...doctors]

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (doctor) =>
          doctor.firstName?.toLowerCase().includes(query) ||
          doctor.lastName?.toLowerCase().includes(query) ||
          doctor.specialization?.toLowerCase().includes(query)
      )
    }

    if (specialization && specialization !== 'All') {
      result = result.filter((doctor) => doctor.specialization === specialization)
    }

    setFilteredDoctors(result)
  }, [searchQuery, specialization, doctors])

  const handleBookAppointment = (doctor) => {
    navigate('/patient/book', { state: { selectedDoctor: doctor } })
  }

  const handleViewProfile = (doctorId) => {
    navigate(`/patient/doctors/${doctorId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
        <Loader />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => navigate('/patient/dashboard')}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold text-slate-800">Find a Doctor</h1>
          <p className="text-sm text-slate-500">{filteredDoctors.length} doctors available</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or specialization..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium ${
                showFilters
                  ? 'border-brand-500 bg-brand-50 text-brand-600'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Specialization
              </label>
              <div className="flex flex-wrap gap-2">
                {specializations.map((spec) => (
                  <button
                    key={spec}
                    onClick={() => setSpecialization(spec === 'All' ? '' : spec)}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      (spec === 'All' && !specialization) || specialization === spec
                        ? 'bg-brand-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {filteredDoctors.length === 0 ? (
            <EmptyState
              icon="search"
              title="No doctors found"
              description={
                searchQuery || specialization
                  ? 'Try adjusting your search or filters'
                  : 'No doctors are currently available'
              }
              actionText={searchQuery || specialization ? 'Clear Filters' : undefined}
              onAction={() => {
                setSearchQuery('')
                setSpecialization('')
              }}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDoctors.map((doctor) => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  onViewProfile={handleViewProfile}
                  onBookAppointment={handleBookAppointment}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

