FROM codercom/code-server
RUN mkdir -p ~/.docker/cli-plugins
COPY --from=docker /usr/local/bin/docker /usr/local/bin/docker
COPY --from=docker /usr/local/libexec/docker/cli-plugins /home/coder/.docker/cli-plugins
USER root
RUN curl -fsSL https://deb.nodesource.com/setup_22.x -o /tmp/nodesource_setup.sh && \
    bash /tmp/nodesource_setup.sh && \
    apt-get install -y nodejs && \
    rm /tmp/nodesource_setup.sh && \
    rm -rf /var/lib/apt/lists/*
USER 1000
RUN code-server --install-extension orta.vscode-jest
RUN code-server --install-extension ms-azuretools.vscode-docker