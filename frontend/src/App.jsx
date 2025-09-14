import { useEffect, useState } from "react";
import axios from "axios";
import { FaSearchengin } from "react-icons/fa";

const API = "https://ai-resumeplayground.onrender.com";

function App() {
  const [profile, setProfile] = useState([]);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    axios.get(`${API}/profile`).then((r) => setProfile(r.data));
    axios.get(`${API}/skills`).then((r) => setSkills(r.data));
    axios.get(`${API}/projects`).then((r) => setProjects(r.data));
  }, []);

  const smartSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/search?q=${search}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  const renderProfile = (data) =>
    data?.length > 0 ? (
      data.map((p, i) => (
        <div key={i} className="mb-4">
          <b>{p.name}</b> ({p.email})<br />
          {p.education}, {p.work}
          <br />
          <a
            href={p.github}
            className="text-blue-400 hover:underline mr-2"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          |
          <a
            href={p.linkedin}
            className="text-blue-400 hover:underline mx-2"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
          |
          <a
            href={p.portfolio}
            className="text-blue-400 hover:underline ml-2"
            target="_blank"
            rel="noreferrer"
          >
            Portfolio
          </a>
        </div>
      ))
    ) : (
      <p>No profile found.</p>
    );

  const renderSkills = (data) =>
    data?.length > 0 ? (
      <ul className="list-disc pl-6 grid grid-cols-2 gap-1">
        {data.map((s, i) => (
          <li key={i}>{s.name}</li>
        ))}
      </ul>
    ) : (
      <p>No skills found.</p>
    );

  const renderProjects = (data) =>
    data?.length > 0 ? (
      <ul className="list-disc pl-6">
        {data.map((p, i) => (
          <li key={i} className="mb-3">
            <b>{p.title}</b>: {p.description} ({p.skill})
            <br />
            <a
              href={p.link}
              className="text-blue-400 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              {p.link}
            </a>
          </li>
        ))}
      </ul>
    ) : (
      <p>No projects found.</p>
    );

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen flex flex-col justify-center items-center p-6">
{/* title */}
      <h1 className="text-4xl font-bold mb-6 flex items-center justify-center">
        <FaSearchengin /> &nbsp; Me-API Playground
      </h1>

{/* search */}
      <div className="flex flex-wrap justify-center gap-3 mb-8 w-full max-w-3xl">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search profile, skills & projects with AI..."
          className="px-4 py-2 rounded-md border border-gray-600 w-80 text-black"
        />
        <button
          onClick={smartSearch}
          className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
        >
          {loading ? "Searching..." : "AI Search"}
        </button>
      </div>

{/* my Data */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-3xl">
        <h2 className="text-2xl font-semibold mb-4">📋 Full Profile</h2>
        {renderProfile(profile)}

        <h2 className="text-2xl font-semibold mt-6 mb-4">🛠 Full Skills</h2>
        {renderSkills(skills)}

        <h2 className="text-2xl font-semibold mt-6 mb-4">📂 Full Projects</h2>
        {renderProjects(projects)}
      </div>

{/* AI Results */}
      {searchResults && (
        <div className="bg-blue-950 mt-8 rounded-lg shadow-lg p-6 w-full max-w-3xl border border-gray-600">
          <h2 className="text-2xl font-semibold mb-4">✨ AI Search Results</h2>

          <h3 className="text-xl font-medium mb-2">Profile</h3>
          {renderProfile(searchResults.profile)}

          <h3 className="text-xl font-medium mt-4 mb-2">Skills</h3>
          {renderSkills(searchResults.skills)}

          <h3 className="text-xl font-medium mt-4 mb-2">Projects</h3>
          {renderProjects(searchResults.projects)}
        </div>
      )}
    </div>
  );
}

export default App;
