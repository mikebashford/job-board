# Database Setup

1. Create a `.env` file in the `backend` directory with the following content:

```
DATABASE_URL=postgres://user:password@localhost:5432/job_board
```

Replace `user`, `password`, and `job_board` with your local PostgreSQL credentials and database name.

2. Run Drizzle migrations after configuring your database and .env file.
