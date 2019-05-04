'use strict';

import { GameObject } from './smge/game_object.js';
import { Sprite } from './smge/modules/sprite.js';

export class RenPhone extends GameObject {
	constructor(smge, ren_phone_spritesheet) {
		super(smge);

		this.name = 'ren phone';
		this.images = {
			phone: Sprite.image_from_spritesheet(ren_phone_spritesheet, 0, 0, 29, 92),
			tap1: Sprite.image_from_spritesheet(ren_phone_spritesheet, 29, 0, 29, 92),
			tap2: Sprite.image_from_spritesheet(ren_phone_spritesheet, 58, 0, 29, 92),
			blink1: Sprite.image_from_spritesheet(ren_phone_spritesheet, 87, 0, 29, 92),
			blink2: Sprite.image_from_spritesheet(ren_phone_spritesheet, 116, 0, 29, 92),
		};
		this.add_module(new Sprite());
		this.sprite.set_image(this.images.phone);
		this.sprite.origin.x = 14;
		this.sprite.origin.y = 92;
		this.queue = [];
		this.choose();
	}
	blink() {
		this.sprite.set_image(this.images.blink2);
		this.smge.add_waiting_action(() => {
			this.sprite.set_image(this.images.blink1);
		}, 100, this.timescale);
		this.smge.add_waiting_action(() => {
			this.sprite.set_image(this.images.phone);
			this.choose();
		}, 200, this.timescale);
	}
	tap() {
		let taps = 2 + Math.ceil(Math.random() * 4);
		let delay = 0;
		for (let i = 0; i < taps; i++) {
			delay += 100;
			this.smge.add_waiting_action(() => {
				let image = this.images.tap1;
				if (0.5 > Math.random()) {
					image = this.images.tap2;
				}
				this.sprite.set_image(image);
			}, delay, this.timescale);
			delay += 50;
			this.smge.add_waiting_action(() => {
				this.sprite.set_image(this.images.phone);
			}, delay, this.timescale);
			delay += 50;
		}
		this.smge.add_waiting_action(() => {
			this.sprite.set_image(this.images.phone);
			this.choose();
		}, taps * 100, this.timescale);
	}
	choose() {
		let delay = (1 + Math.random()) * 1000;
		this.smge.add_waiting_action(() => {
			// 1/2 chance to blink
			if (0.5 > Math.random()) {
				this.blink();
			}
			// 1/2 chance to tap
			else {
				this.tap();
			}
		}, delay, this.timescale);
	}
}
