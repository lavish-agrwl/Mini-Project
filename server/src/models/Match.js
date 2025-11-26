import mongoose from "mongoose";

// Sub-schema for players
const playerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    isOut: {
      type: Boolean,
      default: false,
    },
    runs: {
      type: Number,
      default: 0,
    },
    ballsFaced: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

// Sub-schema for teams
const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    players: [playerSchema],
  },
  { _id: false }
);

// Sub-schema for ball events
const ballEventSchema = new mongoose.Schema(
  {
    overNumber: {
      type: Number,
      required: true,
    },
    ballInOver: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
    },
    batsmanId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false, // Can be null for extras
    },
    eventType: {
      type: String,
      enum: ["runs", "wicket", "wide", "no-ball", "bye", "leg-bye"],
      required: true,
    },
    runs: {
      type: Number,
      default: 0,
    },
    extraType: {
      type: String,
      enum: ["wide", "no-ball", "bye", "leg-bye", null],
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

// Sub-schema for innings
const inningSchema = new mongoose.Schema(
  {
    battingTeamIndex: {
      type: Number,
      required: true,
      enum: [0, 1],
    },
    totalRuns: {
      type: Number,
      default: 0,
    },
    wickets: {
      type: Number,
      default: 0,
    },
    oversCompleted: {
      type: Number,
      default: 0,
    },
    balls: [ballEventSchema],
  },
  { _id: false }
);

// Main match schema
const matchSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Match name is required"],
      trim: true,
    },
    oversPerInnings: {
      type: Number,
      required: true,
      min: 1,
      max: 50,
    },
    teams: {
      type: [teamSchema],
      validate: {
        validator: function (v) {
          return v.length === 2;
        },
        message: "Exactly 2 teams are required",
      },
    },
    innings: [inningSchema],
    current: {
      inningIndex: {
        type: Number,
        default: 0,
      },
      overNumber: {
        type: Number,
        default: 0,
      },
      ballInOver: {
        type: Number,
        default: 0,
      },
      strikerId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },
      nonStrikerId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },
      nextBatsmanIndex: {
        type: Number,
        default: 0,
      },
    },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "finished"],
      default: "not_started",
    },
    matchDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Match = mongoose.model("Match", matchSchema);

export default Match;
