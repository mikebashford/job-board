import { useEffect, useState } from 'react'

export type StripeJob = {
  title: string
  url: string
  team: string
  location: string
}

function isErrorWithMessage(err: unknown): err is { message: string } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    typeof (err as { message: unknown }).message === 'string'
  )
}

export const useStripeJobs = (query: string) => {
  const [jobs, setJobs] = useState<StripeJob[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/jobs/stripe?q=${encodeURIComponent(query)}`)
        if (!res.ok) throw new Error('Failed to fetch Stripe jobs')
        const data = await res.json()
        setJobs(data.jobs || [])
      } catch (err: unknown) {
        if (isErrorWithMessage(err)) {
          setError(err.message)
        } else {
          setError('Unknown error')
        }
        setJobs([])
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [query])

  return { jobs, loading, error }
}
