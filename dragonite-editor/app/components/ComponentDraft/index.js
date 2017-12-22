import React from 'react';
import ReactDOM from 'react-dom';
import { List, Map } from 'immutable';
import {
	Editor,
	EditorState,
  EditorBlock,
  ContentState,
  Modifier,
  RichUtils,
  SelectionState,
} from 'draft-js';

import 'draft-js/dist/Draft.css';

import parser from 'parser/aiScript.peg';
import IntervalTree from 'node-interval-tree';

import {
  Tokens,
  tabCharacter,
} from 'utils';

import styles from './styles.css';

function occupySlice(targetArr, start, end, componentKey) {
  for (var ii = start; ii < end; ii++) {
    targetArr[ii] = componentKey;
  }
}

const scriptDecorator = function(options = {}) {
  const componentTrie = options.componentTrie ? options.componentTrie : null;
  const onFinishParsing = options.onFinishParsing ? options.onFinishParsing : () => {};
  const onReceiveFullParse = options.onReceiveFullParse ? options.onReceiveFullParse : () => {};
  const onReceiveErrors = options.onReceiveErrors ? options.onReceiveErrors : () => {};

  const onStartSelection = options.onStartSelection ? options.onStartSelection : () => {};
  const onEndSelection = options.onEndSelection ? options.onEndSelection : () => {};

  const onStartBool = options.onStartBool ? options.onStartBool : () => {};
  const onEndBool = options.onEndBool ? options.onEndBool : () => {};

  return {
    setComponentTrie: function(trie) {
      componentTrie = trie;
    },
    getDecorations: function(block) {
      const characters = Array.from(block.getText()).fill(Tokens.EMPTY);
      const renderer = [];
      const suggestions = [];
      const types = new IntervalTree();

      try {
        const text = block.getText();
        const data = parser.parse(text, {
          renderer,
          suggestions,
          componentTrie,
          types,
        });
        onReceiveErrors([]); // clean up errors
        onReceiveFullParse(data, text);
      } catch(e) {
        console.log(e);
        // TODO: if we receive an unexpected error, we still need to raise
        const codes = e.expected.map(error => error.description);
        onReceiveErrors(codes);
      };
      onFinishParsing(suggestions, types);

      renderer.forEach(token => {
        occupySlice(characters, token.start, token.end, token.type);
      });

      return List(characters);
    },

    handleSelectMouseDown: (e, props) => {
      e.stopPropagation();
      onStartSelection(e);
    },

    handleSelectChange: (e, props) => {
      e.stopPropagation();
      onEndSelection(e, props);
    },

    handleBoolMouseDown: (e, props) => {
      e.stopPropagation();
      onStartBool(e);
    },

    handleBoolMouseUp: (e, props) => {
      e.stopPropagation();
      onEndBool(e, props);
    },

    getComponentForKey: function(key) {
      if (key === Tokens.EMPTY) return (props) => (<span className="empty">{props.children}</span>)
      else if (key === Tokens.ENTITY) return (props) => (<span className="entity">{props.children}</span>)
      else if (key === Tokens.COMPONENT) return (props) => (<span className="component">{props.children}</span>)
      else if (key === Tokens.INT) return (props) => (<span className="number">{props.children}</span>)
      else if (key === Tokens.BOOL) return (props) => (
        <input
          type="checkbox"
          checked={props.decoratedText === 'true'}
          onMouseDown={(e) => this.handleBoolMouseDown(e, props)}
          onMouseUp={(e) => this.handleBoolMouseUp(e, props)}
        />
      )
      else if (key === Tokens.TEXTURE_SOURCE) return (props) => (
        <select
          className="number"
          value={parseInt(props.decoratedText, 10)}

          onMouseDown={(e) => this.handleSelectMouseDown(e, props)}
          onChange={(e) => this.handleSelectChange(e, props)}
        >
          {options.tilesets.map((tileset, i) => (
            <option key={tileset.src} value={i}>{tileset.name}</option>
          ))}
        </select>
      )
      else if (key === Tokens.ANIMATION_TYPE) return (props) => (
        <select
          className="number"
          value={parseInt(props.decoratedText, 10)}

          onMouseDown={(e) => this.handleSelectMouseDown(e, props)}
          onChange={(e) => this.handleSelectChange(e, props)}
        >
          {options.animations.map((animation, i) => (
            <option key={animation.id} value={i}>{animation.name}</option>
          ))}
        </select>
      )
    },

    getPropsForKey: function(key) {
      return {};
    },
  }
};

