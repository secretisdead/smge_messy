// this is not a complete game file
// this is a scene which expects persistent objects created in demo.js

'use strict';

import { GameObject } from './smge/game_object.js';
import { Scene } from './smge/game_objects/scene.js';
import { Overlay } from './smge/game_objects/overlay.js';
import { Bound } from './smge/bound_manager.js';
import { Text } from './smge/game_objects/text.js';
import { Shaker } from './smge/modules/shaker.js';
import { DemoText } from './smge_demos_text.js';
import { DemoParticles } from './smge_demos_particles.js';
import { DemoCharacter } from './smge_demos_character.js';

export class DemoMainMenu extends Scene {
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
		this.smge.resource_manager.load([
			{
				id: 'boom',
				type: 'audio',
				url: './altemark_bd4_modified.wav',
			},
			{
				id: 'lockdrop_click',
				type: 'audio',
				url: './lockdrop_click.wav',
			},
		], () => {
			super.load();
		});
	}
	compose() {
		// main menu background
		let bg = new Overlay(this.smge, '#101010');
		bg.change_layer(-1);
		this.add_module(bg);

		// center cursor anchor (and by way of 0 weight camera, the screen) on the origin
		this.smge.g.demos.cursor.camera.weight = 0;
		this.smge.g.demos.cursor.anchor.transform.x = 0;
		this.smge.g.demos.cursor.anchor.transform.y = 0;

		// create main menus
		let menus = {
			'text': DemoText,
			'particles': DemoParticles,
			'character': DemoCharacter,
			'secret': null,
		};
		this.menus = {};
		let max_width = 0;
		let y = this.smge.g.demos.nk7px.height * (Object.keys(this.menus).length + 1) / -2;
		for (let menu_name in menus) {
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
			menu.scene_class = menus[menu_name];
			max_width = Math.max(max_width, menu.width);
			menu.transform.y = y;
			y += (this.smge.g.demos.nk7px.height * 2);
			this.menus[menu_name] = menu;
		}
		// set bounds slightly larger than text
		let bound_offset_x = -4;
		let bound_width = max_width + 8;
		let bound_height = 1.5 * this.smge.g.demos.nk7px.height;
		for (let menu_name in this.menus) {
			let menu = this.menus[menu_name];
			menu.transform.x = -1 * max_width / 2;
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
				this.smge.g.demos.unhighlight_menu(menu);
			}
			if (
				this.smge.bound_manager.check(
					menu.bounds[0],
					'on',
					'cursor'
				)
			) {
				let color = null;
				let effect = null;
				if ('secret' == menu_name) {
					color = '#00c0ff';
					effect = 'shake';
				}
				this.smge.g.demos.highlight_menu(menu, color, effect);
			}
		}

		// clicking menu items transitions to target scenes
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
					if ('secret' == menu_name) {
						this.smge.audio.play_once(
							this.smge.resource_manager.resources['boom']
						);
						this.smge.g.demos.cursor.camera.shaker.shake(7, 250);
					}
					else {
						this.smge.g.demos.select_menu(menu);
						let new_scene = new menu.scene_class(this.smge);
						this.smge.g.demos.current_scene = new_scene;
						this.smge.entity_manager.add(new_scene);
						new_scene.transition(this, true);
						// force return button bounds re-check after transition
						this.smge.g.demos.return_button.bounds[0].refresh();
						//TODO put return button enable in scene covered arbitrary callback
						this.smge.g.demos.return_button.enable();
					}
				}
			}
		}
	}
}
