'use strict';

import { ParticleEmitter, Particle } from './smge/game_objects/particle_emitter.js';
import { Timer } from './smge/standalone/timer.js';
import { randsign } from './smge/lib/randsign.js';

export class PrecipitationEmitter extends ParticleEmitter {
	constructor(
		smge,
		intensity,
		direction,
		type,
		lookahead_scale,
		multiplier
	) {
		lookahead_scale = lookahead_scale || 2;
		if (lookahead_scale < 1) {
			console.log('precipitation emitter lookahead scale less than 1, setting to 1');
			lookahead_scale = 1;
		}
		super(
			smge,
			smge.screen.width * lookahead_scale,
			1,
			1000,
			1.57,
			0,
			2000,
			0,
			1
		);
		let particle_class = Particle;
		let color = '#ffffff';
		// set root properties depending on precipitation type
		if ('rain' == type) {
			particle_class = Raindrop;
			this.root_frequency = 5;
			this.root_variance = 0.01;
			this.max_variance = 0.05;
			this.root_particle_speed = 0.4;
			this.max_particle_speed = 1;
			color = '#efdfff';
		}
		else if ('snow' == type) {
			particle_class = Snowflake;
			this.root_frequency = 150;
			this.root_variance = 0.25;
			this.max_variance = 0.3;
			this.root_particle_speed = 0.01;
			this.max_particle_speed = 0.5;
			color = '#ffffff';
		}
		// set particle generator
		this.generate_particle = () => {
			return new particle_class(this.smge, 1, color);
		}
		// set emitter values based on intensity
		this.set_intensity(intensity);
		// set multiplier
		this.multiplier = multiplier || 1;
		// set initial position
		this.lookahead_scale = lookahead_scale || 2;
		this.fix_position();
	}
	multi_emit() {
		for (let i = 0; i < this.multiplier; i++) {
			this.emit();
		}
	}
	set_direction(direction) {
		this.direction = direction;
		if (1.76625 < this.direction || 0.19625 > this.direction) {
			console.log(
				'direction is extreme for precipitation, '
					+ 'you may need to set a large lookahead scale '
					+ 'and/or tweak other precipitation emitter settings'
			);
		}
	}
	set_intensity(intensity) {
		this.intensity = intensity;
		// calculate frequency from intensity
		this.frequency = Math.max(
			1,
			this.root_frequency * (1 - this.intensity)
		);
		this.timer.set(this.frequency, () => {
			this.multi_emit();
		});
		// calculate particle speed from intensity
		this.particle_speed = Math.min(
			this.max_particle_speed,
			this.root_particle_speed * (1 + this.intensity)
		);
		// calculate variance from intensity
		this.variance = Math.min(
			this.max_variance,
			this.root_variance * (1 + this.intensity)
		);
	}
	fix_position() {
		this.max_precipitation_distance = this.smge.screen.height * this.lookahead_scale;
		this.half_max_precipitation_distance = this.max_precipitation_distance / 2;
		this.transform.x = this.smge.screen.offset.x + this.smge.screen.width / 2;
		this.transform.y = this.smge.screen.offset.y + (
			(this.smge.screen.height / 2) - this.half_max_precipitation_distance
		);
	}
	update() {
		this.fix_position();
		super.update();
	}
	emit() {
		// choose random y value within visible screen to prune particle at
		let y_percent = Math.random() + 0.1;
		let original_speed = this.particle_speed;
		let particle_size = 1;
		if (1 < y_percent) {
			particle_size = 3;
		}
		else if (0.75 < y_percent) {
			particle_size = 2;
		}
		else {
			particle_size = 1;
		}
		//let parallax = 0.5 + (y_percent * 2);
		//this.transform.parallax.x = parallax;
		//this.transform.parallax.y = parallax;
		this.particle_speed = (1 + y_percent) * this.particle_speed;
		let p = super.emit();
		p.size = particle_size;
		p.prune_y = p.transform.y + (this.max_precipitation_distance * y_percent);
		p.change_depth(Math.round(p.prune_y));
		this.particle_speed = original_speed;
	}
}

