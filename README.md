# 📚 Study Mate

A full-stack social learning platform designed to help students find study partners, join groups, and explore community. Built with the MERN stack and powered by real-time features.

## 🔗 Live Demo
**[[View Live Application](YOUR_LIVE_LINK_HERE)](https://studymate-frontend-kq19.onrender.com/)**

---

## ✨ Features

- **authentication & Profiles**: Secure user login/signup using JWT and detailed user profiles.
- **Study Partners**: Match-making system to find the perfect study buddy.
- **Community & Posts**: Create posts, share updates, and comment on discussions.
- **Real-time Chat**: Instant messaging and group chats powered by **Socket.io**.
- **Study Groups**: Create or join study groups based on interests.
- **Notifications**: Real-time updates for interactions.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS
- **State/HTTP**: Axios, Context API
- **Real-time**: Socket.io Client

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JSON Web Tokens (JWT), Bcryptjs
- **Real-time**: Socket.io
- **Utilities**: Nodemailer (Email), Multer (File Uploads), Zod (Validation)

---

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (Local or Atlas URI)

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/study-mate.git](https://github.com/your-username/study-mate.git)
cd study-mate
2. Backend Setup
Navigate to the backend folder and install dependencies:

Bash
cd BackEnd
npm install
Create a .env file in the BackEnd directory and add the following variables:

Code snippet
PORT=5000
MONGO=mongodb+srv://<your-mongo-uri>
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_super_secret_key
NODE_ENV=development
# Add email service credentials if needed for Nodemailer
Start the backend server:

Bash
npm run dev
3. Frontend Setup
Open a new terminal, navigate to the frontend folder, and install dependencies:

Bash
cd FrontEnd
npm install
Create a .env.local file in the FrontEnd directory:

Code snippet
GEMINI_API_KEY=your_google_gemini_api_key
# If you are not using a proxy in vite.config.js, specify the API URL:
VITE_API_URL=http://localhost:5000
Start the frontend application:

Bash
npm run dev
The app should now be running at http://localhost:5173.

📂 Project Structure
Plaintext
Study_Mate/
├── BackEnd/
│   ├── config/         # DB connection
│   ├── controllers/    # Route logic (Auth, Post, User, etc.)
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   └── server.js       # Entry point
│
├── FrontEnd/
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── services/   # API & Socket services
│   │   └── App.jsx     # Main application component
│   └── vite.config.js  # Vite configuration
🤝 Contributing
Contributions are welcome! Please fork the repository and create a pull request.

📄 License
This project is licensed under the MIT License.
