import { css, html } from "@node-projects/base-custom-webcomponent";
import { ColorWheel } from "./ColorWheel.js";

export class ComplexColorWheel extends ColorWheel {

    public static override readonly style = css`
        .color-picker-container {
            display: inline-block;
            background: #5d5f60 none repeat scroll 0% 0%;
            border-radius: 4px;
            border: 2px solid #f8fafb;
        }
        
        .color-picker-container .picker-container .canvas-container {
            margin: 20px;
            position: relative;
            float: left;
            width: 200px;
            display: inline-block;
            background: #5D5F60;
        }
        .color-picker-container .picker-container .canvas-container.active {
            display: block;
        }
        #canvas {
            cursor: crosshair;
            border-radius: 50%;
            box-shadow: 0 0 0 4px #E8E8E8;
            background: #E6D3D3;
            width: 200px;
            height: 200px;
        }
        .color-picker-container .picker-container .canvas-container .pointer {
            width: 15px;
            height: 15px;
            border: 2px solid #fff;
            border-radius: 50%;
            position: absolute;
            pointer-events: none;
            background: rgba(0, 0, 0, 0.1);
        }
        .color-picker-container .picker-container .canvas-container input {
            margin-top: 10px;
            width: 100%;
            height: 30px;
            text-align: center;
            background: #353738;
            border: 0;
            color: #fff;
        }
        #slider-container {
            width: 15px;
            float: right;
            position: relative;
            margin: 15px;
        }
        #slider {
            width: 15px;
            height: 249px;
            background: #000;
        }
        #slider-pointer {
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 5px 0 5px 10px;
            border-color: transparent transparent transparent #007bff;
            position: absolute;
            left: -8px;
        }`;

    public static override readonly template = html`
        <div id="root">
            <div id="container" class="color-picker-container">
                <div id="picker-container" class="picker-container">
                    <div id="canvas-container" class="canvas-container">
                        <canvas id="canvas" width="200" height="200"></canvas>
                        <div id="pointer" class="pointer"></div>
                        <input id="input">
                    </div>
                    <div id="slider-container">
                        <div id="slider-pointer"></div>
                        <div id="slider"></div>
                    </div>
                </div>
            </div>
        </div>
        `;

    public static override  readonly is: string = 'node-projects-complex-color-wheel';

    protected _input: HTMLInputElement;

    protected _sliderContainer: HTMLDivElement;
    protected _slider: HTMLDivElement;
    protected _sliderPointer: HTMLDivElement;
    protected _sliderBounds: DOMRect;
    protected _sliderPointerBounds: DOMRect;

    protected valueIp: string;

    constructor() {
        super();
        this._restoreCachedInititalValues();

        this._input = this._getDomElement<HTMLInputElement>('input');

        this._sliderContainer = this._getDomElement<HTMLDivElement>('slider-container');
        this._slider = this._getDomElement<HTMLDivElement>('slider');
        this._sliderPointer = this._getDomElement<HTMLDivElement>('slider-pointer');

        this.initInput();
        this.initSlider();
    }

    initInput() {
        this._input.addEventListener('keyup', () => {
            if (this.valueIp == this.value || '#' + this.valueIp == this.value) {
                return;
            }
            const coordinates = this.getPositionFromColor(this.valueIp);
            if (coordinates != null) {
                this.x = coordinates.x;
                this.y = coordinates.y;
                this.updateColor(this.HEXtoRGB(this.valueIp));
                this.updateAll();
            }
        });
    }

    initSlider() {
        this._sliderBounds = this._slider.getBoundingClientRect();
        this._sliderPointerBounds = this._sliderPointer.getBoundingClientRect();

        this.redrawSlider();

        let dragging = false;

        this._slider.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            dragging = true;
            const total = this.updateSliderCursor(e.clientY);
            this.updateColor(this.HSVtoRGB(this.hsv[0], this.hsv[1], 1 - total));
            this.updateAll();
        });

        this._sliderPointer.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            dragging = true;
            const total = this.updateSliderCursor(e.clientY);
            this.updateColor(this.HSVtoRGB(this.hsv[0], this.hsv[1], 1 - total));
            this.updateAll();
        });

        document.addEventListener('pointermove', (e) => {
            if (!dragging) {
                return;
            }
            const total = this.updateSliderCursor(e.clientY);
            this.updateColor(this.HSVtoRGB(this.hsv[0], this.hsv[1], 1 - total));
            this.updateAll();
        });

        document.addEventListener('pointerup', () => {
            dragging = false;
        });
    };

    updateSliderCursor(y) {
        let total = y - this._sliderBounds.top; // - 6;
        total = this._sliderBounds.height - total;
        total = total / this._sliderBounds.height;
        total = parseFloat(total.toFixed(2));
        if (total < 0) {
            total = 0;
        } else if (total > 1) {
            total = 1;
        }
        total = 1 - total;
        this._sliderPointer.style.top = this._sliderBounds.height * total - (this._sliderPointerBounds.height / 2) + 'px';
        return total;
    }

    redrawSlider() {
        const rgb = this.HSVtoRGB(this.hsv[0], this.hsv[1], 1);
        const hex = this.RGBtoHEX(rgb[0], rgb[1], rgb[2]);
        const gradient = this.makeGradient(hex, '#000');
        this._slider.setAttribute('style', gradient);
        this.updatePointers();
    }

    override updateAll() {
        super.updateAll();
        this.redrawSlider();
        this._input.value = this.value;
    }

    override updatePointers() {
        super.updatePointers()

        if (this._sliderBounds) {
            let position = this._sliderBounds.height * (1 - this.hsv[2]) - (this._sliderPointerBounds.height / 2);
            this._sliderPointer.style.top = position + 'px';
        }
    }

    makeGradient(colour1, colour2) {
        return `background: linear-gradient(${colour1} 0%,${colour2} 100%);`;
    }
}

customElements.define(ComplexColorWheel.is, ComplexColorWheel);