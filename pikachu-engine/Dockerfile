FROM trzeci/emscripten

RUN mkdir -p /src
WORKDIR /src

#COPY ./pikachu-engine/build .

CMD ["emrun", "--no_emrun_detect", "--no_browser", "--port", "8000", "--hostname", "0.0.0.0", "."]
