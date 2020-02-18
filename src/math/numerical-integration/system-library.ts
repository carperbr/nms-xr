import { IntegratorData } from "./integrator";

export const LorenzSystem01: IntegratorData = new IntegratorData();
LorenzSystem01.params = [ 4, 16, 1 ];
LorenzSystem01.state = [ 1, 2, 6 ];
LorenzSystem01.differentials = [
    (params: number[], state: number[]) => {
        return params[0] * (state[1] - state[0]);
    },

    (params: number[], state: number[]) => {
        return -(state[0] * state[2]) + (params[1] * state[0]) - state[1];
    },

    (params: number[], state: number[]) => {
        return state[0] * state[1] - (params[2] * state[2]);
    }
];

export const VanDerPolOscillator01: IntegratorData = new IntegratorData();
VanDerPolOscillator01.params = [1, 1, 0.45];
VanDerPolOscillator01.state = [1, 1, 0];
VanDerPolOscillator01.differentials = [
    (params: number[], state: number[]) => {
        return state[1];
    },

    (params: number[], state: number[]) => {
        return params[0] * Math.sin(state[2]) - params[1] * (Math.pow(state[0], 2) - 1) * state[1] - state[0];
    },

    (params: number[], state: number[]) => {
        return params[2];
    }
];

export const ForcedConservative01a: IntegratorData = new IntegratorData();
ForcedConservative01a.params = [2],
ForcedConservative01a.state = [0, 0, 0],
ForcedConservative01a.differentials = [
    (p: number[], state: number[]) => {
        return state[1];
    },

    (p: number[], state: number[]) => {
        return Math.sin(state[2]) - Math.pow(state[0], 3);
    },

    (p: number[], state: number[]) => {
        return p[0];
    }
];

export const ForcedConservative01b = new IntegratorData(ForcedConservative01a);
ForcedConservative01b.state = [0.0001, 0, 0];

export const ForcedConservative06 = new IntegratorData();
ForcedConservative06.params = [2];
ForcedConservative06.state = [0.7, 0, 0];
ForcedConservative06.differentials = [
    (p: number[], state: number[]) => {
        return state[1];
    },

    (p: number[], state: number[]) => {
        return Math.sin(state[2]) - state[0] / Math.sqrt(Math.abs(state[0]));
    },

    (p: number[], state: number[]) => {
        return p[0];
    }
];

export const DixonSystem = new IntegratorData();
DixonSystem.params = [0, 0.7];
DixonSystem.state = [1, 0];
DixonSystem.differentials = [
    (params: number[], state: number[]) => {
        return (state[0] * state[1]) / (Math.pow(state[0], 2) + Math.pow(state[1], 2)) - params[0] * state[0];
    },

    (params: number[], state: number[]) => {
        return Math.pow(state[1], 2) / (Math.pow(state[0], 2) + Math.pow(state[1], 2)) - params[1] * state[1] + params[1] - 1;
    }
];