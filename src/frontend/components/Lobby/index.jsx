import React from 'react';

import './style.css';

function Top({ onClickSoloPlay, onCreateRoom, onJoinRoom }) {
  let roomIdInput;

  return (
    <ul id="lobby-list">
      <li>
        <button
          className="lobby-btn"
          onClick={() => { onClickSoloPlay(); }}>
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
          ref={(input) => { roomIdInput = input; }}/>
        <button
          className="lobby-btn"
          onClick={() => {
            if (!roomIdInput) {
              return;
            }
            const roomId = roomIdInput.value;
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

function Room({ roomId, isMatched, onLeaveRoom, onGetReady, isReady }) {
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
          disabled={!isMatched || isReady}
          onClick={() => onGetReady()}>
          対戦開始
        </button>
      </li>
      <li id="lobby-room-leave">
        <button
          className="lobby-btn"
          disabled={isReady}
          onClick={() => {
            onLeaveRoom();
          }}>
          ルーム退出
        </button>
      </li>
    </ul>
  );
}

export default function Lobby(props) {
  const { roomId } = props;
  return (
    <div id="lobby-base">
      <div id="lobby-container">
        {roomId ? (
          <Room {...props} />
        ) : (
          <Top {...props} />
        )}
      </div>
    </div>
  );
}
