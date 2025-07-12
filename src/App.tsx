import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import JoobleJobsList from './components/JoobleJobsList'
import Header from './components/Header'
import Footer from './components/Footer'
import MuseJobsList from './components/MuseJobsList'

const App = () => {
  // Add job source selector state
  const [jobSource, setJobSource] = useState<'jooble' | 'muse'>('jooble')

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
                <div className="flex gap-4 mb-8">
                  <button
                    className={`px-6 py-2 rounded-lg font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-colors ${jobSource === 'jooble' ? 'bg-blue-600 text-white' : 'bg-white text-blue-700 hover:bg-blue-100'}`}
                    onClick={() => setJobSource('jooble')}
                    aria-label="Show Jooble jobs"
                    aria-current={jobSource === 'jooble' ? 'page' : undefined}
                  >
                    Jooble
                  </button>
                  <button
                    className={`px-6 py-2 rounded-lg font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-colors ${jobSource === 'muse' ? 'bg-blue-600 text-white' : 'bg-white text-blue-700 hover:bg-blue-100'}`}
                    onClick={() => setJobSource('muse')}
                    aria-label="Show The Muse jobs"
                    aria-current={jobSource === 'muse' ? 'page' : undefined}
                  >
                    The Muse
                  </button>
                </div>
                {jobSource === 'jooble' ? <JoobleJobsList /> : <MuseJobsList />}
              </>
            }
          />
          <Route path="/jooble-jobs" element={<JoobleJobsList />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
