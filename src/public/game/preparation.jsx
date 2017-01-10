const React = require('react');

module.exports = class Preparation extends React.Component {
  render() {
    if (this.props.klasses == null) {
      return null;
    }
    const klasses = this.props.klasses;
    return (
      <div id="preparation">
        <div>出撃ユニット選択</div>
        <div>
          {Object.keys(klasses).map(klassId => {
            const klass = klasses[klassId];
            return (
              <button
                 key={klassId}
                 onClick={() => this.props.dispatch('addSortie', klassId)}>
                 {klass.name}
               </button>
            );
          })}
        </div>
        <div>
          <div>
            出撃数：{this.props.sortie.length}/{this.props.size}
          </div>
          {this.props.sortie.map((klassId, index) => {
            return (
              <span key={index}>
                {this.props.klasses[klassId].name}
                <button
                  key={index}
                  onClick={()=>this.props.dispatch('removeSortie', index)}>
                  X
                </button>
              </span>
            );
          })}
        </div>
        <button onClick={()=>this.props.dispatch('makeSortie')}>出撃</button>
      </div>
    );
  }
}
