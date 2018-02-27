// @flow
import React from 'react';

import './style.css';

import ControlPannel from '../ControlPannel/index.jsx';
import Intro from '../Intro/index.jsx';
import Result from '../Result/index.jsx';

import Client from '../../../game/client/index.js';

import GameModel from '../../../game/models/Game.js';
import type { Forecast } from '../../../game/models/Game.js';
import UnitModel from '../../../game/models/Unit.js';
import TerrainModel from '../../../game/models/Terrain.js';

type Props = {
  isOffense: boolean,
  game: GameModel,
  socket: any,
  isSolo: boolean,
  onSelectCell: number => void,
  onHoverCell: number => void,
  onClickEndTurn: void => void,
  onReturnRoom: void => void,
};
type State = {
  initialized: boolean,
  introduction: boolean,
  mouseX: number,
  mouseY: number,
  isMyTurn: boolean,
  turnRemained: number,
  hoveredUnit: ?UnitModel,
  hoveredTerrain: ?TerrainModel,
  actionForecast: ?Forecast,
  winner: ?boolean,
}

export default class Game extends React.Component<Props, State> {
  pixiCanvas: HTMLCanvasElement;
  screenBase: HTMLDivElement;
  client: Client;
  resizeListener: void => void;

  constructor(props: Props) {
    super(props);
    this.state = {
      initialized: false,
      introduction: true,
      mouseX: 0,
      mouseY: 0,
      isMyTurn: false,
      turnRemained: 0,
      hoveredUnit: null,
      hoveredTerrain: null,
      actionForecast: null,
      winner: null,
    };
  }

  componentDidMount() {
    const { game, isOffense, socket, isSolo } = this.props;
    const cellSize = 40;

    const client = new Client({
      canvas: this.pixiCanvas,
      game,
      cellSize,
      isOffense,
      socket,
      isSolo,
      width: this.screenBase.clientWidth,
      height: this.screenBase.clientHeight,
    });
    client.addEventListener('hover', ({ unit, terrain, forecast }) => {
      this.setState({
        hoveredUnit: unit || this.state.hoveredUnit,
        hoveredTerrain: terrain || this.state.hoveredTerrain,
        actionForecast: forecast,
      });
    });
    client.addEventListener('changeturn', ({ turn, turnRemained }) => {
      this.setState({
        isMyTurn: turn === isOffense,
        turnRemained
      });
    });
    client.addEventListener('endgame', winner => {
      this.setState({ winner });
    });
    this.client = client;
    
    this.setState({
      initialized: true,
    });

    setTimeout(() => {
      this.endIntroduction();
    }, 3000);

    this.resizeListener = () => {
      this.client.resize(this.screenBase.clientWidth, this.screenBase.clientHeight);
    };
    window.addEventListener('resize', this.resizeListener);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeListener);
    this.client.destroy();
  }

  endIntroduction() {
    if (this.state.introduction) {
      this.setState({introduction: false});
      this.client.run();
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
    } = this.props;

    return (
      <div id="screen-container">
        <style>{'body {overflow: hidden}'}</style>
        <style>@import url('https://fonts.googleapis.com/css?family=Anton')</style>
        <div id="screen-header">
          <ControlPannel
            unit={this.state.hoveredUnit}
            terrain={this.state.hoveredTerrain}
            isOffense={isOffense}
            turnRemained={this.state.turnRemained}
            forecast={this.state.actionForecast}
            isMyTurn={this.state.isMyTurn}
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
          onMouseMove={e => {
            if (!this.state.initialized) {
              return;
            }
            this.setState({
              mouseX: e.clientX,
              mouseY: e.clientY,
            });
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
        {this.state.introduction &&
            <Intro
              game={game}
              isOffense={isOffense}
              onClick={() => {
                this.endIntroduction();
              }}
            />
        }
        {this.state.winner != null &&
            <Result
              won={this.state.winner == isOffense}
              onReturnRoom={onReturnRoom}
            />
        }
      </div>
    );
  }

}

