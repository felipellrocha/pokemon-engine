#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>
#endif

#include "sdl2image.h"
#include <iostream>

#include "timer/timer.h"
#include "renderer/renderer.h"
#include "exceptions.h"
#include "entity/entity.h"

#include "networking/websocket.hpp"

const int SCREEN_FPS = 60;
const int SCREEN_TICKS_PER_FRAME = 1000 / SCREEN_FPS;

LTimer fpsTimer;
LTimer capTimer;
int countedFrames = 0;


void loop(Renderer &renderer) {
  capTimer.start();

  float avgFPS = countedFrames / (fpsTimer.getTicks() / 1000.f);
  if (avgFPS > 2000000) avgFPS = 0;

  renderer.loop((double)countedFrames / fpsTimer.getTicks());

  countedFrames++;

  int frameTicks = capTimer.getTicks();
  if (frameTicks < SCREEN_TICKS_PER_FRAME) SDL_Delay(SCREEN_TICKS_PER_FRAME - frameTicks);
}

#ifdef __EMSCRIPTEN__
extern "C" {

  WebSocket::pointer sock = WebSocket::simple_socket();
  EntityManager *manager = new EntityManager();
  Renderer game = Renderer("assets/metroidvania/", sock, manager, 100, 100);

  void resize(int width, int height) {
    game.resize(width, height);
  }

  int initialize() {
    fpsTimer.start();

    string data;
    printf("connecting...\n");
    for (int hasResponded = 0; sock->getReadyState() != WebSocket::CLOSED && hasResponded < 1; hasResponded++) {
      sock->poll(-1);
      sock->dispatch([&data](const string& message) {
        printf("connected!\n");
        data = message;
      });

      printf("message: %s\n", data.c_str());
    }

    game.bootstrap(data);

    emscripten_set_main_loop_arg((em_arg_callback_func)loop, &game, -1, 1);
    SDL_Quit();
    return 0;
  }
}
#else

int main() {
  //string id;
  //printf("What is the game id?\n");
  //getline(cin, id);

  //string url = "ws://localhost:8000/game/" + string(id);
  //string url = "ws://localhost:9000/socket/game/" + string(id);
  string url = "ws://localhost:8000/game/test";
  //string url = "ws://localhost:9000/socket/game/test";

  WebSocket::pointer socket = WebSocket::from_url(url);

  string data;
  for (int hasResponded = 0; socket->getReadyState() != WebSocket::CLOSED && hasResponded < 1; hasResponded++) {
    socket->poll(-1);
    socket->dispatch([&data](const string& message) {
      printf("received!\n");

      data = message;
    });
    printf("Waiting for responses...\n");
  }
  printf("message: %s", data.c_str());

  fpsTimer.start();
  
  EntityManager *manager = new EntityManager();
  Renderer game = Renderer("assets/metroidvania/", socket, manager, 100, 100);
  game.bootstrap(data);

  while (game.isRunning()) {
    loop(game);
  }

  SDL_Quit();
  return 0;
}
#endif
