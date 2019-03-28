// this is the main entry point for the smge demo collection

'use strict';

import { Scene } from './smge/game_objects/scene.js';
import { SpriteFont } from './smge/standalone/sprite_font.js';
import { SpringCameraCursor } from './spring_camera_cursor.js';
import { Text } from './smge/game_objects/text.js';
import { Bound } from './smge/bound_manager.js';
import { Pauser } from './smge/game_objects/pauser.js';
import { DemoMainMenu } from './smge_demos_main_menu.js';

// the main smge demos game object
// this will load in the font resources,
// create the spring camera cursor,
// and maintain the return to main menu listeners used in the demos
export class Demos extends Scene {
	constructor(smge) {
		super(
			smge, 
			{
				cover_color: '#000000',
				cover_type_in: 'cut',
				cover_duration_in: 1,
				cover_type_out: 'cut',
				cover_duration_out: 1,
				min_cover_duration: 1,
			}
		);
		// store this game object somewhere so we can call on its methods from other scenes
		this.smge.g.demos = this;
		this.pauser = null;
		this.current_scene = null;
		this.menu_text_color = '#808080';
		this.menu_text_intensity = 1;
		this.menu_text_frequency = 250;
		this.menu_select_sound = null;
		this.menu_highlight_sound = null;
		this.menu_highlight_text_color = '#d0d0d0';
		this.menu_highlight_text_effect = 'roll';
	}
	load() {
		this.smge.resource_manager.load([
			{
				id: 'cursor_default_sprite',
				type: 'image',
				url: './cursor_default_sprite.png',
			},
			{
				id: 'cursor_pointer_sprite',
				type: 'image',
				url: './cursor_pointer_sprite.png',
			},
			{
				id: 'nk7px_font_data',
				type: 'json',
				url: './nk7px_font_data.json',
			},
			{
				id: 'nk7px_spritesheet',
				type: 'image',
				url: './nk7px_spritesheet.png',
			},
		], () => {
			super.load();
		});
	}
	compose() {
		this.pauser = new Pauser(this.smge, this.smge.timescales.default, 500);
		this.smge.entity_manager.add(this.pauser);
		//TODO set up menu select and highlight sounds since loading is finished
		this.menu_select_sound = this.smge.resource_manager.resources['lockdrop_click'];
		//TODO this.menu_highlight_sound = this.smge.resource_manager.resources['menu_highlick_click'];

		// set up sprite font
		this.nk7px = new SpriteFont(
			this.smge.resource_manager.resources['nk7px_font_data'],
			this.smge.resource_manager.resources['nk7px_spritesheet'],
			true
		);

		// set up cursor
		this.cursor = new SpringCameraCursor(this.smge)
		this.cursor.add_state(
			'default',
			this.smge.resource_manager.resources['cursor_default_sprite'],
			0,
			0
		);
		this.cursor.add_state(
			'pointer',
			this.smge.resource_manager.resources['cursor_pointer_sprite'],
			3,
			0
		);
		this.cursor.change_state('default');
		this.cursor.change_layer(4056);
		// add menu to cursor bounds collide list
		this.cursor.bounds[0].collides.push('menu');
		this.add_module(this.cursor);

		// add return to main menu button
		this.return_button = new Text(
			this.smge,
			this.smge.g.demos.nk7px,
			'left',
			'bottom',
			'left',
			this.menu_text_color,
			'none',
			this.menu_text_intensity,
			this.menu_text_frequency,
			'main menu'
		);
		this.return_button.add_module(
			new Bound(
				'menu',
				['cursor'],
				-4,
				-1.25 * this.return_button.height,
				this.return_button.width + 8,
				1.5 * this.return_button.height,
			)
		);
		this.add_module(this.return_button);
		this.return_button.transform.x = this.nk7px.height;
		this.return_button.transform.y = this.smge.screen.height - this.nk7px.height;
		this.return_button.transform.parallax.x = 0;
		this.return_button.transform.parallax.y = 0;
		this.return_button.change_layer(2048);
		this.return_button.disable();

		// transition main menu in
		let demo_main_menu = new DemoMainMenu(this.smge);
		this.current_scene = demo_main_menu;
		this.smge.entity_manager.add(demo_main_menu);
		demo_main_menu.transition();

		super.compose();
	}
	input_update() {
		super.input_update();

		// pauser
		if (this.smge.input.pressed('p')) {
			this.pauser.toggle();
		}

		// ensure cursor and cursor bounds are loaded before doing the rest of input update
		if (!this.cursor || !this.cursor.bounds) {
			return;
		}

		// change cursor when on/off any collided bound
		if (this.smge.bound_manager.check(this.cursor.bounds[0], 'off', '')) {
			this.cursor.change_state('default');
		}
		if (this.smge.bound_manager.check(this.cursor.bounds[0], 'on', '')) {
			this.cursor.change_state('pointer');
		}

		// return button highlight on/off effects
		if (
			this.smge.bound_manager.check(
				this.return_button.bounds[0],
				'off',
				'cursor'
			)
		) {
			this.unhighlight_menu(this.return_button);
		}
		if (
			this.smge.bound_manager.check(
				this.return_button.bounds[0],
				'on',
				'cursor'
			)
		) {
			this.highlight_menu(this.return_button);
		}

		// clicking return button returns to main menu
		if (this.smge.input.pressed('m1')) {
			if (
				!this.return_button.disabled
				&& this.smge.bound_manager.check(
					this.return_button.bounds[0],
					'during',
					'cursor'
				)
			) {
				this.select_menu(this.return_button);
				this.return_to_main_menu();
			}
		}

		// pressing escape returns to main menu
		if (this.smge.input.pressed('Escape')) {
			this.return_to_main_menu();
		}
	}
	select_menu(menu) {
		if (this.menu_select_sound) {
			this.smge.audio.play_once(this.menu_select_sound);
		}
	}
	unhighlight_menu(menu) {
		menu.color = this.menu_text_color;
		menu.effect = 'none';
		menu.refresh();
	}
	highlight_menu(menu, color, effect) {
		color = color || this.menu_highlight_text_color;
		effect = effect || this.menu_highlight_text_effect;
		menu.color = color;
		menu.effect = effect;
		menu.refresh();
		//TODO
		//TODO this.smge.audio.play_once(this.menu_highlight_sound);
	}
	return_to_main_menu() {
		// already on main menu
		if (
			this.current_scene
			&& DemoMainMenu == this.current_scene.constructor
		) {
			return;
		}
		// return to main menu
		let demo_main_menu = new DemoMainMenu(this.smge);
		this.smge.entity_manager.add(demo_main_menu);
		demo_main_menu.transition(this.current_scene, true);
		this.return_button.disable();
		this.current_scene = demo_main_menu;
	}
	set_indicator_string(x, indicator) {
		let precision = 6;
		let indicator_string = '' + x.toPrecision(precision)
		while (indicator_string.length > 6 && 0 < precision) {
			indicator_string = '' + x.toPrecision(precision);
			precision -= 1;
		}
		if (0 == precision) {
			indicator_string = 'what';
		}
		indicator_string = '[' + indicator_string.padStart(6) + ']';

		let start_pos = indicator.text.indexOf('[');
		indicator.set_text(
			indicator.text.substring(0, start_pos) + indicator_string
		);
	}
}
