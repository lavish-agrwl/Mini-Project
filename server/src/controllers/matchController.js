import Match from "../models/Match.js";

// Helper function to recompute match state from ball history
const recomputeMatchState = (match) => {
  // Reset innings totals
  match.innings.forEach((inning) => {
    inning.totalRuns = 0;
    inning.wickets = 0;
    inning.oversCompleted = 0;

    // Reset player stats for the batting team
    const battingTeam = match.teams[inning.battingTeamIndex];
    battingTeam.players.forEach((player) => {
      player.runs = 0;
      player.ballsFaced = 0;
      player.isOut = false;
    });

    let ballsInCurrentOver = 0;
    let completedOvers = 0;

    // Process each ball
    inning.balls.forEach((ball) => {
      // Add runs to inning total
      inning.totalRuns += ball.runs;

      // Update batsman stats if applicable
      if (ball.batsmanId) {
        const batsman = battingTeam.players.id(ball.batsmanId);
        if (batsman) {
          batsman.runs += ball.runs;
          // Count balls faced (not wides or no-balls)
          if (ball.eventType !== "wide" && ball.eventType !== "no-ball") {
            batsman.ballsFaced += 1;
          }
        }
      }

      // Handle wickets
      if (ball.eventType === "wicket") {
        inning.wickets += 1;
        if (ball.batsmanId) {
          const batsman = battingTeam.players.id(ball.batsmanId);
          if (batsman) {
            batsman.isOut = true;
          }
        }
      }

      // Count valid balls for over completion (not wides or no-balls)
      if (ball.eventType !== "wide" && ball.eventType !== "no-ball") {
        ballsInCurrentOver += 1;
        if (ballsInCurrentOver === 6) {
          completedOvers += 1;
          ballsInCurrentOver = 0;
        }
      }
    });

    inning.oversCompleted = completedOvers + ballsInCurrentOver / 10;
  });

  return match;
};

// Create a new match
export const createMatch = async (req, res) => {
  try {
    const { name, oversPerInnings, teams, matchDate, notes } = req.body;

    // Validate teams
    if (!teams || teams.length !== 2) {
      return res.status(400).json({
        success: false,
        message: "Exactly 2 teams are required",
      });
    }

    if (teams[0].players.length < 1 || teams[1].players.length < 1) {
      return res.status(400).json({
        success: false,
        message: "Each team must have at least 1 player",
      });
    }

    const match = new Match({
      owner: req.user._id,
      name,
      oversPerInnings,
      teams,
      matchDate: matchDate || new Date(),
      notes: notes || "",
      innings: [],
      status: "not_started",
    });

    await match.save();

    res.status(201).json({
      success: true,
      message: "Match created successfully",
      match,
    });
  } catch (error) {
    console.error("Create match error:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating match",
      error: error.message,
    });
  }
};

// Get all matches for the authenticated user
export const getMatches = async (req, res) => {
  try {
    const matches = await Match.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .select("-__v");

    res.json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (error) {
    console.error("Get matches error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching matches",
    });
  }
};

// Get a single match by ID
export const getMatch = async (req, res) => {
  try {
    const match = await Match.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    res.json({
      success: true,
      match,
    });
  } catch (error) {
    console.error("Get match error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching match",
    });
  }
};

// Update match metadata and details
export const updateMatch = async (req, res) => {
  try {
    const { name, notes, matchDate, oversPerInnings, teams } = req.body;

    const match = await Match.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    // Prevent editing if match has started
    if (
      match.status !== "not_started" &&
      (teams || oversPerInnings !== undefined)
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot edit teams or overs after match has started",
      });
    }

    // Update basic metadata (allowed at any time)
    if (name) match.name = name;
    if (notes !== undefined) match.notes = notes;
    if (matchDate) match.matchDate = matchDate;

    // Update teams (only before match starts)
    if (teams) {
      if (teams.length !== 2) {
        return res.status(400).json({
          success: false,
          message: "Exactly 2 teams are required",
        });
      }

      // Validate each team has at least 1 player
      if (teams[0].players.length < 1 || teams[1].players.length < 1) {
        return res.status(400).json({
          success: false,
          message: "Each team must have at least 1 player",
        });
      }

      match.teams = teams;
    }

    // Update overs per innings (only before match starts)
    if (oversPerInnings !== undefined) {
      if (oversPerInnings < 1) {
        return res.status(400).json({
          success: false,
          message: "Overs per innings must be at least 1",
        });
      }
      match.oversPerInnings = oversPerInnings;
    }

    await match.save();

    res.json({
      success: true,
      message: "Match updated successfully",
      match,
    });
  } catch (error) {
    console.error("Update match error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating match",
    });
  }
};

// Delete a match
export const deleteMatch = async (req, res) => {
  try {
    const match = await Match.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    res.json({
      success: true,
      message: "Match deleted successfully",
    });
  } catch (error) {
    console.error("Delete match error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting match",
    });
  }
};

// Start a match
export const startMatch = async (req, res) => {
  try {
    const { battingTeamIndex, strikerId, nonStrikerId } = req.body;

    const match = await Match.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    if (match.status !== "not_started") {
      return res.status(400).json({
        success: false,
        message: "Match has already been started",
      });
    }

    // Initialize first innings
    match.innings = [
      {
        battingTeamIndex,
        totalRuns: 0,
        wickets: 0,
        oversCompleted: 0,
        balls: [],
      },
    ];

    match.current = {
      inningIndex: 0,
      overNumber: 0,
      ballInOver: 0,
      strikerId,
      nonStrikerId,
      nextBatsmanIndex: 2, // First two batsmen are already in
    };

    match.status = "in_progress";

    await match.save();

    res.json({
      success: true,
      message: "Match started successfully",
      match,
    });
  } catch (error) {
    console.error("Start match error:", error);
    res.status(500).json({
      success: false,
      message: "Server error starting match",
    });
  }
};

