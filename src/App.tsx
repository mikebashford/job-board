import { Routes, Route } from 'react-router-dom'
import JoobleJobsList from './components/JoobleJobsList'
import Header from './components/Header'
import Footer from './components/Footer'

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
                <JoobleJobsList />
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
