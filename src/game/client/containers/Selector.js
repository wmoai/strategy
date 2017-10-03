import { connect } from 'react-redux';
import Component from '../components/Selector/Selector.jsx';

const mapStateToProps = state => {
  return {
    player: state.client.player,
    opponent: state.client.opponent,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onSubmit: selectedList => {
      dispatch({ type: 'electArmy', payload: selectedList });
    },
  };
};

const Selector = connect(
  mapStateToProps,
  mapDispatchToProps
)(Component);

export default Selector;