export class Droplet extends Particle {
	constructor(smge, size, color) {
		super(smge);
		this.size = size;
		this.color = color || '#dfefff';
	}
	draw() {
		let screen_pos = this.smge.screen.world_to_screen(this.transform);
		screen_pos.x = Math.round(screen_pos.x);
		screen_pos.y = Math.round(screen_pos.y);
		this.smge.screen.buffer.ctx.imageSmoothingEnabled = false;
		this.smge.screen.buffer.ctx.fillStyle = this.color;
		this.smge.screen.buffer.ctx.fillRect(screen_pos.x, screen_pos.y, this.size, this.size);
	}
	early_update() {
		this.lifetime -= this.timescale.delta;
		if (0 >= this.lifetime) {
			// remove emitter that created this droplet
			this.smge.entity_manager.remove(this.parent.parent);
		}
	}
}

export class Precipitation extends Particle {
	constructor(smge, size, color) {
		super(smge);
		this.size = size;
		this.color = color || '#ffffff';
		this.prune_y = this.transform.y + this.smge.screen.height;
		this.last = {
			x: this.transform.x,
			y: this.transform.y,
			parallax: {
				x: this.transform.parallax.x,
				y: this.transform.parallax.y,
			},
		};
	}
	early_update() {
		// do target y pruning
		if (this.transform.y > this.prune_y) {
			this.parent.remove_module(this);
		}
	}
	update() {
		this.last = {
			x: this.transform.x,
			y: this.transform.y,
			parallax: {
				x: this.transform.parallax.x,
				y: this.transform.parallax.y,
			},
		};
		super.update();
	}
	draw() {
		let last_screen_pos = this.smge.screen.world_to_screen(this.last);
		last_screen_pos.x = Math.round(last_screen_pos.x);
		last_screen_pos.y = Math.round(last_screen_pos.y);
		let screen_pos = this.smge.screen.world_to_screen(this.transform);
		screen_pos.x = Math.round(screen_pos.x);
		screen_pos.y = Math.round(screen_pos.y) + 1;
		this.smge.screen.buffer.ctx.imageSmoothingEnabled = false;
		this.smge.screen.buffer.ctx.beginPath();
		this.smge.screen.buffer.ctx.moveTo(last_screen_pos.x, last_screen_pos.y);
		this.smge.screen.buffer.ctx.lineTo(screen_pos.x, screen_pos.y);
		this.smge.screen.buffer.ctx.lineWidth = this.size;
		this.smge.screen.buffer.ctx.strokeStyle = this.color;
		this.smge.screen.buffer.ctx.stroke();
	}
}

export class Raindrop extends Precipitation {
	constructor(smge, size, color) {
		super(smge, size, color || '#d0f0ff');
	}
	early_update() {
		if (this.transform.y < this.prune_y) {
			return;
		}
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
				return new Droplet(this.smge, Math.max(this.size - 1, 1), this.color);
			}
		);
		droplet_emitter.depth = this.depth;
		this.parent.add_module(droplet_emitter);
		// 2 to 4 droplets
		let droplets = Math.floor(Math.random() * 3) + 2;
		for (let i = 0; i < droplets; i += 1) {
			droplet_emitter.emit(
				this.transform.x,
				this.transform.y,
				this.transform.parallax.x,
				this.transform.parallax.y
			);
		}
		this.parent.remove_module(this);
	}
}

export class Snowflake extends Precipitation {
	constructor(smge, size, color) {
		super(smge, size, color || '#ffffff');
		this.smge.add_waiting_action(() => {
			this.disturb();
		});
	}
	disturb() {
		// disturb x velocity by between 0.001 and 0.002
		let max_v = 20;
		let min_v = 10;
		let v = Math.floor(
			Math.random() * (max_v - min_v + 1) + min_v
		) / 10000 * randsign();
		this.transform.velocity.x += v;
		// wait between 500 and 2000 ms before disturbing again
		let max_time = 20;
		let min_time = 5;
		let time_ms = 100 * Math.floor(
			Math.random() * (max_time - min_time + 1) + min_time
		);
		this.smge.add_waiting_action(time_ms, () => {this.disturb()});
	}
}
