import React, { Component } from 'react';
import styles from './styles.css';

import {
  InlineSVG,
} from 'components';

class Game extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      loading: true,
    };

    this.renderStatus = this.renderStatus.bind(this);
  }

  componentDidMount() {
    const {
      gameId,
    } = this.props;
    const context = this;

    fetch('engine/main.wasm')
      .then(response => response.arrayBuffer())
      .then(buffer => {

        const script = document.createElement('script');
        script.src = 'engine/main.js';
        script.onload = function() {

          this.config = {
            wasmBinary: buffer,
            print: console.log.bind(console),
            printErr: console.error.bind(console),
            canvas: document.querySelector('canvas'),
            websocket: {
              //url: `ws://${window.location.host}/socket/game/${gameId}`,
              url: `ws://localhost:8000/game/${gameId}`,
              subprotocol: 'binary',
            },
            locateFile: function (file) {
              return `/engine/${file}`;
            },
            onRuntimeInitialized: function() {
              const initialize = this.cwrap('initialize', 'number', []);

              const resize = this.cwrap('resize', 'void', ['number', 'number']);
              var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
              var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

              try {
                initialize();
              } catch(e) {
                if (e !== "SimulateInfiniteLoop") {
                  console.log('Error found: ', e, e.stack);
                  return;
                }
              };
              resize(width, height);


              window.addEventListener("resize", function() {
                var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
                var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
                resize(width, height);
              });
            },
          };

          // eslint-disable-next-line no-undef
          this.game = Module(this.config);

          context.setState({
            loading: false,
          });
        };

        document.body.appendChild(script);
      })
      .catch(err => {
        console.err('ERROR!', err);
        this.setState({
          loading: 'error',
        });
      });
  }

  renderStatus() {
    const {
      loading,
    } = this.state;

    if (loading === 'error') return <div className='error'>There was an error loading the game</div>;
    else if (loading) return <div className='loading'>
      <InlineSVG icon="loader" />
      <span>Loading...</span>
    </div>;
  }

  render() {
    return (
      <div className={styles.component}>
        {this.renderStatus()}
        <canvas />
      </div>
    );
  }
}

export default Game;