// Record a ball
export const recordBall = async (req, res) => {
  try {
    const { eventType, runs, batsmanId, extraType, notes } = req.body;

    const match = await Match.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    if (match.status !== "in_progress") {
      return res.status(400).json({
        success: false,
        message: "Match is not in progress",
      });
    }

    const currentInning = match.innings[match.current.inningIndex];
    const currentBall = match.current.ballInOver;
    const currentOver = match.current.overNumber;

    // Create ball event
    const ballEvent = {
      overNumber: currentOver,
      ballInOver: currentBall + 1,
      batsmanId: batsmanId || match.current.strikerId,
      eventType,
      runs: runs || 0,
      extraType: extraType || null,
      notes: notes || "",
      timestamp: new Date(),
    };

    currentInning.balls.push(ballEvent);

    // Check if this is a valid ball (not wide or no-ball)
    const isValidBall = eventType !== "wide" && eventType !== "no-ball";

    if (isValidBall) {
      match.current.ballInOver += 1;

      // Check for over completion
      if (match.current.ballInOver >= 6) {
        match.current.overNumber += 1;
        match.current.ballInOver = 0;

        // Swap striker and non-striker at end of over
        const temp = match.current.strikerId;
        match.current.strikerId = match.current.nonStrikerId;
        match.current.nonStrikerId = temp;
      } else {
        // Rotate strike on odd runs
        if (runs % 2 === 1) {
          const temp = match.current.strikerId;
          match.current.strikerId = match.current.nonStrikerId;
          match.current.nonStrikerId = temp;
        }
      }
    }

    // Handle wicket
    if (eventType === "wicket") {
      const battingTeam = match.teams[currentInning.battingTeamIndex];

      // Check if all out or if there are more batsmen
      if (match.current.nextBatsmanIndex < battingTeam.players.length) {
        // Bring in next batsman as striker
        match.current.strikerId =
          battingTeam.players[match.current.nextBatsmanIndex]._id;
        match.current.nextBatsmanIndex += 1;
      }
    }

    // Recompute match state
    recomputeMatchState(match);

    // Check for innings completion
    const oversCompleted = Math.floor(currentInning.oversCompleted);
    const allOut =
      currentInning.wickets >=
      match.teams[currentInning.battingTeamIndex].players.length - 1;

    if (oversCompleted >= match.oversPerInnings || allOut) {
      // Check if we need to start second innings
      if (match.current.inningIndex === 0) {
        // Start second innings
        const secondBattingTeamIndex =
          currentInning.battingTeamIndex === 0 ? 1 : 0;
        const secondBattingTeam = match.teams[secondBattingTeamIndex];

        match.innings.push({
          battingTeamIndex: secondBattingTeamIndex,
          totalRuns: 0,
          wickets: 0,
          oversCompleted: 0,
          balls: [],
        });

        match.current = {
          inningIndex: 1,
          overNumber: 0,
          ballInOver: 0,
          strikerId: secondBattingTeam.players[0]._id,
          nonStrikerId: secondBattingTeam.players[1]._id,
          nextBatsmanIndex: 2,
        };
      } else {
        // Match finished
        match.status = "finished";
      }
    } else if (match.current.inningIndex === 1) {
      // Check if chasing team has won
      const firstInningRuns = match.innings[0].totalRuns;
      const secondInningRuns = match.innings[1].totalRuns;

      if (secondInningRuns > firstInningRuns) {
        match.status = "finished";
      }
    }

    await match.save();

    res.json({
      success: true,
      message: "Ball recorded successfully",
      match,
    });
  } catch (error) {
    console.error("Record ball error:", error);
    res.status(500).json({
      success: false,
      message: "Server error recording ball",
      error: error.message,
    });
  }
};

// Edit a past ball
export const editBall = async (req, res) => {
  try {
    const { ballId } = req.params;
    const { eventType, runs, extraType, notes } = req.body;

    const match = await Match.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    // Find the ball in innings
    let ballFound = false;
    for (let inning of match.innings) {
      const ball = inning.balls.id(ballId);
      if (ball) {
        // Update ball properties
        if (eventType !== undefined) ball.eventType = eventType;
        if (runs !== undefined) ball.runs = runs;
        if (extraType !== undefined) ball.extraType = extraType;
        if (notes !== undefined) ball.notes = notes;

        ballFound = true;
        break;
      }
    }

    if (!ballFound) {
      return res.status(404).json({
        success: false,
        message: "Ball not found",
      });
    }

    // Recompute match state
    recomputeMatchState(match);

    await match.save();

    res.json({
      success: true,
      message: "Ball updated successfully",
      match,
    });
  } catch (error) {
    console.error("Edit ball error:", error);
    res.status(500).json({
      success: false,
      message: "Server error editing ball",
      error: error.message,
    });
  }
};

// Get match history (ball-by-ball)
export const getMatchHistory = async (req, res) => {
  try {
    const match = await Match.findOne({
      _id: req.params.id,
      owner: req.user._id,
    }).select("innings teams name");

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    res.json({
      success: true,
      history: match.innings,
      teams: match.teams,
      matchName: match.name,
    });
  } catch (error) {
    console.error("Get match history error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching match history",
    });
  }
};
