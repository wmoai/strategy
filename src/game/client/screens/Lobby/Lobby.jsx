import React from 'react';

import './Lobby.css';

export default class Lobby extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  lobby() {
    const { dispatch } = this.props;
    return (
      <ul id="lobby-list">
        <li>
          <button
            className="lobby-btn"
            onClick={() => { dispatch('createRoom'); }}>
            ルーム作成
          </button>
        </li>
        <li id="lobby-join">
          <input
            type="text"
            className="lobby-input"
            placeholder="ルームID"
            ref={(input) => { this.roomIdInput = input; }}/>
          <button
            className="lobby-btn"
            onClick={() => {
              const roomId = this.roomIdInput.value;
              if (roomId != '') {
                dispatch('joinRoom', roomId);
              }
            }}>
            参加
          </button>
        </li>
      </ul>
    );
  }

  room() {
    const { roomId, dispatch } = this.props;
    return (
      <ul id="lobby-list">
        <li id="lobby-room">
          <span>ルームID</span>
          <input
            type="text"
            className="lobby-input"
            value={roomId}
            onClick={e => e.target.select()}
            readOnly/>
        </li>
        <li>
          <button
            className="lobby-btn"
            onClick={() => { dispatch('leaveRoom'); }}>
            退出
          </button>
        </li>
      </ul>
    );
  }

  render() {
    const { roomId } = this.props;
    return (
      <div id="lobby-base">
        <div id="lobby-container">
          {(roomId && roomId != '') ? (
            this.room()
          ) : (
            this.lobby()
          )}
        </div>
      </div>
    );
  }

}
