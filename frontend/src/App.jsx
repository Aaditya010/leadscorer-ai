import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';

function App(){
  return(
    <Router>
      <div className="flex min-h-screen bg-gray-100">
        <aside className="w-64 bg-gray-900 text-white min-h-screen">
          <h2 className="text-2xl font-bold mb-8">Lead Scorer AI</h2>
          <nav>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="block py-2 px-4 hover:bg-gray-700 rounded transition">
                Dashboard</Link>
              </li>
              <li>
                <Link to="/leads" className="block cdpy-2 px-4 hover:bg-gray-700 rounded transition">
                Leads</Link>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<Dashboard/>}/>
            <Route path="/leads" element={<Leads/>}/>
          </Routes>
        </main>


      </div>
    </Router>
  );
}
export default App;