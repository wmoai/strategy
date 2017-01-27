import React from 'react';
import Refunit from './refunit.jsx';

export default class Navigator extends React.Component {
  render() {
    let contents;
    if (this.props.refbattle) {
      const btl = this.props.refbattle;
      contents = (
        <table id="refbattle">
          <tbody>
            <tr>
              <td colSpan="3" className="name">{btl.me.name}</td>
            </tr>
            <tr>
              <td>{btl.me.hp}</td>
              <th>HP</th>
              <td>{btl.tg.hp}</td>
            </tr>
            <tr>
              <td>{btl.me.val}</td>
              <th>威力</th>
              <td>{btl.tg.val}</td>
            </tr>
            <tr>
              <td>{btl.me.hit}</td>
              <th>命中</th>
              <td>{btl.tg.hit}</td>
            </tr>
            <tr>
              <td>{btl.me.crit}</td>
              <th>致命</th>
              <td>{btl.tg.crit}</td>
            </tr>
            <tr>
              <td colSpan="3" className="name">{btl.tg.name}</td>
            </tr>
          </tbody>
        </table>
      );
    } else if (this.props.refunit) {
      contents = <Refunit unit={this.props.refunit} />;
    }
    return (
      <div id="navigator">
        {contents}
      </div>
    );
  }


}
