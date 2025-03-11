# Workshop PoC

This is only a PoC that demonstrates how one might be able to launch a workshop using containers in a multi-tenant fashion.

Due to the [Docker Socket Proxy](https://github.com/mikesir87/docker-socket-proxy) in the environment, there are a few protections/configurations that make this environment unique:

- Docker commands will only return the items created by this environment
- Mounts in new containers are only allowed from the project directory
- Mount source paths are remapped to ensure file paths work correctly
- Requests to start a new container with the Docker socket will be remapped to use the proxied socket

## Known limitations

- Running multiple instances will cause port conflicts
- Volume names are currently hard-coded in the Compose file (for remapping/allowlisting of mount sources)

## Try it out

To try it out, you'll first start off by launching the workshop environment. After that, you can try a few things in the workshop environment.

### Start the workshop stack

1. Clone this project

2. Start the stack using Docker Compose

    ```console
    docker compose up -d
    ```

3. Open http://localhost:8085. When you're prompted for the password, simply enter `password`.


### Test out the workshop environment

1. Once you're in VS Code, open a terminal (Menu -> Terminal -> New Terminal)

2. In the terminal, run a `docker ps`. Notice how you see no other containers, even though there are other containers running on the machine (run the same `docker ps` in another terminal directly on your machine)!

3. Start the application stack by launching Docker Compose:

    ```console
    docker compose up -d
    ````

    You'll see all of the containers start up successfully!

4. Run another `docker ps` and you'll see the containers you started!

5. To experiment with the volume remapping... start another container and mount the `dev/db` directory into the container:

    ```console
    docker run --rm -tiv ./dev/db:/data ubuntu
    ```

    Now, run `ls /data` and see the file that's there! Yet, if you look at the container config on the host, you'll see the volume mount's source is _not_ `./dev/db`, but the `project` volume!

    Exit that container now by running `exit`

6. To experiment with the Docker Socket remapping, start a new container and share the Docker socket:

    ```console
    docker run --rm -tiv /var/run/docker.sock:/var/run/docker.sock docker sh
    ```

    In this new terminal, run `docker ps` and validate you can still only see the containers created inside of the workshop!

    If you inspect this `docker` container from the host, you'll see that the socket is the proxied socket, not `/var/run/docker.sock`.

7. To run the Testcontainers tests, run `npm run integration-test` in the VS code terminal (not inside of a container).

    You'll see the containers start up and run as you would expect! All of the mount paths are remapped, etc.