// @flow
import React from 'react';

import './Lobby.css';

type Props = {
  roomId: string,
  isMatched: boolean,
  onSoloPlay: () => void,
  onCreateRoom: () => void,
  onJoinRoom: string => void,
  onLeaveRoom: () => void,
  onReady: () => void,
};
type State = {
  isReady: boolean,
};

export default class Lobby extends React.Component<Props, State> {
  roomIdInput: ?HTMLInputElement;

  constructor(props: Props) {
    super(props);
    this.state = {
      isReady: false
    };
  }

  lobby() {
    const { onSoloPlay, onCreateRoom, onJoinRoom } = this.props;
    return (
      <ul id="lobby-list">
        <li>
          <button
            className="lobby-btn"
            onClick={() => { onSoloPlay(); }}>
            ソロプレイ
          </button>
        </li>
        <li id="lobby-create">
          <button
            className="lobby-btn"
            onClick={() => { onCreateRoom(); }}>
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
              if (!this.roomIdInput) {
                return;
              }
              const roomId = this.roomIdInput.value;
              if (roomId != '') {
                onJoinRoom(roomId);
              }
            }}>
            参加
          </button>
        </li>
      </ul>
    );
  }

  room() {
    const { roomId, isMatched, onLeaveRoom, onReady } = this.props;
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
          <div id="lobby-wait">
            {isMatched ? '対戦相手が見つかりました' : '対戦相手を待っています...'}
          </div>
        </li>
        <li>
          <button
            className="lobby-btn"
            disabled={!isMatched || this.state.isReady}
            onClick={() => {
              this.setState({
                isReady: true
              }, () => {
                onReady();
              });
            }}>
            対戦開始
          </button>
        </li>
        <li id="lobby-room-leave">
          <button
            className="lobby-btn"
            disabled={this.state.isReady}
            onClick={() => {
              onLeaveRoom();
            }}>
            ルーム退出
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
          {roomId ? (
            this.room()
          ) : (
            this.lobby()
          )}
        </div>
      </div>
    );
  }
}
