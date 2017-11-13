import React, { PureComponent } from 'react';
import classnames from 'classnames';

export default class component extends PureComponent {
  render() {
    const src = require(`icons/${this.props.icon}.svg`);
    const classes = classnames('icon', this.props.className);

    return (
      <div
        {...this.props}
        className={classes}
        dangerouslySetInnerHTML={{ __html: src }}
      />
    );
  }
}

