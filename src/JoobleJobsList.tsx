import { useEffect, useState } from 'react'

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

const JoobleJobsList = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch('http://localhost:4000/api/jobs/jooble')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch jobs')
        return res.json()
      })
      .then(data => {
        setJobs(data)
        setError(null)
      })
      .catch(err => {
        setError(err.message)
        setJobs([])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-blue-700 text-lg">Loading Jooble jobs...</div>
  if (error) return <div className="text-red-600">Error: {error}</div>

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-blue-800">Jooble Jobs</h2>
      {jobs.length === 0 ? (
        <div className="text-gray-600">No jobs found.</div>
      ) : (
        <ul className="space-y-4">
          {jobs.map(job => (
            <li key={job.sourceId} className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl font-semibold text-blue-700 hover:underline"
                tabIndex={0}
                aria-label={`View job: ${job.title} at ${job.companyName}`}
              >
                {job.title}
              </a>
              <div className="text-gray-700 font-medium">{job.companyName}</div>
              <div className="text-gray-500 text-sm">
                {job.location.city}
                {job.location.state ? `, ${job.location.state}` : ''}
                {job.location.country ? `, ${job.location.country}` : ''}
                {job.isRemote && <span className="ml-2 text-green-600">Remote</span>}
              </div>
              {job.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {job.skills.map(skill => (
                    <span
                      key={skill}
                      className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
              <div
                className="text-gray-600 text-sm line-clamp-2"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default JoobleJobsList
