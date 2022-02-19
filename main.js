const SLIDER_WIDTH = 200;
const SLIDER_X = 100;
const SLIDER_Y = 50;
const SLIDER_SEP = 30;

let platform = {
	width: 400,
	height: 2,

	draw: function(){
		const x = width / 2 - this.width / 2;
		const y = height / 2 - this.height / 2;
		rect(x, y, this.width, this.height)
	}
};

let box = {
	width: 20,
	height: 20,
	distance: 40,
	velocity: 0,
	acceleration: 0,
	mass: 2,

	draw: function(){
		const x = width / 2 - this.width / 2;
		const y = height / 2 - this.distance - this.height / 2;
		rect(x, y, this.width, this.height);
	}
};

let spring = {
	restLength: 100,
	k: 0.0001,
	width: 400,
	height: 1,

	getForce: function(height){
		return (this.restLength - height) * this.k;
	},

	draw: function(){
		const x = width / 2 - this.width / 2;
		const y = height / 2 - this.restLength - this.height / 2;
		push()
		fill(100, 0, 200)
		stroke(100, 0, 200)
		rect(x, y, this.width, this.height);
		pop()
	}
};

let pid = {
	p: 90 * 1e-6,
	i: 2.4 * 1e-6,
	d: 700 * 1e-6,
	desired: 200,
	error: 0,
	error_integral: 0,
	prev_error: 0,
	error_deriv: 0,
	width: 400,
	height: 1,

	update: function(distance){
		this.error = this.desired - distance;
		this.error_integral += this.error;
		this.error_deriv = this.error - this.prev_error;
		this.prev_error = this.error;
	},

	draw: function(){
		const x = width / 2 - this.width / 2;
		const y = height / 2 - this.desired - this.height / 2;
		push()
		fill(255, 0, 0)
		stroke(255, 0, 0)
		rect(x, y, this.width, this.height);
		pop()
	},

	getForce: function(){
		const proportional = this.p * this.error;
		const integral = this.i * this.error_integral;
		const derivative = this.d * this.error_deriv;
		return proportional + integral + derivative;
	}

};

let system = {
	b: 0.005,

	platform: platform,
	box: box,
	spring: spring,
	pid: pid,

	update: function(timeDelta){
		this.pid.update(this.box.distance);

		let force = this.spring.getForce(this.box.distance);
		force += -this.b * this.box.velocity;
		force += this.pid.getForce();

		const deltaX = this.box.velocity * timeDelta;
		const deltaV = this.box.acceleration * timeDelta;

		this.pid.update(this.box.distance)
		this.box.distance += deltaX;
		this.box.velocity += deltaV;
		this.box.acceleration = force / this.box.mass;
	},

	draw: function(){
		// first draw the "platform"
		this.platform.draw();
		this.spring.draw();
		this.pid.draw();
		this.box.draw();
	}
};

// function mouseDragged(){
// 	pid.desired = height / 2 - mouseY;
// }
// 
// function mouseClicked(){
// 	pid.desired = height / 2 - mouseY;
// }

function setup(){
	// i: 2.4 * 1e-6,
	// d: 700 * 1e-6,
	this.p_slider = createSlider(0, 180, 90);
	p_slider.position(SLIDER_X, SLIDER_Y + 0 * SLIDER_SEP);

	this.i_slider = createSlider(0, 48, 24);
	this.i_slider.position(SLIDER_X, SLIDER_Y + 1 * SLIDER_SEP);

	this.d_slider = createSlider(0, 1400, 700);
	this.d_slider.position(SLIDER_X, SLIDER_Y + 2 * SLIDER_SEP);

	this.desired_slider = createSlider(50, 400, 150);
	this.desired_slider.position(SLIDER_X, SLIDER_Y + 3 * SLIDER_SEP);

	createCanvas(windowWidth, windowHeight);
	fill(0);
}

function draw_text(){
	texts = ["P", "I", "D", "Desired"];
	for(let i = 0; i < texts.length; i++){
		text(texts[i], SLIDER_X + SLIDER_WIDTH, SLIDER_Y + 15 + i * SLIDER_SEP);
	}
}

function draw(){
	const p_value = this.p_slider.value();
	const i_value = this.i_slider.value() / 10;
	const d_value = this.d_slider.value();
	const desired_value = this.desired_slider.value();

	pid.p = p_value * 1e-6;
	pid.i = i_value * 1e-6;
	pid.d = d_value * 1e-6;
	pid.desired = desired_value;

	background(255);
	system.draw();
	draw_text();

	system.update(deltaTime);
}
