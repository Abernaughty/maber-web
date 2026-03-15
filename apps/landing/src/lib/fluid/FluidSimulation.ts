/**
 * WebGL Fluid Simulation
 * Based on the Stable Fluids algorithm by Jos Stam
 * Ported from vanilla JS to TypeScript for SvelteKit
 */

import {
	baseVertexShader,
	displayShader,
	advectionShader,
	divergenceShader,
	curlShader,
	vorticityShader,
	pressureShader,
	gradientShader,
	splatShader
} from './shaders';

interface Color {
	r: number;
	g: number;
	b: number;
}

interface FluidConfig {
	SIM_RESOLUTION: number;
	DYE_RESOLUTION: number;
	DENSITY_DISSIPATION: number;
	VELOCITY_DISSIPATION: number;
	PRESSURE: number;
	PRESSURE_ITERATIONS: number;
	CURL: number;
	SPLAT_RADIUS: number;
	SPLAT_FORCE: number;
	SHADING: boolean;
	COLOR_UPDATE_SPEED: number;
	BACK_COLOR: Color;
	TRANSPARENT: boolean;
}

interface FBO {
	texture: WebGLTexture;
	fbo: WebGLFramebuffer;
	width: number;
	height: number;
	texelSizeX: number;
	texelSizeY: number;
	attach: (id: number) => number;
}

interface DoubleFBO {
	width: number;
	height: number;
	texelSizeX: number;
	texelSizeY: number;
	read: FBO;
	write: FBO;
	swap: () => void;
}

interface ShaderProgram {
	program: WebGLProgram;
	uniforms: Record<string, WebGLUniformLocation | null>;
	bind: () => void;
}

interface WebGLExtensions {
	supportLinearFiltering: unknown;
	halfFloatTexType: number;
	formatRGBA: { internalFormat: number; format: number };
	formatRG: { internalFormat: number; format: number };
	formatR: { internalFormat: number; format: number };
}

class Pointer {
	id = -1;
	texcoordX = 0;
	texcoordY = 0;
	prevTexcoordX = 0;
	prevTexcoordY = 0;
	deltaX = 0;
	deltaY = 0;
	down = false;
	moved = false;
	color: Color = { r: 0, g: 0, b: 0 };
}

function HSVtoRGB(h: number, s: number, v: number): Color {
	let r = 0,
		g = 0,
		b = 0;
	const i = Math.floor(h * 6);
	const f = h * 6 - i;
	const p = v * (1 - s);
	const q = v * (1 - f * s);
	const t = v * (1 - (1 - f) * s);

	switch (i % 6) {
		case 0:
			r = v;
			g = t;
			b = p;
			break;
		case 1:
			r = q;
			g = v;
			b = p;
			break;
		case 2:
			r = p;
			g = v;
			b = t;
			break;
		case 3:
			r = p;
			g = q;
			b = v;
			break;
		case 4:
			r = t;
			g = p;
			b = v;
			break;
		case 5:
			r = v;
			g = p;
			b = q;
			break;
	}

	return { r, g, b };
}

const DEFAULT_CONFIG: FluidConfig = {
	SIM_RESOLUTION: 128,
	DYE_RESOLUTION: 1440,
	DENSITY_DISSIPATION: 3.5,
	VELOCITY_DISSIPATION: 2,
	PRESSURE: 1,
	PRESSURE_ITERATIONS: 20,
	CURL: 3,
	SPLAT_RADIUS: 0.2,
	SPLAT_FORCE: 6000,
	SHADING: true,
	COLOR_UPDATE_SPEED: 10,
	BACK_COLOR: { r: 0, g: 0, b: 0 },
	TRANSPARENT: true
};

export class FluidSimulation {
	private canvas: HTMLCanvasElement;
	private config: FluidConfig;
	private gl!: WebGLRenderingContext | WebGL2RenderingContext;
	private ext!: WebGLExtensions;
	private pointers: Pointer[];
	private lastTime: number;
	private colorUpdateTimer: number;
	private animationId: number | null = null;

