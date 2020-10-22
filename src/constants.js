import blank from './Images/blank.png';
import one from './Images/one.png';
import two from './Images/two.png';
import three from './Images/three.png';
import four from './Images/four.png';
import five from './Images/five.png';
import six from './Images/seven.png';
import seven from './Images/seven.png';
import eight from './Images/eight.png';

//difficulties
export const EASY = [10, 8, 10];
export const MEDIUM = [14, 18, 40];

//gameStates
export const NOT_STARTED = "stopped";
export const PLAYING = "playing";
export const GAME_WIN = "clear";
export const GAME_LOSS = "game over";

//space states
export const STATE_HIDDEN = "hidden";
export const STATE_SHOWN = "shown";
export const STATE_MARKED = "marked";

export function numberToImage(number) {
    const images = [blank, one, two, three, four, five, six, seven, eight];
    return images[parseInt(number)];
}