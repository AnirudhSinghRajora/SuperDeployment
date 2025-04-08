# Chat Application

This is a real-time chat application with a client and server architecture.

## Project Structure
- `client/` - React frontend
- `server/` - Express backend with Socket.io

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)

### Server Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   PORT=8080
   MONGODB_URI=mongodb+srv://admin:admin123@cluster0.mongodb.net/chat-app?retryWrites=true&w=majority
   JWT_SECRET=your-secret-key-here
   JWT_SECREAT_KEY=your-secret-key-here
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```
   Note: Replace the MongoDB URI with your own connection string.

4. Start the server:
   ```bash
   npm start
   ```

### Client Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   REACT_APP_API_URL=http://localhost:8080
   REACT_APP_SOCKET_URL=http://localhost:8080
   REACT_APP_BACKEND_URL=http://localhost:8080
   ```
4. Start the client:
   ```bash
   npm start
   ```

## Using the Application
1. Open your browser and navigate to `http://localhost:3000`
2. Register a new account or log in with existing credentials
3. Start chatting with other users

## Deployment Notes
- For production, update the environment variables accordingly
- Set proper CORS configuration
- Use strong, unique JWT secret keys
- Consider using a process manager like PM2 for the server 