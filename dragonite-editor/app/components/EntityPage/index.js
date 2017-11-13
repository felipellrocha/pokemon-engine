import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom'

import {
  Entity,
  EntitySidebar,
  InlineSVG,
} from 'components';

import {
  addEntity,
} from 'actions';

import styles from './styles.css';

class component extends PureComponent {
  render() {
    const {
      entities,
      addEntity,
    } = this.props;

    return (
      <div className={styles.component}>
        <EntitySidebar />
        <div className="main">
          {Object.keys(entities).map(id => {
            const entity = entities[id];
            return (<Entity key={id} id={id} />)
          })}
          <div className="entity add" onClick={addEntity}>
            <div>Add a new entity</div>
            <InlineSVG icon="plus" />
          </div>
        </div>
     </div>
    );
  }
}

export default compose(
  connect(
    state => ({
      entities: state.app.entities,
    }),
    dispatch => ({
      addEntity: () => dispatch(addEntity()),
    }),
  ),
  withRouter,
)(component);
