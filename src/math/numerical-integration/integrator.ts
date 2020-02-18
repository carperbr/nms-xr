export class IntegratorData {
    params: number[];
    state: number[];
    differentials: ((params: number[], state: number[]) => number)[];

    constructor(other?: IntegratorData) {
        if (other != undefined) {
            this.params = [...other.params];
            this.state = [...other.state];
            this.differentials = [...other.differentials];
        }
    }
}

export class Integrator {
    differentials: ((params: number[], state: number[]) => number)[];

    estimate4th: number;
    estimate5th: number;
    buffer: number[];
    state: number[];
    midpoints: number[];
    parameters: number[];
    minima: number[];
    maxima: number[];

    error: number;
    epsilon: number = 0.00000001;
    dt: number = 0.01;
    elapsed: number = 0;
    dtOpt: number;
    dtMin: number;

    weights: number[] = [
        // k1w
        1.0 / 5.0, 3.0 / 40.0, 44.0 / 45.0, 19372.0 / 6561.0, 9017.0 / 3168.0, 35.0 / 384.0, 35.0 / 384.0, 5179.0 / 57600.0,

        // k2w
        0.0, 9.0 / 40.0, -56.0 / 15.0, -25360.0 / 2187.0, -355.0 / 73.0, 0.0, 0.0, 0.0,

        // k3w
        0.0, 0.0, 32.0 / 9.0, 64448.0 / 6561.0, 46732.0 / 5247.0, 500.0 / 1113.0, 500.0 / 1113.0, 7571.0 / 16695.0,
        
        // k4w
        0.0, 0.0, 0.0, -212.0 / 729.0, 49.0 / 176.0, 125.0 / 192.0, 125.0 / 192.0, 393.0 / 640.0,
        
        // k5w
        0.0, 0.0, 0.0, 0.0, -5103.0 / 18656.0, -2187.0 / 6784.0, -2187.0 / 6784.0, -92097.0 / 339200.0,
        
        // k6w
        0.0, 0.0, 0.0, 0.0, 0.0, 11.0 / 84.0, 11.0 / 84.0, 187.0 / 2100.0,

        // k7w
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0 / 40.0
    ];
    
    constructor(data: IntegratorData) {
        if (data != undefined) {
            this.parameters = [...data.params];
            this.state = [...data.state];
            this.differentials = [...data.differentials];
        }
        
        this.buffer = [];
        this.midpoints = [...this.state];
        this.minima = [...this.state];
        this.maxima = [...this.state];

        for (let i = 0; i < this.state.length * 8; i++) {
            this.buffer.push(0);
        }
    }

    integrate(step: number) {
        let delta: number = 0;

        while (delta < step) {
            delta += this.dt;

            for (let i = 0; i < this.state.length; i++) {
                this.midpoints[i] = this.state[i];
            }

            for (let stage = 0; stage < 7; stage++) {
                for (let v = 0; v < this.state.length; v++) {           
                    let val = this.differentials[v](this.parameters, this.midpoints)
                    this.setBuffer(stage, v, val * this.dt);
                }

                if (stage < 6) {
                    for (let i = 0; i < this.state.length; i++) {
                        this.midpoints[i] = this.state[i] + (this.getWeight(0, stage) * this.getBuffer(0, i)) + (this.getWeight(1, stage) * this.getBuffer(1, i)) + (this.getWeight(2, stage) * this.getBuffer(2, i)) + (this.getWeight(3, stage) * this.getBuffer(3, i)) + (this.getWeight(4, stage) * this.getBuffer(4, i)) + (this.getWeight(5, stage) * this.getBuffer(5, i));
                    }
                }
            }

            this.dtMin = Number.POSITIVE_INFINITY;
            
            for (let i = 0; i < this.state.length; i++) {
                this.estimate4th = this.state[i] + (this.getWeight(0, 6) * this.getBuffer(0, i)) + (this.getWeight(1, 6) * this.getBuffer(1, i)) + (this.getWeight(2, 6) * this.getBuffer(2, i)) + (this.getWeight(3, 6) * this.getBuffer(3, i)) + (this.getWeight(4, 6) * this.getBuffer(4, i)) + (this.getWeight(5, 6) * this.getBuffer(5, i));
                this.estimate5th = this.state[i] + (this.getWeight(0, 7) * this.getBuffer(0, i)) + (this.getWeight(1, 7) * this.getBuffer(1, i)) + (this.getWeight(2, 7) * this.getBuffer(2, i)) + (this.getWeight(3, 7) * this.getBuffer(3, i)) + (this.getWeight(4, 7) * this.getBuffer(4, i)) + (this.getWeight(5, 7) * this.getBuffer(5, i)) + (this.getWeight(6, 7) * this.getBuffer(6, i));
                this.state[i] = this.estimate5th;
                this.error = Math.abs(this.estimate5th - this.estimate4th);
                this.dtOpt = 0.75 * this.dt * Math.min(Math.max(this.epsilon / this.error, 0.1), 2);

                if (this.elapsed > 10) {
                    if (this.minima[i] > this.estimate5th) {
                        this.minima[i] = this.estimate5th;
                    }

                    if (this.maxima[i] < this.estimate5th) {
                        this.maxima[i] = this.estimate5th;
                    }
                }

                if (this.dtMin > this.dtOpt && Number.isFinite(this.dtOpt)) {
                    this.dtMin = this.dtOpt;
                }
            }

            if (Number.isFinite(this.dtMin)) {
                this.dt = this.dtMin;
            }
        }
    }

    getBuffer(stage: number, variable: number): number {
        return this.buffer[variable + stage * this.state.length];
    }

    setBuffer(stage: number, variable: number, val: number) {
        this.buffer[variable + stage * this.state.length] = val;
    }

    getWeight(k: number, stage: number) {
        return this.weights[stage + k * 8];
    }
}