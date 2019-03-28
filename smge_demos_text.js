// this is not a complete game file
// this is a scene which expects persistent objects created in demo.js

'use strict';

import { GameObject } from './smge/game_object.js';
import { Scene } from './smge/game_objects/scene.js';
import { Overlay } from './smge/game_objects/overlay.js';
import { SpringCameraCursor } from './spring_camera_cursor.js';
import { SpriteFont } from './smge/standalone/sprite_font.js';
import { Bound } from './smge/bound_manager.js';
import { Text } from './smge/game_objects/text.js';

export class DemoText extends Scene {
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
				id: 'lockdrop_click',
				type: 'audio',
				url: './lockdrop_click.wav',
			},
		], () => {
			super.load();
		});
	}
	compose() {
		// text demo background
		let bg = new Overlay(this.smge, '#602020');
		bg.change_layer(-1);
		this.add_module(bg);

		// center cursor anchor (and by way of 0 weight camera, the screen) on the origin
		this.smge.g.demos.cursor.camera.weight = 0;
		this.smge.g.demos.cursor.anchor.transform.x = 0;
		this.smge.g.demos.cursor.anchor.transform.y = 0;

		// create sample
		this.sample = new Text(
			this.smge,
			this.smge.g.demos.nk7px,
			'center',
			'top',
			'left',
			this.smge.g.demos.menu_text_color,
			'none',
			this.smge.g.demos.menu_text_intensity,
			this.smge.g.demos.menu_text_frequency,
			'text features can be \\c"#ff0000"changed\\c"'
				+ this.smge.g.demos.menu_text_color
				+ '"\\nwithin the text by using\\n'
				+ '\\e"roll"\\c"#ffffff"control codes\\c"'
				+ this.smge.g.demos.menu_text_color + '"\\e"none" in the '
				+ '\\f"75"\\e"shake"\\i"0.5"\\c"#ff0000"t'	//t
				+ '\\i"0.65"\\c"#00ff00"e'							//e
				+ '\\f"50"\\i"0.8"\\c"#0000ff"x'					//x
				+ '\\i"0.95"\\c"#00ffff"t'							//t
				+ ' '														//
				+ '\\f"25"\\i"1.25"\\c"#ff00ff"b'				//b
				+ '\\i"1.5"\\c"#ffff00"o'							//o
				+ '\\f"10"\\i"2"\\c"#000000"d'					//d
				+ '\\i"2.5"\\c"#ffffff"y'							//y
		);
		this.sample.transform.x = this.smge.screen.width / 2;
		this.sample.transform.y = this.smge.g.demos.nk7px.height;
		this.sample.transform.parallax.x = 0;
		this.sample.transform.parallax.y = 0;
		this.add_module(this.sample);

		// create lorem ipsum
		this.lorem_ipsum = new Text(
			this.smge,
			this.smge.g.demos.nk7px,
			'center',
			'center',
			'left',
			this.smge.g.demos.menu_text_color,
			'none',
			this.smge.g.demos.menu_text_intensity,
			this.smge.g.demos.menu_text_frequency,
			'Lorem ipsum dolor sit amet, \\n'
				+ 'consectetur adipiscing elit, \\n'
				+ 'sed do eiusmod tempor \\n'
				+ 'incididunt ut labore et \\n'
				+ 'dolore magna aliqua. Ut enim \\n'
				+ 'ad minim veniam, quis \\n'
				+ 'nostrud exercitation ullamco \\n'
				+ 'laboris nisi ut aliquip ex \\n'
				+ 'ea commodo consequat. Duis \\n'
				+ 'aute irure dolor in \\n'
				+ 'reprehenderit in voluptate \\n'
				+ 'velit esse cillum dolore eu \\n'
				+ 'fugiat nulla pariatur. \\n'
				+ 'Excepteur sint occaecat \\n'
				+ 'cupidatat non proident, sunt \\n'
				+ 'in culpa qui officia \\n'
				+ 'deserunt mollit anim id est \\n'
				+ 'laborum.'
		);
		this.add_module(this.lorem_ipsum);

		// create effect menus
		this.menus = {
			'none': null,
			'shake': null,
			'jumble': null,
			'quake': null,
			'locomotion': null,
			'roll': null,
		};
		let max_width = 0;
		let y = this.smge.g.demos.nk7px.height * 2;
		for (let menu_name in this.menus) {
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
			'change intensity: up/down arrows [      ]'
		);
		this.intensity_instructions.transform.x = this.smge.screen.width - this.smge.g.demos.nk7px.height;
		this.intensity_instructions.transform.y = this.smge.screen.height - (this.smge.g.demos.nk7px.height * 3);
		this.intensity_instructions.transform.parallax.x = 0;
		this.intensity_instructions.transform.parallax.y = 0;
		this.add_module(this.intensity_instructions);
		this.smge.g.demos.set_indicator_string(this.lorem_ipsum.intensity, this.intensity_instructions);

		// create frequency instruction text
		this.frequency_instructions = new Text(
			this.smge,
			this.smge.g.demos.nk7px,
			'right',
			'bottom',
			'left',
			this.smge.g.demos.menu_text_color,
			'none',
			0,
			0,
			'change frequency: left/right arrows [' + ('' + this.lorem_ipsum.frequency).padStart(6) + ']'
		);
		this.frequency_instructions.transform.x = this.smge.screen.width - this.smge.g.demos.nk7px.height;
		this.frequency_instructions.transform.y = this.smge.screen.height - this.smge.g.demos.nk7px.height;
		this.frequency_instructions.transform.parallax.x = 0;
		this.frequency_instructions.transform.parallax.y = 0;
		this.add_module(this.frequency_instructions);

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
				if (this.lorem_ipsum.effect != menu_name) {
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

		let change = false;

		// intensity change
		if (this.smge.input.down('ArrowUp')) {
			this.lorem_ipsum.intensity += 0.05;
			change = true;
		}
		if (this.smge.input.down('ArrowDown')) {
			this.lorem_ipsum.intensity -= 0.05;
			this.lorem_ipsum.intensity = Math.max(this.lorem_ipsum.intensity, 0);
			change = true;
		}

		// frequency change
		if (this.smge.input.down('ArrowLeft')) {
			this.lorem_ipsum.frequency -= 5;
			change = true;
		}
		if (this.smge.input.down('ArrowRight')) {
			this.lorem_ipsum.frequency += 5;
			change = true;
		}

		// clicking effect menus changes lorem ipsum text effect
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
					this.smge.g.demos.unhighlight_menu(this.menus[this.lorem_ipsum.effect]);
					this.smge.g.demos.highlight_menu(menu);
					this.lorem_ipsum.effect = menu_name;
					change = true;
				}
			}
		}

		if (change) {
			this.smge.g.demos.set_indicator_string(this.lorem_ipsum.intensity, this.intensity_instructions);
			// update frequency instructions
			let start_pos = this.frequency_instructions.text.indexOf('[');
			this.frequency_instructions.set_text(
				this.frequency_instructions.text.substring(0, start_pos) + '['
					+ ('' + this.lorem_ipsum.frequency).padStart(6) + ']'
			);
			// refresh lorem ipsum text
			this.lorem_ipsum.refresh();
		}
	}
}
