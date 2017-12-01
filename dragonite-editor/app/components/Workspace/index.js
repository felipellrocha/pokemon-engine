import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import classnames from 'classnames';

import styles from './styles.css';

import {
  Grid,
  Objects,
} from 'components';

import {
  putDownTile,
  paintTile,
} from 'actions';

import { memoize, throttle } from 'lodash';

class Workspace extends PureComponent {
  constructor(props) {
    super(props);

    this._handlePutTile = throttle(this._handlePutTile.bind(this), 50, { leading: true});

    this._handleMouseMove = this._handleMouseMove.bind(this);
    this._handleMouseDown = this._handleMouseDown.bind(this);
    this._handleMouseUp = this._handleMouseUp.bind(this);

    this.state = {
      mouseDown: false,
    }
  }

  _handleMouseMove(event) {
    event.persist();

    this._handlePutTile(event);
  }

  _handlePutTile(e) {
    if (!this.state.mouseDown && e.type !== 'click') { return }

    const {
      offsetX: x,
      offsetY: y,
    } = e.nativeEvent;

    const {
      dispatch,
      tile,
      method,
      selectedLayer,
      selectedTile,
    } = this.props;

    const xy = {
      x: Math.floor(x / tile.width),
      y: Math.floor(y / tile.height),
    };

    if (method === 'put') dispatch(putDownTile(xy));
    else dispatch(paintTile(xy, selectedLayer, selectedTile));
  }

  _handleMouseDown() {
    this.setState({
      mouseDown: true,
    });
  }

  _handleMouseUp() {
    this.setState({
      mouseDown: false,
    });
  }

  render() {
    const {
      grid,
      tile,
      data,
      layers,
      tileAction,
      method,
      selectedLayer,
    } = this.props;

    const style = {
      width: grid.columns * tile.width,
      height: grid.rows * tile.height,
    }

    const actionMethod = (method === 'put') ?
      putDownTile :
      paintTile;

    return (
      <div
        className={styles.component}
        style={style}
      > 
        {layers.map((layer, index) => {
          if (!layer.visible) return null;

          const classes = classnames(styles.stack, {
            [styles.disableEvents]: selectedLayer !== index,
          });

          return (layer.type === 'tile') ?
            (
              <Grid
                key={layer.id}
                grid={grid}
                data={layer.data}
                className={classes}
                actionMethod={actionMethod}

                onClick={this._handlePutTile}
                onMouseMove={this._handleMouseMove}
                onMouseDown={this._handleMouseDown}
                onMouseUp={this._handleMouseUp}

                togglableGrid
                workspace
              />
            ) :
            (
              <Objects
                key={layer.id}
                layer={layer}
                grid={grid}
                className={classes}
              />
            )
        })}
      </div>
    );
  }
}

export default connect(
  (state, props) => ({
    layers: state.tilemap.layers,
    grid: state.tilemap.grid,
    tile: state.app.tile,
    selectedLayer: state.global.selectedLayer,
    selectedObject: state.global.selectedObject,
    selectedTile: state.global.selectedTile,
    method: state.global.selectedAction,
  }),
)(Workspace);
