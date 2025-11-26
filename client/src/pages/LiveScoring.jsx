import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { matchAPI } from "../services/api";

const LiveScoring = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showExtraMenu, setShowExtraMenu] = useState(false);
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

  const handleWicket = async () => {
    const wicketNotes = prompt("Wicket type (e.g., caught, bowled, run out):");
    await recordBall({
      eventType: "wicket",
      runs: 0,
      batsmanId: match.current.strikerId,
      extraType: null,
      notes: wicketNotes || "Out",
    });
  };

  const handleExtra = async (extraType, runs = 1) => {
    await recordBall({
      eventType: extraType,
      runs,
      batsmanId: match.current.strikerId,
      extraType,
      notes: "",
    });
    setShowExtraMenu(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading match...</p>
      </div>
    );
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
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-primary-600 text-white py-4 px-4 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-xl font-bold">{match.name}</h1>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-white hover:text-primary-100"
            >
              Exit
            </button>
          </div>
          <p className="text-sm text-primary-100">
            Inning {match.current.inningIndex + 1} - {battingTeam.name} batting
          </p>
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
            <div className="card bg-gradient-to-r from-primary-600 to-primary-700 text-white">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{battingTeam.name}</h2>
                  <p className="text-sm text-primary-100">
                    vs {bowlingTeam.name}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold">
                    {currentInning.totalRuns}/{currentInning.wickets}
                  </div>
                  <div className="text-lg">
                    Overs: {currentInning.oversCompleted.toFixed(1)}
                  </div>
                </div>
              </div>

              {/* Current Over */}
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-primary-100 mb-1">This Over</p>
                <div className="flex gap-2">
                  {lastBalls.length === 0 ? (
                    <span className="text-sm">No balls yet</span>
                  ) : (
                    lastBalls.map((ball, idx) => (
                      <div
                        key={idx}
                        className="w-10 h-10 rounded-full bg-white text-primary-700 flex items-center justify-center font-bold text-sm"
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
              <h3 className="text-lg font-semibold mb-3">Current Batsmen</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border-2 border-green-300">
                  <div>
                    <span className="font-medium">{striker?.name}</span>
                    <span className="text-xs text-green-600 ml-2">
                      ★ On Strike
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      {striker?.runs || 0} ({striker?.ballsFaced || 0})
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">{nonStriker?.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      {nonStriker?.runs || 0} ({nonStriker?.ballsFaced || 0})
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scoring Controls */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Record Ball</h3>

              {submitting ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Recording ball...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Runs */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Runs
                    </p>
                    <div className="grid grid-cols-7 gap-2">
                      {[0, 1, 2, 3, 4, 5, 6].map((runs) => (
                        <button
                          key={runs}
                          onClick={() => handleRunClick(runs)}
                          className={`btn ${
                            runs === 0
                              ? "btn-secondary"
                              : runs === 4 || runs === 6
                              ? "btn-success"
                              : "btn-primary"
                          } text-lg font-bold h-16`}
                        >
                          {runs}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Wicket & Extras */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={handleWicket}
                      className="btn btn-danger h-16 text-lg font-bold"
                    >
                      WICKET
                    </button>
                    <button
                      onClick={() => setShowExtraMenu(!showExtraMenu)}
                      className="btn btn-secondary h-16 text-lg font-bold"
                    >
                      EXTRAS
                    </button>
                  </div>

                  {/* Extras Menu */}
                  {showExtraMenu && (
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Select Extra Type:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleExtra("wide", 1)}
                          className="btn btn-secondary"
                        >
                          Wide (1 run)
                        </button>
                        <button
                          onClick={() => handleExtra("no-ball", 1)}
                          className="btn btn-secondary"
                        >
                          No Ball (1 run)
                        </button>
                        <button
                          onClick={() => handleExtra("bye", 1)}
                          className="btn btn-secondary"
                        >
                          Bye (1 run)
                        </button>
                        <button
                          onClick={() => handleExtra("leg-bye", 1)}
                          className="btn btn-secondary"
                        >
                          Leg Bye (1 run)
                        </button>
                      </div>
                      <button
                        onClick={() => setShowExtraMenu(false)}
                        className="btn btn-secondary w-full mt-2"
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
            <div className="card">
              <h3 className="text-lg font-semibold mb-3">Recent Balls</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {currentInning.balls.length === 0 ? (
                  <p className="text-sm text-gray-500">No balls recorded yet</p>
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
                          className="text-sm p-2 bg-gray-50 rounded"
                        >
                          <div className="flex justify-between">
                            <span className="font-medium">
                              {ball.overNumber}.{ball.ballInOver}
                            </span>
                            <span
                              className={`font-bold ${
                                ball.eventType === "wicket"
                                  ? "text-red-600"
                                  : ball.runs >= 4
                                  ? "text-green-600"
                                  : "text-gray-700"
                              }`}
                            >
                              {ball.eventType === "wicket"
                                ? "WICKET"
                                : ball.eventType === "wide"
                                ? `Wd ${ball.runs}`
                                : ball.eventType === "no-ball"
                                ? `Nb ${ball.runs}`
                                : `${ball.runs} run${
                                    ball.runs !== 1 ? "s" : ""
                                  }`}
                            </span>
                          </div>
                          {ball.notes && (
                            <p className="text-xs text-gray-600 mt-1">
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
    </div>
  );
};

export default LiveScoring;
