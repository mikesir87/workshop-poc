# Hands-on Two: Sharing container configurations in your projects

## Learning objectives

In this hands-on, you will complete the following objectives:

- Learn about Docker Compose to share your container configuration

Let's get started!


## Segment One: Writing a Compose file

In the previous hands-on, you launched a container using the CLI (or GUI). While this works, sending teammates a collection of CLI commands can be quite cumbersome.

That's where Docker Compose comes in!

With Docker Compose, you can define all the containers, volumes, and networks required for your application to run using a YAML-based configuration. 

1. At the root of this project, create a file named `compose.yaml` with the following contents:

    ```yaml
    services:
      postgres:
        image: postgres:16-alpine
        ports:
          - 5432:5432
        environment:
          POSTGRES_PASSWORD: postgres 
        volumes:
          - ./db:/docker-entrypoint-initdb.d
    ```

2. If you still have the postgres container running from the previous hands-on, go ahead and remove it now:

    ```console
    docker rm -f postgres
    ```

   The `-f` flag will stop the container first and then remove it (doing both a `docker stop` and a `docker rm`).

3. Launch the stack by using the `docker compose up` command:

    ```console
    docker compose up
    ```

    You'll see the containers start and logs start to stream to the console.

    When you're done, press Ctrl+C to tear it all down!

4. You can also launch the stack and run it in the background, similar to what we did with containers by using the `-d` flag:

    ```console
    docker compose up -d
    ```
   
5. To access the log stream, use the `docker compose logs` command (the `-f` flag will "follow" the log output):

    ```console
    docker compose logs -f
    ```
   
6. When you're done, tear everything down with the `docker compose down` command:

    ```console
    docker compose down
    ```

And... that's it! With this, your team can place a `compose.yaml` at the root of the project and everyone can easily spin up their app's dependencies. And you'll know everyone is on the same version.

> [!TIP]
> When you need to update your database version, simply update the Compose file and everyone on the team will get the update on their next pull and `docker compose up`! No more having to uninstall and reconfigure your machine for a different database.




## Recap

In this hands-on, you accomplished the following:

- Created a Compose file to easily define and share your container config with your team
