# Cricket Scoreboard Manager

A full-stack MERN (MongoDB, Express, React, Node.js) application for managing cricket matches with live scoring, ball-by-ball tracking, and match history.

## Features

- **User Authentication**: Secure email/password authentication with JWT and bcrypt
- **Match Management**: Create, edit, and delete cricket matches
- **Live Scoring**: Real-time ball-by-ball scoring with automatic state management
- **Team & Player Setup**: Configure teams with multiple players
- **Ball Tracking**: Record runs, wickets, extras (wide, no-ball, bye, leg-bye)
- **Auto-calculation**: Automatic score calculation, strike rotation, and over completion
- **Match History**: View complete ball-by-ball commentary of past matches
- **Edit Past Balls**: Modify any ball and automatically recompute all scores
- **Single-device ownership**: Only match creators can view and edit their matches

## Tech Stack

### Backend

- **Node.js** + **Express**: RESTful API server
- **MongoDB** + **Mongoose**: Database and ODM
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **express-validator**: Input validation

### Frontend

- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first styling
- **React Router**: Client-side routing
- **Axios**: HTTP client

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB** (v5 or higher) - running locally or a MongoDB Atlas connection string
- **npm** or **yarn**

## Installation & Setup

### 1. Clone or Extract the Project

```bash
cd "c:\Programming\Mini Project"
```

### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cricket-scoreboard
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

**Important**: Change `JWT_SECRET` to a random, secure string in production.

### 3. Frontend Setup

```bash
cd ../client

# Install dependencies
npm install

# Create .env file (optional - proxy is configured in vite.config.js)
cp .env.example .env
```

### 4. Start MongoDB

Make sure MongoDB is running:

```bash
# If using local MongoDB
mongod

# Or ensure your MongoDB service is running
```

### 5. Seed Database (Optional)

To create demo user and sample data:

```bash
cd server
npm run seed
```

**Demo Credentials:**

- Email: `demo@cricket.com`
- Password: `demo123`

## Running the Application

You need to run both the backend and frontend servers.

### Terminal 1 - Backend Server

```bash
cd server
npm run dev
```

Backend will run on `http://localhost:5000`

### Terminal 2 - Frontend Server

```bash
cd client
npm run dev
```

Frontend will run on `http://localhost:5173`

### Access the Application

Open your browser and navigate to: **http://localhost:5173**

## Building for Production

### Backend

```bash
cd server
npm start
```

### Frontend

```bash
cd client

# Build for production
npm run build

# Preview production build
npm run preview
```

The production build will be in `client/dist` folder. You can serve this with any static file server or integrate with your backend.

## Project Structure