class Script extends React.Component {
  constructor(props) {
    super(props);


    const options = Object.assign({}, this.props, {
      onStartSelection: this.handleStartSelection,
      onEndSelection: this.handleEndSelection,

      onStartBool: this.handleStartBool,
      onEndBool: this.handleEndBool,
    });

    this.decorator = scriptDecorator(options);

    const content = ContentState.createFromText(props.value, '\\DONOTBREAKINTOBLOCKSPLEASE');
    const editorState = EditorState.createWithContent(content, this.decorator);

    this.state = {
      editorState,
      interacting: false,
    };
  }

  handleStartSelection = () => {
    this.setState({
      interacting: true,
    });
  }

  handleStartBool = (e, props) => {
    this.setState({
      interacting: true,
    });
  }

  handleEndBool = (e, props) => {
    const value = e.target.checked ? 'false' : 'true';

    const state = this.state.editorState;
    const contentState = props.contentState;
    const subProps = props.children[0].props;

    const selection = props
      .contentState
      .getSelectionAfter()
      .merge({
        anchorOffset: subProps.start,
        focusOffset: subProps.start + subProps.text.length,
      });
    const newContentState = Modifier.replaceText(
      state.getCurrentContent(),
      selection,
      value,
    );
    //const selectionState = SelectionState.createEmpty(); 


    const newState = EditorState.push(state, newContentState, 'insert-characters');
    const text = newState.getCurrentContent().getPlainText();
    this.props.onChange({ text });

    this.setState({
      editorState: newState,
      interacting: false,
    });
  }

  handleEndSelection = (e, props) => {
    const value = e.target.value;

    const state = this.state.editorState;
    const contentState = props.contentState;
    const subProps = props.children[0].props;
    const selection = props
      .contentState
      .getSelectionAfter()
      .merge({
        anchorOffset: subProps.start,
        focusOffset: subProps.start + subProps.text.length,
      });
    const newContentState = Modifier.replaceText(
      state.getCurrentContent(),
      selection,
      value,
    );
    //const selectionState = SelectionState.createEmpty(); 


    const newState = EditorState.push(state, newContentState, 'insert-characters');
    const text = newState.getCurrentContent().getPlainText();
    this.props.onChange({ text });

    this.setState({
      editorState: newState,
      interacting: false,
    });
  }

  handleChange = (editorState) => {
    const position = this.state.editorState.getSelection().getStartOffset();
    const text = editorState.getCurrentContent().getPlainText();

    this.props.onChange({ text, position });
    this.setState({editorState});
  }

  handleTab = (e) => {
    e.preventDefault();

    const currentState = this.state.editorState;
    const newContentState = Modifier.replaceText(
      currentState.getCurrentContent(),
      currentState.getSelection(),
      tabCharacter
    );

    this.setState({ 
      editorState: EditorState.push(currentState, newContentState, 'insert-characters')
    });
  }

  handleClick = () => {
    this.refs.editor.focus();
  }

  handleReturn = (e, state) => {
    e.preventDefault();

    const newState = RichUtils.insertSoftNewline(state);

    this.setState({ 
      editorState: newState,
    });

    return 'handled';
  }

  render() {
    return (
      <div className={styles.component} onClick={this.handleClick}>
        <Editor
          ref='editor'
          editorState={this.state.editorState}
          onChange={this.handleChange}
          onTab={this.handleTab}
          handleReturn={this.handleReturn}
          readOnly={this.state.interacting}
        />
      </div>
    );
  }
}

Script.defaultProps = {
  value: '',
  onChange: () => { },
  dispatch: () => { },
};

export default Script;
