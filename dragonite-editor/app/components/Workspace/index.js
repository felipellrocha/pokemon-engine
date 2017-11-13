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

import { memoize } from 'lodash';

class Workspace extends PureComponent {
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
        onClick={this._handlePutTile}
        onMouseMove={this._handlePutTile}
        onMouseDown={this._handleMouseDown}
        onMouseUp={this._handleMouseUp}
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
