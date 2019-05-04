'use strict';

import { ParticleEmitter, Particle } from './smge/game_objects/particle_emitter.js';
import { Timer } from './smge/standalone/timer.js';
import { randsign } from './smge/lib/randsign.js';

export class PrecipitationEmitter extends ParticleEmitter {
	constructor(
		smge,
		width,
		max_precipitation_distance,
		min_frequency,
		max_frequency,
		intensity,
		direction,
		color,
		min_speed,
		max_speed,
		min_variance,
		max_variance,
		min_size,
		max_size,
		generate_particle
	) {
		super(
			smge,
			width,
			1, // height
			1000, // frequency
			direction,
			0, // variance
			2000, // max particles
			0, // particle lifetime
			1, // particle speed
			generate_particle
		);
		this.max_precipitation_distance = max_precipitation_distance;
		this.min_frequency = min_frequency;
		this.max_frequency = max_frequency;
		this.min_speed = min_speed;
		this.max_speed = max_speed;
		this.min_variance = min_variance;
		this.max_variance = max_variance;
		this.min_size = min_size;
		this.max_size = max_size;
		this.intensity = intensity;
		// set emitter values based on intensity
		this.refresh_properties();
	}
	set_direction(direction) {
		this.direction = direction;
		if (1.76625 < this.direction || 0.19625 > this.direction) {
			console.log(
				'direction is extreme for precipitation, '
					+ 'ensure you set the emitter position and width appropriately'
			);
		}
	}
	refresh_properties() {
		// calculate frequency from intensity
		let diff = this.max_frequency - this.min_frequency;
		this.frequency = this.max_frequency - (diff * this.intensity);
		console.log('intensity: ' + this.intensity + ', min: ' + this.min_frequency + ', max: ' + this.max_frequency + ' freq: ' + this.frequency);
		this.timer.set(this.frequency, () => {
			this.emit();
		});
		// calculate particle speed from intensity
		this.particle_speed = Math.min(
			this.max_speed,
			Math.max(
				this.min_speed,
				this.max_speed * this.intensity
			)
		);
		// calculate variance from intensity
		this.variance = Math.min(
			this.max_variance,
			Math.max(
				this.min_variance,
				this.max_variance * this.intensity
			)
		);
	}
	update() {
		super.update();
	}
	emit() {
		// choose random y value to prune particle at
		let y_percent = Math.random() + 0.1;
		//TODO speed shouldn't change based on depth, parallax should be set to accurately reflect depth
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
		let parallax = y_percent * 2;
		this.transform.parallax.x = parallax + 0.5;
		this.transform.parallax.y = parallax;
		this.particle_speed = (1 + y_percent) * this.particle_speed;
		let p = super.emit();
		p.size = particle_size;
		p.prune_y = p.transform.y + (this.max_precipitation_distance * y_percent);
		p.transform.y -= 0.25 * this.max_precipitation_distance * y_percent;
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
			this.parent.parent.parent.remove_module(this.parent.parent);
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
		// check for minimal precipitation movement
		let diff = {
			x: Math.abs(screen_pos.x - last_screen_pos.x),
			y: Math.abs(screen_pos.y - last_screen_pos.y),
		};
		let half_size = this.size / 2;
		// less movement than precipitation size should draw point
		if (diff.x < half_size && diff.y < half_size) {
			this.smge.screen.buffer.ctx.fillStyle = this.color;
			this.smge.screen.buffer.ctx.fillRect(
				screen_pos.x - half_size,
				screen_pos.y - half_size,
				this.size,
				this.size
			);
		}
		// otherwise draw line from last screen position to current screen position
		else {
			this.smge.screen.buffer.ctx.beginPath();
			this.smge.screen.buffer.ctx.moveTo(last_screen_pos.x, last_screen_pos.y);
			this.smge.screen.buffer.ctx.lineTo(screen_pos.x, screen_pos.y);
			this.smge.screen.buffer.ctx.lineWidth = this.size;
			this.smge.screen.buffer.ctx.strokeStyle = this.color;
			this.smge.screen.buffer.ctx.stroke();
		}
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
		// disturb x velocity by between 0.0025 and 0.005
		let max_v = 50;
		let min_v = 25;
		let v = Math.floor(
			Math.random() * (max_v - min_v + 1) + min_v
		) / 10000 * randsign();
		this.transform.velocity.x += v;
		// wait between 500 and 1000 ms before disturbing again
		let max_time = 10;
		let min_time = 5;
		let time_ms = 100 * Math.floor(
			Math.random() * (max_time - min_time + 1) + min_time
		);
		this.smge.add_waiting_action(time_ms, () => {this.disturb()});
	}
	draw() {
		let screen_pos = this.smge.screen.world_to_screen(this.transform);
		screen_pos.x = Math.round(screen_pos.x);
		screen_pos.y = Math.round(screen_pos.y) + 1;
		this.smge.screen.buffer.ctx.imageSmoothingEnabled = false;
		let half_size = this.size / 2;
		this.smge.screen.buffer.ctx.fillStyle = this.color;
		this.smge.screen.buffer.ctx.fillRect(
			screen_pos.x - half_size,
			screen_pos.y - half_size,
			this.size,
			this.size
		);
	}
}

export class RainEmitter extends PrecipitationEmitter {
	constructor(
		smge,
		width,
		max_precipitation_distance,
		min_frequency,
		max_frequency,
		intensity,
		direction,
		color
	) {
		color = color || '#efdfff';
		super(
			smge,
			width,
			max_precipitation_distance,
			min_frequency,
			max_frequency,
			intensity,
			direction,
			color,
			0.4, // min speed
			0.75, // max speed
			0, // min variance
			0.05, // max variance
			1, // min size
			2, // max size
			() => {
				return new Raindrop(smge, 1, color);
			},
		);
		//
	}
}

export class SnowEmitter extends PrecipitationEmitter {
	constructor(
		smge,
		width,
		max_precipitation_distance,
		min_frequency,
		max_frequency,
		intensity,
		direction,
		color
	) {
		color = color || '#ffffff';
		super(
			smge,
			width,
			max_precipitation_distance,
			min_frequency,
			max_frequency,
			intensity,
			direction,
			color,
			0.05, // min speed
			0.1, // max speed
			0.1, // min variance
			0.2, // max variance
			1, // min size
			3, // max size
			() => {
				return new Snowflake(smge, 1, color);
			},
		);
		//
	}
}
