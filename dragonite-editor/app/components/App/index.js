import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';

import { Route } from 'react-router-dom';
import styles from './styles.css';

import {
  InitialPage,

  EntityPage,
  SelectorPage,
  ImportPage,
  SettingsPage,
  AnimationPage,

  Sidebar,
  Footer,
} from 'components';

class component extends PureComponent {
  constructor(props) {
    super(props);

    this.ensureFileIsLoaded = this.ensureFileIsLoaded.bind(this);
  }
  
  ensureFileIsLoaded(component) {
    const {
      filename,
    } = this.props;

    return (filename !== '') ? component : InitialPage;

  }

  render() {
    return (
      <div className={styles.component}>

        <Route exact path="/" component={this.ensureFileIsLoaded(SelectorPage)} />
        <Route path="/entity" component={this.ensureFileIsLoaded(EntityPage)} />
        <Route path="/selector" component={this.ensureFileIsLoaded(SelectorPage)} />
        <Route path="/import" component={this.ensureFileIsLoaded(ImportPage)} />
        <Route path="/settings" component={this.ensureFileIsLoaded(SettingsPage)} />
        <Route path="/animations" component={this.ensureFileIsLoaded(AnimationPage)} />

      </div>
    );
  };
};

export default compose(
  withRouter,
  connect(state => ({
    filename: state.global.filename,
  })),
)(component);
