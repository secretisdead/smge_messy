'use strict';

import { GameObject } from './smge/game_object.js';
import { Overlay } from './smge/game_objects/overlay.js';
import { Focus } from './smge/modules/focus.js'
import { Animator } from './smge/modules/animator.js'

export class ResectDrop extends GameObject {
	constructor(smge, color, target_scene) {
		super(smge);
		this.color = color;
		this.target_scene = target_scene;
		this.load();
	}
	load() {
		this.smge.resource_manager.load([
			{
				id: 'resect_drop_animation',
				type: 'json',
				url: './resect_drop_animation.json',
			},
			{
				id: 'resect_drop_spritesheet',
				type: 'image',
				url: './resect_drop_spritesheet.png',
			},
			{
				id: 'lockdrop_click',
				type: 'audio',
				url: './lockdrop_click.wav',
			},
			{
				id: 'resect_drop_buzz',
				type: 'audio',
				url: './resect_drop_buzz.wav',
			},
		], () => {
			this.compose();
		});
	}
	compose() {
		this.bg = new Overlay(this.smge, this.color);
		this.bg.change_layer(-1);
		this.add_module(this.bg);

		// create lock
		this.lock = new GameObject(this.smge);
		this.lock.add_module(new Focus());
		this.lock.focus();
		this.lock.name = 'lock';

		// add animator to sprite with lockdrop animation recipe
		this.lock.add_module(
			new Animator(
				this.smge.resource_manager.resources['resect_drop_spritesheet'],
				this.smge.resource_manager.resources['resect_drop_animation']
			)
		);
		this.set_scale();

		// add animator listener to play lockdrop_click on named event 'click'
		this.lock.animator.add_event('click', () => {
			this.smge.audio.play_once(
				this.smge.resource_manager.resources['lockdrop_click']
			);
		});
		// add animator listener to play resect_drop_buzz and change bg color on named event 'red'
		this.lock.animator.add_event('red', () => {
			this.bg.color = '#a00000';
			this.smge.audio.play_once(
				this.smge.resource_manager.resources['resect_drop_buzz']
			);
		});

		// add to smge
		this.add_module(this.lock);

		// play
		this.lock.animator.play(1, () => {
			if (!this.target_scene) {
				return;
			}
			// transition to target scene with removal of lockdrop
			this.smge.entity_manager.add(this.target_scene);
			this.target_scene.transition(this, true);
		});
	}
	set_scale() {
		let quarter_short_edge = Math.min(
			this.smge.screen.width,
			this.smge.screen.height
		) / 5;
		let scale = 1;
		while (scale * this.lock.animator.frames[0].height < quarter_short_edge) {
			scale += 1;
		}
		scale -= 1;
		this.lock.transform.scale.x = scale;
		this.lock.transform.scale.y = scale;
	}
}