```
Mini Project/
├── server/                 # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Auth middleware
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── server.js      # Express app entry point
│   │   └── seed.js        # Database seeding script
│   ├── package.json
│   └── .env.example
│
└── client/                # Frontend (React + Vite)
    ├── src/
    │   ├── components/    # Reusable components
    │   ├── context/       # React context (Auth)
    │   ├── pages/         # Page components
    │   ├── services/      # API service layer
    │   ├── App.jsx        # Main app component
    │   ├── main.jsx       # React entry point
    │   └── index.css      # Tailwind styles
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user (protected)

### Matches

- `POST /api/matches` - Create new match (protected)
- `GET /api/matches` - Get all user's matches (protected)
- `GET /api/matches/:id` - Get single match (protected)
- `PUT /api/matches/:id` - Update match metadata (protected)
- `DELETE /api/matches/:id` - Delete match (protected)
- `POST /api/matches/:id/start` - Start match (protected)
- `POST /api/matches/:id/ball` - Record a ball (protected)
- `PUT /api/matches/:id/ball/:ballId` - Edit a ball (protected)
- `GET /api/matches/:id/history` - Get ball-by-ball history (protected)

## Usage Guide

### 1. Register/Login

- Create a new account or use demo credentials
- You'll be redirected to the dashboard

### 2. Create a Match

- Click "Create New Match"
- Enter match details (name, overs, date, notes)
- Add teams and players (minimum 1 player per team)
- Click "Create Match"

### 3. Start Match

- From dashboard, click "Start Match" on a new match
- Select which team bats first
- Choose opening batsmen (striker and non-striker)
- Click "Start Match"

### 4. Live Scoring

- Use the run buttons (0-6) to record runs
- Click "WICKET" to record a dismissal
- Click "EXTRAS" for wide, no-ball, bye, leg-bye
- The system automatically:
  - Rotates strike on odd runs
  - Changes ends after each over
  - Brings in new batsmen after wickets
  - Completes innings and starts second innings
  - Ends match when chase is successful or overs are complete

### 5. View Match History

- Finished matches show "View Details"
- See complete ball-by-ball commentary
- Click "Edit" on any ball to modify it
- Scores automatically recalculate after edits

## Manual Testing Plan

### Test 1: User Registration & Login

1. Navigate to register page
2. Create account with email/password
3. Verify redirect to dashboard
4. Logout and login again
5. ✅ Success: User can register, login, logout

### Test 2: Create Match

1. Click "Create New Match"
2. Fill match details (name: "Test Match", overs: 5)
3. Add Team 1: "India" with 6 players
4. Add Team 2: "Australia" with 6 players
5. Submit
6. ✅ Success: Match appears in dashboard

### Test 3: Live Scoring

1. Click "Start Match" on created match
2. Select Team 1 to bat first
3. Choose opening batsmen
4. Start match
5. Record various events:
   - Click "1" (1 run - strike rotates)
   - Click "4" (boundary)
   - Click "EXTRAS" → "Wide" (adds 1 run, no ball counted)
   - Click "6" (six runs)
   - Click "WICKET" (record dismissal)
6. Complete an over (6 valid balls)
7. ✅ Success: Score updates, overs increment, new batsman appears

### Test 4: Innings Transition

1. Continue match until first innings completes (all overs or all out)
2. Verify second innings starts automatically
3. Chase the target
4. ✅ Success: Match transitions to second innings and finishes correctly

### Test 5: Edit Past Ball

1. View a finished match
2. Click "Edit" on a ball in the history
3. Change runs from 4 to 6
4. Save
5. ✅ Success: Score recalculates, all totals update

### Test 6: Match Ownership

1. Logout and create new user
2. Verify previous user's matches don't appear
3. ✅ Success: Matches are private to creators

## Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running: `mongod` or check service status
- Verify `MONGODB_URI` in `.env` is correct
- Try: `mongodb://127.0.0.1:27017/cricket-scoreboard` instead of localhost

### Port Already in Use

- Backend: Change `PORT` in `server/.env`
- Frontend: Change port in `client/vite.config.js`

### CORS Errors

- Verify `CLIENT_URL` in `server/.env` matches frontend URL
- Check backend CORS configuration in `server/src/server.js`

### JWT Token Issues

- Clear browser cookies and localStorage
- Logout and login again
- Verify `JWT_SECRET` is set in `.env`

### Frontend Build Issues

- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Clear npm cache: `npm cache clean --force`

## Development Notes

### Key Features Implemented

- ✅ Secure authentication (bcrypt + JWT + HttpOnly cookies)
- ✅ Full CRUD for matches
- ✅ Ball-by-ball tracking with events
- ✅ Automatic score calculation and state management
- ✅ Strike rotation on odd runs
- ✅ Over completion and innings transitions
- ✅ Edit past balls with recomputation
- ✅ Ownership-based access control
- ✅ Responsive UI with Tailwind CSS
- ✅ Form validation (client and server)
- ✅ Error handling and user feedback

### Future Enhancements (Not Implemented)

- Player statistics aggregation
- Multiple match formats (T20, ODI, Test)
- Advanced analytics and graphs
- Export match scorecard as PDF
- Mobile app version
- Live sharing (websockets)

## License

MIT License - Feel free to use this project for learning and development.

## Support

For issues or questions, please check:

1. This README for setup instructions
2. Console logs for error messages
3. MongoDB connection status
4. Network tab for API errors

---

**Happy Scoring! 🏏**
