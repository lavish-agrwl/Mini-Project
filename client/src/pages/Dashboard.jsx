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
      not_started: "bg-gray-200 text-gray-800",
      in_progress: "bg-blue-200 text-blue-800",
      finished: "bg-green-200 text-green-800",
    };
    const labels = {
      not_started: "Not Started",
      in_progress: "In Progress",
      finished: "Finished",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Cricket Scoreboard
              </h1>
              <p className="text-sm text-gray-600">
                Welcome, {user?.name || user?.email}
              </p>
            </div>
            <button onClick={logout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">My Matches</h2>
          <button
            onClick={() => navigate("/create-match")}
            className="btn btn-primary"
          >
            + Create New Match
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => (
              <div
                key={match._id}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {match.name}
                  </h3>
                  {getStatusBadge(match.status)}
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{match.teams[0].name}</span>{" "}
                    vs{" "}
                    <span className="font-medium">{match.teams[1].name}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    {match.oversPerInnings} overs per innings
                  </p>
                  <p className="text-sm text-primary-600 font-medium">
                    {getMatchScore(match)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(match.matchDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  {match.status === "not_started" ? (
                    <>
                      <button
                        onClick={() => navigate(`/match/${match._id}/setup`)}
                        className="btn btn-primary flex-1"
                      >
                        Start Match
                      </button>
                      <button
                        onClick={() => navigate(`/match/${match._id}/edit`)}
                        className="btn btn-secondary"
                        title="Edit match details"
                      >
                        Edit
                      </button>
                    </>
                  ) : match.status === "in_progress" ? (
                    <button
                      onClick={() => navigate(`/match/${match._id}/live`)}
                      className="btn btn-success flex-1"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/match/${match._id}/view`)}
                      className="btn btn-secondary flex-1"
                    >
                      View Details
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteMatch(match._id)}
                    className="btn btn-danger"
                    title="Delete match"
                  >
                    Delete
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
