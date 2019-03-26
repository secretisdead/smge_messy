// this is not a complete game file
// this is a scene which expects persistent objects created in demo.js

'use strict';

import { GameObject } from './smge/game_object.js';
import { Scene } from './smge/game_objects/scene.js';
import { Overlay } from './smge/game_objects/overlay.js';
import { Sprite } from './smge/modules/sprite.js';
import { Text } from './smge/game_objects/text.js';
import { Bound } from './smge/bound_manager.js';
import { PrecipitationEmitter } from './weather.js';

export class DemoParticles extends Scene {
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
		this.current_menu = null;
		this.current_intensity = 0.01;
		this.current_direction = 1.57;
	}
	load() {
		this.smge.resource_manager.load([
			{
				id: 'obelisk',
				type: 'image',
				url: './obelisk_moss.png?nocache6',
			},
		], () => {
			super.load();
		});
	}
	compose() {
		// particles demo background
		let bg = new Overlay(this.smge, '#202020');
		bg.change_layer(-1);
		this.add_module(bg);

		// obelisk
		let obelisk = new GameObject(this.smge);
		obelisk.add_module(
			new Sprite(this.smge.resource_manager.resources['obelisk'], 9, 48)
		);
		obelisk.change_depth(0);
		this.add_module(obelisk);

		// center cursor anchor slightly above obelisk and change weight to 0.25
		this.smge.g.demos.cursor.anchor.transform.x = 0;
		this.smge.g.demos.cursor.anchor.transform.y = -56;
		this.smge.g.demos.cursor.camera.weight = 0.25;

		// create emitter menus
		let emitters = {
			'none': null,
			'rain': new PrecipitationEmitter(
				this.smge,
				this.current_intensity,
				this.current_direction,
				'rain',
				2,
				2
			),
			'snow': new PrecipitationEmitter(
				this.smge,
				this.current_intensity,
				this.current_direction,
				'snow',
				2
			),
//			'fireflies': null,
//			'fire': null,
		};
		this.menus = {};
		let max_width = 0;
		let y = this.smge.g.demos.nk7px.height * 2;
		for (let menu_name in emitters) {
			let menu = new Text(
				this.smge,
				this.smge.g.demos.nk7px,
				'left',
				'bottom',
				'left',
				this.smge.g.demos.menu_text_color,
				'none',
				this.smge.g.demos.menu_text_intensity,
				this.smge.g.demos.menu_text_frequency,
				menu_name
			);
			max_width = Math.max(max_width, menu.width);
			menu.transform.x = this.smge.g.demos.nk7px.height;
			menu.transform.y = y;
			menu.transform.parallax.x = 0;
			menu.transform.parallax.y = 0;
			y += (this.smge.g.demos.nk7px.height * 2);
			// add target emitter to this menu
			menu.emitter = emitters[menu_name];
			if (menu.emitter) {
				this.add_module(menu.emitter);
			}
			this.menus[menu_name] = menu;
		}
		// set bounds slightly larger than text
		let bound_offset_x = -4;
		let bound_width = max_width + 8;
		let bound_height = 1.5 * this.smge.g.demos.nk7px.height;
		for (let menu_name in this.menus) {
			let menu = this.menus[menu_name];
			menu.add_module(
				new Bound(
					'menu',
					['cursor'],
					bound_offset_x,
					-1.25 * menu.height,
					bound_width,
					bound_height,
				)
			);
			this.add_module(menu);
		}

		// set initially selected emitter menu
		this.smge.g.demos.highlight_menu(this.menus['none']);
		this.current_menu = this.menus['none'];

		// create intensity instruction text
		this.intensity_instructions = new Text(
			this.smge,
			this.smge.g.demos.nk7px,
			'right',
			'bottom',
			'left',
			this.smge.g.demos.menu_text_color,
			'none',
			0,
			0,
			'change intensity: up/down arrows [     ]'
		);
		this.intensity_instructions.transform.x = this.smge.screen.width - this.smge.g.demos.nk7px.height;
		this.intensity_instructions.transform.y = this.smge.screen.height - (this.smge.g.demos.nk7px.height * 3);
		this.intensity_instructions.transform.parallax.x = 0;
		this.intensity_instructions.transform.parallax.y = 0;
		this.add_module(this.intensity_instructions);
		this.smge.g.demos.set_indicator_string(this.current_intensity, this.intensity_instructions);

		// create direction instruction text
		this.direction_instructions = new Text(
			this.smge,
			this.smge.g.demos.nk7px,
			'right',
			'bottom',
			'left',
			this.smge.g.demos.menu_text_color,
			'none',
			0,
			0,
			'change direction: left/right arrows [     ]'
		);
		this.direction_instructions.transform.x = this.smge.screen.width - this.smge.g.demos.nk7px.height;
		this.direction_instructions.transform.y = this.smge.screen.height - this.smge.g.demos.nk7px.height;
		this.direction_instructions.transform.parallax.x = 0;
		this.direction_instructions.transform.parallax.y = 0;
		this.add_module(this.direction_instructions);
		this.smge.g.demos.set_indicator_string(this.current_direction, this.direction_instructions);

		super.compose();
	}
	input_update() {
		super.input_update();

		// menu highlight on/off effects
		for (let menu_name in this.menus) {
			let menu = this.menus[menu_name];
			if (
				this.smge.bound_manager.check(
					menu.bounds[0],
					'off',
					'cursor'
				)
			) {
				if (this.current_menu != menu) {
					this.smge.g.demos.unhighlight_menu(menu);
				}
			}
			if (
				this.smge.bound_manager.check(
					menu.bounds[0],
					'on',
					'cursor'
				)
			) {
				this.smge.g.demos.highlight_menu(menu);
			}
		}

		// intensity change
		let last_intensity = this.current_intensity;
		if (this.smge.input.down('ArrowUp')) {
			this.current_intensity += 0.05;
		}
		if (this.smge.input.down('ArrowDown')) {
			this.current_intensity -= 0.05;
		}
		if (this.current_intensity != last_intensity) {
			for (let menu_name in this.menus) {
				let menu = this.menus[menu_name];
				if (menu.emitter) {
					menu.emitter.set_intensity(this.current_intensity);
					console.log('set emitter for ' + menu_name + ' to ' + menu.emitter.intensity);
				}
			}
			this.smge.g.demos.set_indicator_string(this.current_intensity, this.intensity_instructions);
		}

		// direction change
		let last_direction = this.current_direction;
		if (this.smge.input.down('ArrowLeft')) {
			this.current_direction += 0.05;
		}
		if (this.smge.input.down('ArrowRight')) {
			this.current_direction -= 0.05;
		}
		if (this.current_direction != last_direction) {
			for (let menu_name in this.menus) {
				let menu = this.menus[menu_name];
				if (menu.emitter) {
					menu.emitter.set_direction(this.current_direction);
					console.log('set direction for ' + menu_name + ' to ' + menu.emitter.direction);
				}
			}
			this.smge.g.demos.set_indicator_string(this.current_direction, this.direction_instructions);
		}

		// clicking emitter menus changes which emitters are active
		if (this.smge.input.pressed('m1')) {
			for (let menu_name in this.menus) {
				let menu = this.menus[menu_name];
				if (
					this.smge.bound_manager.check(
						menu.bounds[0],
						'during',
						'cursor'
					)
				) {
					if (this.current_menu.emitter != menu.emitter) {
						this.smge.g.demos.select_menu(menu);
						this.smge.g.demos.highlight_menu(menu);
						this.smge.g.demos.unhighlight_menu(this.current_menu);
						if (this.current_menu.emitter) {
							this.current_menu.emitter.deactivate();
						}
						if (menu.emitter) {
							menu.emitter.activate();
						}
						this.current_menu = menu;
					}
				}
			}
		}
	}
}
