FROM codercom/code-server

ENV CS_DISABLE_GETTING_STARTED_OVERRIDE=1
ENV PORT=8085
EXPOSE 8085

RUN mkdir -p ~/.docker/cli-plugins
COPY --link --from=docker /usr/local/bin/docker /usr/local/bin/docker
COPY --link --from=docker /usr/local/libexec/docker/cli-plugins /home/coder/.docker/cli-plugins

USER root
RUN curl -fsSL https://deb.nodesource.com/setup_22.x -o /tmp/nodesource_setup.sh && \
    bash /tmp/nodesource_setup.sh && \
    apt-get install -y nodejs && \
    rm /tmp/nodesource_setup.sh && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /home/coder/.config/code-server && \
    mkdir -p /home/coder/.local/share/code-server && \
    chown -R coder:coder /home/coder/.config/code-server && \
    chown -R coder:coder /home/coder/.local/share/code-server

USER 1000
RUN code-server --install-extension orta.vscode-jest && \
    code-server --install-extension ms-azuretools.vscode-docker
COPY ./config.yaml /home/coder/.config/code-server/config.yaml
