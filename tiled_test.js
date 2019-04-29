// this is the main entry point for the character lineup

'use strict';

import { Scene } from './smge/game_objects/scene.js';
import { TiledBackground } from './smge/game_objects/tiled_background.js';
import { GameObject } from './smge/game_object.js';

export class TiledTest extends Scene {
	constructor(smge) {
		super(smge);
		this.smge.resource_manager.load([
			{
				id: 'checkers',
				type: 'image',
				url: './checkers.png',
			},
		], () => {
			this.tiled = new TiledBackground(
				this.smge,
				this.smge.resource_manager.resources['checkers'],
				0.025,
				-0.025
			);
			this.add_module(this.tiled);
		});
		this.smge.screen.offset.x = this.smge.screen.width / -2;
		this.smge.screen.offset.y = this.smge.screen.height / -2;
	}
}
