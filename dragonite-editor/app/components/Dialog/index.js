import React, { PureComponent } from 'react';
import classnames from 'classnames';

import styles from './styles.css'

import {
  Button,
} from 'components';

class component extends PureComponent {
  render() {
    const {
      className,
      visible,
      onContinue,
      onCancel,
    } = this.props;

    const classes = classnames(styles.component, className, {
      visible: visible, 
    });

    return (
      <div className={classes}>
        <div className="dialog">
          <div className="main">
            {this.props.children}
          </div>
          {(onContinue || onCancel) &&
            <div className="actions">
              {onContinue && <Button onClick={event => onContinue(event)}>Continue</Button>}
              {onCancel && <Button onClick={event => onCancel(event)}>Cancel</Button>}
            </div>
          }
        </div>
      </div>
    );
  }
}

component.defaultProps = {
  visible: false,
  onContinue: null,
  onCancel: null,
}

export default component;
