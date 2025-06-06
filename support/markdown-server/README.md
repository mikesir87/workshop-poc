## Running the Project with Docker

This project is containerized using Docker and can be run easily with Docker Compose. Below are the project-specific instructions and requirements:

### Requirements
- **Node.js version:** The Dockerfile uses `node:22.13.1-slim` (set via `NODE_VERSION` build argument).
- **No external services** (databases, caches, etc.) are required.
- **No persistent storage** is configured by default.

### Environment Variables
- No required environment variables are set by default in the Dockerfile or compose file.
- If you need to provide environment variables, you can create a `.env` file and uncomment the `env_file` line in `docker-compose.yml`.

### Build and Run Instructions
1. **Build and start the service:**
   ```sh
   docker compose up --build
   ```
   This will build the image and start the `javascript-app` service.

2. **Access the application:**
   - The app will be available on [http://localhost:3000](http://localhost:3000)

### Ports
- **3000**: The application exposes port 3000 (as set in both the Dockerfile and Docker Compose).

### Special Configuration
- The container runs as a non-root user (`appuser`) for improved security.
- The build uses `npm ci --production` for deterministic, production-only installs.
- No volumes or custom networks are configured by default.

---

*Update this section if you add environment variables, persistent storage, or additional services in the future.*