import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { matchAPI } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import BatsmanCard from "../components/BatsmanCard";
import BallButton from "../components/BallButton";

const LiveScoring = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showExtraMenu, setShowExtraMenu] = useState(false);
  const [showWicketMenu, setShowWicketMenu] = useState(false);
  const [showNoBallRunsMenu, setShowNoBallRunsMenu] = useState(false);
  const [editingBall, setEditingBall] = useState(null);
  const [editFormData, setEditFormData] = useState({
    eventType: "runs",
    runs: 0,
    notes: "",
  });
  const [ballData, setBallData] = useState({
    eventType: "runs",
    runs: 0,
    extraType: null,
    notes: "",
  });

  useEffect(() => {
    fetchMatch();
  }, [id]);

  const fetchMatch = async () => {
    try {
      const response = await matchAPI.getOne(id);
      setMatch(response.data.match);
      setLoading(false);
    } catch (error) {
      setError("Failed to load match");
      setLoading(false);
    }
  };

  const handleRunClick = async (runs) => {
    await recordBall({
      eventType: "runs",
      runs,
      batsmanId: match.current.strikerId,
      extraType: null,
      notes: "",
    });
  };

  const handleWicket = async (wicketType = "Out") => {
    await recordBall({
      eventType: "wicket",
      runs: 0,
      batsmanId: match.current.strikerId,
      extraType: null,
      notes: wicketType,
    });
    setShowWicketMenu(false);
  };

  const handleExtra = async (extraType, runs = 1) => {
    if (extraType === "no-ball") {
      setShowNoBallRunsMenu(true);
      setShowExtraMenu(false);
      return;
    }
    await recordBall({
      eventType: extraType,
      runs,
      batsmanId: match.current.strikerId,
      extraType,
      notes: "",
    });
    setShowExtraMenu(false);
  };

  const handleNoBallWithRuns = async (runsScored) => {
    await recordBall({
      eventType: "no-ball",
      runs: 1 + runsScored, // 1 penalty + runs scored
      batsmanId: match.current.strikerId,
      extraType: "no-ball",
      notes: runsScored > 0 ? `No-ball + ${runsScored} runs` : "No-ball",
    });
    setShowNoBallRunsMenu(false);
  };

  const recordBall = async (ballData) => {
    setSubmitting(true);
    setError("");

    try {
      const response = await matchAPI.recordBall(id, ballData);
      setMatch(response.data.match);

      // Check if match is finished
      if (response.data.match.status === "finished") {
        setTimeout(() => {
          alert("Match finished!");
          navigate(`/match/${id}/view`);
        }, 500);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to record ball");
    } finally {
      setSubmitting(false);
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
    setSubmitting(true);

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
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading match..." />;
  }

  if (!match || match.status !== "in_progress") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card text-center">
          <p className="text-red-600 mb-4">Match is not in progress</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentInning = match.innings[match.current.inningIndex];
  const battingTeam = match.teams[currentInning.battingTeamIndex];
  const bowlingTeam = match.teams[currentInning.battingTeamIndex === 0 ? 1 : 0];

  const striker = battingTeam.players.find(
    (p) => p._id === match.current.strikerId
  );
  const nonStriker = battingTeam.players.find(
    (p) => p._id === match.current.nonStrikerId
  );

  const currentOver = Math.floor(currentInning.oversCompleted);
  const ballsInOver = Math.round(
    (currentInning.oversCompleted - currentOver) * 10
  );

  // Get last 6 balls for current over display
  const lastBalls = currentInning.balls.slice(-6).reverse();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-6 px-4 shadow-2xl">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{match.name}</h1>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="btn bg-white/20 hover:bg-white/30 backdrop-blur-sm border-0 text-white"
            >
              <span className="mr-1">←</span> Exit
            </button>
          </div>
          <div className="flex items-center gap-2 ml-12">
            <span className="badge bg-white/20 text-white backdrop-blur-sm">
              LIVE - Inning {match.current.inningIndex + 1}
            </span>
            <p className="text-sm text-primary-100">
              {battingTeam.name} batting
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Scoring Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Scoreboard */}
            <div className="card bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-2xl border-0">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-3xl font-bold mb-1">
                    {battingTeam.name}
                  </h2>
                  <p className="text-sm text-white/80 flex items-center gap-2">
                    vs {bowlingTeam.name}
                  </p>
                </div>
                <div className="text-right">
                  <div className="score-display text-white mb-1">
                    {currentInning.totalRuns}
                    <span className="text-2xl">/{currentInning.wickets}</span>
                  </div>
                  <div className="text-lg text-white/90 flex items-center justify-end gap-1">
                    {currentInning.oversCompleted.toFixed(1)}\n{" "}
                  </div>
                </div>
              </div>

              {/* Current Over */}
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                <p className="text-xs text-white/80 mb-2 font-semibold flex items-center gap-2">
                  THIS OVER
                </p>
                <div className="flex gap-2 flex-wrap">
                  {lastBalls.length === 0 ? (
                    <span className="text-sm text-white/70">No balls yet</span>
                  ) : (
                    lastBalls.map((ball, idx) => (
                      <div
                        key={idx}
                        className="w-12 h-12 rounded-xl bg-white text-primary-700 flex items-center justify-center font-bold text-lg shadow-lg transform hover:scale-110 transition-transform"
                      >
                        {ball.eventType === "wicket"
                          ? "W"
                          : ball.eventType === "wide"
                          ? `Wd${ball.runs}`
                          : ball.eventType === "no-ball"
                          ? `Nb${ball.runs}`
                          : ball.runs}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Batsmen */}
            <div className="card">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                Current Batsmen
              </h3>
              <div className="space-y-3">
                <BatsmanCard player={striker} isStriker={true} />
                <BatsmanCard player={nonStriker} isStriker={false} />
              </div>
            </div>

            {/* Scoring Controls */}
            <div className="card border-2 border-primary-200">
              <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
                Record Ball
              </h3>

              {submitting ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
                  <p className="text-gray-600 mt-4 font-medium">
                    Recording ball...
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Runs */}
                  <div>
                    <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      RUNS
                    </p>
                    <div className="grid grid-cols-7 gap-2">
                      {[0, 1, 2, 3, 4, 5, 6].map((runs) => (
                        <BallButton
                          key={runs}
                          label={runs}
                          onClick={() => handleRunClick(runs)}
                          color={
                            runs === 0
                              ? "inherit"
                              : runs === 4 || runs === 6
                              ? "success"
                              : "primary"
                          }
                        />
                      ))}
                    </div>
                  </div>

                  {/* Wicket & Extras */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setShowWicketMenu(!showWicketMenu)}
                      className="btn bg-gradient-to-br from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 h-16 text-lg font-bold shadow-lg hover:shadow-xl"
                    >
                      <span className="mr-2">❌</span> WICKET
                    </button>
                    <button
                      onClick={() => setShowExtraMenu(!showExtraMenu)}
                      className="btn bg-gradient-to-br from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 h-16 text-lg font-bold shadow-lg hover:shadow-xl"
                    >
                      <span className="mr-2">➕</span> EXTRAS
                    </button>
                  </div>

                  {/* Extras Menu */}
                  {showExtraMenu && (
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-5 rounded-xl border-2 border-orange-200 animate-slide-up">
                      <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        Select Extra Type:
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleExtra("wide", 1)}
                          className="btn bg-white border-2 border-orange-300 text-orange-700 hover:bg-orange-50 font-semibold"
                        >
                          Wide (1 run)
                        </button>
                        <button
                          onClick={() => handleExtra("no-ball", 1)}
                          className="btn bg-white border-2 border-orange-300 text-orange-700 hover:bg-orange-50 font-semibold"
                        >
                          No Ball (+runs)
                        </button>
                        <button
                          onClick={() => handleExtra("bye", 1)}
                          className="btn bg-white border-2 border-orange-300 text-orange-700 hover:bg-orange-50 font-semibold"
                        >
                          Bye (1 run)
                        </button>
                        <button
                          onClick={() => handleExtra("leg-bye", 1)}
                          className="btn bg-white border-2 border-orange-300 text-orange-700 hover:bg-orange-50 font-semibold"
                        >
                          Leg Bye (1 run)
                        </button>
                      </div>
                      <button
                        onClick={() => setShowExtraMenu(false)}
                        className="btn btn-secondary w-full mt-3"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* Wicket Type Menu */}
                  {showWicketMenu && (
                    <div className="bg-gradient-to-br from-red-50 to-rose-50 p-5 rounded-xl border-2 border-red-200 animate-slide-up">
                      <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <span>❌</span> Select Wicket Type:
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleWicket("Bowled")}
                          className="btn bg-white border-2 border-red-300 text-red-700 hover:bg-red-50 font-semibold"
                        >
                          Bowled
                        </button>
                        <button
                          onClick={() => handleWicket("Caught")}
                          className="btn bg-white border-2 border-red-300 text-red-700 hover:bg-red-50 font-semibold"
                        >
                          Caught
                        </button>
                        <button
                          onClick={() => handleWicket("LBW")}
                          className="btn bg-white border-2 border-red-300 text-red-700 hover:bg-red-50 font-semibold"
                        >
                          LBW
                        </button>
                        <button
                          onClick={() => handleWicket("Run Out")}
                          className="btn bg-white border-2 border-red-300 text-red-700 hover:bg-red-50 font-semibold"
                        >
                          Run Out
                        </button>
                        <button
                          onClick={() => handleWicket("Stumped")}
                          className="btn bg-white border-2 border-red-300 text-red-700 hover:bg-red-50 font-semibold"
                        >
                          Stumped
                        </button>
                        <button
                          onClick={() => handleWicket("Hit Wicket")}
                          className="btn bg-white border-2 border-red-300 text-red-700 hover:bg-red-50 font-semibold"
                        >
                          Hit Wicket
                        </button>
                        <button
                          onClick={() => handleWicket("Caught & Bowled")}
                          className="btn bg-white border-2 border-red-300 text-red-700 hover:bg-red-50 font-semibold"
                        >
                          C&B
                        </button>
                        <button
                          onClick={() => handleWicket("Out")}
                          className="btn bg-white border-2 border-red-300 text-red-700 hover:bg-red-50 font-semibold"
                        >
                          Other
                        </button>
                      </div>
                      <button
                        onClick={() => setShowWicketMenu(false)}
                        className="btn btn-secondary w-full mt-3"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Ball History & Stats */}
          <div className="space-y-6">
            {/* Match Progress */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-3">Match Progress</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Over:</span>
                  <span className="font-medium">
                    {currentOver}.{ballsInOver}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining Overs:</span>
                  <span className="font-medium">
                    {(
                      match.oversPerInnings - currentInning.oversCompleted
                    ).toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Run Rate:</span>
                  <span className="font-medium">
                    {currentInning.oversCompleted > 0
                      ? (
                          currentInning.totalRuns / currentInning.oversCompleted
                        ).toFixed(2)
                      : "0.00"}
                  </span>
                </div>
              </div>
            </div>

            {/* Ball-by-Ball Log */}
            <div className="card border-2 border-primary-200">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  Recent Balls
                </h3>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {currentInning.balls.length === 0 ? (
                  <div className="text-center py-8 bg-gradient-to-br from-blue-50 to-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600">
                      No balls recorded yet
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Start scoring to see ball history
                    </p>
                  </div>
                ) : (
                  currentInning.balls
                    .slice()
                    .reverse()
                    .slice(0, 20)
                    .map((ball, idx) => {
                      const batsman = battingTeam.players.find(
                        (p) => p._id === ball.batsmanId
                      );
                      return (
                        <div
                          key={idx}
                          className="p-3 bg-gradient-to-r from-white to-gray-50 rounded-xl border-2 border-gray-200 hover:border-primary-400 transition-all shadow-sm hover:shadow-md"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3 flex-1">
                              <span className="font-mono font-bold text-sm bg-primary-100 text-primary-700 px-2 py-1 rounded-lg">
                                {ball.overNumber}.{ball.ballInOver}
                              </span>
                              <span className="text-sm text-gray-600">
                                {batsman?.name || "Unknown"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-bold text-lg px-3 py-1 rounded-lg ${
                                  ball.eventType === "wicket"
                                    ? "bg-red-100 text-red-700"
                                    : ball.runs >= 4
                                    ? "bg-green-100 text-green-700"
                                    : ball.runs > 0
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {ball.eventType === "wicket"
                                  ? "❌ W"
                                  : ball.eventType === "wide"
                                  ? `Wd+${ball.runs}`
                                  : ball.eventType === "no-ball"
                                  ? `Nb+${ball.runs}`
                                  : ball.runs === 4
                                  ? "4"
                                  : ball.runs === 6
                                  ? "6"
                                  : ball.runs}
                              </span>
                              <button
                                onClick={() => openEditModal(ball)}
                                className="btn bg-gradient-to-r from-primary-500 to-primary-700 text-white hover:from-primary-600 hover:to-primary-800 text-xs px-3 py-1 flex items-center gap-1"
                                title="Edit this ball"
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                          {ball.notes && (
                            <p className="text-xs text-gray-600 mt-2 pl-2 border-l-2 border-gray-300">
                              {ball.notes}
                            </p>
                          )}
                        </div>
                      );
                    })
                )}
              </div>
            </div>

            {/* Batting Team */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-3">Batting Order</h3>
              <div className="space-y-1 text-sm max-h-64 overflow-y-auto">
                {battingTeam.players.map((player, idx) => (
                  <div
                    key={player._id}
                    className={`flex justify-between p-2 rounded ${
                      player.isOut
                        ? "bg-red-50 text-gray-500 line-through"
                        : player._id === striker?._id
                        ? "bg-green-100"
                        : player._id === nonStriker?._id
                        ? "bg-blue-50"
                        : "bg-gray-50"
                    }`}
                  >
                    <span>{player.name}</span>
                    <span className="font-medium">
                      {player.isOut
                        ? "Out"
                        : `${player.runs || 0} (${player.ballsFaced || 0})`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* No-Ball Runs Menu */}
      {showNoBallRunsMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border-2 border-amber-200 animate-scale-in">
            <h3 className="text-2xl font-bold mb-4 text-amber-700">
              No-Ball Runs
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Select runs scored off the no-ball (plus 1 penalty run)
            </p>
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[0, 1, 2, 3, 4, 5, 6].map((runs) => (
                <BallButton
                  key={runs}
                  label={runs}
                  onClick={() => handleNoBallWithRuns(runs)}
                  color={runs === 4 || runs === 6 ? "success" : "warning"}
                />
              ))}
            </div>
            <button
              onClick={() => setShowNoBallRunsMenu(false)}
              className="btn btn-secondary w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit Ball Modal */}
      {editingBall && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border-2 border-primary-200 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                Edit Ball
              </h3>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 mb-6">
              <p className="text-sm font-semibold text-gray-700">
                Over {editingBall.overNumber}.{editingBall.ballInOver}
              </p>
            </div>

            <form onSubmit={handleEditBall} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
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
                  disabled={submitting}
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
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Runs
                </label>
                <input
                  type="number"
                  min="0"
                  max="6"
                  value={editFormData.runs}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      runs: parseInt(e.target.value) || 0,
                    })
                  }
                  className="input"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={editFormData.notes}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, notes: e.target.value })
                  }
                  className="input"
                  rows="3"
                  placeholder="Add notes about this ball..."
                  disabled={submitting}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="btn btn-secondary flex-1"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={submitting}
                >
                  {submitting ? "Updating..." : "Update Ball"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveScoring;
