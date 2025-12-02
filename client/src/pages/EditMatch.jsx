import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { matchAPI } from "../services/api";

const EditMatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [matchData, setMatchData] = useState({
    name: "",
    oversPerInnings: 20,
    matchDate: "",
    notes: "",
    teams: [
      { name: "", players: [{ name: "" }] },
      { name: "", players: [{ name: "" }] },
    ],
  });

  const [canEditStructure, setCanEditStructure] = useState(true);

  useEffect(() => {
    fetchMatch();
  }, [id]);

  const fetchMatch = async () => {
    try {
      const response = await matchAPI.get(id);
      const match = response.data.match;

      // Check if match has started
      setCanEditStructure(match.status === "not_started");

      setMatchData({
        name: match.name,
        oversPerInnings: match.oversPerInnings,
        matchDate: match.matchDate
          ? new Date(match.matchDate).toISOString().split("T")[0]
          : "",
        notes: match.notes || "",
        teams: match.teams.map((team) => ({
          name: team.name,
          players: team.players.map((p) => ({ name: p.name })),
        })),
      });
    } catch (error) {
      console.error("Error fetching match:", error);
      setError("Failed to load match details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const updateData = {
        name: matchData.name,
        notes: matchData.notes,
        matchDate: matchData.matchDate,
      };

      // Only send teams and overs if match hasn't started
      if (canEditStructure) {
        updateData.teams = matchData.teams;
        updateData.oversPerInnings = matchData.oversPerInnings;
      }

      await matchAPI.update(id, updateData);
      navigate("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to update match details"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleTeamNameChange = (teamIndex, value) => {
    const newTeams = [...matchData.teams];
    newTeams[teamIndex].name = value;
    setMatchData({ ...matchData, teams: newTeams });
  };

  const handlePlayerNameChange = (teamIndex, playerIndex, value) => {
    const newTeams = [...matchData.teams];
    newTeams[teamIndex].players[playerIndex].name = value;
    setMatchData({ ...matchData, teams: newTeams });
  };

  const addPlayer = (teamIndex) => {
    const newTeams = [...matchData.teams];
    newTeams[teamIndex].players.push({ name: "" });
    setMatchData({ ...matchData, teams: newTeams });
  };

  const removePlayer = (teamIndex, playerIndex) => {
    const newTeams = [...matchData.teams];
    if (newTeams[teamIndex].players.length > 1) {
      newTeams[teamIndex].players.splice(playerIndex, 1);
      setMatchData({ ...matchData, teams: newTeams });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading match details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
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
            Edit Match Details
          </h1>

          {!canEditStructure && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
              <p className="font-medium">Match has started</p>
              <p className="text-sm mt-1">
                You can only edit the match name, date, and notes. Teams and
                overs cannot be changed once a match has started.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Match Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Match Name *
              </label>
              <input
                type="text"
                value={matchData.name}
                onChange={(e) =>
                  setMatchData({ ...matchData, name: e.target.value })
                }
                required
                className="input"
                placeholder="e.g., India vs Australia - T20 Match"
              />
            </div>

            {/* Match Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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

            {/* Overs Per Innings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overs Per Innings *
              </label>
              <input
                type="number"
                value={matchData.oversPerInnings}
                onChange={(e) =>
                  setMatchData({
                    ...matchData,
                    oversPerInnings: parseInt(e.target.value) || 1,
                  })
                }
                required
                min="1"
                max="50"
                disabled={!canEditStructure}
                className="input disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {!canEditStructure && (
                <p className="text-sm text-gray-500 mt-1">
                  Cannot be changed after match starts
                </p>
              )}
            </div>

            {/* Teams */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Teams</h2>

              {matchData.teams.map((team, teamIndex) => (
                <div key={teamIndex} className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Team {teamIndex + 1}
                  </h3>

                  {/* Team Name */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Team Name *
                    </label>
                    <input
                      type="text"
                      value={team.name}
                      onChange={(e) =>
                        handleTeamNameChange(teamIndex, e.target.value)
                      }
                      required
                      disabled={!canEditStructure}
                      className="input disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder={`Team ${teamIndex + 1} name`}
                    />
                  </div>

                  {/* Players */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Players *
                    </label>
                    <div className="space-y-2">
                      {team.players.map((player, playerIndex) => (
                        <div key={playerIndex} className="flex gap-2">
                          <input
                            type="text"
                            value={player.name}
                            onChange={(e) =>
                              handlePlayerNameChange(
                                teamIndex,
                                playerIndex,
                                e.target.value
                              )
                            }
                            required
                            disabled={!canEditStructure}
                            className="input flex-1 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            placeholder={`Player ${playerIndex + 1} name`}
                          />
                          {canEditStructure && team.players.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removePlayer(teamIndex, playerIndex)
                              }
                              className="btn btn-secondary"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {canEditStructure && (
                      <button
                        type="button"
                        onClick={() => addPlayer(teamIndex)}
                        className="btn btn-secondary mt-2"
                      >
                        + Add Player
                      </button>
                    )}
                    {!canEditStructure && (
                      <p className="text-sm text-gray-500 mt-2">
                        Cannot be changed after match starts
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={matchData.notes}
                onChange={(e) =>
                  setMatchData({ ...matchData, notes: e.target.value })
                }
                className="input"
                rows="3"
                placeholder="Add any additional notes about this match..."
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary flex-1"
              >
                {submitting ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditMatch;
