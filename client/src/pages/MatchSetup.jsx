import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { matchAPI } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import TeamVsDisplay from "../components/TeamVsDisplay";

const MatchSetup = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [battingTeamIndex, setBattingTeamIndex] = useState(0);
  const [striker, setStriker] = useState("");
  const [nonStriker, setNonStriker] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatch();
  }, [id]);

  const fetchMatch = async () => {
    try {
      const response = await matchAPI.getOne(id);
      setMatch(response.data.match);

      // Set default players if available
      const team = response.data.match.teams[0];
      if (team.players.length >= 2) {
        setStriker(team.players[0]._id);
        setNonStriker(team.players[1]._id);
      }
    } catch (error) {
      setError("Failed to load match");
    } finally {
      setLoading(false);
    }
  };

  const handleStartMatch = async () => {
    if (!striker || !nonStriker) {
      setError("Please select both opening batsmen");
      return;
    }

    if (striker === nonStriker) {
      setError("Please select different batsmen");
      return;
    }

    setError("");

    try {
      await matchAPI.start(id, {
        battingTeamIndex,
        strikerId: striker,
        nonStrikerId: nonStriker,
      });

      navigate(`/match/${id}/live`);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to start match");
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading match..." />;
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">Match not found</p>
      </div>
    );
  }

  const battingTeam = match.teams[battingTeamIndex];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {match.name}
          </h1>
          <p className="text-gray-600 mb-6">Setup match to begin scoring</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Which team will bat first?
              </label>
              <div className="grid grid-cols-2 gap-4">
                {match.teams.map((team, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setBattingTeamIndex(idx);
                      // Reset player selection when team changes
                      if (team.players.length >= 2) {
                        setStriker(team.players[0]._id);
                        setNonStriker(team.players[1]._id);
                      }
                    }}
                    className={`p-4 border-2 rounded-lg font-medium transition-all ${
                      battingTeamIndex === idx
                        ? "border-primary-600 bg-primary-50 text-primary-700"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {team.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opening Batsman (Striker)
              </label>
              <select
                value={striker}
                onChange={(e) => setStriker(e.target.value)}
                className="input"
              >
                <option value="">Select striker</option>
                {battingTeam.players.map((player) => (
                  <option key={player._id} value={player._id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opening Batsman (Non-Striker)
              </label>
              <select
                value={nonStriker}
                onChange={(e) => setNonStriker(e.target.value)}
                className="input"
              >
                <option value="">Select non-striker</option>
                {battingTeam.players.map((player) => (
                  <option key={player._id} value={player._id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleStartMatch}
              className="btn btn-primary w-full"
            >
              Start Match
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchSetup;
