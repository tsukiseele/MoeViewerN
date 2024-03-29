export class TimeoutError extends Error {
	constructor(message) {
		super(message);
		this.name = 'TimeoutError';
	}
}


/**
An error to be thrown when the request is aborted by AbortController.
DOMException is thrown instead of this Error when DOMException is available.
*/
export class AbortError extends Error {
	constructor(message: string) {
		super();
		this.name = 'AbortError';
		this.message = message;
	}
}

const getDOMException = errorMessage => globalThis.DOMException === undefined ?
	new AbortError(errorMessage) :
	new DOMException(errorMessage);

export default function pTimeout(promise: Promise<any>, milliseconds: number, fallback: Function | Error, options: any) {
	let timer;

	const cancelablePromise = new Promise((resolve, reject) => {
		if (typeof milliseconds !== 'number' || Math.sign(milliseconds) !== 1) {
			throw new TypeError(`Expected \`milliseconds\` to be a positive number, got \`${milliseconds}\``);
		}

		if (milliseconds === Number.POSITIVE_INFINITY) {
			resolve(promise);
			return;
		}

		options = {
			customTimers: {setTimeout, clearTimeout},
			...options
		};

		if (options && options.signal) {
			const {signal} = options;

			signal.addEventListener('abort', () => {
				const reason = signal.reason === undefined ?
					getDOMException('This operation was aborted.') :
					signal.reason;

				reject(reason instanceof Error ? reason : getDOMException(reason));
			});
		}

		timer = options.customTimers.setTimeout.call(undefined, () => {
			if (typeof fallback === 'function') {
				try {
					resolve(fallback());
				} catch (error) {
					reject(error);
				}

				return;
			}

			const message = typeof fallback === 'string' ? fallback : `Promise timed out after ${milliseconds} milliseconds`;
      const timeoutError = fallback instanceof Error ? fallback : new TimeoutError(message);
      //@ts-ignore
			if (typeof promise.cancel === 'function') {
				//@ts-ignore
        promise.cancel();
			}

			reject(timeoutError);
		}, milliseconds);

		(async () => {
			try {
				resolve(await promise);
			} catch (error) {
				reject(error);
			} finally {
				options.customTimers.clearTimeout.call(undefined, timer);
			}
		})();
  });
  // @ts-ignore
	cancelablePromise.clear = () => {
		clearTimeout(timer);
		timer = undefined;
	};

	return cancelablePromise;
}
