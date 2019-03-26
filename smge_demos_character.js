// this is not a complete game file
// this is a scene which expects persistent objects created in demo.js

'use strict';

import { Scene } from './smge/game_objects/scene.js';
import { Overlay } from './smge/game_objects/overlay.js';
import { Sprite } from './smge/modules/sprite.js';
import { Bound } from './smge/bound_manager.js';

export class DemoCharacter extends Scene {
	constructor(smge) {
		super(
			smge, 
			{
				cover_color: '#000000',
				cover_type_in: 'cut',
				cover_duration_in: 1,
				cover_type_out: 'fade',
				cover_duration_out: 100,
				min_cover_duration: 250,
			}
		);
	}
	load() {
		if (this.loaded) {
			super.load();
			return;
		}
/** /
		this.smge.resource_manager.load([
			{
				id: 'obelisk',
				type: 'image',
				url: './obelisk_moss.png?nocache6',
			},
		], () => {
/**/
			super.load();
/** /
		});
/**/
	}
	compose() {
		let bg = new Overlay(this.smge, '#204060');
		bg.change_layer(-1);
		this.add_module(bg);

		// center cursor anchor (and by way of 0 weight camera, the screen) on the origin
		this.smge.g.demos.cursor.camera.weight = 0;
		this.smge.g.demos.cursor.anchor.transform.x = 0;
		this.smge.g.demos.cursor.anchor.transform.y = 0;

		super.compose();
	}
	input_update() {
		super.input_update();
	}
}
