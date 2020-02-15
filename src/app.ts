import { ImmersiveApp, ui, FPS_DELTA, ExclusiveRender, Prism, ServerEvent, PrivilegeId } from 'lumin';
import { Renderer } from "./graphics";
import { StateManager } from './state';
import { SimpleTest } from './states';

export class App extends ImmersiveApp {
    prism: Prism;

    constructor(delta: number) {
        super(delta);
        App._instance = this;
    }

    init () {      
        this.setEventSleepTime(FPS_DELTA);
        this.setOcclusionEnabled(false);
        this.prism = this.requestNewPrism([6, 6, 6]);
        this.selectPrism(this.prism, true);
        
        let options = new ExclusiveRender.ClientOptions();
        let exclusiveRender = this.startExclusiveModeGL(options, <any>Renderer.instance.context);
        Renderer.instance.initialize(exclusiveRender);

        StateManager.instance.addState(new SimpleTest());
        StateManager.instance.setState("SimpleTest");
        
        return 0;
    }

    eventListener(event: ServerEvent): boolean {
        StateManager.instance.eventListener(event);

        return false;
    }

    updateLoop (delta: number) {        
        StateManager.instance.update(delta);
        Renderer.instance.beginFrame();        
        StateManager.instance.draw(delta);
        Renderer.instance.endFrame();

        return true;
    }

    deInit(): number {
        this.stopExclusiveMode();
        return 0;
    }

    private static _instance: App;
    static get instance() {
        return App._instance;
    }
}
