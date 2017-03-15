import React from 'react';
import Refunit from './refunit.jsx';

export default function Navigator({ unit, battle, left }) {
  let style = {};
  if (left) {
    style.left = '10px';
  } else {
    style.right = '10px';
  }
  let contents;
  if (battle) {
    contents = (
      <table id="refbattle">
        <tbody>
          <tr>
            <td colSpan="3" className="name">{battle.me.name}</td>
          </tr>
          <tr>
            <td>{battle.me.hp}</td>
            <th>HP</th>
            <td>{battle.tg.hp}</td>
          </tr>
          <tr>
            <td>{battle.me.val}</td>
            <th>威力</th>
            <td>{battle.tg.val}</td>
          </tr>
          <tr>
            <td>{battle.me.hit}</td>
            <th>命中</th>
            <td>{battle.tg.hit}</td>
          </tr>
          <tr>
            <td>{battle.me.crit}</td>
            <th>致命</th>
            <td>{battle.tg.crit}</td>
          </tr>
          <tr>
            <td colSpan="3" className="name">{battle.tg.name}</td>
          </tr>
        </tbody>
      </table>
    );
  } else if (unit) {
    contents = <Refunit unit={unit} />;
  }
  return (
    <div id="navigator" style={style}>
      {contents}
    </div>
  );

}
