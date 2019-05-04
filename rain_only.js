'use strict';

import { Scene } from './smge/game_objects/scene.js';
import { Overlay } from './smge/game_objects/overlay.js';
import { RainEmitter, Droplet } from './weather.js';
import { SpringCameraCursor } from './spring_camera_cursor.js';
import { RenPhone } from './ren_phone.js';
import { ParticleEmitter } from './smge/game_objects/particle_emitter.js';

export class RainOnly extends Scene {
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
		// rain background
		let bg = new Overlay(this.smge, '#202020');
		bg.change_layer(-1);
		this.add_module(bg);
	}
	load() {
		this.smge.resource_manager.load([
			{
				id: 'cursor_default_sprite',
				type: 'image',
				url: './cursor_default_sprite.png',
			},
			{
				id: 'ren_phone_spritesheet',
				type: 'image',
				url: './ren_phone_spritesheet.png?1e',
			},
		], () => {
			super.load();
			this.compose();
		});
	}
	compose() {
		this.smge.screen.offset.x = this.smge.screen.width / -2;
		this.smge.screen.offset.y = this.smge.screen.height / -2;

		// set up cursor
		this.cursor = new SpringCameraCursor(this.smge, 0.1, true);
		this.cursor.add_state(
			'default',
			this.smge.resource_manager.resources['cursor_default_sprite'],
			0,
			0
		);
		this.cursor.change_state('default');
		this.cursor.change_layer(4056);
		this.add_module(this.cursor);

		let total_rain_slices = 3;
		this.rain_slices = [];
		for (let i = 0; i < total_rain_slices; i++) {
			let rain = new RainEmitter(
				this.smge,
				//this.smge.screen.width / 2,
				//this.smge.screen.height / 2,
				this.smge.screen.width * 2,
				this.smge.screen.height * 2,
				0.05, // min freq
				20, // max freq
				0.75, // intensity //0.5
				1.7 // direction //1.57
			);
			//rain.transform.y = this.smge.screen.height / -4;
			rain.transform.y = this.smge.screen.height * -1;
			rain.transform.x = 0;
			rain.deactivate();
			this.add_module(rain);
			this.rain_slices.push(rain);
		}
		this.smge.add_waiting_action(() => {
			for (let i in this.rain_slices) {
				this.rain_slices[i].activate();
			}
		}, 50);
		this.ren = new RenPhone(this.smge, this.smge.resource_manager.resources['ren_phone_spritesheet']);
		let ren_offset = this.ren.images.phone.height;
		this.ren.transform.y = ren_offset;
		this.ren.change_depth(ren_offset);
		this.add_module(this.ren);
		console.log('adding droplet on ren in 4 seconds');
		this.smge.add_waiting_action(() => {
			this.droplet_on_ren();
		}, 10, this.timescale);
		super.compose();
	}
	droplet_on_ren() {
		let droplet_emitter = new ParticleEmitter(
			this.smge,
			1,
			1,
			0,
			4.71,
			2,
			4,
			75,
			0.05,
			() => {
				return new Droplet(this.smge, 1, '#d0f0ff');
			}
		);
		let tops = [
			{x: -14, y: 14},
			{x: -13, y: 13},
			{x: -12, y: 12},
			{x: -11, y: 10},
			{x: -10, y: 9},
			{x: -9, y: 8},
			{x: -8, y: 7},
			{x: -7, y: 6},
			{x: -6, y: 4},
			{x: -5, y: 2},
			{x: -4, y: 1},

			{x: -3, y: 0},
			{x: -2, y: 0},
			{x: -1, y: 0},
			{x: 0, y: 0},
			{x: 1, y: 0},

			{x: 2, y: 2},
			{x: 3, y: 3},
			{x: 4, y: 5},
			{x: 5, y: 7},
			{x: 6, y: 8},
			{x: 7, y: 9},
			{x: 8, y: 11},
			{x: 9, y: 11},
			{x: 10, y: 12},
			{x: 11, y: 15},

			{x: 9, y: 34},
			{x: 10, y: 33},
			{x: 11, y: 32},
			{x: 12, y: 32},
			{x: 13, y: 33},
		];
		let pos = tops[Math.floor(Math.random() * (tops.length - 1))];
		droplet_emitter.depth = this.ren.depth;
		this.add_module(droplet_emitter);
		// 2 to 4 droplets
		let droplets = Math.floor(Math.random() * 3) + 2;
		for (let i = 0; i < droplets; i += 1) {
			droplet_emitter.emit(pos.x, pos.y, 1, 1);
		}
		this.smge.add_waiting_action(() => {
			this.droplet_on_ren();
		}, 100, this.timescale);
	}
}
