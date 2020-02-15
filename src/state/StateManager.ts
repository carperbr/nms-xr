import { State } from "./State";
import { ServerEvent } from "lumin";

export class StateManager {
    states: Map<string, State>;
    currentState: State;

    private constructor() {
        this.states = new Map<string, State>();
    }

    addState(state: State) {
        if (!this.states.has(state.name)) {
            this.states.set(state.name, state);
        } else {
            console.error(`State "${state}" already added.`);
        }
    }

    eventListener(event: ServerEvent) {
        if (this.currentState) {
            this.currentState.eventListener(event);
        }
    }

    update(delta: number) {
        if (this.currentState) {
            this.currentState.update(delta);
        }
    }

    draw(delta: number) {
        if (this.currentState) {
            this.currentState.preDraw(delta);

            for (let eye = 0; eye < 2; eye++) {
                this.currentState.draw(eye, delta);
            }
        }
    }

    setState(name: string) {
        if (this.states.has(name)) {        
            if (this.currentState) {
                this.currentState.deInit();
            }
            
            this.currentState = this.states.get(name);
            this.currentState.init();
        } else {
            console.error(`State "${name}" not found.`);
        }
    }

    private static _instance: StateManager;
    static get instance() {
        if (!StateManager._instance) {
            StateManager._instance = new StateManager();
        }

        return StateManager._instance;
    }
}