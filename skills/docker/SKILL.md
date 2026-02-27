---
name: docker
description: Auto-learned from EvoMap. The Docker build is timing out due to slow npm ci installation of a large node_modules, which can be mitigated with layer caching, multi-stage builds, and other optimizations.
---

# docker

Auto-generated skill from EvoMap asset.

## Summary
The Docker build is timing out due to slow npm ci installation of a large node_modules, which can be mitigated with layer caching, multi-stage builds, and other optimizations.

## Signals
N/A

## Strategy
N/A

## Content
Docker build timeouts when running `npm ci` in large Node.js projects are a common problem, typically stemming from the time it takes to install a large number of dependencies. Here's a breakdown of the issue and potential solutions:

**Problem:**

The `npm ci` command, while designed for clean and reproducible builds, can be slow, especially when dealing with numerous dependencies. If the Docker build doesn't leverage layer caching effectively, `npm ci` will re-run on every build, exacerbating the timeout issue. A cache miss often happens when `package.json` or `package-lock.json` change, forcing `npm ci` to reinstall everything.

**Solutions:**

1.  **Leverage Docker Layer Caching:**
	*   Order your Dockerfile commands strategically. Copy `package.json` and `package-lock.json` first, then run `npm ci`. This allows Docker to cache the `node_modules` layer as long as these two files remain unchanged. Any changes to the source code *after* this step won't invalidate the `node_modules` cache.

	    dockerfile
	    FROM node:16-alpine

	    WORKDIR /app

	    COPY package*.json ./
	    RUN npm ci --omit=dev

	    COPY . .

	    CMD ["npm", "start"]
	    
	    Note the use of `--omit=dev` in production to avoid installing development dependencies.

2.  **Multi-Stage Builds:**
	*   Use multi-stage builds to separate the dependency installation from the final image.  This reduces the final image size and can improve build times. Install dependencies in an intermediate stage, then copy the `node_modules` folder to the final stage.

	    dockerfile
	    # Install dependencies
	    FROM node:16-alpine AS builder
	    WORKDIR /app
	    COPY package*.json ./
	    RUN npm ci --omit=dev

	    # Build the application
	    COPY . .
	    RUN npm run build

	    # Production image
	    FROM node:16-alpine
	    WORKDIR /app
	    COPY --from=builder /app/node_modules ./node_modules
	    COPY --from=builder /app/dist ./dist # Copy built assets
	    COPY package*.json ./
		CMD ["node", "dist/index.js"]
	    

3.  **Alternative Package Managers:**
	*   Consider using `yarn` or `pnpm`.  `yarn` can sometimes be faster than `npm` due to its parallel installation approach. `pnpm` uses a content-addressable file system to save disk space and can be significantly faster when dealing with large dependency trees. However, switching package managers requires modifying your build process and potentially your codebase.

	    dockerfile
	    # Using yarn
	    FROM node:16-alpine

	    WORKDIR /app

	    COPY package*.json ./
	    RUN yarn install --frozen-lockfile --production

	    COPY . .

	    CMD ["npm", "start"]
	    

	    dockerfile
	    # Using pnpm
	    FROM node:16-alpine

	    WORKDIR /app

	    COPY package*.json pnpm-lock.yaml ./
	    RUN npm install -g pnpm
	    RUN pnpm install --frozen-lockfile --prod

	    COPY . .

	    CMD ["npm", "start"]
	    

4. **Increase Docker Build Timeout:**
While not a direct solution, you can increase the default Docker build timeout if all other optimizations fail. However, this should be a last resort. The method to increase the timeout varies depending on your Docker setup (e.g., Docker Desktop, Docker Engine).

5.  **`.dockerignore` File:**
	*   Ensure your `.dockerignore` file is properly configured to exclude unnecessary files and folders (e.g., `node_modules` before dependency installation, build artifacts).  This speeds up the `COPY` command and reduces the image size.

	    .dockerignore
	    node_modules
	    dist
	    coverage
	    .git
	    

**Actionable Advice:**

*   Start by optimizing your Dockerfile using layer caching and a `.dockerignore` file. These are the easiest and safest changes to implement.
*   If the build remains slow, consider multi-stage builds to reduce the final image size and isolate the dependency installation process.
*   Evaluate switching to `yarn` or `pnpm` if you're still facing performance issues with `npm`.  Benchmark their performance in your specific project before making a complete switch.
*   Only increase the Docker build timeout as a last resort, after exhausting all other optimization strategies.


---
*Auto-generated from EvoMap*
