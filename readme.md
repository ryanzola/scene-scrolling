# Three.js - Template - Complex

🚧 This template is under construction

## Setup

### Prerequisites

1. Install [Docker](https://docs.docker.com/get-docker/).
2. Install [Make](https://www.gnu.org/software/make/) (optional, for convenience).

### Development Environment

Using Docker and Makefile:

```bash
# Build the Docker image (only the first time or when dependencies change)
make build

# Run the local server at localhost:3000 using Docker
make up

# Stop the local server and clean up the container
make down
```

### Alternatively, without Make:

```bash
# Build the Docker image (only the first time or when dependencies change)
docker build -t template-complex -f Dockerfile .

# Run the local server at localhost:3000 using Docker
docker run --rm --name template-complex \
  -p 3000:3000 \
  -v ${PWD}:/app \
  -v /app/node_modules \
  template-complex

# Stop the local server and clean up the container (in a separate terminal)
docker stop template-complex
rm -rf ./node_modules
```

### Production Build

```bash
# Build for production in the dist/ directory
docker run --rm \
  -v ${PWD}:/app \
  -v /app/node_modules \
  template-complex \
  npm run build
```
