import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import {
  Tile,
  InlineSVG,
  Button,
} from 'components';

import {
  changeTerrain,
  selectTilesets,
} from 'actions';

import styles from './styles.css';

class component extends PureComponent {
  render() {
    const {
      className,
      selectedTerrainType,

      changeTerrainType,
      importTextures,
    } = this.props;

    const classes = classnames(styles.component, className);

    return (
      <div className={classes}>
        <div className="left">
          <div>Terrain type:
            <select value={selectedTerrainType} onChange={changeTerrainType} >
              <option value='6-animated'>6 Type:Animated</option>
              <option value='6-tile'>6 Type</option>
              <option value='4-tile'>4 Type</option>
            </select>
          </div>
        </div>
        <div className="right">
          <Button onClick={importTextures}>
            Add texture
          </Button>
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    selectedTerrainType: state.global.selectedTerrainType,
  }),
  dispatch => ({
    changeTerrainType: (event) => dispatch(changeTerrain(event.target.value)),
    importTextures: () => dispatch(selectTilesets()),
  }),
)(component);
