import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';

import {
  Grid,
  InlineSVG,
  Sidebar,
  SelectorFooter,
  Workspace,
} from 'components';


import {
  changeGridColumns,
  changeGridRows,
} from 'actions';

import styles from './styles.css';

class component extends PureComponent {
  constructor(props) {
    super(props);

    this._handleRemoveRow = this._handleRemoveRow.bind(this);
    this._handleAddRow = this._handleAddRow.bind(this);
    this._handleRemoveColumn = this._handleRemoveColumn.bind(this);
    this._handleAddColumn = this._handleAddColumn.bind(this);
  }
  
  _handleRemoveRow() {
    const {
      dispatch,
      grid,
    } = this.props;

    dispatch(changeGridRows(grid.rows - 1));
  }

  _handleAddRow() {
    const {
      dispatch,
      grid,
    } = this.props;

    dispatch(changeGridRows(grid.rows + 1));
  }

  _handleRemoveColumn() {
    const {
      dispatch,
      grid,
    } = this.props;

    dispatch(changeGridColumns(grid.columns - 1));
  }

  _handleAddColumn() {
    const {
      dispatch,
      grid,
    } = this.props;

    dispatch(changeGridColumns(grid.columns + 1));
  }

  render() {
    const {
      grid,
      tile,
      data,
      layers,
      zoom,
    } = this.props;

    const style = {
      transform: `scale(${zoom})`,
    };

    return (
      <div className={styles.component}>
        <Sidebar />
        <div className="work-area" style={style} >
          <Workspace />
        </div>
        <InlineSVG className="action columns-remove" icon="minus" onClick={this._handleRemoveColumn} />
        <InlineSVG className="action columns-add" icon="plus" onClick={this._handleAddColumn} />
        <InlineSVG className="action rows-add" icon="plus" onClick={this._handleAddRow} />
        <InlineSVG className="action rows-remove" icon="minus" onClick={this._handleRemoveRow} />
        <SelectorFooter />
      </div>
    );
  }
}

export default compose(
  connect(state => ({
    tile: state.app.tile,
    data: state.app.data,
    zoom: state.global.zoom,
    grid: state.tilemap.grid,
  })),
)(component);
