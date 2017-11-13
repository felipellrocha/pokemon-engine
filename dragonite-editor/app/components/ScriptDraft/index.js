import React from 'react';
import ReactDOM from 'react-dom';
import { List, Map } from 'immutable';
import {
	Editor,
	EditorState,
  ContentState,
} from 'draft-js';

import parser from 'parser/script.peg';

import styles from './styles.css';

function occupySlice(targetArr, start, end, componentKey) {
  for (var ii = start; ii < end; ii++) {
    targetArr[ii] = componentKey;
  }
}

const Decorations = {
  UNSTYLED: 0,
  COMMAND: 1,
  PARAMETER: 2,
  VALUE: 3,
  INFO: 4,
};

const scriptDecorator = {
  getDecorations: function(block) {
    const text = Array.from(block.getText()).fill(Decorations.UNSTYLED);

    try {
      const data = parser.parse(block.getText(), { includeLocation: true });
    
      data.forEach(command => {
        occupySlice(text, command.start, command.end, Decorations.COMMAND);

        command.info.forEach(i => {
          occupySlice(text, i.start, i.end, Decorations.INFO);
        });

        Object.entries(command.parameters).forEach(par => {
          const [ key, value ] = par;
          
          value.info.forEach(i => {
            if (i.type === 'parameter') occupySlice(text, i.start, i.end, Decorations.PARAMETER);
            else occupySlice(text, i.start, i.end, Decorations.INFO);
          });

          occupySlice(text, value.start, value.end, Decorations.VALUE);
        });
      });
    } catch(e) { };

    return List(text);
  },

  getComponentForKey: function(key) {
    if (key === Decorations.UNSTYLED) return (props) => (<span>{props.children}</span>);
    if (key === Decorations.COMMAND) return (props) => (<span className="command">{props.children}</span>);
    if (key === Decorations.PARAMETER) return (props) => (<span className="parameter">{props.children}</span>);
    if (key === Decorations.VALUE) return (props) => (<span className="value">{props.children}</span>);
    if (key === Decorations.INFO) return (props) => (<span className="info">{props.children}</span>);
  },

  getPropsForKey: function(key) {
    return {};
  }
};

class Script extends React.Component {
  constructor(props) {
    super(props);
    this.onChange = (editorState) => {
      const text = editorState.getCurrentContent().getPlainText();
      this.props.onChange(text);
      this.setState({editorState});
    };
    this.state = {
      editorState: EditorState.createWithContent(
        ContentState.createFromText(props.value),
        scriptDecorator
      ),
    };
  }

  render() {
    return (
      <div className={styles.component}>
        <Editor
          editorState={this.state.editorState}
          onChange={this.onChange}
        />
      </div>
    );
  }
}

Script.defaultProps = {
  value: '',
  handleChange: () => { },
};

export default Script;
