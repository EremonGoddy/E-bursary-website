import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from "./components/pages/HomePage"
import AboutPage from './components/pages/AboutPage';
import ServicesPage from './components/pages/ServicesPage';
import ContactPage from './components/pages/ContactPage';


function App() {


  return (
    <Router>
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/about" element={<AboutPage/>} />
        <Route path="/services" element={<ServicesPage/>} />
        <Route path="/contact" element={<ContactPage/>} />
      </Routes>
    </div>
  </Router>
  )
}

export default App
