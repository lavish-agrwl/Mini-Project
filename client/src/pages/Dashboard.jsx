import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { matchAPI } from "../services/api";

const Dashboard = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await matchAPI.getAll();
      setMatches(response.data.matches);
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMatch = async (id) => {
    if (window.confirm("Are you sure you want to delete this match?")) {
      try {
        await matchAPI.delete(id);
        fetchMatches();
      } catch (error) {
        console.error("Error deleting match:", error);
        alert("Failed to delete match");
      }
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      not_started:
        "bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-sm",
      in_progress:
        "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm animate-pulse",
      finished:
        "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm",
    };
    const labels = {
      not_started: "⏸️ Not Started",
      in_progress: "🔴 Live",
      finished: "✅ Finished",
    };
    return <span className={`badge ${styles[status]}`}>{labels[status]}</span>;
  };

  const getMatchScore = (match) => {
    if (match.status === "not_started") return "Not started";

    let scoreText = "";
    match.innings.forEach((inning, idx) => {
      const teamName = match.teams[inning.battingTeamIndex].name;
      scoreText += `${teamName}: ${inning.totalRuns}/${inning.wickets}`;
      if (idx < match.innings.length - 1) scoreText += " | ";
    });
    return scoreText || "No score yet";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-600 to-purple-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">🏏</span>
                <h1 className="text-3xl font-bold text-white">
                  Cricket Scoreboard
                </h1>
              </div>
              <p className="text-sm text-primary-100 ml-12">
                Welcome back, {user?.name || user?.email}!
              </p>
            </div>
            <button
              onClick={logout}
              className="btn bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
            >
              <span className="mr-2">🚪</span> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>🏆</span> My Matches
          </h2>
          <button
            onClick={() => navigate("/create-match")}
            className="btn btn-primary flex items-center gap-2"
          >
            <span className="text-xl">+</span> Create New Match
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading matches...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 mb-4">
              No matches yet. Create your first match!
            </p>
            <button
              onClick={() => navigate("/create-match")}
              className="btn btn-primary"
            >
              Create Match
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {matches.map((match) => (
              <div
                key={match._id}
                className="card hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-l-4 border-primary-500"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                    {match.name}
                  </h3>
                  {getStatusBadge(match.status)}
                </div>

                <div className="space-y-3 mb-5">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3">
                    <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <span>🏏</span>
                      <span className="font-bold text-primary-600">
                        {match.teams[0].name}
                      </span>
                      <span className="text-gray-400">vs</span>
                      <span className="font-bold text-purple-600">
                        {match.teams[1].name}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>⏱️</span>
                    <span>{match.oversPerInnings} overs per innings</span>
                  </div>
                  <div className="text-sm font-bold text-primary-600">
                    <span>📊</span> {getMatchScore(match)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>📅</span>
                    <span>
                      {new Date(match.matchDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {match.status === "not_started" ? (
                    <>
                      <button
                        onClick={() => navigate(`/match/${match._id}/setup`)}
                        className="btn btn-primary flex-1 text-sm"
                      >
                        <span className="mr-1">▶️</span> Start
                      </button>
                      <button
                        onClick={() => navigate(`/match/${match._id}/edit`)}
                        className="btn btn-secondary text-sm"
                        title="Edit match details"
                      >
                        <span>✏️</span>
                      </button>
                    </>
                  ) : match.status === "in_progress" ? (
                    <button
                      onClick={() => navigate(`/match/${match._id}/live`)}
                      className="btn btn-success flex-1 text-sm"
                    >
                      <span className="mr-1">🔴</span> Continue
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/match/${match._id}/view`)}
                      className="btn btn-secondary flex-1 text-sm"
                    >
                      <span className="mr-1">👁️</span> View
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteMatch(match._id)}
                    className="btn btn-danger text-sm"
                    title="Delete match"
                  >
                    <span>🗑️</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
