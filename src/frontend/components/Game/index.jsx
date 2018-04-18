// @flow
import React from 'react';

import './style.css';

import ControlPannel from '../ControlPannel/index.jsx';
import Intro from '../Intro/index.jsx';
import Result from '../Result/index.jsx';

import Client from '../../../game/client/index.js';

import GameModel from '../../../game/models/Game.js';
import UnitModel from '../../../game/models/Unit.js';
import TerrainModel from '../../../game/models/Terrain.js';
import type { Forecast } from '../../../game/models/Game.js';

type Props = {
  isOffense: boolean,
  game: GameModel,
  socket: any,
  isSolo: boolean,
  isIntroduction: boolean,
  isMyTurn: boolean,
  turnRemained: number,
  hoveredUnit: ?UnitModel,
  hoveredTerrain: ?TerrainModel,
  actionForecast: ?Forecast,
  isResult: boolean,
  winner: ?boolean,

  onInitGame: void => void,
  onRunGame: void => void,
  onClickEndTurn: void => void,
  onChangeTurn: (boolean, number) => void,
  onEndGame: boolean => void,
  onHoverGame: (?UnitModel, ?TerrainModel, ?Forecast) => void,
  onReturnRoom: void => void
};

export default class Game extends React.Component<Props> {
  pixiCanvas: HTMLCanvasElement;
  screenBase: HTMLDivElement;
  client: Client;
  resizeListener: void => void;

  componentDidMount() {
    const { game, isOffense, socket, isSolo, onEndGame } = this.props;
    const cellSize = 40;

    const client = new Client({
      canvas: this.pixiCanvas,
      game,
      cellSize,
      isOffense,
      socket,
      isSolo,
      width: this.screenBase.clientWidth,
      height: this.screenBase.clientHeight
    });
    client.addEventListener('hover', ({ unit, terrain, forecast }) => {
      const { hoveredUnit, hoveredTerrain } = this.props;
      this.props.onHoverGame(
        unit || hoveredUnit,
        terrain || hoveredTerrain,
        forecast
      );
    });
    client.addEventListener('changeturn', ({ turn, turnRemained }) => {
      this.props.onChangeTurn(turn, turnRemained);
    });
    client.addEventListener('endgame', winner => {
      onEndGame(winner);
    });
    this.client = client;

    this.resizeListener = () => {
      this.client.resize(
        this.screenBase.clientWidth,
        this.screenBase.clientHeight
      );
    };
    window.addEventListener('resize', this.resizeListener);
    this.props.onInitGame();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeListener);
    this.client.destroy();
  }

  endIntroduction() {
    if (this.props.isIntroduction) {
      this.client.run();
      this.props.onRunGame();
    }
  }

  changeScale(deltaY: number) {
    this.client.zoom(deltaY / 500);
  }

  render() {
    const {
      isOffense,
      game,
      onReturnRoom,
      isResult,
      isMyTurn,
      turnRemained,
      hoveredUnit,
      hoveredTerrain,
      actionForecast,
      winner
    } = this.props;

    return (
      <div id="screen-container">
        <style>{'body {overflow: hidden}'}</style>
        <div id="screen-header">
          <ControlPannel
            isOffense={isOffense}
            isMyTurn={isMyTurn}
            unit={hoveredUnit}
            terrain={hoveredTerrain}
            turnRemained={turnRemained}
            forecast={actionForecast}
            onClickEndTurn={() => {
              this.client.endTurn();
            }}
          />
        </div>
        <div
          id="screen-base"
          ref={block => {
            if (block) {
              this.screenBase = block;
            }
          }}
          onWheel={e => {
            this.changeScale(e.deltaY);
          }}
        >
          <canvas
            id="screen-canvas"
            ref={canvas => {
              if (canvas) {
                this.pixiCanvas = canvas;
              }
            }}
          />
        </div>
        {this.props.isIntroduction && (
          <Intro
            game={game}
            isOffense={isOffense}
            onEnd={() => this.endIntroduction()}
          />
        )}
        {isResult && (
          <Result won={winner == isOffense} onReturnRoom={onReturnRoom} />
        )}
      </div>
    );
  }
}
