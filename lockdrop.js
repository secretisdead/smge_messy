'use strict';

import { GameObject } from './smge/game_object.js';
import { Overlay } from './smge/game_objects/overlay.js';
import { Focus } from './smge/modules/focus.js'
import { Animator } from './smge/modules/animator.js'

export class Lockdrop extends GameObject {
	constructor(smge, color, target_scene) {
		super(smge);
		this.color = color;
		this.target_scene = target_scene;
		this.load();
	}
	load() {
		this.smge.resource_manager.load([
			{
				id: 'lockdrop_animation',
				type: 'json',
				url: './lockdrop_animation.json',
			},
			{
				id: 'lockdrop_spritesheet',
				type: 'image',
				url: './lockdrop_spritesheet.png',
			},
			{
				id: 'lockdrop_click',
				type: 'audio',
				url: './lockdrop_click.wav',
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
				this.smge.resource_manager.resources['lockdrop_spritesheet'],
				this.smge.resource_manager.resources['lockdrop_animation']
			)
		);
		this.set_scale();

		// add animator listener to play lockdrop_click on named event 'click'
		this.lock.animator.add_event('click', () => {
			this.smge.audio.play_once(
				this.smge.resource_manager.resources['lockdrop_click']
			);
		});

		// add to smge
		this.add_module(this.lock);

		if (this.target_scene) {
			// store target scene cover color
			this.target_scene_color = this.target_scene.cover.color;
			// change target scene cover color to transparent
			this.target_scene.cover.change_color('#00000000');
			this.smge.entity_manager.add(this.target_scene);
		}

		// play
		this.lock.animator.play(1, () => {
			if (!this.target_scene) {
				return;
			}
			// transition to target scene with removal of lockdrop
			this.target_scene.transition(
				null,
				false,
				{
					composed: ()=> {
						console.log('lockdrop target scene composed, removing lockdrop');
						// restore target scene cover color
						this.target_scene.cover.change_color(this.target_scene_color || this.color);
						this.smge.entity_manager.remove(this);
					},
				}
			);
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
