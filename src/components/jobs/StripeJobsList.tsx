import React from 'react'
import { useStripeJobs } from '../../hooks/jobs/useStripeJobs'
import type { StripeJob } from '../../hooks/jobs/useStripeJobs'

type StripeJobsListProps = {
  query: string
}

const StripeJobsList: React.FC<StripeJobsListProps> = ({ query }) => {
  const { jobs, loading, error } = useStripeJobs(query)

  if (loading) {
    return <div className="py-4 text-blue-600">Loading Stripe jobs...</div>
  }
  if (error) {
    return <div className="py-4 text-red-600">Error: {error}</div>
  }
  if (!jobs.length) {
    return <div className="py-4 text-gray-500">No Stripe jobs found.</div>
  }

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">Stripe Jobs</h2>
      <ul className="divide-y divide-gray-200">
        {jobs.map((job: StripeJob, idx: number) => (
          <li
            key={job.url + idx}
            className="py-4 flex flex-col md:flex-row md:items-center md:justify-between"
          >
            <div>
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 hover:underline font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"
                tabIndex={0}
                aria-label={`View job: ${job.title} at Stripe`}
              >
                {job.title}
              </a>
              <span className="ml-2 text-sm text-gray-600">({job.team})</span>
            </div>
            <div className="text-sm text-gray-500 mt-1 md:mt-0">{job.location}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default StripeJobsList
