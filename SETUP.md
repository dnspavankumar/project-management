# MongoDB Setup Guide

You need MongoDB to run this application. Choose one of these options:

## Option 1: MongoDB Atlas (Cloud - Recommended for Quick Start)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free account
3. Create a new cluster (free tier available)
4. Click "Connect" on your cluster
5. Choose "Connect your application"
6. Copy the connection string
7. Update `.env.local`:
```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/project-management?retryWrites=true&w=majority
```
8. Replace `<username>` and `<password>` with your database credentials
9. Make sure to whitelist your IP address in Atlas Network Access

## Option 2: Install MongoDB Locally (Windows)

### Using MongoDB Community Server:

1. Download MongoDB Community Server from:
   https://www.mongodb.com/try/download/community

2. Run the installer (choose "Complete" installation)

3. During installation:
   - Install MongoDB as a Service
   - Use default data directory

4. After installation, MongoDB should start automatically

5. Verify installation:
```bash
mongod --version
```

6. Your `.env.local` should have:
```
MONGODB_URI=mongodb://localhost:27017/project-management
```

### Using Docker (if you have Docker installed):

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Option 3: Use MongoDB Compass (GUI Tool)

1. Download [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. Install and open it
3. Connect to `mongodb://localhost:27017`
4. This provides a visual interface to manage your database

## Verify Connection

After setting up MongoDB, restart your Next.js dev server:

```bash
npm run dev
```

Check the terminal for:
- ✅ MongoDB connected successfully

If you see connection errors:
- Ensure MongoDB is running
- Check your connection string in `.env.local`
- For Atlas: verify IP whitelist and credentials
- For local: ensure MongoDB service is started

## Troubleshooting

**Error: "connect ECONNREFUSED"**
- MongoDB is not running. Start the MongoDB service.

**Error: "Authentication failed"**
- Check username/password in connection string

**Error: "Server selection timeout"**
- For Atlas: Check IP whitelist
- For local: Ensure MongoDB is running on port 27017
