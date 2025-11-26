import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { matchAPI } from "../services/api";

const MatchView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingBall, setEditingBall] = useState(null);
  const [editFormData, setEditFormData] = useState({
    eventType: "runs",
    runs: 0,
    notes: "",
  });

  useEffect(() => {
    fetchMatch();
  }, [id]);

  const fetchMatch = async () => {
    try {
      const response = await matchAPI.getOne(id);
      setMatch(response.data.match);
    } catch (error) {
      console.error("Error fetching match:", error);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (ball) => {
    setEditingBall(ball);
    setEditFormData({
      eventType: ball.eventType,
      runs: ball.runs,
      notes: ball.notes || "",
    });
  };

  const closeEditModal = () => {
    setEditingBall(null);
    setEditFormData({ eventType: "runs", runs: 0, notes: "" });
  };

  const handleEditBall = async (e) => {
    e.preventDefault();

    try {
      const response = await matchAPI.editBall(
        id,
        editingBall._id,
        editFormData
      );
      setMatch(response.data.match);
      closeEditModal();
      alert("Ball updated successfully. Scores have been recalculated.");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update ball");
    }
  };

  const getWinner = () => {
    if (match.status !== "finished" || match.innings.length < 2) return null;

    const firstInningRuns = match.innings[0].totalRuns;
    const secondInningRuns = match.innings[1].totalRuns;

    if (secondInningRuns > firstInningRuns) {
      return {
        team: match.teams[match.innings[1].battingTeamIndex].name,
        margin: `${
          match.teams[match.innings[1].battingTeamIndex].players.length -
          match.innings[1].wickets -
          1
        } wickets`,
      };
    } else if (firstInningRuns > secondInningRuns) {
      return {
        team: match.teams[match.innings[0].battingTeamIndex].name,
        margin: `${firstInningRuns - secondInningRuns} runs`,
      };
    } else {
      return { team: "Match Tied", margin: "" };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading match...</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">Match not found</p>
      </div>
    );
  }

  const winner = getWinner();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-primary-600 hover:text-primary-700 font-medium mb-4"
          >
            ← Back to Dashboard
          </button>

          <div className="card">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {match.name}
                </h1>
                <p className="text-gray-600">
                  {match.teams[0].name} vs {match.teams[1].name}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(match.matchDate).toLocaleDateString()} •{" "}
                  {match.oversPerInnings} overs
                </p>
              </div>
              <div className="text-right">
                {match.status === "finished" && winner && (
                  <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                    <p className="font-bold">{winner.team} Won</p>
                    {winner.margin && (
                      <p className="text-sm">by {winner.margin}</p>
                    )}
                  </div>
                )}
                {match.status === "in_progress" && (
                  <button
                    onClick={() => navigate(`/match/${id}/live`)}
                    className="btn btn-success"
                  >
                    Continue Match
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Innings Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {match.innings.map((inning, inningIdx) => {
            const team = match.teams[inning.battingTeamIndex];
            return (
              <div key={inningIdx} className="card">
                <h2 className="text-xl font-bold mb-4">
                  Inning {inningIdx + 1} - {team.name}
                </h2>

                <div className="text-4xl font-bold text-primary-600 mb-4">
                  {inning.totalRuns}/{inning.wickets}
                </div>

                <div className="text-sm text-gray-600 mb-4">
                  Overs: {inning.oversCompleted.toFixed(1)} | Run Rate:{" "}
                  {inning.oversCompleted > 0
                    ? (inning.totalRuns / inning.oversCompleted).toFixed(2)
                    : "0.00"}
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Batting Summary</h3>
                  <div className="space-y-1">
                    {team.players.map((player) => (
                      <div
                        key={player._id}
                        className="flex justify-between text-sm"
                      >
                        <span
                          className={
                            player.isOut ? "text-gray-500" : "font-medium"
                          }
                        >
                          {player.name} {player.isOut && "(Out)"}
                        </span>
                        <span>
                          {player.runs} ({player.ballsFaced})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ball-by-Ball History */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Ball-by-Ball Commentary</h2>

          {match.innings.map((inning, inningIdx) => {
            const team = match.teams[inning.battingTeamIndex];
            return (
              <div key={inningIdx} className="mb-8">
                <h3 className="text-lg font-semibold mb-3 text-primary-700">
                  Inning {inningIdx + 1} - {team.name} Batting
                </h3>

                {inning.balls.length === 0 ? (
                  <p className="text-gray-500">No balls recorded</p>
                ) : (
                  <div className="space-y-2">
                    {inning.balls.map((ball, ballIdx) => {
                      const batsman = team.players.find(
                        (p) => p._id === ball.batsmanId
                      );
                      return (
                        <div
                          key={ball._id}
                          className="flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-4">
                              <span className="font-mono text-sm font-medium text-gray-700">
                                {ball.overNumber}.{ball.ballInOver}
                              </span>
                              <span className="text-sm text-gray-600">
                                {batsman?.name || "Unknown"}
                              </span>
                              <span
                                className={`font-bold ${
                                  ball.eventType === "wicket"
                                    ? "text-red-600"
                                    : ball.runs >= 4
                                    ? "text-green-600"
                                    : "text-gray-900"
                                }`}
                              >
                                {ball.eventType === "wicket"
                                  ? "⚠️ WICKET"
                                  : ball.eventType === "wide"
                                  ? `Wide + ${ball.runs}`
                                  : ball.eventType === "no-ball"
                                  ? `No Ball + ${ball.runs}`
                                  : ball.eventType === "bye"
                                  ? `Bye ${ball.runs}`
                                  : ball.eventType === "leg-bye"
                                  ? `Leg Bye ${ball.runs}`
                                  : `${ball.runs} ${
                                      ball.runs === 4
                                        ? "🏏"
                                        : ball.runs === 6
                                        ? "🎯"
                                        : ""
                                    }`}
                              </span>
                            </div>
                            {ball.notes && (
                              <p className="text-xs text-gray-600 mt-1 ml-20">
                                {ball.notes}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => openEditModal(ball)}
                            className="btn btn-secondary text-sm"
                          >
                            Edit
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Ball Modal */}
      {editingBall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Edit Ball</h3>
            <p className="text-sm text-gray-600 mb-4">
              Over {editingBall.overNumber}.{editingBall.ballInOver}
            </p>

            <form onSubmit={handleEditBall} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type
                </label>
                <select
                  value={editFormData.eventType}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      eventType: e.target.value,
                    })
                  }
                  className="input"
                >
                  <option value="runs">Runs</option>
                  <option value="wicket">Wicket</option>
                  <option value="wide">Wide</option>
                  <option value="no-ball">No Ball</option>
                  <option value="bye">Bye</option>
                  <option value="leg-bye">Leg Bye</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Runs
                </label>
                <input
                  type="number"
                  min="0"
                  value={editFormData.runs}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      runs: parseInt(e.target.value),
                    })
                  }
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={editFormData.notes}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, notes: e.target.value })
                  }
                  className="input"
                  rows="2"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  Update Ball
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchView;
