import { useEffect, useState } from 'react'
import JobCard from './jobs/JobCard'

type Job = {
  sourceId: string
  sourceName: string
  title: string
  companyName: string
  location: {
    city?: string
    state?: string
    country?: string
    zip?: string
  }
  isRemote?: boolean
  description: string
  url?: string
  postedDate?: string
  salaryMin?: number
  salaryMax?: number
  salaryCurrency?: string
  jobType?: string
  experienceLevel?: string
  skills: string[]
  industry?: string
  normalizedCompanyName: string
}

type ApiResponse = {
  jobs: Job[]
  totalCount: number
  totalPages: number
  page: number
  pageSize: number
}

const CombinedJobsList = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('developer')
  const [location, setLocation] = useState('')
  const [experience, setExperience] = useState('')
  const [searching, setSearching] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [minSalary, setMinSalary] = useState('')
  const [maxSalary, setMaxSalary] = useState('')
  const [postedWithin, setPostedWithin] = useState('')
  const pageSize = 20

  const fetchJobs = (pageOverride?: number) => {
    setLoading(true)
    setError(null)
    setSearching(true)
    const params = new URLSearchParams({
      keywords: title,
      location,
      page: String(pageOverride ?? page),
      ...(experience ? { experience } : {}),
      ...(minSalary ? { minSalary } : {}),
      ...(maxSalary ? { maxSalary } : {}),
      pageSize: String(pageSize),
      ...(postedWithin ? { postedWithin } : {}),
    })
    fetch(`http://localhost:4000/api/jobs/combined?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch jobs')
        return res.json()
      })
      .then((data: ApiResponse) => {
        setJobs(data.jobs)
        setTotalPages(data.totalPages || 1)
        setPage(data.page || 1)
        setError(null)
      })
      .catch(err => {
        setError(err.message)
        setJobs([])
      })
      .finally(() => {
        setLoading(false)
        setSearching(false)
      })
  }

  useEffect(() => {
    fetchJobs(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchJobs(1)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    fetchJobs(newPage)
  }

  // Generate numbered page buttons (show up to 5 pages around current)
  const getPageNumbers = () => {
    const maxButtons = 5
    let start = Math.max(1, page - Math.floor(maxButtons / 2))
    const end = Math.min(totalPages, start + maxButtons - 1)
    if (end - start < maxButtons - 1) {
      start = Math.max(1, end - maxButtons + 1)
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  return (
    <div className="w-full mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-blue-800">All Jobs</h2>
      <form
        className="flex flex-col md:flex-row gap-4 mb-8 items-end bg-white p-4 rounded shadow"
        onSubmit={handleSubmit}
        aria-label="Job search form"
      >
        <div className="flex flex-col w-full md:w-1/2">
          <label htmlFor="job-title" className="text-sm font-medium text-gray-700 mb-1">
            Job Title
          </label>
          <input
            id="job-title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="e.g. developer, engineer"
            aria-label="Job title"
          />
        </div>
        <div className="flex flex-col w-full md:w-1/2">
          <label htmlFor="location" className="text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="e.g. New York, Remote"
            aria-label="Location"
          />
        </div>
        <div className="flex flex-col w-full md:w-1/2">
          <label htmlFor="experience" className="text-sm font-medium text-gray-700 mb-1">
            Years of Experience
          </label>
          <select
            id="experience"
            value={experience}
            onChange={e => setExperience(e.target.value)}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Years of experience"
          >
            <option value="">Any</option>
            <option value="0">0 years</option>
            <option value="<3">&lt;3 years</option>
            <option value="3-5">3-5 years</option>
            <option value="5+">5+ years</option>
          </select>
        </div>
        <div className="flex flex-col w-full md:w-1/2">
          <label htmlFor="min-salary" className="text-sm font-medium text-gray-700 mb-1">
            Minimum Salary
          </label>
          <input
            id="min-salary"
            type="number"
            value={minSalary}
            onChange={e => setMinSalary(e.target.value)}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="e.g. 50000"
            aria-label="Minimum salary"
            min="0"
          />
        </div>
        <div className="flex flex-col w-full md:w-1/2">
          <label htmlFor="max-salary" className="text-sm font-medium text-gray-700 mb-1">
            Maximum Salary
          </label>
          <input
            id="max-salary"
            type="number"
            value={maxSalary}
            onChange={e => setMaxSalary(e.target.value)}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="e.g. 120000"
            aria-label="Maximum salary"
            min="0"
          />
        </div>
        <div className="flex flex-col w-full md:w-1/5">
          <label htmlFor="posted-within" className="text-sm font-medium text-gray-700 mb-1">
            Posted Within
          </label>
          <select
            id="posted-within"
            value={postedWithin}
            onChange={e => setPostedWithin(e.target.value)}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Posted within"
          >
            <option value="">Any time</option>
            <option value="0">Recently (today)</option>
            <option value="3">Within 3 days</option>
            <option value="7">Within 7 days</option>
            <option value="30">Within a month</option>
          </select>
        </div>
        <div className="flex flex-col w-full md:w-1/2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 w-full"
            disabled={searching}
            aria-label="Search jobs"
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
      {loading ? (
        <div className="text-blue-700 text-lg">Loading jobs...</div>
      ) : error ? (
        <div className="text-red-600">Error: {error}</div>
      ) : jobs.length === 0 ? (
        <div className="text-gray-600">No jobs found.</div>
      ) : (
        <>
          <ul className="space-y-4 mb-8">
            {jobs.map(job => (
              <li key={job.sourceId + job.sourceName}>
                <JobCard job={job} />
              </li>
            ))}
          </ul>
          {/* Pagination Controls */}
          <nav className="flex justify-center items-center gap-2 mb-4" aria-label="Pagination">
            <button
              className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold disabled:opacity-50"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              aria-label="Previous page"
            >
              Previous
            </button>
            {getPageNumbers().map(num => (
              <button
                key={num}
                className={`px-3 py-1 rounded font-semibold ${num === page ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                onClick={() => handlePageChange(num)}
                aria-current={num === page ? 'page' : undefined}
              >
                {num}
              </button>
            ))}
            <button
              className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold disabled:opacity-50"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              aria-label="Next page"
            >
              Next
            </button>
          </nav>
          <div className="text-center text-gray-500 text-sm">
            Page {page} of {totalPages}
          </div>
        </>
      )}
    </div>
  )
}

export default CombinedJobsList
