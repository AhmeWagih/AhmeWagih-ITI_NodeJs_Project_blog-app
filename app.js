const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const { default: helmet } = require('helmet');
const { sanitizeMongoInput } = require('express-v5-mongo-sanitize');
const { xss } = require('express-xss-sanitizer');
const hpp = require('hpp');
const morgan = require('morgan');
const cron = require('node-cron');
const Post = require('./models/postsModel');
const logger = require('./config/logger');

cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const result = await Post.updateMany(
      {
        status: 'scheduled',
        publishedAt: { $lte: now }
      },
      {
        $set: {
          status: 'published',
          published: true
        }
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`Cron: Published ${result.modifiedCount} scheduled posts.`);
    }
  } catch (error) {
    console.error('Cron: Error publishing scheduled posts:', error);
  }
});

const usersRouter = require('./routes/usersRoutes');
const postsRouter = require('./routes/postsRoutes');
const commentsRouter = require('./routes/commentsRoutes');
const likesRouter = require('./routes/likesRoutes');
const bookmarksRouter = require('./routes/bookmarksRoutes');
const notificationsRouter = require('./routes/notificationsRoutes');
const donationRouter = require('./routes/donation');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');

const app = express();

// Middleware
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(sanitizeMongoInput);
app.use(xss());
app.use(hpp());
app.use(rateLimiter);
app.use(morgan('combined', { stream: logger.stream }));

// DB connection
mongoose
  .connect(`${process.env.MONGO_URL}/${process.env.DATABASE_NAME}`)
  .then(() => logger.info('DB connection successfully!...'))
  .catch((err) => logger.error('DB connection error:', err));

// Routes
app.use('/users', usersRouter);
app.use('/posts', postsRouter);
app.use('/comments', commentsRouter);
app.use('/likes', likesRouter);
app.use('/bookmarks', bookmarksRouter);
app.use('/notifications', notificationsRouter);
app.use('/donation', donationRouter);

// Global error handler
app.use(errorHandler);

const port = Number(process.env.PORT);
app.listen(port, () => {
  logger.info(`Server listening on port ${port}...`);
});