import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import classnames from 'classnames';

import styles from './styles.css';

class component extends PureComponent {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event) {
    const {
      disabled,
      onClick,
    } = this.props;

    if (!disabled && onClick) onClick(event);
  }

  render() {
    const {
      label,
      className,
      disabled,
    } = this.props;

    const classes = classnames(styles.component, className, {
      disabled: disabled,
    });

    return (
      <a
        className={classes}
        onClick={this.handleClick}
      >
        { this.props.children }
      </a>
    );
  }
}

export default component;