	// Shader programs
	private displayProgram!: ShaderProgram;
	private splatProgram!: ShaderProgram;
	private advectionProgram!: ShaderProgram;
	private divergenceProgram!: ShaderProgram;
	private curlProgram!: ShaderProgram;
	private vorticityProgram!: ShaderProgram;
	private pressureProgram!: ShaderProgram;
	private gradientProgram!: ShaderProgram;

	// Framebuffers
	private dye!: DoubleFBO;
	private velocity!: DoubleFBO;
	private divergenceFBO!: FBO;
	private curlFBO!: FBO;
	private pressureFBO!: DoubleFBO;

	// Bound event handlers (for cleanup)
	private boundOnMouseDown: (e: MouseEvent) => void;
	private boundOnMouseMove: (e: MouseEvent) => void;
	private boundOnMouseUp: () => void;
	private boundOnTouchStart: (e: TouchEvent) => void;
	private boundOnTouchMove: (e: TouchEvent) => void;
	private boundOnTouchEnd: (e: TouchEvent) => void;

	constructor(canvas: HTMLCanvasElement, config: Partial<FluidConfig> = {}) {
		this.canvas = canvas;
		this.config = { ...DEFAULT_CONFIG, ...config };
		this.pointers = [new Pointer()];
		this.lastTime = Date.now();
		this.colorUpdateTimer = 0;

		// Bind event handlers
		this.boundOnMouseDown = this.onMouseDown.bind(this);
		this.boundOnMouseMove = this.onMouseMove.bind(this);
		this.boundOnMouseUp = this.onMouseUp.bind(this);
		this.boundOnTouchStart = this.onTouchStart.bind(this);
		this.boundOnTouchMove = this.onTouchMove.bind(this);
		this.boundOnTouchEnd = this.onTouchEnd.bind(this);

		this.canvas.style.pointerEvents = 'auto';

		this.initWebGL();
		this.createShaderPrograms();
		this.initFramebuffers();
		this.initEventListeners();
		this.animate();
	}

	private initWebGL(): void {
		const params: WebGLContextAttributes = {
			alpha: true,
			depth: false,
			stencil: false,
			antialias: false,
			preserveDrawingBuffer: false
		};

		this.gl =
			(this.canvas.getContext('webgl2', params) as WebGL2RenderingContext) ||
			(this.canvas.getContext('webgl', params) as WebGLRenderingContext) ||
			(this.canvas.getContext('experimental-webgl', params) as WebGLRenderingContext);

		const isWebGL2 = this.gl instanceof WebGL2RenderingContext;

		if (isWebGL2) {
			this.gl.getExtension('EXT_color_buffer_float');
			const gl2 = this.gl as WebGL2RenderingContext;
			this.ext = {
				supportLinearFiltering: this.gl.getExtension('OES_texture_float_linear'),
				halfFloatTexType: gl2.HALF_FLOAT,
				formatRGBA: { internalFormat: gl2.RGBA16F, format: gl2.RGBA },
				formatRG: { internalFormat: gl2.RG16F, format: gl2.RG },
				formatR: { internalFormat: gl2.R16F, format: gl2.RED }
			};
		} else {
			const halfFloat = this.gl.getExtension('OES_texture_half_float');
			this.gl.getExtension('OES_texture_half_float_linear');
			this.ext = {
				supportLinearFiltering: this.gl.getExtension('OES_texture_half_float_linear'),
				halfFloatTexType: halfFloat ? halfFloat.HALF_FLOAT_OES : this.gl.UNSIGNED_BYTE,
				formatRGBA: { internalFormat: this.gl.RGBA, format: this.gl.RGBA },
				formatRG: { internalFormat: this.gl.RGBA, format: this.gl.RGBA },
				formatR: { internalFormat: this.gl.RGBA, format: this.gl.RGBA }
			};
		}

		if (!this.ext.supportLinearFiltering) {
			this.config.DYE_RESOLUTION = 512;
			this.config.SHADING = false;
		}

		this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

		const buffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
		this.gl.bufferData(
			this.gl.ARRAY_BUFFER,
			new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
			this.gl.STATIC_DRAW
		);

		const elementBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, elementBuffer);
		this.gl.bufferData(
			this.gl.ELEMENT_ARRAY_BUFFER,
			new Uint16Array([0, 1, 2, 0, 2, 3]),
			this.gl.STATIC_DRAW
		);

