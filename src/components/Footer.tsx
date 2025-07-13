const Footer = () => (
  <footer className="w-full bg-white border-t mt-8 py-4 text-center text-gray-500 text-sm">
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between px-4">
      <div>&copy; {new Date().getFullYear()} Job Board Aggregator</div>
      <div className="mt-2 md:mt-0">
        <a
          href="https://github.com/mikebashford"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline text-blue-600"
          aria-label="GitHub Repository"
        >
          GitHub
        </a>
      </div>
    </div>
  </footer>
)

export default Footer
