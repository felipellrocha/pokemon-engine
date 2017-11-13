import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import classnames from 'classnames';
import { withRouter } from 'react-router-dom'

import { memoize } from 'lodash';

import {
  loadComponents,
} from 'actions';

import {
  Button,
} from 'components';

import styles from './styles.css';

class component extends PureComponent {
  render() {
    const {
      components,
      
      loadComponents,
      reloadComponents,
    } = this.props;

    return (
      <div className={styles.component}>
        <h1>Entities</h1>
        <Button onClick={loadComponents}>Load Component file</Button>
        <Button onClick={reloadComponents}>Reload Components</Button>
        <div className="components">
          {components.map(component => {
            const members = Object.keys(component.members);
            return (
              <div
                className="component"
                key={component.name}
                onDragStart={event => {
                  event.dataTransfer.setData('text/plain', JSON.stringify(component));
                }}
                draggable
              >
                {component.name}
                {members.length > 0 &&
                  <div className="members">
                    {members.map(name => {
                      const member = component.members[name];

                      return (
                        <div className="member" key={ member.name }>
                          <strong>{ member.type }</strong>: { member.name }
                        </div>
                      )
                    })}
                  </div>
                }
              </div>
            )
          })}
        </div>
      </div>
    );
  }
}

export default compose(
  connect(
    state => ({
      components: state.global.components,
    }),
    dispatch => ({
      loadComponents: () => dispatch(loadComponents()),
      reloadComponents: () => dispatch(loadComponents(true)),
    }),
  ),
  withRouter,
)(component);
