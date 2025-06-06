# Hands-on Three: Building container images

## Learning objectives

In this hands-on, you will complete the following objectives:

- Learn how to build a simple container image
- Learn how to use Docker Compose to test the containerized app

Let's get started!


## Segment One: Containerizing the Node app

To build container images, we're going to use a `Dockerfile`, which is basically the instruction set on how to build an image.

From there, we will then build the image and then run it!

1. At the root of this project, create a file named `Dockerfile` (no file extension) with the following contents:

    ```dockerfile
    FROM node:lts-slim
    WORKDIR /usr/local/app
    COPY package* ./
    RUN npm ci --production
    COPY ./src ./src
    CMD ["node", "src/index.js"]
    ```
   
    - `FROM node:lts-slim` - the image to start from and extend
    - `COPY package* ./` - copy the dependency descriptor files into the container image
    - `RUN npm ci --production` - install only the production dependencies into the container
    - `COPY ./src ./src` - copy in the app files
    - `CMD ["node", "src/index.js]` - the default command that should be executed when starting a container from this image

3. Use the following `docker build` command to build a container image:

    ```console
    docker build -t node-app .
    ```

   - `-t node-app` - tag (or name) the newly built image as `node-app`
   - `.` - the location of the Dockerfile and other referenced files (a `.` means the current directory)



## Segment Two: Testing the containerized app

Now that we have a Dockerfile and we're able to build it, let's make another Compose file that will allow us to test our fully containerized app.

1. At the root of the project, create a new file called `compose-prod.yaml` with the following contents:

      ```yaml
      services:
        server:
          build: ./
          ports:
             - 3000:3000
          depends_on:
             - postgres  # Ensure the database starts before the app
          environment:
             POSTGRES_HOST: postgres # Uses the service name of the database as the host
             POSTGRES_PORT: 5432
             POSTGRES_USER: postgres
             POSTGRES_PASSWORD: postgres 
             POSTGRES_DB: postgres
      
        postgres:
          image: postgres:16-alpine
          environment:
             POSTGRES_USER: postgres
             POSTGRES_PASSWORD: postgres 
             POSTGRES_DB: postgres
    ```

    You'll notice there are now _two_ containers defined here. The first one (named `server`) also indicates the image will come from the output of a build.

2. Start the stack by using the following Compose file:

    ```console
    docker compose -f compose-prod.yaml up
    ```
   
    You'll see an image build and then start the stack!

> [!IMPORTANT]
> When using `build` in a Compose file, the image will be built only on the first launch. Add the `--build` flag to rebuild the image at launch.


## Recap

In this hands-on, you accomplished the following:

- Created a basic Dockerfile to create a container image
- Created a Compose file that can be used to test the containerized application
