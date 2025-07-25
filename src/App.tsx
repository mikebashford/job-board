import { Routes, Route } from 'react-router-dom'
import CombinedJobsList from './components/CombinedJobsList'
import Header from './components/Header'
import Footer from './components/Footer'
import JobDetailPage from './components/jobs/JobDetailPage'

const App = () => {
  // Add job source selector state
  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-blue-50 to-blue-200">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center">
        <Routes>
          <Route
            path="/"
            element={
              <>
                {/* Job Source Selector Tabs */}
                <CombinedJobsList />
              </>
            }
          />
          <Route path="/jooble-jobs" element={<CombinedJobsList />} />
          <Route path="/jobs/:jobId" element={<JobDetailPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
