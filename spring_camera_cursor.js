'use strict';

import { GameObject } from './smge/game_object.js';
import { Cursor } from './smge/game_objects/cursor.js';
import { Bound } from './smge/bound_manager.js';
import { Midpoint } from './smge/game_objects/midpoint.js';
import { Autofocus } from './smge/modules/autofocus.js';
import { Transform } from './smge/modules/transform.js';
import { Shaker } from './smge/modules/shaker.js';

export class SpringCameraCursor extends Cursor {
	constructor(smge, weight) {
		super(smge);

		this.name = 'cursor';
		this.change_layer(2048);
		this.add_module(new Bound('cursor', [], -1, -1, 2, 2));

		this.anchor = new GameObject(this.smge);
		this.anchor.name = 'camera anchor';
		this.anchor.add_module(new Transform());
		this.add_module(this.anchor);

		this.camera = new Midpoint(
			this.smge,
			this.anchor.transform,
			this.transform,
			weight || 0
		);
		this.camera.name = 'camera';
		this.camera.add_module(new Shaker());
		this.camera.add_module(new Autofocus());
		this.add_module(this.camera);
	}
}
