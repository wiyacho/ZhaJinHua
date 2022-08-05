export default abstract class ASystem {
    public abstract init(...args): Promise<any>;
    public abstract release(): void;
}