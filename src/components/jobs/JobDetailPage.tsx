import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

// Reuse Job type from JobCard
// If Job type is not exported, redefine here (should be moved to a shared types file)
type JobLocation = {
  city?: string
  state?: string
  country?: string
  zip?: string
}

type Job = {
  sourceId: string
  sourceName: string
  title: string
  companyName: string
  location: JobLocation
  isRemote?: boolean
  description: string
  url?: string
  postedDate?: string | Date
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
  job: Job
}

const JobDetailPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const navigate = useNavigate()

  // Fetch job details
  useEffect(() => {
    if (!jobId) {
      setError('No job ID provided.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    fetch(`http://localhost:4000/api/jobs/${jobId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch job details')
        return res.json()
      })
      .then((data: ApiResponse) => {
        setJob(data.job)
        setError(null)
      })
      .catch(err => {
        setError(err.message)
        setJob(null)
      })
      .finally(() => setLoading(false))
  }, [jobId])

  // Check if job is saved for the user
  useEffect(() => {
    if (!jobId) return
    setSaveError(null)
    fetch('http://localhost:4000/api/users/me/saved-jobs', {
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch saved jobs')
        return res.json()
      })
      .then((data: { jobs: { jobId: string }[] }) => {
        setIsSaved(data.jobs.some(j => j.jobId === jobId))
      })
      .catch(() => {
        // If error, assume not saved (could be unauthenticated)
        setIsSaved(false)
      })
  }, [jobId])

  const handleSaveClick = async () => {
    if (!job) return
    setSaveLoading(true)
    setSaveError(null)
    try {
      if (!isSaved) {
        // Save job
        const res = await fetch('http://localhost:4000/api/users/me/saved-jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ jobId: job.sourceId }),
        })
        if (!res.ok) throw new Error('Failed to save job')
        setIsSaved(true)
      } else {
        // Unsave job
        const res = await fetch(`http://localhost:4000/api/users/me/saved-jobs/${job.sourceId}`, {
          method: 'DELETE',
          credentials: 'include',
        })
        if (!res.ok) throw new Error('Failed to unsave job')
        setIsSaved(false)
      }
    } catch (err: unknown) {
      let message = 'Error saving job'
      if (err instanceof Error) message = err.message
      setSaveError(message)
    } finally {
      setSaveLoading(false)
    }
  }

  const handleReportClick = () => {
    alert('Thank you for reporting this job. We will review it shortly.')
  }

  if (loading) {
    return <div className="p-8 text-blue-700 text-lg">Loading job details...</div>
  }
  if (error) {
    return (
      <div className="p-8 text-red-600">
        Error: {error}
        <button
          className="ml-4 px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    )
  }
  if (!job) {
    return <div className="p-8 text-gray-600">Job not found.</div>
  }

  const locationString = [job.location.city, job.location.state, job.location.country]
    .filter(Boolean)
    .join(', ')
  const postedDate = job.postedDate
    ? typeof job.postedDate === 'string'
      ? new Date(job.postedDate)
      : job.postedDate
    : undefined

  return (
    <main className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8 mt-8 flex flex-col gap-4">
      <h1 className="text-3xl font-bold text-blue-800 mb-2">{job.title}</h1>
      <div className="flex flex-col md:flex-row md:items-center gap-2 text-lg font-medium text-gray-700">
        <span>{job.companyName}</span>
        <span className="hidden md:inline">&bull;</span>
        <span>{locationString}</span>
        {job.isRemote && <span className="ml-2 text-green-600">Remote</span>}
      </div>
      <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-2">
        {job.jobType && <span className="bg-gray-100 rounded px-2 py-0.5">{job.jobType}</span>}
        {job.experienceLevel && (
          <span className="bg-gray-100 rounded px-2 py-0.5">{job.experienceLevel}</span>
        )}
        {job.industry && <span className="bg-gray-100 rounded px-2 py-0.5">{job.industry}</span>}
      </div>
      <div className="text-gray-400 text-sm mb-2">
        {postedDate && <span>Posted: {postedDate.toLocaleDateString()}</span>}
        {job.salaryMin && (
          <span className="ml-4">
            Salary: {job.salaryMin}
            {job.salaryMax ? ` - ${job.salaryMax}` : ''}
            {job.salaryCurrency ? ` ${job.salaryCurrency}` : ''}
          </span>
        )}
      </div>
      <div className="flex gap-4 mb-4">
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Apply to this job (opens in new tab)"
        >
          Apply Now
        </a>
        <button
          type="button"
          onClick={handleSaveClick}
          className={`px-5 py-2 rounded font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-400 ${isSaved ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'} ${saveLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
          aria-label={isSaved ? 'Unsave job' : 'Save job'}
          disabled={saveLoading}
        >
          {saveLoading ? (isSaved ? 'Unsaving...' : 'Saving...') : isSaved ? 'Saved' : 'Save Job'}
        </button>
        <button
          type="button"
          onClick={handleReportClick}
          className="px-5 py-2 rounded bg-red-100 text-red-700 font-semibold shadow hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-label="Report this job as broken or spam"
        >
          Report Job
        </button>
      </div>
      {saveError && <div className="text-red-600 text-sm">{saveError}</div>}
      <section>
        <h2 className="text-xl font-semibold text-blue-700 mb-2">Job Description</h2>
        <div
          className="prose max-w-none text-gray-800"
          dangerouslySetInnerHTML={{ __html: job.description }}
        />
      </section>
      {job.skills && job.skills.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-blue-700 mb-1">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {job.skills.map(skill => (
              <span
                key={skill}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                tabIndex={0}
                aria-label={`Skill: ${skill}`}
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

export default JobDetailPage
