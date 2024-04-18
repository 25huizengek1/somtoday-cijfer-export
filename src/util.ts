export function wait(delay: number) {
    return new Promise(res => setTimeout(res, delay));
}

type Next = () => void;

export function sequentially(promises: (() => Promise<unknown>)[]): Promise<void> {
    return sequence(promises.map(p => async (next: Next) => {
        await p();
        next();
    }));
}

export function sequence(promises: ((next: Next) => Promise<void>)[]): Promise<void> {
    return new Promise(res => {
        let i = 0;
        const getNext = () => () => {
            runPromise(i++);
        };
        const runPromise = (i: number) => {
            if (i >= promises.length) return res();
            promises[i](getNext());
        };
        getNext()();
    });
}
