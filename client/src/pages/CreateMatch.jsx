import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { matchAPI } from "../services/api";

const CreateMatch = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [matchData, setMatchData] = useState({
    name: "",
    oversPerInnings: 20,
    matchDate: new Date().toISOString().split("T")[0],
    notes: "",
    teams: [
      { name: "", players: [""] },
      { name: "", players: [""] },
    ],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMatchInfoSubmit = (e) => {
    e.preventDefault();
    if (!matchData.name.trim()) {
      setError("Match name is required");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleTeamNameChange = (teamIndex, value) => {
    const newTeams = [...matchData.teams];
    newTeams[teamIndex].name = value;
    setMatchData({ ...matchData, teams: newTeams });
  };

  const handlePlayerNameChange = (teamIndex, playerIndex, value) => {
    const newTeams = [...matchData.teams];
    newTeams[teamIndex].players[playerIndex] = value;
    setMatchData({ ...matchData, teams: newTeams });
  };

  const addPlayer = (teamIndex) => {
    const newTeams = [...matchData.teams];
    newTeams[teamIndex].players.push("");
    setMatchData({ ...matchData, teams: newTeams });
  };

  const removePlayer = (teamIndex, playerIndex) => {
    const newTeams = [...matchData.teams];
    if (newTeams[teamIndex].players.length > 1) {
      newTeams[teamIndex].players.splice(playerIndex, 1);
      setMatchData({ ...matchData, teams: newTeams });
    }
  };

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    setError("");

    // Validate teams
    if (!matchData.teams[0].name.trim() || !matchData.teams[1].name.trim()) {
      setError("Both team names are required");
      return;
    }

    // Filter out empty player names and validate
    const teams = matchData.teams.map((team) => ({
      name: team.name.trim(),
      players: team.players
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
        .map((name) => ({ name })),
    }));

    if (teams[0].players.length < 1 || teams[1].players.length < 1) {
      setError("Each team must have at least 1 player");
      return;
    }

    setLoading(true);

    try {
      const response = await matchAPI.create({
        name: matchData.name,
        oversPerInnings: parseInt(matchData.oversPerInnings),
        matchDate: matchData.matchDate,
        notes: matchData.notes,
        teams,
      });

      navigate(`/match/${response.data.match._id}/setup`);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create match");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Create New Match
          </h1>

          {/* Step Indicator */}
          <div className="flex items-center mb-8">
            <div
              className={`flex items-center ${
                step >= 1 ? "text-primary-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 1 ? "bg-primary-600 text-white" : "bg-gray-300"
                }`}
              >
                1
              </div>
              <span className="ml-2 font-medium">Match Info</span>
            </div>
            <div className="flex-1 h-1 mx-4 bg-gray-300"></div>
            <div
              className={`flex items-center ${
                step >= 2 ? "text-primary-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 2 ? "bg-primary-600 text-white" : "bg-gray-300"
                }`}
              >
                2
              </div>
              <span className="ml-2 font-medium">Teams & Players</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleMatchInfoSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Match Name *
                </label>
                <input
                  type="text"
                  value={matchData.name}
                  onChange={(e) =>
                    setMatchData({ ...matchData, name: e.target.value })
                  }
                  className="input"
                  placeholder="e.g., India vs Australia"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Overs per Innings *
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={matchData.oversPerInnings}
                  onChange={(e) =>
                    setMatchData({
                      ...matchData,
                      oversPerInnings: e.target.value,
                    })
                  }
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Match Date
                </label>
                <input
                  type="date"
                  value={matchData.matchDate}
                  onChange={(e) =>
                    setMatchData({ ...matchData, matchDate: e.target.value })
                  }
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={matchData.notes}
                  onChange={(e) =>
                    setMatchData({ ...matchData, notes: e.target.value })
                  }
                  className="input"
                  rows="3"
                  placeholder="Any additional notes about the match"
                />
              </div>

              <button type="submit" className="btn btn-primary w-full">
                Next: Add Teams
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreateMatch} className="space-y-6">
              {/* Team 1 */}
              <div className="border-2 border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Team 1</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    value={matchData.teams[0].name}
                    onChange={(e) => handleTeamNameChange(0, e.target.value)}
                    className="input"
                    placeholder="e.g., India"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Players (minimum 1) *
                  </label>
                  {matchData.teams[0].players.map((player, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={player}
                        onChange={(e) =>
                          handlePlayerNameChange(0, idx, e.target.value)
                        }
                        className="input flex-1"
                        placeholder={`Player ${idx + 1} name`}
                      />
                      {matchData.teams[0].players.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePlayer(0, idx)}
                          className="btn btn-danger"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addPlayer(0)}
                    className="btn btn-secondary mt-2"
                  >
                    + Add Player
                  </button>
                </div>
              </div>

              {/* Team 2 */}
              <div className="border-2 border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Team 2</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    value={matchData.teams[1].name}
                    onChange={(e) => handleTeamNameChange(1, e.target.value)}
                    className="input"
                    placeholder="e.g., Australia"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Players (minimum 1) *
                  </label>
                  {matchData.teams[1].players.map((player, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={player}
                        onChange={(e) =>
                          handlePlayerNameChange(1, idx, e.target.value)
                        }
                        className="input flex-1"
                        placeholder={`Player ${idx + 1} name`}
                      />
                      {matchData.teams[1].players.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePlayer(1, idx)}
                          className="btn btn-danger"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addPlayer(1)}
                    className="btn btn-secondary mt-2"
                  >
                    + Add Player
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn btn-secondary flex-1"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary flex-1"
                >
                  {loading ? "Creating..." : "Create Match"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateMatch;
