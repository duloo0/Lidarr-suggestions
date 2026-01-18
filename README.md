This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Docker Deployment

### Quick Start with Docker Compose

1. Copy the environment template:
```bash
cp .env.example .env
```

2. (Optional) Customize your `.env` file:
```env
APP_PORT=3000              # Change the port if needed
DOCKER_NETWORK=lidarr-suggestions-network  # Change network name if needed
```

3. Build and start the container:
```bash
docker-compose up -d
```

4. Access the application at [http://localhost:3000](http://localhost:3000) (or your configured port)

### Docker Commands

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down

# Rebuild after code changes
docker-compose up -d --build

# Stop and remove everything (including network)
docker-compose down -v
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_PORT` | `3000` | Host port to expose the application |
| `DOCKER_NETWORK` | `lidarr-suggestions-network` | Docker network name |
| `NODE_ENV` | `production` | Node environment mode |

### Manual Docker Build

```bash
# Build the image
docker build -t lidarr-suggestions:latest .

# Run the container
docker run -d \
  --name lidarr-suggestions \
  -p 3000:3000 \
  --restart unless-stopped \
  lidarr-suggestions:latest
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
