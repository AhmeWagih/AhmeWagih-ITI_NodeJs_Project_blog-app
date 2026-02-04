# ITI Blog Project

A production-ready RESTful API for a blogging platform, built with Node.js, Express, and MongoDB.

## 🚀 Features

### Core Features
- **Authentication**: Secure Signup/Login with JWT, Password Hashing (Bcrypt), and Role-based Access Control (Admin/User).
- **User Management**: Profile updates, Follow/Unfollow system, Profile pictures (ImageKit), and Password Reset flow.
- **Blog Posts**: Create, Read, Update, Delete (CRUD), Drafts, Scheduled Publishing, and Image Uploads.
- **Interactions**:
  - **Comments**: Nested comments (up to 2 levels) & Replies.
  - **Likes/Reactions**: Like Posts and Comments.
  - **Bookmarks**: Save posts for later.
- **Search**: Advanced search for Posts (text, tags, author) and Users (name/email).
- **Notifications**: In-app notifications for likes, comments, and follows.
- **Emails**: Automated emails for Welcome, Password Reset, and Notification alerts using Nodemailer.

### Advanced Features
- **Security**: Rate Limiting, Helmet (Headers), Mongo Sanitization, XSS Protection, and HPP.
- **Performance**: Logging (Winston+Morgan), IP-based duplicate view prevention.
- **Docker**: Full Docker support with Docker Compose for easy deployment.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JSON Web Tokens (JWT)
- **File Storage**: ImageKit
- **Email**: Nodemailer
- **Validation**: Joi
- **Containerization**: Docker & Docker Compose

## 📦 Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or Atlas URI)
- ImageKit Account (for images)
- SMTP Server (e.g., Gmail, Mailtrap)

### Steps
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory (see `.env.example` below).

4. **Run the Server**
   ```bash
   # Development Mode (with Nodemon)
   npm run dev
   
   # Production Mode
   npm start
   ```

## 🐳 Running with Docker

1. **Build and Run**
   ```bash
   docker-compose up --build
   ```
   
## 📡 Key API Endpoints

### Auth
- `POST /users/register` - Create account
- `POST /users/login` - Login
- `POST /users/forgot-password` - Request password reset

### Users
- `GET /users/profile` - Get current user
- `PATCH /users/profile` - Update profile
- `GET /users/search?q=name` - Search users

### Posts
- `GET /posts` - Get all published posts
- `POST /posts` - Create post
- `GET /posts/drafts` - Get drafts
- `POST /posts/:id/schedule` - Schedule post publish

### Interactions
- `POST /posts/:id/comments` - Add comment
- `POST /likes/:targetId/toggle` - Like/Unlike Post or Comment
- `POST /users/:id/follow` - Follow user

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
