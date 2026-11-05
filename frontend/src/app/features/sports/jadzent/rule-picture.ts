import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FigureTeam, RuleFigure } from '../basketball/rule-figure';
import { JadzentPicture } from './rules-content';

interface CourtPlayer {
  x: number;
  y: number;
  team: FigureTeam;
  girl: boolean;
}

const PLAYER_SCALE = 0.3;
const DAMA_RADIUS = 10.2;

@Component({
  selector: 'app-jadzent-rule-picture',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RuleFigure],
  host: { class: 'rule-picture' },
  templateUrl: './rule-picture.html',
})
export class JadzentRulePicture {
  readonly name = input.required<JadzentPicture>();
  readonly label = input('');

  readonly playerScale = PLAYER_SCALE;
  readonly damaRadius = DAMA_RADIUS;
  readonly damaLeftX = 89.3 - DAMA_RADIUS;
  readonly damaRightX = 150.7 + DAMA_RADIUS;

  readonly fieldPairs: CourtPlayer[] = [
    { x: 48, y: 62, team: 'us', girl: false },
    { x: 60, y: 66, team: 'us', girl: true },
    { x: 46, y: 112, team: 'us', girl: false },
    { x: 58, y: 116, team: 'us', girl: true },
    { x: 100, y: 70, team: 'us', girl: false },
    { x: 112, y: 74, team: 'us', girl: true },
    { x: 98, y: 118, team: 'us', girl: false },
    { x: 110, y: 122, team: 'us', girl: true },
  ];

  readonly jokers: CourtPlayer[] = [
    { x: 175, y: 30, team: 'us', girl: false },
    { x: 226, y: 92, team: 'us', girl: true },
    { x: 175, y: 152, team: 'us', girl: false },
  ];

  readonly damaGirl: CourtPlayer = { x: 161, y: 88, team: 'us', girl: true };

  bunX(player: CourtPlayer, scale = PLAYER_SCALE): number {
    return player.x + 7 * scale;
  }

  bunY(player: CourtPlayer, scale = PLAYER_SCALE): number {
    return player.y - 97 * scale;
  }
}