		this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(0);
	}

	private createShader(
		type: number,
		source: string,
		keywords?: string[]
	): WebGLShader | null {
		if (keywords) {
			const keywordsString = keywords.map((k) => `#define ${k}\n`).join('');
			source = keywordsString + source;
		}

		const shader = this.gl.createShader(type);
		if (!shader) return null;

		this.gl.shaderSource(shader, source);
		this.gl.compileShader(shader);

		if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
			console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
			this.gl.deleteShader(shader);
			return null;
		}

		return shader;
	}

	private createProgram(
		vertexShader: WebGLShader,
		fragmentShader: WebGLShader
	): WebGLProgram | null {
		const program = this.gl.createProgram();
		if (!program) return null;

		this.gl.attachShader(program, vertexShader);
		this.gl.attachShader(program, fragmentShader);
		this.gl.linkProgram(program);

		if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
			console.error('Program linking error:', this.gl.getProgramInfoLog(program));
			this.gl.deleteProgram(program);
			return null;
		}

		return program;
	}

	private getUniforms(program: WebGLProgram): Record<string, WebGLUniformLocation | null> {
		const uniforms: Record<string, WebGLUniformLocation | null> = {};
		const uniformCount = this.gl.getProgramParameter(program, this.gl.ACTIVE_UNIFORMS);

		for (let i = 0; i < uniformCount; i++) {
			const info = this.gl.getActiveUniform(program, i);
			if (info) {
				uniforms[info.name] = this.gl.getUniformLocation(program, info.name);
			}
		}

		return uniforms;
	}

	private createProgramWithUniforms(
		vertexShader: WebGLShader,
		fragmentShader: WebGLShader
	): ShaderProgram {
		const program = this.createProgram(vertexShader, fragmentShader)!;
		return {
			program,
			uniforms: this.getUniforms(program),
			bind: () => this.gl.useProgram(program)
		};
	}

	private createShaderPrograms(): void {
		const baseVertex = this.createShader(this.gl.VERTEX_SHADER, baseVertexShader)!;

		const displayFrag = this.createShader(this.gl.FRAGMENT_SHADER, displayShader, ['SHADING']);
		const splatFrag = this.createShader(this.gl.FRAGMENT_SHADER, splatShader);
		const advectionFrag = this.createShader(
			this.gl.FRAGMENT_SHADER,
			advectionShader,
			this.ext.supportLinearFiltering ? undefined : ['MANUAL_FILTERING']
		);
		const divergenceFrag = this.createShader(this.gl.FRAGMENT_SHADER, divergenceShader);
		const curlFrag = this.createShader(this.gl.FRAGMENT_SHADER, curlShader);
		const vorticityFrag = this.createShader(this.gl.FRAGMENT_SHADER, vorticityShader);
		const pressureFrag = this.createShader(this.gl.FRAGMENT_SHADER, pressureShader);
		const gradientFrag = this.createShader(this.gl.FRAGMENT_SHADER, gradientShader);

		this.displayProgram = this.createProgramWithUniforms(baseVertex, displayFrag!);
		this.splatProgram = this.createProgramWithUniforms(baseVertex, splatFrag!);
		this.advectionProgram = this.createProgramWithUniforms(baseVertex, advectionFrag!);
		this.divergenceProgram = this.createProgramWithUniforms(baseVertex, divergenceFrag!);
		this.curlProgram = this.createProgramWithUniforms(baseVertex, curlFrag!);
		this.vorticityProgram = this.createProgramWithUniforms(baseVertex, vorticityFrag!);
		this.pressureProgram = this.createProgramWithUniforms(baseVertex, pressureFrag!);
		this.gradientProgram = this.createProgramWithUniforms(baseVertex, gradientFrag!);
	}

	private getResolution(resolution: number): { width: number; height: number } {
		let aspectRatio = this.gl.drawingBufferWidth / this.gl.drawingBufferHeight;
		if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;

		const min = Math.round(resolution);
		const max = Math.round(resolution * aspectRatio);

		if (this.gl.drawingBufferWidth > this.gl.drawingBufferHeight) {
			return { width: max, height: min };
		} else {
			return { width: min, height: max };
		}
	}

	private initFramebuffers(): void {
		const simRes = this.getResolution(this.config.SIM_RESOLUTION);
		const dyeRes = this.getResolution(this.config.DYE_RESOLUTION);

		const texType = this.ext.halfFloatTexType;
		const rgba = this.ext.formatRGBA;
		const rg = this.ext.formatRG;
		const r = this.ext.formatR;
		const filtering = this.ext.supportLinearFiltering ? this.gl.LINEAR : this.gl.NEAREST;

		this.gl.disable(this.gl.BLEND);

		this.dye = this.createDoubleFBO(
			dyeRes.width,
			dyeRes.height,
			rgba.internalFormat,
			rgba.format,
			texType,
			filtering
		);
		this.velocity = this.createDoubleFBO(
			simRes.width,
			simRes.height,
			rg.internalFormat,
			rg.format,
			texType,
			filtering
		);
		this.divergenceFBO = this.createFBO(
			simRes.width,
			simRes.height,
			r.internalFormat,
			r.format,
			texType,
			this.gl.NEAREST
		);
		this.curlFBO = this.createFBO(
			simRes.width,
			simRes.height,
			r.internalFormat,
			r.format,
			texType,
			this.gl.NEAREST
		);
		this.pressureFBO = this.createDoubleFBO(
			simRes.width,
			simRes.height,
			r.internalFormat,
			r.format,
			texType,
			this.gl.NEAREST
		);
	}

	private createFBO(
		w: number,
		h: number,
		internalFormat: number,
		format: number,
		type: number,
		param: number
	): FBO {
		this.gl.activeTexture(this.gl.TEXTURE0);

		const texture = this.gl.createTexture()!;
		this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, param);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, param);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
		this.gl.texImage2D(this.gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

		const fbo = this.gl.createFramebuffer()!;
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fbo);
		this.gl.framebufferTexture2D(
			this.gl.FRAMEBUFFER,
			this.gl.COLOR_ATTACHMENT0,
			this.gl.TEXTURE_2D,
			texture,
			0
		);
		this.gl.viewport(0, 0, w, h);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);

		const gl = this.gl;
		return {
			texture,
			fbo,
			width: w,
			height: h,
			texelSizeX: 1.0 / w,
			texelSizeY: 1.0 / h,
			attach(id: number) {
				gl.activeTexture(gl.TEXTURE0 + id);
				gl.bindTexture(gl.TEXTURE_2D, texture);
				return id;
			}
		};
	}

	private createDoubleFBO(
		w: number,
		h: number,
		internalFormat: number,
		format: number,
		type: number,
		param: number
	): DoubleFBO {
		let fbo1 = this.createFBO(w, h, internalFormat, format, type, param);
		let fbo2 = this.createFBO(w, h, internalFormat, format, type, param);

		return {
			width: w,
			height: h,
			texelSizeX: fbo1.texelSizeX,
			texelSizeY: fbo1.texelSizeY,
			get read() {
				return fbo1;
			},
			set read(value) {
				fbo1 = value;
			},
			get write() {
				return fbo2;
			},
			set write(value) {
				fbo2 = value;
			},
			swap() {
				const temp = fbo1;
				fbo1 = fbo2;
				fbo2 = temp;
			}
		};
	}

	private blit(target: FBO): void {
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, target.fbo);
		this.gl.viewport(0, 0, target.width, target.height);
		this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
	}

	private render(): void {
		this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

		this.displayProgram.bind();
		if (this.config.SHADING) {
			this.gl.uniform2f(
				this.displayProgram.uniforms.texelSize,
				1.0 / this.gl.drawingBufferWidth,
				1.0 / this.gl.drawingBufferHeight
			);
		}
		this.gl.uniform1i(this.displayProgram.uniforms.uTexture, this.dye.read.attach(0));
		this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
	}

	private splat(x: number, y: number, dx: number, dy: number, color: Color): void {
		this.splatProgram.bind();

		this.gl.uniform1i(this.splatProgram.uniforms.uTarget, this.velocity.read.attach(0));
		this.gl.uniform1f(
			this.splatProgram.uniforms.aspectRatio,
			this.canvas.clientWidth / this.canvas.clientHeight
		);
		this.gl.uniform2f(this.splatProgram.uniforms.point, x, y);
		this.gl.uniform3f(this.splatProgram.uniforms.color, dx, dy, 0.0);

		const radius = this.correctRadius(this.config.SPLAT_RADIUS / 100.0);
		this.gl.uniform1f(this.splatProgram.uniforms.radius, radius);

		this.blit(this.velocity.write);
		this.velocity.swap();

		this.gl.uniform1i(this.splatProgram.uniforms.uTarget, this.dye.read.attach(0));
		this.gl.uniform3f(this.splatProgram.uniforms.color, color.r, color.g, color.b);
		this.blit(this.dye.write);
		this.dye.swap();
	}

	private correctRadius(radius: number): number {
		const aspectRatio = this.canvas.clientWidth / this.canvas.clientHeight;
		if (aspectRatio > 1) radius *= aspectRatio;
		return radius;
	}

	private correctDeltaX(delta: number): number {
		const aspectRatio = this.canvas.clientWidth / this.canvas.clientHeight;
		if (aspectRatio < 1) delta *= aspectRatio;
		return delta;
	}

	private correctDeltaY(delta: number): number {
		const aspectRatio = this.canvas.clientWidth / this.canvas.clientHeight;
		if (aspectRatio > 1) delta /= aspectRatio;
		return delta;
	}

	private generateColor(): Color {
		const c = HSVtoRGB(Math.random(), 1.0, 1.0);
		c.r *= 0.5;
		c.g *= 0.5;
		c.b *= 0.5;
		return c;
	}

	private step(dt: number): void {
		this.gl.disable(this.gl.BLEND);

		// Curl
		this.curlProgram.bind();
		this.gl.uniform2f(
			this.curlProgram.uniforms.texelSize,
			this.velocity.texelSizeX,
			this.velocity.texelSizeY
		);
		this.gl.uniform1i(this.curlProgram.uniforms.uVelocity, this.velocity.read.attach(0));
		this.blit(this.curlFBO);

		// Vorticity
		this.vorticityProgram.bind();
		this.gl.uniform2f(
			this.vorticityProgram.uniforms.texelSize,
			this.velocity.texelSizeX,
			this.velocity.texelSizeY
		);
		this.gl.uniform1i(
			this.vorticityProgram.uniforms.uVelocity,
			this.velocity.read.attach(0)
		);
		this.gl.uniform1i(this.vorticityProgram.uniforms.uCurl, this.curlFBO.attach(1));
		this.gl.uniform1f(this.vorticityProgram.uniforms.curl, this.config.CURL);
		this.gl.uniform1f(this.vorticityProgram.uniforms.dt, dt);
		this.blit(this.velocity.write);
		this.velocity.swap();

		// Divergence
		this.divergenceProgram.bind();
		this.gl.uniform2f(
			this.divergenceProgram.uniforms.texelSize,
			this.velocity.texelSizeX,
			this.velocity.texelSizeY
		);
		this.gl.uniform1i(
			this.divergenceProgram.uniforms.uVelocity,
			this.velocity.read.attach(0)
		);
		this.blit(this.divergenceFBO);

		// Clear pressure
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.pressureFBO.write.fbo);
		this.gl.clearColor(0, 0, 0, 1);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);

		// Pressure iterations
		this.pressureProgram.bind();
		this.gl.uniform2f(
			this.pressureProgram.uniforms.texelSize,
			this.velocity.texelSizeX,
			this.velocity.texelSizeY
		);
		this.gl.uniform1i(
			this.pressureProgram.uniforms.uDivergence,
			this.divergenceFBO.attach(0)
		);

		for (let i = 0; i < this.config.PRESSURE_ITERATIONS; i++) {
			this.gl.uniform1i(
				this.pressureProgram.uniforms.uPressure,
				this.pressureFBO.read.attach(1)
			);
			this.blit(this.pressureFBO.write);
			this.pressureFBO.swap();
		}

		// Gradient subtraction
		this.gradientProgram.bind();
		this.gl.uniform2f(
			this.gradientProgram.uniforms.texelSize,
			this.velocity.texelSizeX,
			this.velocity.texelSizeY
		);
		this.gl.uniform1i(
			this.gradientProgram.uniforms.uPressure,
			this.pressureFBO.read.attach(0)
		);
		this.gl.uniform1i(
			this.gradientProgram.uniforms.uVelocity,
			this.velocity.read.attach(1)
		);
		this.blit(this.velocity.write);
		this.velocity.swap();

		// Advection (velocity)
		this.advectionProgram.bind();
		this.gl.uniform2f(
			this.advectionProgram.uniforms.texelSize,
			this.velocity.texelSizeX,
			this.velocity.texelSizeY
		);

		if (!this.ext.supportLinearFiltering) {
			this.gl.uniform2f(
				this.advectionProgram.uniforms.dyeTexelSize,
				this.velocity.texelSizeX,
				this.velocity.texelSizeY
			);
		}

		const velocityId = this.velocity.read.attach(0);
		this.gl.uniform1i(this.advectionProgram.uniforms.uVelocity, velocityId);
		this.gl.uniform1i(this.advectionProgram.uniforms.uSource, velocityId);
		this.gl.uniform1f(this.advectionProgram.uniforms.dt, dt);
		this.gl.uniform1f(
			this.advectionProgram.uniforms.dissipation,
			this.config.VELOCITY_DISSIPATION
		);
		this.blit(this.velocity.write);
		this.velocity.swap();

		// Advection (dye)
		if (!this.ext.supportLinearFiltering) {
			this.gl.uniform2f(
				this.advectionProgram.uniforms.dyeTexelSize,
				this.dye.texelSizeX,
				this.dye.texelSizeY
			);
		}

		this.gl.uniform1i(this.advectionProgram.uniforms.uVelocity, this.velocity.read.attach(0));
		this.gl.uniform1i(this.advectionProgram.uniforms.uSource, this.dye.read.attach(1));
		this.gl.uniform1f(
			this.advectionProgram.uniforms.dissipation,
			this.config.DENSITY_DISSIPATION
		);
		this.blit(this.dye.write);
		this.dye.swap();
	}

	private scaleByPixelRatio(input: number): number {
		const pixelRatio = window.devicePixelRatio || 1;
		return Math.floor(input * pixelRatio);
	}

	private resizeCanvas(): boolean {
		const width = this.scaleByPixelRatio(this.canvas.clientWidth);
		const height = this.scaleByPixelRatio(this.canvas.clientHeight);

		if (this.canvas.width !== width || this.canvas.height !== height) {
			this.canvas.width = width;
			this.canvas.height = height;
			return true;
		}

		return false;
	}

	private calcDeltaTime(): number {
		const now = Date.now();
		let dt = (now - this.lastTime) / 1000;
		dt = Math.min(dt, 0.016666);
		this.lastTime = now;
		return dt;
	}

	private updateColors(dt: number): void {
		this.colorUpdateTimer += dt * this.config.COLOR_UPDATE_SPEED;
		if (this.colorUpdateTimer >= 1) {
			this.colorUpdateTimer = 0;
			this.pointers.forEach((p) => {
				p.color = this.generateColor();
			});
		}
	}

	private applyInputs(): void {
		this.pointers.forEach((pointer) => {
			if (pointer.moved) {
				pointer.moved = false;
				this.splat(
					pointer.texcoordX,
					pointer.texcoordY,
					pointer.deltaX * this.config.SPLAT_FORCE,
					pointer.deltaY * this.config.SPLAT_FORCE,
					pointer.color
				);
			}
		});
	}

	private update(): void {
		const dt = this.calcDeltaTime();
		if (this.resizeCanvas()) {
			this.initFramebuffers();
		}

		this.updateColors(dt);
		this.applyInputs();
		this.step(dt);
		this.render();
		this.animationId = requestAnimationFrame(() => this.update());
	}

	private animate(): void {
		this.update();
	}

	// Event handlers
	private updatePointerDownData(pointer: Pointer, id: number, x: number, y: number): void {
		pointer.id = id;
		pointer.down = true;
		pointer.moved = false;
		pointer.texcoordX = x / this.canvas.clientWidth;
		pointer.texcoordY = 1.0 - y / this.canvas.clientHeight;
		pointer.prevTexcoordX = pointer.texcoordX;
		pointer.prevTexcoordY = pointer.texcoordY;
		pointer.deltaX = 0;
		pointer.deltaY = 0;
		pointer.color = this.generateColor();

		this.splat(pointer.texcoordX, pointer.texcoordY, pointer.deltaX, pointer.deltaY, pointer.color);
	}

	private updatePointerMoveData(pointer: Pointer, x: number, y: number): void {
		pointer.prevTexcoordX = pointer.texcoordX;
		pointer.prevTexcoordY = pointer.texcoordY;
		pointer.texcoordX = x / this.canvas.clientWidth;
		pointer.texcoordY = 1.0 - y / this.canvas.clientHeight;
		pointer.deltaX = this.correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX);
		pointer.deltaY = this.correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY);
		pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
	}

	private onMouseDown(e: MouseEvent): void {
		this.updatePointerDownData(this.pointers[0], -1, e.offsetX, e.offsetY);
		this.canvas.style.pointerEvents = 'none';
	}

	private onMouseMove(e: MouseEvent): void {
		this.updatePointerMoveData(this.pointers[0], e.offsetX, e.offsetY);
	}

	private onMouseUp(): void {
		this.pointers[0].down = false;
		this.canvas.style.pointerEvents = 'auto';
	}

	private onTouchStart(e: TouchEvent): void {
		e.preventDefault();
		const touches = e.targetTouches;

		for (let i = 0; i < touches.length; i++) {
			if (i >= this.pointers.length) {
				this.pointers.push(new Pointer());
			}

			const touch = touches[i];
			const rect = this.canvas.getBoundingClientRect();
			const x = touch.clientX - rect.left;
			const y = touch.clientY - rect.top;
			this.updatePointerDownData(this.pointers[i], touch.identifier, x, y);
		}
	}

	private onTouchMove(e: TouchEvent): void {
		e.preventDefault();
		const touches = e.targetTouches;

		for (let i = 0; i < touches.length; i++) {
			const pointer = this.pointers[i];
			const touch = touches[i];

			if (pointer && pointer.id === touch.identifier) {
				const rect = this.canvas.getBoundingClientRect();
				const x = touch.clientX - rect.left;
				const y = touch.clientY - rect.top;
				this.updatePointerMoveData(pointer, x, y);
			}
		}
	}

	private onTouchEnd(e: TouchEvent): void {
		const touches = e.changedTouches;

		for (let i = 0; i < touches.length; i++) {
			const pointer = this.pointers.find((p) => p.id === touches[i].identifier);
			if (pointer) {
				pointer.down = false;
			}
		}
	}

	private initEventListeners(): void {
		this.canvas.addEventListener('mousedown', this.boundOnMouseDown);
		this.canvas.addEventListener('mousemove', this.boundOnMouseMove);
		window.addEventListener('mouseup', this.boundOnMouseUp);

		this.canvas.addEventListener('touchstart', this.boundOnTouchStart, { passive: false });
		this.canvas.addEventListener('touchmove', this.boundOnTouchMove, { passive: false });
		window.addEventListener('touchend', this.boundOnTouchEnd);
	}

	/** Clean up resources and event listeners */
	destroy(): void {
		if (this.animationId !== null) {
			cancelAnimationFrame(this.animationId);
		}

		this.canvas.removeEventListener('mousedown', this.boundOnMouseDown);
		this.canvas.removeEventListener('mousemove', this.boundOnMouseMove);
		window.removeEventListener('mouseup', this.boundOnMouseUp);

		this.canvas.removeEventListener('touchstart', this.boundOnTouchStart);
		this.canvas.removeEventListener('touchmove', this.boundOnTouchMove);
		window.removeEventListener('touchend', this.boundOnTouchEnd);
	}
}
