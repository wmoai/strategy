import { connect } from 'react-redux';
import Component from '../components/Selector/Selector.jsx';
import { selectUnits } from '../actions';

const mapStateToProps = state => {
  return {
    me: state.me,
    opponent: state.opponent,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onSubmit: selectedList => {
      dispatch(selectUnits(selectedList));
    },
  };
};

const Selector = connect(
  mapStateToProps,
  mapDispatchToProps
)(Component);

export default Selector;
