import React from 'react'
import { Link } from 'react-router-dom'

// Normalized job type (adjust import if you have a shared type)
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

type JobCardProps = {
  job: Job
  isSaved?: boolean
  onSave?: (jobId: string) => void
  className?: string
}

const JobCard: React.FC<JobCardProps> = ({ job, isSaved, onSave, className }) => {
  const handleSaveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    e.preventDefault()
    if (onSave) onSave(job.sourceId)
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
    <article
      className={`bg-white rounded-lg shadow p-4 flex flex-col gap-2 transition hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-400 ${className || ''}`}
      tabIndex={0}
      aria-label={`Job: ${job.title} at ${job.companyName}`}
    >
      <div className="flex items-center justify-between gap-2">
        <Link
          to={`/jobs/${job.sourceId}`}
          className="text-xl font-semibold text-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400"
          tabIndex={0}
          aria-label={`View job: ${job.title} at ${job.companyName}`}
        >
          {job.title}
        </Link>
        <button
          type="button"
          onClick={handleSaveClick}
          className={`ml-2 px-3 py-1 rounded text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${isSaved ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
          aria-label={isSaved ? 'Unsave job' : 'Save job'}
        >
          {isSaved ? 'Saved' : 'Save Job'}
        </button>
      </div>
      <div className="text-gray-700 font-medium">{job.companyName}</div>
      <div className="text-gray-500 text-sm">
        {locationString}
        {job.isRemote && <span className="ml-2 text-green-600">Remote</span>}
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-gray-600">
        {job.jobType && <span className="bg-gray-100 rounded px-2 py-0.5">{job.jobType}</span>}
        {job.experienceLevel && (
          <span className="bg-gray-100 rounded px-2 py-0.5">{job.experienceLevel}</span>
        )}
        {job.industry && <span className="bg-gray-100 rounded px-2 py-0.5">{job.industry}</span>}
      </div>
      <div className="text-gray-400 text-xs">
        {postedDate && <span>Posted: {postedDate.toLocaleDateString()}</span>}
        {job.salaryMin && (
          <span className="ml-4">
            Salary: {job.salaryMin}
            {job.salaryMax ? ` - ${job.salaryMax}` : ''}
            {job.salaryCurrency ? ` ${job.salaryCurrency}` : ''}
          </span>
        )}
      </div>
    </article>
  )
}

export default JobCard
